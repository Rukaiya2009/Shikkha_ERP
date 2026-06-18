package com.shikkhaerp.modules.auth.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ComplianceDTO {
    private String userId;
    private String email;
    private String consentType;
    private boolean isGranted;
    private String requestType;
    private String status;
    private String alertType;
    private String message;
    private boolean isRead;
    private LocalDateTime createdAt;
}
