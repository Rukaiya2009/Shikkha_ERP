package com.shikkhaerp.modules.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

    private final Set<String> blacklistedTokens = new HashSet<>();

    public void blacklistToken(String token, String userId) {
        blacklistedTokens.add(token);
        log.info("Token blacklisted for user: {}", userId);
    }

    public boolean isTokenBlacklisted(String token) {
        return blacklistedTokens.contains(token);
    }
}