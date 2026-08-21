package com.fintrack.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Budget Entity
 * Monthly spending limit per category per user.
 * Uniqueness: one budget per (user + category + month + year).
 */
@Entity
@Table(
    name = "budgets",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"user_id", "category", "month", "year"}
    )
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The user who owns this budget */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Category key: food, transport, shopping, etc. */
    @Column(nullable = false)
    private String category;

    /** Monthly budget limit in PKR */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal limitAmount;

    /** Month number: 1–12 */
    @Column(nullable = false)
    private Integer month;

    /** 4-digit year: 2024, 2025, etc. */
    @Column(nullable = false)
    private Integer year;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
