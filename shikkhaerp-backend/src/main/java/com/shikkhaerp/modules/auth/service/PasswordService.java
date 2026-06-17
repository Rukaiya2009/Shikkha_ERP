//cat > src/main/java/com/shikkhaerp/modules/auth/service/PasswordService.java << 'EOF'
package com.shikkhaerp.modules.auth.service;

import com.shikkhaerp.modules.auth.entity.PasswordHistory;
import com.shikkhaerp.modules.auth.repository.PasswordHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PasswordService {

    private final PasswordHistoryRepository passwordHistoryRepository;
    private final PasswordEncoder passwordEncoder;
    private static final int PASSWORD_HISTORY_LIMIT = 5;

    @Transactional
    public PasswordHistory savePasswordHistory(String userId, String encodedPassword) {
        PasswordHistory history = new PasswordHistory();
        history.setUserId(userId);
        history.setPasswordHash(encodedPassword);
        return passwordHistoryRepository.save(history);
    }

    public boolean isPasswordReused(String userId, String newPassword) {
        List<String> lastPasswords = passwordHistoryRepository.findLastPasswordHashesWithLimit(
            userId, PASSWORD_HISTORY_LIMIT
        );
        
        for (String oldHash : lastPasswords) {
            if (passwordEncoder.matches(newPassword, oldHash)) {
                return true;
            }
        }
        return false;
    }

    public long getPasswordHistoryCount(String userId) {
        return passwordHistoryRepository.countByUserId(userId);
    }

    @Transactional
    public void clearPasswordHistory(String userId) {
        passwordHistoryRepository.deleteByUserId(userId);
    }
}
