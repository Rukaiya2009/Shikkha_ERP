package com.shikkhaerp.modules.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String refreshToken;
    private String tokenType;
    private String userId;
    private String email;
    private String name;
    private String fullName;
    private String role;
    private Long expiresIn;
    private Long refreshExpiresIn;
    private LocalDateTime issuedAt;
    private LocalDateTime expiresAt;
    private String message;
    private boolean success;
    private String status;
    private String redirectUrl;
    private String schoolId;
    private String tenantId;
}