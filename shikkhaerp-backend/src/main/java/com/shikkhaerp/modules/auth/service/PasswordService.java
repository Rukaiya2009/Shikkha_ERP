package com.shikkhaerp.modules.auth.service;

import com.shikkhaerp.modules.user.entity.User;
import com.shikkhaerp.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ===== EXISTING METHODS =====
    
    public void changePassword(String email, String oldPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Invalid old password");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(java.time.LocalDateTime.now());
        userRepository.save(user);
        log.info("Password changed for user: {}", email);
    }

    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(java.time.LocalDateTime.now());
        userRepository.save(user);
        log.info("Password reset for user: {}", email);
    }

    public boolean validatePassword(String email, String password) {
        return userRepository.findByEmail(email)
            .map(user -> passwordEncoder.matches(password, user.getPassword()))
            .orElse(false);
    }

    // ===== ADD THESE MISSING METHODS =====

    /**
     * Check if the new password has been used before
     */
    public boolean isPasswordReused(String email, String newPassword) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return false;
        return passwordEncoder.matches(newPassword, user.getPassword());
    }

    /**
     * Get count of password history entries
     */
    public int getPasswordHistoryCount(String email) {
        // Simplified - returns 1 if user exists, 0 otherwise
        return userRepository.findByEmail(email).isPresent() ? 1 : 0;
    }
}