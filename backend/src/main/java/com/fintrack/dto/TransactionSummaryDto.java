package com.fintrack.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal; /** Dashboard summary: totals for income, expense, balance, savings */
@Data @Builder public class TransactionSummaryDto {
    public BigDecimal totalIncome;
    public BigDecimal totalExpense;
    public BigDecimal balance;
    public BigDecimal savings;
}
