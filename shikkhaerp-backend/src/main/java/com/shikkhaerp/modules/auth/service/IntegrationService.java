//cat > src/main/java/com/shikkhaerp/modules/auth/service/IntegrationService.java << 'EOF'
package com.shikkhaerp.modules.auth.service;

import com.shikkhaerp.modules.auth.entity.*;
import com.shikkhaerp.modules.auth.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IntegrationService {

    private final OAuth2AccountRepository oauth2AccountRepository;
    private final ApiKeyRepository apiKeyRepository;
    private final RateLimitRepository rateLimitRepository;
    private final ApiKeyAllowedEndpointRepository apiKeyAllowedEndpointRepository;

    // ==================== OAuth2 ====================

    @Transactional
    public OAuth2Account linkOAuthAccount(String userId, String provider, String providerId, String email,
                                          String accessToken, String refreshToken, LocalDateTime expiresAt) {
        OAuth2Account account = new OAuth2Account();
        account.setUserId(userId);
        account.setProvider(provider);
        account.setProviderId(providerId);
        account.setEmail(email);
        account.setAccessToken(accessToken);
        account.setRefreshToken(refreshToken);
        account.setExpiresAt(expiresAt);
        return oauth2AccountRepository.save(account);
    }

    // ==================== API Key ====================

    @Transactional
    public ApiKey generateApiKey(String userId, String name, String permissions) {
        ApiKey apiKey = new ApiKey();
        apiKey.setUserId(userId);
        apiKey.setApiKey(UUID.randomUUID().toString().replace("-", ""));
        apiKey.setName(name);
        apiKey.setPermissions(permissions);
        apiKey.setActive(true);
        apiKey.setCreatedAt(LocalDateTime.now());
        return apiKeyRepository.save(apiKey);
    }

    @Transactional
    public void revokeApiKey(UUID apiKeyId) {
        apiKeyRepository.findById(apiKeyId).ifPresent(key -> {
            key.setActive(false);
            apiKeyRepository.save(key);
        });
    }

    public boolean validateApiKey(String apiKey) {
        return apiKeyRepository.findByApiKey(apiKey)
            .map(key -> key.isActive() && (key.getExpiresAt() == null || LocalDateTime.now().isBefore(key.getExpiresAt())))
            .orElse(false);
    }

    // ==================== Rate Limit ====================

    @Transactional
    public RateLimit trackRequest(String userId, String ipAddress, String endpoint) {
        RateLimit rateLimit = new RateLimit();
        rateLimit.setUserId(userId);
        rateLimit.setIpAddress(ipAddress);
        rateLimit.setEndpoint(endpoint);
        rateLimit.setRequestCount(1);
        return rateLimitRepository.save(rateLimit);
    }

    public boolean isRateLimited(String userId, String ipAddress, String endpoint, int maxRequests) {
        // Check rate limit logic
        return false; // Placeholder - implement actual logic
    }
}
