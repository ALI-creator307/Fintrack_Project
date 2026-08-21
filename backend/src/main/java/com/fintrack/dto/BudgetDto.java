package com.fintrack.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

// ============================================================
//  FinTrack — Data Transfer Objects (DTOs)
//  Separates API contract from internal JPA entities.
// ============================================================

// ── Auth DTOs ────────────────────────────────────────────────

// ── User DTO ─────────────────────────────────────────────────

// ── Transaction DTOs ─────────────────────────────────────────

// ── Budget DTOs ──────────────────────────────────────────────

/** Response object for a budget — includes calculated spent amount */
@Data @Builder public class BudgetDto {
    public Long id;
    public String category;
    public BigDecimal limitAmount;
    public BigDecimal spentAmount;   // calculated from transactions
    public Integer month;
    public Integer year;
}

// ── Goal DTOs ────────────────────────────────────────────────

