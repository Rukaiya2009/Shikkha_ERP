package com.shikkhaerp.modules.auth.api;

import com.shikkhaerp.modules.auth.dto.SecurityDTO;
import com.shikkhaerp.modules.auth.service.SecurityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/security")
@RequiredArgsConstructor
public class SecurityController {

    private final SecurityService securityService;

    @GetMapping("/user/{userId}/history")
    public ResponseEntity<List<SecurityDTO>> getUserSecurityHistory(@PathVariable String userId) {
        var events = securityService.getUserSecurityEvents(userId);
        var dtos = events.stream()
            .map(event -> SecurityDTO.builder()
                .userId(event.getUserId())
                .email(event.getEmail())
                .eventType(event.getEventType())
                .description(event.getDescription())
                .severity(event.getSeverity())
                .ipAddress(event.getIpAddress())
                .userAgent(event.getUserAgent())
                .eventTime(event.getEventTime())
                .metadata(event.getMetadata())
                .build())
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/type/{eventType}")
    public ResponseEntity<List<SecurityDTO>> getEventsByType(@PathVariable String eventType) {
        var events = securityService.getSecurityEventsByType(eventType);
        var dtos = events.stream()
            .map(event -> SecurityDTO.builder()
                .userId(event.getUserId())
                .email(event.getEmail())
                .eventType(event.getEventType())
                .description(event.getDescription())
                .severity(event.getSeverity())
                .ipAddress(event.getIpAddress())
                .userAgent(event.getUserAgent())
                .eventTime(event.getEventTime())
                .metadata(event.getMetadata())
                .build())
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}