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
public class LoginHistoryDTO {
    private String id;
    private String userId;
    private String email;
    private String username;
    private String fullName;
    private String ipAddress;
    private String userAgent;
    private String deviceId;
    private String sessionId;
    private String status;
    private String loginType;
    private String failureReason;
    private String source;
    private String country;
    private String city;
    private String region;
    private boolean success;
    private LocalDateTime loginTime;
    private LocalDateTime logoutTime;
    private Long sessionDuration;
    private String notes;
}