package com.shikkhaerp.modules.auth.service;

import com.shikkhaerp.modules.auth.dto.LockDTO;
import com.shikkhaerp.modules.user.entity.User;
import com.shikkhaerp.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

// Rewritten to be DATABASE-BACKED.
//
// The previous version stored locks in an in-memory HashMap, which meant locks
// disappeared on every restart (Render restarts/sleeps constantly), were never
// persisted, were not shared across instances, and were not thread-safe.
//
// Locks now live on the User row itself (locked_until / login_attempts), which
// is the same source of truth AuthService and the User entity already use — so
// the lock shown here always matches the lock actually enforced at login.
@Slf4j
@Service
@RequiredArgsConstructor
public class AccountLockService {

    private static final int LOCK_MINUTES = 30;
    private static final int MAX_ATTEMPTS = 5;

    private final UserRepository userRepository;

    private Optional<User> find(String userId) {
        try {
            return userRepository.findById(UUID.fromString(userId));
        } catch (IllegalArgumentException e) {
            log.warn("Invalid user id supplied to AccountLockService: {}", userId);
            return Optional.empty();
        }
    }

    private LockDTO toDto(User user) {
        boolean locked = user.isLocked();
        int attempts = user.getLoginAttempts() == null ? 0 : user.getLoginAttempts();

        return LockDTO.builder()
            .userId(String.valueOf(user.getId()))
            .email(user.getEmail())
            .locked(locked)
            .isLocked(locked)
            .lockType(locked ? "TEMPORARY" : "UNLOCKED")
            .status(locked ? "LOCKED" : "ACTIVE")
            .lockedAt(locked && user.getLockedUntil() != null
                    ? user.getLockedUntil().minusMinutes(LOCK_MINUTES) : null)
            .unlocksAt(locked ? user.getLockedUntil() : null)
            .failedAttempts(attempts)
            .maxAttempts(MAX_ATTEMPTS)
            .remainingAttempts(Math.max(0, MAX_ATTEMPTS - attempts))
            .build();
    }

    private LockDTO notFound(String userId) {
        return LockDTO.builder()
            .userId(userId)
            .locked(false)
            .isLocked(false)
            .status("ACTIVE")
            .maxAttempts(MAX_ATTEMPTS)
            .remainingAttempts(MAX_ATTEMPTS)
            .build();
    }

    @Transactional
    public LockDTO lockAccount(String userId, String email, String reason) {
        return find(userId).map(user -> {
            user.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_MINUTES));
            user.setLoginAttempts(MAX_ATTEMPTS);
            userRepository.save(user);
            log.info("Account locked: {} — {}", user.getEmail(), reason);

            LockDTO dto = toDto(user);
            dto.setLockReason(reason);
            return dto;
        }).orElseGet(() -> notFound(userId));
    }

    // This is the real admin "unlock" — it clears the lock in the database, so
    // the user can log in again immediately without waiting out the 30 minutes.
    @Transactional
    public LockDTO unlockAccount(String userId, String email, String reason) {
        return find(userId).map(user -> {
            user.setLockedUntil(null);
            user.setLoginAttempts(0);
            userRepository.save(user);
            log.info("Account unlocked: {} — {}", user.getEmail(), reason);

            LockDTO dto = toDto(user);
            dto.setUnlockedAt(LocalDateTime.now());
            dto.setLockReason(reason);
            return dto;
        }).orElseGet(() -> notFound(userId));
    }

    public LockDTO getAccountLockStatus(String userId) {
        return find(userId).map(this::toDto).orElseGet(() -> notFound(userId));
    }

    public boolean isAccountLocked(String userId) {
        return find(userId).map(User::isLocked).orElse(false);
    }
}
