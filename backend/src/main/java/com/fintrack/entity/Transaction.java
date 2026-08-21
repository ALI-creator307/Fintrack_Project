package com.fintrack.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Transaction Entity
 * Stores income and expense records per user.
 * All amounts in PKR (Pakistani Rupees).
 */
@Entity
@Table(name = "transactions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The user who owns this transaction */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Short description e.g. "Monthly Salary", "Food Order" */
    @Column(nullable = false)
    private String name;

    /** Category key: salary, food, transport, shopping, etc. */
    @Column(nullable = false)
    private String category;

    /** Transaction date */
    @Column(nullable = false)
    private LocalDate date;

    /** Amount in PKR */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    /** "income" or "expense" */
    @Column(nullable = false)
    private String type;

    /** Optional note/description */
    @Column
    private String note;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
