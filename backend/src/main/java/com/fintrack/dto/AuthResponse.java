package com.fintrack.dto;

import lombok.Builder;
import lombok.Data; /** Response for successful login/register — includes JWT token */
@Data @Builder public class AuthResponse {
    public String token;
    public String type = "Bearer";
    public Long id;
    public String name;
    public String email;
    public String pictureUrl;
    public String provider;
}
