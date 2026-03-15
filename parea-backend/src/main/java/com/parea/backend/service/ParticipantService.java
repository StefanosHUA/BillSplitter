package com.parea.backend.service;

import com.parea.backend.dto.Requests.ParticipantCreateReq;
import com.parea.backend.dto.Responses;
import com.parea.backend.dto.Responses.SessionRes;
import com.parea.backend.entity.PareaSession;
import com.parea.backend.entity.Participant;
import com.parea.backend.repository.PareaSessionRepository;
import com.parea.backend.repository.ParticipantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@Transactional
public class ParticipantService {
    private final ParticipantRepository participantRepository;
    private final PareaSessionRepository sessionRepository;
    private final PareaSessionService sessionService;

    public ParticipantService(ParticipantRepository participantRepo,
                              PareaSessionRepository sessionRepo,
                              PareaSessionService sessionService) {
        this.participantRepository = participantRepo;
        this.sessionRepository = sessionRepo;
        this.sessionService = sessionService;
    }

    public SessionRes addParticipant(Long sessionId, ParticipantCreateReq req) {
        PareaSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        Participant p = new Participant();
        p.setName(req.name());
        p.setSession(session);

        // Best Practice: Bidirectional sync
        session.getParticipants().add(p);
        participantRepository.save(p);

        return sessionService.mapToDTO(session);
    }

    public SessionRes removeParticipant(Long sessionId, Long participantId) {
        PareaSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        // Clean up joins in shared items
        session.getReceiptItems().forEach(item ->
                item.getSharedBy().removeIf(p -> p.getId().equals(participantId))
        );

        session.getParticipants().removeIf(p -> p.getId().equals(participantId));
        return sessionService.mapToDTO(sessionRepository.save(session));
    }

    @Transactional
    public Responses.ParticipantRes settleParticipant(Long participantId, BigDecimal currentDebt) {
        Participant p = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));

        // Senior Logic: Explicitly handle the Snapshot
        if (p.getAmountPaid().compareTo(BigDecimal.ZERO) > 0 && p.getAmountPaid().compareTo(currentDebt) == 0) {
            p.setAmountPaid(BigDecimal.ZERO);
        } else {
            p.setAmountPaid(currentDebt);
        }

        // CRITICAL: Explicitly save and flush to the database
        // to ensure the DTO creator sees the updated value.
        Participant saved = participantRepository.saveAndFlush(p);

        return new Responses.ParticipantRes(
                saved.getId(),
                saved.getName(),
                saved.getAmountPaid().doubleValue()
        );
    }

    @Transactional
    public void updateName(Long participantId, String newName) {
        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        participant.setName(newName);
    }
}