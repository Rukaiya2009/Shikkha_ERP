package com.shikkhaerp.modules.auth.service;

import com.shikkhaerp.modules.auth.entity.BlacklistedToken;
import com.shikkhaerp.modules.auth.repository.BlacklistedTokenRepository;
import com.shikkhaerp.bootstrap.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

    private final BlacklistedTokenRepository blacklistedTokenRepository;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public void blacklistToken(String token, String userId) {
        if (token != null && !token.isEmpty()) {
            // Check if already blacklisted
            if (!blacklistedTokenRepository.existsByToken(token)) {
                BlacklistedToken blacklistedToken = new BlacklistedToken();
                blacklistedToken.setToken(token);
                blacklistedToken.setUserId(userId);
                blacklistedToken.setExpiresAt(LocalDateTime.now().plusDays(7)); // Match token expiry
                blacklistedTokenRepository.save(blacklistedToken);
            }
        }
    }

    public boolean isTokenBlacklisted(String token) {
        return blacklistedTokenRepository.existsByToken(token);
    }
}
