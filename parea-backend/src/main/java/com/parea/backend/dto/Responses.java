package com.parea.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class Responses {
    // amountPaid matches the Snapshotting Senior Solution
    public record ParticipantRes(Long id, String name, Double amountPaid) {}

    public record ItemRes(Long id, String itemName, Double price, List<Long> sharedByParticipantIds) {}

    public record SessionRes(
            Long id,
            String title,
            LocalDateTime date,
            boolean isSettled, // Host-controlled or auto-calculated flag
            List<ParticipantRes> participants,
            List<ItemRes> items,
            Double receiptTotal
    ) {}

    public record AuthRes(String token, Long id, String username, String email) {}
    public record DebtRes(Long participantId, String name, Double amount) {}
}