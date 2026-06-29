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
public class AuditDTO {
    private String id;
    private String userId;
    private String email;
    private String username;
    private String fullName;
    private String action;
    private String actionCategory;
    private String resource;
    private String resourceId;
    private String resourceType;
    private String oldValue;
    private String newValue;
    private Map<String, Object> changes;
    private String ipAddress;
    private String userAgent;
    private String deviceId;
    private String sessionId;
    private String status;
    private String severity;
    private String errorMessage;
    private String stackTrace;
    private String source;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String performedBy;
    private String tenantId;
    private String schoolId;
    private boolean success;
} 