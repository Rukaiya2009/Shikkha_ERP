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
public class AccountLockDTO {
    
    // ===== Identification =====
    private String id;  // Changed from UUID to String for consistency
    private String userId;
    private String email;
    private String username;
    private String fullName;
    
    // ===== Lock Information =====
    private LocalDateTime lockedAt;
    private LocalDateTime unlocksAt;
    private LocalDateTime lockedUntil;  // Alternative name for unlocksAt
    private String lockReason;
    private String lockType;  // TEMPORARY, PERMANENT, ADMIN, AUTOMATIC
    
    // ===== Status =====
    private boolean active;
    private boolean locked;
    private boolean permanent;
    private String status;  // LOCKED, UNLOCKED, EXPIRED, PERMANENT
    
    // ===== Attempts =====
    private int failedAttempts;
    private int maxAttempts;
    private int remainingAttempts;
    
    // ===== Context =====
    private String ipAddress;
    private String userAgent;
    private String deviceId;
    private String triggeredBy;  // User ID who triggered lock (if admin)
    
    // ===== Timestamps =====
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime unlockedAt;
    private LocalDateTime expiresAt;
    
    // ===== Additional Info =====
    private String notes;
    private String unlockReason;
    private String unlockedBy;  // User ID who unlocked (if admin)
    
    // ===== Factory Methods =====
    
    public static AccountLockDTOBuilder temporaryLock(String userId, String email, int failedAttempts, int maxAttempts) {
        LocalDateTime now = LocalDateTime.now();
        return AccountLockDTO.builder()
            .userId(userId)
            .email(email)
            .lockedAt(now)
            .unlocksAt(now.plusMinutes(30))
            .lockedUntil(now.plusMinutes(30))
            .lockType("TEMPORARY")
            .locked(true)
            .active(true)
            .status("LOCKED")
            .failedAttempts(failedAttempts)
            .maxAttempts(maxAttempts)
            .remainingAttempts(0)
            .lockReason("Too many failed login attempts");
    }
    
    public static AccountLockDTOBuilder permanentLock(String userId, String email, String reason) {
        LocalDateTime now = LocalDateTime.now();
        return AccountLockDTO.builder()
            .userId(userId)
            .email(email)
            .lockedAt(now)
            .lockType("PERMANENT")
            .locked(true)
            .permanent(true)
            .active(true)
            .status("PERMANENT")
            .lockReason(reason);
    }
    
    public static AccountLockDTOBuilder adminLock(String userId, String email, String reason, String adminId) {
        LocalDateTime now = LocalDateTime.now();
        return AccountLockDTO.builder()
            .userId(userId)
            .email(email)
            .lockedAt(now)
            .lockType("ADMIN")
            .locked(true)
            .active(true)
            .status("LOCKED")
            .lockReason(reason)
            .triggeredBy(adminId);
    }
    
    public static AccountLockDTOBuilder unlocked(String userId, String email, String unlockReason, String unlockedBy) {
        LocalDateTime now = LocalDateTime.now();
        return AccountLockDTO.builder()
            .userId(userId)
            .email(email)
            .unlockedAt(now)
            .locked(false)
            .active(true)
            .status("UNLOCKED")
            .unlockReason(unlockReason)
            .unlockedBy(unlockedBy);
    }
    
    // ===== Helper Methods =====
    
    public boolean isExpired() {
        if (unlocksAt == null) return false;
        return LocalDateTime.now().isAfter(unlocksAt);
    }
    
    public boolean isTemporary() {
        return "TEMPORARY".equals(lockType) || "AUTOMATIC".equals(lockType);
    }
    
    public boolean isPermanent() {
        return "PERMANENT".equals(lockType) || permanent;
    }
    
    public boolean isAdminLock() {
        return "ADMIN".equals(lockType);
    }
    
    public long getLockDurationMinutes() {
        if (lockedAt == null || unlocksAt == null) return 0;
        return java.time.Duration.between(lockedAt, unlocksAt).toMinutes();
    }
    
    public long getRemainingLockMinutes() {
        if (!locked || unlocksAt == null) return 0;
        if (LocalDateTime.now().isAfter(unlocksAt)) return 0;
        return java.time.Duration.between(LocalDateTime.now(), unlocksAt).toMinutes();
    }
}