package com.parea.backend.controller;

import com.parea.backend.dto.Requests;
import com.parea.backend.dto.Requests.*;
import com.parea.backend.dto.Responses;
import com.parea.backend.dto.Responses.*;
import com.parea.backend.service.PareaSessionService;
import com.parea.backend.service.ParticipantService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
public class PareaSessionController {

    private final PareaSessionService sessionService;
    private final ParticipantService  participantService;

    public PareaSessionController(PareaSessionService sessionService, ParticipantService participantService) {
        this.sessionService = sessionService;
        this.participantService = participantService;
    }

    @PostMapping
    public ResponseEntity<SessionRes> createSession(@RequestBody SessionCreateReq req) {
        return ResponseEntity.ok(sessionService.createSession(req));
    }

    @GetMapping("/host/{hostId}")
    public ResponseEntity<List<SessionRes>> getHostSessions(@PathVariable Long hostId) {
        return ResponseEntity.ok(sessionService.getHostSessions(hostId));
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<SessionRes> getSession(@PathVariable Long sessionId) {
        return ResponseEntity.ok(sessionService.getSessionById(sessionId));
    }

    @PatchMapping("/{sessionId}/settle")
    public ResponseEntity<Void> settleSession(@PathVariable Long sessionId) {
        sessionService.settleSession(sessionId);
        return ResponseEntity.ok().build();
    }


    @PostMapping("/{sessionId}/friends")
    public ResponseEntity<SessionRes> addFriend(
            @PathVariable Long sessionId,
            @Valid @RequestBody ParticipantCreateReq req) {
        // We now call participantService instead of sessionService!
        return ResponseEntity.ok(participantService.addParticipant(sessionId, req));
    }

    @PostMapping("/{sessionId}/items")
    public ResponseEntity<SessionRes> addItem(@PathVariable Long sessionId, @RequestBody ItemCreateReq req) {
        return ResponseEntity.ok(sessionService.addItem(sessionId, req));
    }

    @PostMapping("/{sessionId}/items/{itemId}/share")
    public ResponseEntity<SessionRes> toggleShare(
            @PathVariable Long sessionId,
            @PathVariable Long itemId,
            @RequestParam Long friendId) {
        return ResponseEntity.ok(sessionService.toggleShare(sessionId, itemId, friendId));
    }


    @GetMapping("/{sessionId}/calculate") // Added {sessionId} to match the React call
    public ResponseEntity<List<DebtRes>> getSessionDebts(@PathVariable Long sessionId) {
        return ResponseEntity.ok(sessionService.calculateDebts(sessionId));
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long sessionId) {
        sessionService.deleteSession(sessionId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{sessionId}/friends/{friendId}")
    public ResponseEntity<SessionRes> deleteFriend(@PathVariable Long sessionId, @PathVariable Long friendId) {
        return ResponseEntity.ok(participantService.removeParticipant(sessionId, friendId));
    }

    @DeleteMapping("/{sessionId}/items/{itemId}")
    public ResponseEntity<SessionRes> deleteItem(@PathVariable Long sessionId, @PathVariable Long itemId) {
        return ResponseEntity.ok(sessionService.deleteItem(sessionId, itemId));
    }

    @PostMapping("/{sessionId}/items/bulk")
    public ResponseEntity<Responses.SessionRes> addItemsBulk(
            @PathVariable Long sessionId,
            @RequestBody Requests.BulkItemCreateReq req) {
        return ResponseEntity.ok(sessionService.addItemsBulk(sessionId, req));
    }

}