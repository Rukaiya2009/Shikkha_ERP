package com.shikkhaerp.modules.auth.api;

import com.shikkhaerp.modules.auth.dto.AuditDTO;
import com.shikkhaerp.modules.auth.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @GetMapping("/user/{userId}")
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

    @GetMapping("/action/{action}")
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
}