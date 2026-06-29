package com.shikkhaerp.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshTokenRequest {
    
    @NotBlank(message = "Refresh token is required")
    private String refreshToken;
    
    // Optional: Add user identifier for validation
    private String userId;
    
    // Optional: Add device info for security tracking
    private String deviceId;
    private String userAgent;
    private String ipAddress;
}