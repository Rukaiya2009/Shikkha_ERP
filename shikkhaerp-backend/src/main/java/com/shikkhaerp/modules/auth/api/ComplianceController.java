//cat > src/main/java/com/shikkhaerp/modules/auth/api/ComplianceController.java << 'EOF'
package com.shikkhaerp.modules.auth.api;

import com.shikkhaerp.modules.auth.service.ComplianceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;  // ← ADD THIS IMPORT

@RestController
@RequestMapping("/api/compliance")
@RequiredArgsConstructor
public class ComplianceController {

    private final ComplianceService complianceService;

    // GDPR Consent
    @PostMapping("/consent/{userId}/{consentType}")
    public ResponseEntity<String> recordConsent(@PathVariable String userId, @PathVariable String consentType,
                                                @RequestParam String ipAddress) {
        complianceService.recordConsent(userId, consentType, ipAddress);
        return ResponseEntity.ok("Consent recorded");
    }

    // Data Export
    @PostMapping("/export/{userId}")
    public ResponseEntity<String> requestDataExport(@PathVariable String userId) {
        var request = complianceService.requestDataExport(userId);
        return ResponseEntity.ok("Data export requested with ID: " + request.getId());
    }

    // Account Deletion
    @PostMapping("/deletion/{userId}/{email}")
    public ResponseEntity<String> requestAccountDeletion(@PathVariable String userId, @PathVariable String email) {
        var request = complianceService.requestAccountDeletion(userId, email);
        return ResponseEntity.ok("Account deletion requested with ID: " + request.getId());
    }

    // Login Alerts
    @GetMapping("/alerts/{userId}")
    public ResponseEntity<?> getUnreadAlerts(@PathVariable String userId) {
        return ResponseEntity.ok(complianceService.getUnreadAlerts(userId));
    }

    @PostMapping("/alert/read/{alertId}")
    public ResponseEntity<String> markAlertAsRead(@PathVariable UUID alertId) {
        complianceService.markAlertAsRead(alertId);
        return ResponseEntity.ok("Alert marked as read");
    }
}
