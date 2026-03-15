package com.parea.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Entity
@Table(name = "participants")
@Data
@NoArgsConstructor
public class Participant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(precision = 10, scale = 2)
    private BigDecimal amountPaid = BigDecimal.ZERO;

    public boolean isFullySettled(BigDecimal currentDebt) {
        if (currentDebt == null) return false;
        return amountPaid.compareTo(currentDebt) >= 0;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private PareaSession session;

}