package com.parea.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "receipt_items")
@Getter // Use individual annotations
@Setter
@NoArgsConstructor
public class ReceiptItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String itemName;
    private Double price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private PareaSession session;

    @ManyToMany
    @JoinTable(
            name = "item_shares",
            joinColumns = @JoinColumn(name = "item_id"),
            inverseJoinColumns = @JoinColumn(name = "participant_id")
    )
    private List<Participant> sharedBy = new ArrayList<>();

    // Explicitly do NOT override equals/hashCode.
    // This ensures two items with null IDs are unique based on their memory reference.
}