//cat > src/main/java/com/shikkhaerp/modules/auth/api/AdvancedSecurityController.java << 'EOF'
package com.shikkhaerp.modules.auth.api;

import com.shikkhaerp.modules.auth.dto.AdvancedSecurityDTO;
import com.shikkhaerp.modules.auth.service.AdvancedSecurityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/security/advanced")
@RequiredArgsConstructor
public class AdvancedSecurityController {

    private final AdvancedSecurityService securityService;

    // 2FA
    @PostMapping("/2fa/enable/{userId}")
    public ResponseEntity<String> enable2FA(@PathVariable String userId, @RequestParam String secretKey) {
        securityService.enable2FA(userId, secretKey);
        return ResponseEntity.ok("2FA enabled successfully");
    }

    @PostMapping("/2fa/disable/{userId}")
    public ResponseEntity<String> disable2FA(@PathVariable String userId) {
        securityService.disable2FA(userId);
        return ResponseEntity.ok("2FA disabled successfully");
    }

    @GetMapping("/2fa/status/{userId}")
    public ResponseEntity<Boolean> is2FAEnabled(@PathVariable String userId) {
        return ResponseEntity.ok(securityService.is2FAEnabled(userId));
    }

    // MFA Backup Codes
    @PostMapping("/mfa/backup-codes/{userId}")
    public ResponseEntity<List<String>> generateBackupCodes(@PathVariable String userId) {
        var codes = securityService.generateBackupCodes(userId, 10);
        return ResponseEntity.ok(codes.stream().map(c -> c.getBackupCode()).toList());
    }

    @PostMapping("/mfa/validate-backup-code")
    public ResponseEntity<Boolean> validateBackupCode(@RequestParam String userId, @RequestParam String backupCode) {
        return ResponseEntity.ok(securityService.validateBackupCode(userId, backupCode));
    }

    // Device Management
    @PostMapping("/device/register")
    public ResponseEntity<String> registerDevice(@RequestParam String userId, @RequestParam String deviceId,
                                                 @RequestParam String deviceName, @RequestParam String deviceType) {
        securityService.registerDevice(userId, deviceId, deviceName, deviceType);
        return ResponseEntity.ok("Device registered successfully");
    }

    @PostMapping("/device/trust/{userId}/{deviceId}")
    public ResponseEntity<String> trustDevice(@PathVariable String userId, @PathVariable String deviceId) {
        securityService.trustDevice(userId, deviceId);
        return ResponseEntity.ok("Device trusted successfully");
    }

    @GetMapping("/device/list/{userId}")
    public ResponseEntity<?> getUserDevices(@PathVariable String userId) {
        return ResponseEntity.ok(securityService.getUserDevices(userId));
    }

    // IP Whitelist
    @PostMapping("/ip/whitelist")
    public ResponseEntity<String> addIpToWhitelist(@RequestParam String ipAddress, @RequestParam String description) {
        securityService.addIpToWhitelist(ipAddress, description);
        return ResponseEntity.ok("IP added to whitelist");
    }

    @GetMapping("/ip/whitelist/{ipAddress}")
    public ResponseEntity<Boolean> isIpWhitelisted(@PathVariable String ipAddress) {
        return ResponseEntity.ok(securityService.isIpWhitelisted(ipAddress));
    }
}
