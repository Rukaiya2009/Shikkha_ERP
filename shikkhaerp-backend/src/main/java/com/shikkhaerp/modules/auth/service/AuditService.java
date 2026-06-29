package com.shikkhaerp.modules.auth.service;

import com.shikkhaerp.modules.auth.dto.AuditDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    // In-memory storage for demo - replace with actual repository
    private final List<AuditDTO> auditLogs = new ArrayList<>();

    public void logAction(AuditDTO audit) {
        audit.setCreatedAt(LocalDateTime.now());
        auditLogs.add(audit);
        log.info("Audit log: {} - {}", audit.getAction(), audit.getEmail());
    }

    public List<AuditDTO> getUserAuditLogs(String userId) {
        return auditLogs.stream()
            .filter(log -> userId.equals(log.getUserId()))
            .toList();
    }

    public List<AuditDTO> getRecentAuditLogs(int limit) {
        return auditLogs.stream()
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .limit(limit)
            .toList();
    }

    public List<AuditDTO> getAuditLogsByAction(String action) {
        return auditLogs.stream()
            .filter(log -> action.equals(log.getAction()))
            .toList();
    }

    public List<AuditDTO> getAllAuditLogs() {
        return new ArrayList<>(auditLogs);
    }
}