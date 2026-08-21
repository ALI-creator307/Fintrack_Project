package com.fintrack.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal; /** Request body for creating a new goal */
@Data public class GoalRequest {
    @NotBlank(message = "Goal name is required")
    public String name;

    public String icon;
    public String bg;

    @NotNull(message = "Target amount is required")
    @DecimalMin(value = "1", message = "Target must be positive")
    public BigDecimal targetAmount;

    public String deadline;
}
