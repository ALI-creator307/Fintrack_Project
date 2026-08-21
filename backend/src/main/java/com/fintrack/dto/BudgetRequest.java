package com.fintrack.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal; /** Request body for creating/updating a budget */
@Data public class BudgetRequest {
    @NotBlank(message = "Category is required")
    public String category;

    @NotNull(message = "Limit amount is required")
    @DecimalMin(value = "1", message = "Limit must be positive")
    public BigDecimal limitAmount;

    @NotNull @Min(1) @Max(12)
    public Integer month;

    @NotNull @Min(2020)
    public Integer year;
}
