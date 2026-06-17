package com.shikkhaerp.modules.auth.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class LoginHistoryDTO {
    private UUID id;
    private String userId;
    private String email;
    private String ipAddress;
    private String userAgent;
    private String status;
    private String failureReason;
    private LocalDateTime loginTime;
}