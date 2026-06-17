package com.shikkhaerp.modules.auth.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class AccountLockDTO {
    private UUID id;
    private String userId;
    private String email;
    private LocalDateTime lockedAt;
    private LocalDateTime unlocksAt;
    private String lockReason;
    private boolean isActive;
    private int failedAttempts;
    private boolean isLocked;
}