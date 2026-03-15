package com.parea.backend.service;

import com.parea.backend.dto.Requests;
import com.parea.backend.dto.Requests.*;
import com.parea.backend.dto.Responses.*;
import com.parea.backend.entity.*;
import com.parea.backend.repository.AppUserRepository;
import com.parea.backend.repository.PareaSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class PareaSessionService {

    private final PareaSessionRepository sessionRepository;
    private final AppUserRepository userRepository;

    public PareaSessionService(PareaSessionRepository sessionRepository, AppUserRepository userRepository) {
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
    }

    public SessionRes createSession(SessionCreateReq req) {
        AppUser host = userRepository.findById(req.hostId())
                .orElseThrow(() -> new RuntimeException("Host not found"));

        PareaSession session = new PareaSession();
        session.setTitle(req.title());
        session.setHost(host);

        return mapToDTO(sessionRepository.save(session));
    }

    public List<SessionRes> getHostSessions(Long hostId) {
        return sessionRepository.findByHostId(hostId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public SessionRes getSessionById(Long sessionId) {
        return mapToDTO(getSessionOrThrow(sessionId));
    }

    public void settleSession(Long sessionId) {
        PareaSession session = getSessionOrThrow(sessionId);
        session.setSettled(true);
        sessionRepository.save(session);
    }

    public SessionRes addItem(Long sessionId, ItemCreateReq req) {
        PareaSession session = getSessionOrThrow(sessionId);

        ReceiptItem item = new ReceiptItem();
        item.setItemName(req.name());
        item.setPrice(req.price());
        item.setSession(session);

        session.getReceiptItems().add(item);
        syncReceiptTotal(session);
        return mapToDTO(sessionRepository.save(session));
    }

    public SessionRes toggleShare(Long sessionId, Long itemId, Long friendId) {
        PareaSession session = getSessionOrThrow(sessionId);

        ReceiptItem item = session.getReceiptItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found"));

        Participant friend = session.getParticipants().stream()
                .filter(p -> p.getId().equals(friendId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Friend not found"));

        boolean isAlreadyShared = item.getSharedBy().stream().anyMatch(p -> p.getId().equals(friendId));

        if (isAlreadyShared) {
            item.getSharedBy().removeIf(p -> p.getId().equals(friendId));
        } else {
            item.getSharedBy().add(friend);
        }

        return mapToDTO(sessionRepository.save(session));
    }

    public void deleteSession(Long sessionId) {
        sessionRepository.deleteById(sessionId);
    }

    public SessionRes deleteItem(Long sessionId, Long itemId) {
        PareaSession session = getSessionOrThrow(sessionId);

        // Remove item and clear its share relationships
        session.getReceiptItems().removeIf(item -> {
            if (item.getId().equals(itemId)) {
                item.getSharedBy().clear();
                return true;
            }
            return false;
        });
        syncReceiptTotal(session);
        return mapToDTO(sessionRepository.save(session));
    }

    public List<DebtRes> calculateDebts(Long sessionId) {
        PareaSession session = getSessionOrThrow(sessionId);
        // Use BigDecimal for the map to maintain precision during accumulation
        Map<Long, BigDecimal> debts = new HashMap<>();

        session.getParticipants().forEach(p -> debts.put(p.getId(), BigDecimal.ZERO));

        for (ReceiptItem item : session.getReceiptItems()) {
            int sharersCount = item.getSharedBy().size();
            if (sharersCount > 0) {
                // Convert item price to BigDecimal
                BigDecimal itemPrice = BigDecimal.valueOf(item.getPrice());

                // Calculate the split: Price / Count, rounded to 2 decimal places
                BigDecimal splitAmount = itemPrice.divide(
                        BigDecimal.valueOf(sharersCount), 2, RoundingMode.HALF_UP
                );

                item.getSharedBy().forEach(sharer ->
                        debts.put(sharer.getId(), debts.get(sharer.getId()).add(splitAmount))
                );
            }
        }

        return session.getParticipants().stream()
                .map(p -> new DebtRes(
                        p.getId(),
                        p.getName(),
                        debts.get(p.getId()).doubleValue() // Convert back to double for DTO
                ))
                .collect(Collectors.toList());
    }
    private PareaSession getSessionOrThrow(Long sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
    }

    public SessionRes mapToDTO(PareaSession session) {
        List<ParticipantRes> participants = session.getParticipants().stream()
                .map(p -> new ParticipantRes(
                        p.getId(),
                        p.getName(),
                        // CRITICAL: Pull the real value from the DB, not a hardcoded boolean
                        p.getAmountPaid() != null ? p.getAmountPaid().doubleValue() : 0.0
                ))
                .collect(Collectors.toList());

        List<ItemRes> items = session.getReceiptItems().stream()
                .map(i -> new ItemRes(
                        i.getId(),
                        i.getItemName(),
                        i.getPrice(),
                        i.getSharedBy().stream().map(Participant::getId).collect(Collectors.toList())
                ))
                .collect(Collectors.toList());

        return new SessionRes(
                session.getId(),
                session.getTitle(),
                session.getSessionDate(),
                session.isSettled(),
                participants,
                items,
                session.getReceiptTotal()
        );
    }

    private void syncReceiptTotal(PareaSession session) {
        double total = session.getReceiptItems().stream()
                .mapToDouble(ReceiptItem::getPrice)
                .sum();
        session.setReceiptTotal(total);
    }

    @Transactional
    public SessionRes addItemsBulk(Long sessionId, Requests.BulkItemCreateReq req) {
        // 1. Fetch the session (it's now managed by the Persistence Context)
        PareaSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        // 2. Add the items
        for (Requests.ItemCreateReq itemReq : req.items()) {
            ReceiptItem item = new ReceiptItem();
            item.setItemName(itemReq.name());
            item.setPrice(itemReq.price());
            item.setSession(session);
            session.getReceiptItems().add(item);
        }

        syncReceiptTotal(session);
        PareaSession savedSession = sessionRepository.saveAndFlush(session);

        return mapToDTO(savedSession);
    }

}