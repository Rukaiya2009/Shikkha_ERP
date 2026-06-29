package com.shikkhaerp.modules.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecurityEventDTO {
    
    // ===== Identification =====
    private String id;  // Changed from UUID to String for consistency
    private String userId;
    private String email;
    private String username;
    private String fullName;
    
    // ===== Event Information =====
    private String eventType;          // LOGIN, LOGOUT, PASSWORD_CHANGE, etc.
    private String eventCategory;      // AUTH, ADMIN, USER, SYSTEM, SECURITY
    private String description;
    private String severity;           // LOW, MEDIUM, HIGH, CRITICAL
    private String status;             // SUCCESS, FAILED, PENDING, BLOCKED
    private boolean success;
    private String failureReason;
    
    // ===== Request Information =====
    private String ipAddress;
    private String userAgent;
    private String deviceId;
    private String sessionId;
    private String source;             // WEB, MOBILE, API, ADMIN
    
    // ===== Location Data =====
    private String country;
    private String city;
    private String region;
    private Double latitude;
    private Double longitude;
    
    // ===== Timestamps =====
    private LocalDateTime eventTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // ===== Additional Data =====
    private String metadata;           // JSON string
    private Map<String, Object> details; // Structured metadata
    private String notes;
    
    // ===== Factory Methods =====
    
    public static SecurityEventDTOBuilder loginEvent(String email, String ipAddress, boolean success) {
        return SecurityEventDTO.builder()
            .email(email)
            .eventType("LOGIN")
            .eventCategory("AUTH")
            .ipAddress(ipAddress)
            .eventTime(LocalDateTime.now())
            .success(success)
            .status(success ? "SUCCESS" : "FAILED")
            .severity(success ? "LOW" : "MEDIUM");
    }
    
    public static SecurityEventDTOBuilder logoutEvent(String userId, String email) {
        return SecurityEventDTO.builder()
            .userId(userId)
            .email(email)
            .eventType("LOGOUT")
            .eventCategory("AUTH")
            .eventTime(LocalDateTime.now())
            .success(true)
            .status("SUCCESS")
            .severity("LOW");
    }
    
    public static SecurityEventDTOBuilder passwordChangeEvent(String userId, String email, String ipAddress) {
        return SecurityEventDTO.builder()
            .userId(userId)
            .email(email)
            .eventType("PASSWORD_CHANGE")
            .eventCategory("AUTH")
            .ipAddress(ipAddress)
            .eventTime(LocalDateTime.now())
            .severity("MEDIUM")
            .status("SUCCESS")
            .success(true);
    }
    
    public static SecurityEventDTOBuilder passwordResetEvent(String email, String ipAddress) {
        return SecurityEventDTO.builder()
            .email(email)
            .eventType("PASSWORD_RESET")
            .eventCategory("AUTH")
            .ipAddress(ipAddress)
            .eventTime(LocalDateTime.now())
            .severity("HIGH")
            .status("SUCCESS")
            .success(true);
    }
    
    public static SecurityEventDTOBuilder suspiciousActivity(String email, String description, String ipAddress) {
        return SecurityEventDTO.builder()
            .email(email)
            .eventType("SUSPICIOUS_ACTIVITY")
            .eventCategory("SECURITY")
            .description(description)
            .ipAddress(ipAddress)
            .eventTime(LocalDateTime.now())
            .severity("HIGH")
            .status("BLOCKED")
            .success(false);
    }
    
    public static SecurityEventDTOBuilder adminAction(String userId, String email, String action, String ipAddress) {
        return SecurityEventDTO.builder()
            .userId(userId)
            .email(email)
            .eventType("ADMIN_ACTION")
            .eventCategory("ADMIN")
            .description(action)
            .ipAddress(ipAddress)
            .eventTime(LocalDateTime.now())
            .severity("HIGH")
            .status("SUCCESS")
            .success(true);
    }
    
    public static SecurityEventDTOBuilder failedAttempt(String email, String eventType, String reason, String ipAddress) {
        return SecurityEventDTO.builder()
            .email(email)
            .eventType(eventType)
            .eventCategory("AUTH")
            .failureReason(reason)
            .ipAddress(ipAddress)
            .eventTime(LocalDateTime.now())
            .severity("MEDIUM")
            .status("FAILED")
            .success(false);
    }
    
    // ===== Helper Methods =====
    
    public boolean isHighSeverity() {
        return "HIGH".equals(severity) || "CRITICAL".equals(severity);
    }
    
    public boolean isFailed() {
        return !success || "FAILED".equals(status) || "BLOCKED".equals(status);
    }
    
    public String getEventDisplayName() {
        if (eventType == null) return "UNKNOWN";
        return eventType.replace("_", " ").toUpperCase();
    }
}