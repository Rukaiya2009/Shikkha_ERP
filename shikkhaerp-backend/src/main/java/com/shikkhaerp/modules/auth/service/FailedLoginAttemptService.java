//cat > src/main/java/com/shikkhaerp/modules/auth/service/FailedLoginAttemptService.java << 'EOF'
package com.shikkhaerp.modules.auth.service;

import com.shikkhaerp.modules.auth.entity.FailedLoginAttempt;
import com.shikkhaerp.modules.auth.repository.FailedLoginAttemptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FailedLoginAttemptService {

    private final FailedLoginAttemptRepository failedLoginAttemptRepository;

    @Transactional
    public FailedLoginAttempt recordFailedAttempt(String userId, String email, String ipAddress, 
                                                  String userAgent, String failureReason) {
        FailedLoginAttempt attempt = new FailedLoginAttempt();
        attempt.setUserId(userId);
        attempt.setEmail(email);
        attempt.setIpAddress(ipAddress);
        attempt.setUserAgent(userAgent);
        attempt.setFailureReason(failureReason);
        attempt.setAttemptTime(LocalDateTime.now());
        attempt.setResolved(false);
        return failedLoginAttemptRepository.save(attempt);
    }

    public List<FailedLoginAttempt> getUserFailedAttempts(String userId) {
        return failedLoginAttemptRepository.findByUserIdOrderByAttemptTimeDesc(userId);
    }

    public List<FailedLoginAttempt> getFailedAttemptsByEmail(String email) {
        return failedLoginAttemptRepository.findByEmailOrderByAttemptTimeDesc(email);
    }

    public long countFailedAttemptsSince(String email, LocalDateTime since) {
        return failedLoginAttemptRepository.countByEmailAndAttemptTimeAfter(email, since);
    }

    @Transactional
    public void resolveFailedAttempts(String email) {
        List<FailedLoginAttempt> attempts = failedLoginAttemptRepository.findByEmailOrderByAttemptTimeDesc(email);
        for (FailedLoginAttempt attempt : attempts) {
            if (!attempt.isResolved()) {
                attempt.setResolved(true);
                failedLoginAttemptRepository.save(attempt);
            }
        }
    }

    @Transactional
    public void cleanupOldAttempts(LocalDateTime before) {
        failedLoginAttemptRepository.deleteByAttemptTimeBefore(before);
    }
}
