package com.shikkhaerp.modules.auth.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class SecurityDTO {
    private String userId;
    private String email;
    private String eventType;
    private String description;
    private String severity;
    private String ipAddress;
    private String userAgent;
    private LocalDateTime eventTime;
    private String metadata;
}