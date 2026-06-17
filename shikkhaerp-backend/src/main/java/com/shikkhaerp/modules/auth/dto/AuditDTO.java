package com.shikkhaerp.modules.auth.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class AuditDTO {
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