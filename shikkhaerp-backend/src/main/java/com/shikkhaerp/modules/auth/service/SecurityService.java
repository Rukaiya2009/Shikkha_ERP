package com.shikkhaerp.modules.auth.service;

import com.shikkhaerp.modules.auth.dto.SecurityDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SecurityService {

    private final List<SecurityDTO> securityEvents = new ArrayList<>();

    public void logSecurityEvent(SecurityDTO event) {
        event.setEventTime(LocalDateTime.now());
        securityEvents.add(event);
        log.info("Security event: {} - {} - {}", event.getEventType(), event.getEmail(), event.getSeverity());
    }

    public List<SecurityDTO> getUserSecurityEvents(String userId) {
        return securityEvents.stream()
            .filter(event -> userId.equals(event.getUserId()))
            .collect(Collectors.toList());
    }

    public List<SecurityDTO> getRecentSecurityEvents(int limit) {
        return securityEvents.stream()
            .sorted((a, b) -> b.getEventTime().compareTo(a.getEventTime()))
            .limit(limit)
            .collect(Collectors.toList());
    }

    public List<SecurityDTO> getSecurityEventsByType(String eventType) {
        return securityEvents.stream()
            .filter(event -> eventType.equals(event.getEventType()))
            .collect(Collectors.toList());
    }

    public List<SecurityDTO> getAllSecurityEvents() {
        return new ArrayList<>(securityEvents);
    }

    public List<SecurityDTO> getHighSeverityEvents() {
        return securityEvents.stream()
            .filter(event -> "HIGH".equals(event.getSeverity()) || "CRITICAL".equals(event.getSeverity()))
            .collect(Collectors.toList());
    }
}