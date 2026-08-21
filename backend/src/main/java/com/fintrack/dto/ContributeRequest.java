package com.fintrack.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal; /** Request body for adding contribution to a goal */
@Data public class ContributeRequest {
    @NotNull @DecimalMin(value = "0.01")
    public BigDecimal amount;
}
