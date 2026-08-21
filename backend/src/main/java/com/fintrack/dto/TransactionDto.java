package com.fintrack.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime; /** Response object for a single transaction */
@Data @Builder public class TransactionDto {
    public Long id;
    public String name;
    public String category;
    public LocalDate date;
    public BigDecimal amount;
    public String type;
    public String note;
    public LocalDateTime createdAt;
}
