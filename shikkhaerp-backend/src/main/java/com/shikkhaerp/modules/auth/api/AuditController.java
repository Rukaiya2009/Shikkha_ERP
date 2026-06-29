package com.shikkhaerp.modules.auth.api;

import com.shikkhaerp.modules.auth.dto.AuditDTO;
import com.shikkhaerp.modules.auth.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AuditDTO>> getUserAuditLogs(@PathVariable String userId) {
        List<AuditDTO> logs = auditService.getUserAuditLogs(userId);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/action/{action}")
    public ResponseEntity<List<AuditDTO>> getAuditLogsByAction(@PathVariable String action) {
        List<AuditDTO> logs = auditService.getAuditLogsByAction(action);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<AuditDTO>> getRecentAuditLogs(@RequestParam(defaultValue = "50") int limit) {
        List<AuditDTO> logs = auditService.getRecentAuditLogs(limit);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/all")
    public ResponseEntity<List<AuditDTO>> getAllAuditLogs() {
        List<AuditDTO> logs = auditService.getAllAuditLogs();
        return ResponseEntity.ok(logs);
    }
}