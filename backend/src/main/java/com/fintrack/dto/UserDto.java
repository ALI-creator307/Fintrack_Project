package com.fintrack.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder public class UserDto {
    public Long id;
    public String name;
    public String email;
    public String pictureUrl;
    public String provider;
    public LocalDateTime createdAt;
}
