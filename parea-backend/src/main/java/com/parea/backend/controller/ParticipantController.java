package com.parea.backend.controller;

import com.parea.backend.dto.Requests;
import com.parea.backend.dto.Requests.ParticipantCreateReq;
import com.parea.backend.dto.Responses;
import com.parea.backend.service.ParticipantService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api")
public class ParticipantController {

    private final ParticipantService participantService;

    public ParticipantController(ParticipantService participantService) {
        this.participantService = participantService;
    }

    @PostMapping("/sessions/{sessionId}/participants")
    public ResponseEntity<Void> addParticipant(@PathVariable Long sessionId, @RequestBody ParticipantCreateReq req) {
        participantService.addParticipant(sessionId, req);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{sessionId}/participants/{participantId}")
    public ResponseEntity<Responses.SessionRes> removeParticipant(
            @PathVariable Long sessionId,
            @PathVariable Long participantId) {
        return ResponseEntity.ok(participantService.removeParticipant(sessionId, participantId));
    }

    @PatchMapping("/participants/{participantId}/settle")
    public ResponseEntity<Responses.ParticipantRes> settleParticipant(
            @PathVariable Long participantId,
            @RequestBody Requests.ParticipantSettleReq req) {

        // Update the service to return the mapped DTO
        Responses.ParticipantRes updatedParticipant = participantService.settleParticipant(
                participantId,
                BigDecimal.valueOf(req.amount())
        );
        return ResponseEntity.ok(updatedParticipant);
    }

    @PutMapping("/participants/{participantId}")
    public ResponseEntity<Void> updateParticipantName(
            @PathVariable Long participantId,
            @RequestBody ParticipantCreateReq req) { // Reusing your CreateReq since it contains 'name'
        participantService.updateName(participantId, req.name());
        return ResponseEntity.ok().build();
    }



}