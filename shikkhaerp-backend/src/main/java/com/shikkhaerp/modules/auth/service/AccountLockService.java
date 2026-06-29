package com.shikkhaerp.modules.auth.service;

import com.shikkhaerp.modules.auth.dto.LockDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountLockService {

    private final Map<String, LockDTO> accountLocks = new HashMap<>();

    public LockDTO lockAccount(String userId, String email, String reason) {
        LockDTO lock = LockDTO.builder()
            .userId(userId)
            .email(email)
            .locked(true)
            .isLocked(true)
            .lockType("TEMPORARY")
            .status("LOCKED")
            .lockedAt(LocalDateTime.now())
            .unlocksAt(LocalDateTime.now().plusMinutes(30))
            .lockReason(reason)
            .failedAttempts(5)
            .maxAttempts(5)
            .remainingAttempts(0)
            .build();
        
        accountLocks.put(userId, lock);
        log.info("Account locked: {} - {}", email, reason);
        return lock;
    }

    public LockDTO unlockAccount(String userId, String email, String reason) {
        LockDTO unlock = LockDTO.builder()
            .userId(userId)
            .email(email)
            .locked(false)
            .isLocked(false)
            .lockType("UNLOCKED")
            .status("UNLOCKED")
            .unlockedAt(LocalDateTime.now())
            .lockReason(reason)
            .build();
        
        accountLocks.remove(userId);
        log.info("Account unlocked: {} - {}", email, reason);
        return unlock;
    }

    public LockDTO getAccountLockStatus(String userId) {
        return accountLocks.getOrDefault(userId, 
            LockDTO.builder()
                .userId(userId)
                .locked(false)
                .isLocked(false)
                .status("ACTIVE")
                .build()
        );
    }

    public boolean isAccountLocked(String userId) {
        LockDTO lock = accountLocks.get(userId);
        if (lock == null) return false;
        
        // Check if lock has expired
        if (lock.getUnlocksAt() != null && LocalDateTime.now().isAfter(lock.getUnlocksAt())) {
            accountLocks.remove(userId);
            return false;
        }
        
        return lock.isLocked();
    }
}