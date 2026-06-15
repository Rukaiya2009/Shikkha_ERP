package com.shikkhaerp.core.audit;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuditService {
    
    private final AuditRepository auditRepository;
    
    public void log(String userId, String username, String userRole, 
                    String action, String details, 
                    Object oldValue, Object newValue,
                    String entityType, String entityId,
                    HttpServletRequest request) {
        
        AuditLog auditLog = AuditLog.builder()
                .userId(userId)
                .username(username)
                .userRole(userRole)
                .action(action)
                .details(details)
                .oldValue(oldValue != null ? oldValue.toString() : null)
                .newValue(newValue != null ? newValue.toString() : null)
                .entityType(entityType)
                .entityId(entityId)
                .ipAddress(getClientIp(request))
                .userAgent(request != null ? request.getHeader("User-Agent") : null)
                .success(true)
                .build();
        
        auditRepository.save(auditLog);
        log.info("AUDIT: {} | User: {} | Entity: {}", action, username, entityType);
    }
    
    public void logError(String userId, String username, String userRole, String action, 
                         String errorMessage, HttpServletRequest request) {
        
        AuditLog auditLog = AuditLog.builder()
                .userId(userId)
                .username(username)
                .userRole(userRole)
                .action(action)
                .failureReason(errorMessage)
                .ipAddress(getClientIp(request))
                .userAgent(request != null ? request.getHeader("User-Agent") : null)
                .success(false)
                .build();
        
        auditRepository.save(auditLog);
        log.warn("AUDIT ERROR: {} | User: {} | Error: {}", action, username, errorMessage);
    }
    
    @Transactional(readOnly = true)
    public List<AuditLog> getUserAuditTrail(String userId) {
        return auditRepository.findByUserId(userId, Pageable.unpaged()).getContent();
    }
    
    @Transactional(readOnly = true)
    public List<AuditLog> getEntityAuditTrail(String entityType, String entityId) {
        return auditRepository.findByEntityTypeAndEntityId(entityType, entityId);
    }
    
    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogsByDateRange(LocalDateTime start, LocalDateTime end) {
        return auditRepository.findByCreatedAtBetween(start, end);
    }
    
    @Transactional(readOnly = true)
    public List<AuditLog> getRecentAuditLogs(int limit) {
        return auditRepository.findRecentAuditLogs(PageRequest.of(0, limit)).getContent();
    }
    
    private String getClientIp(HttpServletRequest request) {
        if (request == null) return null;
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}