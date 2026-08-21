package com.fintrack.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Goal Entity
 * Savings goals per user (e.g. Emergency Fund, Hajj Savings).
 */
@Entity
@Table(name = "goals")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The user who owns this goal */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Goal name e.g. "Emergency Fund", "Hajj Savings" */
    @Column(nullable = false)
    private String name;

    /** Emoji icon for display e.g. "🛡️" */
    @Column
    private String icon;

    /** Background color hex for card e.g. "#f0eeff" */
    @Column
    private String bg;

    /** Target amount in PKR */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal targetAmount;

    /** Amount saved so far */
    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal savedAmount = BigDecimal.ZERO;

    /** Deadline display string e.g. "Dec 2025" */
    @Column
    private String deadline;

    /** "active" or "completed" */
    @Column(nullable = false)
    @Builder.Default
    private String status = "active";

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
