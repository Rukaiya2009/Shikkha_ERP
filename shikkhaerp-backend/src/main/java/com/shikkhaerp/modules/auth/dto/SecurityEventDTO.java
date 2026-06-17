package com.shikkhaerp.modules.auth.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class SecurityEventDTO {
    private UUID id;
    private String userId;
    private String email;
    private String eventType;
    private String description;
    private String severity;
    private String ipAddress;
    private String userAgent;
    private String metadata;
    private LocalDateTime eventTime;
}