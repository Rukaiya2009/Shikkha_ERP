//cat > src/main/java/com/shikkhaerp/modules/auth/api/SecurityAuditController.java << 'EOF'
package com.shikkhaerp.modules.auth.api;

import com.shikkhaerp.modules.auth.dto.AuditDTO;
import com.shikkhaerp.modules.auth.dto.LockDTO;
import com.shikkhaerp.modules.auth.dto.SecurityDTO;
import com.shikkhaerp.modules.auth.service.AccountLockService;
import com.shikkhaerp.modules.auth.service.AuditService;
import com.shikkhaerp.modules.auth.service.SecurityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/security")
public class SecurityAuditController {

    private final SecurityService securityService;
    private final AccountLockService accountLockService;
    private final AuditService auditService;

    // ==================== LOGIN HISTORY ENDPOINTS ====================

    @GetMapping("/login-history/user/{userId}")
    public ResponseEntity<List<SecurityDTO>> getUserLoginHistory(@PathVariable String userId) {
        var history = securityService.getUserLoginHistory(userId);
        var dtos = history.stream()
            .map(h -> SecurityDTO.builder()
                .userId(h.getUserId())
                .email(h.getEmail())
                .ipAddress(h.getIpAddress())
                .userAgent(h.getUserAgent())
                .eventTime(h.getLoginTime())
                .description(h.isSuccess() ? "Login successful" : "Login failed: " + h.getFailureReason())
                .severity(h.isSuccess() ? "INFO" : "WARNING")
                .build())
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/login-history/date-range")
    public ResponseEntity<List<SecurityDTO>> getLoginHistoryByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        // Note: Add date range method to SecurityService if needed
        return ResponseEntity.ok(List.of());
    }

    // ==================== ACCOUNT LOCK ENDPOINTS ====================

    @GetMapping("/account-lock/{userId}/status")
    public ResponseEntity<LockDTO> getLockStatus(@PathVariable String userId) {
        boolean isLocked = accountLockService.isAccountLocked(userId);
        var lock = accountLockService.getActiveLock(userId);
        
        LockDTO dto = LockDTO.builder()
            .userId(userId)
            .isLocked(isLocked)
            .lockedAt(lock.map(l -> l.getLockedAt()).orElse(null))
            .unlocksAt(lock.map(l -> l.getUnlocksAt()).orElse(null))
            .lockReason(lock.map(l -> l.getLockReason()).orElse(null))
            .failedAttempts(lock.map(l -> l.getFailedAttempts()).orElse(0))
            .build();
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/account-lock/{userId}/unlock")
    public ResponseEntity<String> unlockAccount(@PathVariable String userId) {
        accountLockService.unlockAccount(userId);
        return ResponseEntity.ok("Account unlocked successfully");
    }

    // ==================== AUDIT LOG ENDPOINTS ====================

    @GetMapping("/audit-logs/user/{userId}")
    public ResponseEntity<List<AuditDTO>> getUserAuditLogs(@PathVariable String userId) {
        var logs = auditService.getUserAuditLogs(userId);
        var dtos = logs.stream()
            .map(log -> AuditDTO.builder()
                .userId(log.getUserId())
                .email(log.getEmail())
                .action(log.getAction())
                .resource(log.getResource())
                .resourceId(log.getResourceId())
                .oldValue(log.getOldValue())
                .newValue(log.getNewValue())
                .ipAddress(log.getIpAddress())
                .userAgent(log.getUserAgent())
                .status(log.getStatus())
                .errorMessage(log.getErrorMessage())
                .createdAt(log.getCreatedAt())
                .build())
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/audit-logs/action/{action}")
    public ResponseEntity<List<AuditDTO>> getAuditLogsByAction(@PathVariable String action) {
        var logs = auditService.getAuditLogsByAction(action);
        var dtos = logs.stream()
            .map(log -> AuditDTO.builder()
                .userId(log.getUserId())
                .email(log.getEmail())
                .action(log.getAction())
                .resource(log.getResource())
                .resourceId(log.getResourceId())
                .oldValue(log.getOldValue())
                .newValue(log.getNewValue())
                .ipAddress(log.getIpAddress())
                .userAgent(log.getUserAgent())
                .status(log.getStatus())
                .errorMessage(log.getErrorMessage())
                .createdAt(log.getCreatedAt())
                .build())
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/audit-logs/date-range")
    public ResponseEntity<List<AuditDTO>> getAuditLogsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        var logs = auditService.getAuditLogsByDateRange(start, end);
        var dtos = logs.stream()
            .map(log -> AuditDTO.builder()
                .userId(log.getUserId())
                .email(log.getEmail())
                .action(log.getAction())
                .resource(log.getResource())
                .resourceId(log.getResourceId())
                .oldValue(log.getOldValue())
                .newValue(log.getNewValue())
                .ipAddress(log.getIpAddress())
                .userAgent(log.getUserAgent())
                .status(log.getStatus())
                .errorMessage(log.getErrorMessage())
                .createdAt(log.getCreatedAt())
                .build())
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
