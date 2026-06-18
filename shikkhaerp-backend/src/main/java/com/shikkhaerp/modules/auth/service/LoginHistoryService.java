//cat > src/main/java/com/shikkhaerp/modules/auth/service/LoginHistoryService.java << 'EOF'
package com.shikkhaerp.modules.auth.service;

import com.shikkhaerp.modules.auth.entity.LoginHistory;
import com.shikkhaerp.modules.auth.repository.LoginHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LoginHistoryService {

    private final LoginHistoryRepository loginHistoryRepository;

    @Transactional
    public LoginHistory recordLogin(String userId, String email, String ipAddress, 
                                    String userAgent, boolean success, String failureReason) {
        LoginHistory history = new LoginHistory();
        history.setUserId(userId);
        history.setEmail(email);
        history.setIpAddress(ipAddress);
        history.setUserAgent(userAgent);
        history.setSuccess(success);
        history.setFailureReason(failureReason);
        history.setLoginTime(LocalDateTime.now());
        return loginHistoryRepository.save(history);
    }

    public List<LoginHistory> getUserLoginHistory(String userId) {
        return loginHistoryRepository.findByUserIdOrderByLoginTimeDesc(userId);
    }

    public List<LoginHistory> getUserLoginHistoryByEmail(String email) {
        return loginHistoryRepository.findByEmailOrderByLoginTimeDesc(email);
    }

    public List<LoginHistory> getLoginHistoryByDateRange(LocalDateTime start, LocalDateTime end) {
        return loginHistoryRepository.findByDateRange(start, end);
    }

    public long countFailedLogins(String email, LocalDateTime since) {
        return loginHistoryRepository.countFailedLogins(email, since);
    }
}
