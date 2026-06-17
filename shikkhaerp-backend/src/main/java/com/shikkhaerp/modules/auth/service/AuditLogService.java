//cat > src/main/java/com/shikkhaerp/modules/auth/service/AuditLogService.java << 'EOF'
package com.shikkhaerp.modules.auth.service;

import com.shikkhaerp.modules.auth.entity.AuditLog;
import com.shikkhaerp.modules.auth.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public AuditLog logAction(String userId, String email, String action, String resource,
                              String resourceId, String oldValue, String newValue,
                              String ipAddress, String userAgent, String status, String errorMessage) {
        AuditLog log = new AuditLog();
        log.setUserId(userId);
        log.setEmail(email);
        log.setAction(action);
        log.setResource(resource);
        log.setResourceId(resourceId);
        log.setOldValue(oldValue);
        log.setNewValue(newValue);
        log.setIpAddress(ipAddress);
        log.setUserAgent(userAgent);
        log.setStatus(status);
        log.setErrorMessage(errorMessage);
        log.setCreatedAt(LocalDateTime.now());
        return auditLogRepository.save(log);
    }

    public List<AuditLog> getUserAuditLogs(String userId) {
        return auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<AuditLog> getAuditLogsByAction(String action) {
        return auditLogRepository.findByActionOrderByCreatedAtDesc(action);
    }

    public List<AuditLog> getAuditLogsByResource(String resource) {
        return auditLogRepository.findByResourceOrderByCreatedAtDesc(resource);
    }

    public List<AuditLog> getAuditLogsByDateRange(LocalDateTime start, LocalDateTime end) {
        return auditLogRepository.findByDateRange(start, end);
    }

    public long countByAction(String action) {
        return auditLogRepository.countByAction(action);
    }
}
