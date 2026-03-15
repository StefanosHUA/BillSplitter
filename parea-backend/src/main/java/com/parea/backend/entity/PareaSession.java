package com.parea.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "parea_sessions")
@Data
@NoArgsConstructor
public class PareaSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title; // e.g., "Klimataria Taverna"
    private LocalDateTime sessionDate = LocalDateTime.now();
    private Double receiptTotal;
    private String receiptImageUrl;
    private boolean isSettled = false;

    @ManyToOne
    @JoinColumn(name = "host_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private AppUser host;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Participant> participants = new ArrayList<>();

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<ReceiptItem> receiptItems = new ArrayList<>();

}