//cat > src/main/java/com/shikkhaerp/modules/auth/service/SecurityService.java << 'EOF'
package com.shikkhaerp.modules.auth.service;

import com.shikkhaerp.modules.auth.entity.LoginHistory;
import com.shikkhaerp.modules.auth.entity.SecurityEvent;
import com.shikkhaerp.modules.auth.repository.LoginHistoryRepository;
import com.shikkhaerp.modules.auth.repository.SecurityEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SecurityService {

    private final SecurityEventRepository securityEventRepository;
    private final LoginHistoryRepository loginHistoryRepository;

    // ==================== LOGIN HISTORY METHODS ====================

    public List<LoginHistory> getUserLoginHistory(String userId) {
        return loginHistoryRepository.findByUserIdOrderByLoginTimeDesc(userId);
    }

    // ==================== SECURITY EVENT METHODS ====================

    @Transactional
    public SecurityEvent logSecurityEvent(String userId, String email, String eventType, 
                                          String description, String severity, String ipAddress, 
                                          String userAgent, String metadata) {
        SecurityEvent event = SecurityEvent.builder()
            .userId(userId)
            .email(email)
            .eventType(eventType)
            .description(description)
            .severity(severity)
            .ipAddress(ipAddress)
            .userAgent(userAgent)
            .metadata(metadata)
            .eventTime(LocalDateTime.now())
            .status("PENDING")
            .build();
        return securityEventRepository.save(event);
    }

    public List<SecurityEvent> getUserSecurityEvents(String userId) {
        return securityEventRepository.findByUserIdOrderByEventTimeDesc(userId);
    }

    public List<SecurityEvent> getSecurityEventsByType(String eventType) {
        return securityEventRepository.findByEventTypeOrderByEventTimeDesc(eventType);
    }

    public List<SecurityEvent> getSecurityEventsBySeverity(String severity) {
        return securityEventRepository.findBySeverityOrderByEventTimeDesc(severity);
    }

    public List<SecurityEvent> getSecurityEventsByDateRange(LocalDateTime start, LocalDateTime end) {
        return securityEventRepository.findByDateRange(start, end);
    }

    @Transactional
    public void resolveSecurityEvent(UUID eventId, String resolvedBy, String notes) {
        securityEventRepository.findById(eventId).ifPresent(event -> {
            event.setStatus("RESOLVED");
            event.setResolvedBy(resolvedBy);
            event.setResolutionNotes(notes);
            event.setResolvedAt(LocalDateTime.now());
            securityEventRepository.save(event);
        });
    }
}
