package com.fintrack.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data; /** Request body for POST /api/auth/login */
@Data public class LoginRequest {
    @Email(message = "Valid email required")
    @NotBlank public String email;
    @NotBlank public String password;
}
