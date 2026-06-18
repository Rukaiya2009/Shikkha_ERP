package com.shikkhaerp.modules.auth.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class AuditLogDTO {
    private UUID id;
    private String userId;
    private String email;
    private String action;
    private String resource;
    private String resourceId;
    private String oldValue;
    private String newValue;
    private String ipAddress;
    private String userAgent;
    private String status;
    private String errorMessage;
    private LocalDateTime createdAt;
}