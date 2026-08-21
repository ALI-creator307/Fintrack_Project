package com.fintrack.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime; /** Response object for a goal */
@Data @Builder public class GoalDto {
    public Long id;
    public String name;
    public String icon;
    public String bg;
    public BigDecimal targetAmount;
    public BigDecimal savedAmount;
    public String deadline;
    public String status;
    public Integer percentComplete;
    public LocalDateTime createdAt;
}
