package com.fintrack.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate; /** Request body for creating/updating a transaction */
@Data public class TransactionRequest {
    @NotBlank(message = "Transaction name is required")
    public String name;

    @NotBlank(message = "Category is required")
    public String category;

    @NotNull(message = "Date is required")
    public LocalDate date;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be positive")
    public BigDecimal amount;

    @NotBlank(message = "Type must be 'income' or 'expense'")
    @Pattern(regexp = "income|expense", message = "Type must be 'income' or 'expense'")
    public String type;

    public String note;
}
