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
public class LockDTO {
    private String id;
    private String userId;
    private String email;
    private String username;
    private boolean locked;
    private boolean isLocked;
    private String lockType;
    private String status;
    private LocalDateTime lockedAt;
    private LocalDateTime unlocksAt;
    private LocalDateTime lockedUntil;
    private String lockReason;
    private int failedAttempts;
    private int maxAttempts;
    private int remainingAttempts;
    private String ipAddress;
    private String userAgent;
    private String triggeredBy;
    private String unlockedBy;
    private LocalDateTime unlockedAt;
    private boolean permanent;
    private String notes;
}