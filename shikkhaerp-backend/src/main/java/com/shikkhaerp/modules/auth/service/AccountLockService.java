//cat > src/main/java/com/shikkhaerp/modules/auth/service/AccountLockService.java << 'EOF'
package com.shikkhaerp.modules.auth.service;

import com.shikkhaerp.modules.auth.entity.AccountLock;
import com.shikkhaerp.modules.auth.repository.AccountLockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AccountLockService {

    private final AccountLockRepository accountLockRepository;
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCK_DURATION_MINUTES = 30;

    @Transactional
    public AccountLock lockAccount(String userId, String email, String reason) {
        accountLockRepository.deactivateByUserId(userId);

        AccountLock lock = new AccountLock();
        lock.setUserId(userId);
        lock.setEmail(email);
        lock.setLockReason(reason);
        lock.setLockedAt(LocalDateTime.now());
        lock.setUnlocksAt(LocalDateTime.now().plusMinutes(LOCK_DURATION_MINUTES));
        lock.setActive(true);
        lock.setFailedAttempts(MAX_FAILED_ATTEMPTS);
        return accountLockRepository.save(lock);
    }

    @Transactional
    public void unlockAccount(String userId) {
        accountLockRepository.deactivateByUserId(userId);
    }

    public boolean isAccountLocked(String userId) {
        Optional<AccountLock> lock = accountLockRepository.findByUserIdAndIsActiveTrue(userId);
        return lock.isPresent() && lock.get().isLocked();
    }

    public Optional<AccountLock> getActiveLock(String userId) {
        return accountLockRepository.findByUserIdAndIsActiveTrue(userId);
    }

    @Transactional
    public void incrementFailedAttempts(String userId, String email) {
        Optional<AccountLock> existingLock = accountLockRepository.findByUserIdAndIsActiveTrue(userId);
        
        if (existingLock.isPresent()) {
            AccountLock lock = existingLock.get();
            lock.setFailedAttempts(lock.getFailedAttempts() + 1);
            if (lock.getFailedAttempts() >= MAX_FAILED_ATTEMPTS) {
                lock.setActive(true);
                lock.setUnlocksAt(LocalDateTime.now().plusMinutes(LOCK_DURATION_MINUTES));
            }
            accountLockRepository.save(lock);
        } else {
            AccountLock newLock = new AccountLock();
            newLock.setUserId(userId);
            newLock.setEmail(email);
            newLock.setFailedAttempts(1);
            newLock.setActive(false);
            newLock.setLockedAt(LocalDateTime.now());
            accountLockRepository.save(newLock);
        }
    }

    @Transactional
    public void resetFailedAttempts(String userId) {
        accountLockRepository.deactivateByUserId(userId);
    }

    @Transactional
    public void cleanupExpiredLocks() {
        accountLockRepository.deactivateExpiredLocks(LocalDateTime.now());
    }
}
