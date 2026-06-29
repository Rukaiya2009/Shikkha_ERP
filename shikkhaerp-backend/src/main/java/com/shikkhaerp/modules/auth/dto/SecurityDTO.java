package com.shikkhaerp.modules.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecurityDTO {
    private String userId;
    private String email;
    private String username;
    private String fullName;
    private String eventType;
    private String eventCategory;
    private String description;
    private String severity;
    private String ipAddress;
    private String userAgent;
    private String deviceId;
    private String sessionId;
    private LocalDateTime eventTime;
    private LocalDateTime createdAt;
    private String status;
    private boolean success;
    private String failureReason;
    private String metadata;
    private Map<String, Object> details;
    private String source;
    private String country;
    private String city;
    private String region;
    private Double latitude;
    private Double longitude;
    private String notes;
}