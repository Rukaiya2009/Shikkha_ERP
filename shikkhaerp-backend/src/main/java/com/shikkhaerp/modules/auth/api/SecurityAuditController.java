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
import java.util.ArrayList;
import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/security")
public class SecurityAuditController {

    private final SecurityService securityService;
    private final AccountLockService accountLockService;
    private final AuditService auditService;

    // ==================== SECURITY EVENTS ENDPOINTS ====================

    @GetMapping("/events/user/{userId}")
    public ResponseEntity<List<SecurityDTO>> getUserSecurityEvents(@PathVariable String userId) {
        List<SecurityDTO> events = securityService.getUserSecurityEvents(userId);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/events/recent")
    public ResponseEntity<List<SecurityDTO>> getRecentSecurityEvents(@RequestParam(defaultValue = "50") int limit) {
        List<SecurityDTO> events = securityService.getRecentSecurityEvents(limit);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/events/type/{eventType}")
    public ResponseEntity<List<SecurityDTO>> getSecurityEventsByType(@PathVariable String eventType) {
        List<SecurityDTO> events = securityService.getSecurityEventsByType(eventType);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/events/high-severity")
    public ResponseEntity<List<SecurityDTO>> getHighSeverityEvents() {
        List<SecurityDTO> events = securityService.getHighSeverityEvents();
        return ResponseEntity.ok(events);
    }

    @GetMapping("/events/all")
    public ResponseEntity<List<SecurityDTO>> getAllSecurityEvents() {
        List<SecurityDTO> events = securityService.getAllSecurityEvents();
        return ResponseEntity.ok(events);
    }

    // ==================== ACCOUNT LOCK ENDPOINTS ====================

    @GetMapping("/account-lock/{userId}/status")
    public ResponseEntity<LockDTO> getLockStatus(@PathVariable String userId) {
        LockDTO lock = accountLockService.getAccountLockStatus(userId);
        return ResponseEntity.ok(lock);
    }

    @PostMapping("/account-lock/{userId}/lock")
    public ResponseEntity<LockDTO> lockAccount(
            @PathVariable String userId,
            @RequestParam String email,
            @RequestParam String reason) {
        LockDTO lock = accountLockService.lockAccount(userId, email, reason);
        return ResponseEntity.ok(lock);
    }

    @PostMapping("/account-lock/{userId}/unlock")
    public ResponseEntity<LockDTO> unlockAccount(
            @PathVariable String userId,
            @RequestParam String email,
            @RequestParam String reason) {
        LockDTO unlock = accountLockService.unlockAccount(userId, email, reason);
        return ResponseEntity.ok(unlock);
    }

    @GetMapping("/account-lock/{userId}/is-locked")
    public ResponseEntity<Boolean> isAccountLocked(@PathVariable String userId) {
        boolean locked = accountLockService.isAccountLocked(userId);
        return ResponseEntity.ok(locked);
    }

    // ==================== AUDIT LOG ENDPOINTS ====================

    @GetMapping("/audit-logs/user/{userId}")
    public ResponseEntity<List<AuditDTO>> getUserAuditLogs(@PathVariable String userId) {
        List<AuditDTO> logs = auditService.getUserAuditLogs(userId);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/audit-logs/action/{action}")
    public ResponseEntity<List<AuditDTO>> getAuditLogsByAction(@PathVariable String action) {
        List<AuditDTO> logs = auditService.getAuditLogsByAction(action);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/audit-logs/recent")
    public ResponseEntity<List<AuditDTO>> getRecentAuditLogs(@RequestParam(defaultValue = "50") int limit) {
        List<AuditDTO> logs = auditService.getRecentAuditLogs(limit);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/audit-logs/all")
    public ResponseEntity<List<AuditDTO>> getAllAuditLogs() {
        List<AuditDTO> logs = auditService.getAllAuditLogs();
        return ResponseEntity.ok(logs);
    }
}