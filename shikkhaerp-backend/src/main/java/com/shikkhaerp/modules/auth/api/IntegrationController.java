//cat > src/main/java/com/shikkhaerp/modules/auth/api/IntegrationController.java << 'EOF'
package com.shikkhaerp.modules.auth.api;

import com.shikkhaerp.modules.auth.service.IntegrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;  // ← ADD THIS IMPORT

@RestController
@RequestMapping("/integration")
@RequiredArgsConstructor
public class IntegrationController {

    private final IntegrationService integrationService;

    @PostMapping("/oauth/link")
    public ResponseEntity<String> linkOAuthAccount(@RequestParam String userId, @RequestParam String provider,
                                                   @RequestParam String providerId, @RequestParam String email) {
        integrationService.linkOAuthAccount(userId, provider, providerId, email, null, null, null);
        return ResponseEntity.ok("OAuth account linked successfully");
    }

    @PostMapping("/apikey/generate")
    public ResponseEntity<String> generateApiKey(@RequestParam String userId, @RequestParam String name,
                                                 @RequestParam String permissions) {
        var apiKey = integrationService.generateApiKey(userId, name, permissions);
        return ResponseEntity.ok("API Key generated: " + apiKey.getApiKey());
    }

    @PostMapping("/apikey/revoke/{apiKeyId}")
    public ResponseEntity<String> revokeApiKey(@PathVariable UUID apiKeyId) {
        integrationService.revokeApiKey(apiKeyId);
        return ResponseEntity.ok("API Key revoked successfully");
    }

    @GetMapping("/apikey/validate")
    public ResponseEntity<Boolean> validateApiKey(@RequestParam String apiKey) {
        return ResponseEntity.ok(integrationService.validateApiKey(apiKey));
    }
}
