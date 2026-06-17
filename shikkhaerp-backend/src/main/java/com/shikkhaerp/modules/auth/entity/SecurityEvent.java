package com.shikkhaerp.modules.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * SecurityEvent Entity
 * Tracks all security-related events for monitoring and alerting
 * Critical for government security compliance
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "security_events",
       indexes = {
           @Index(name = "idx_security_events_user_id", columnList = "user_id"),
           @Index(name = "idx_security_events_email", columnList = "email"),
           @Index(name = "idx_security_events_event_type", columnList = "event_type"),
           @Index(name = "idx_security_events_severity", columnList = "severity"),
           @Index(name = "idx_security_events_event_time", columnList = "event_time"),
           @Index(name = "idx_security_events_status", columnList = "status")
       })
public class SecurityEvent {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;
    
    @Column(name = "user_id", length = 36)
    private String userId;
    
    @Column(name = "email", length = 100)
    private String email;
    
    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;  
    // LOGIN_FAILURE, LOGIN_SUCCESS, ACCOUNT_LOCKED, ACCOUNT_UNLOCKED, 
    // PASSWORD_CHANGED, PASSWORD_RESET, PASSWORD_EXPIRED, 
    // MFA_ENABLED, MFA_DISABLED, MFA_VERIFIED, MFA_FAILED,
    // SESSION_CREATED, SESSION_EXPIRED, SESSION_TERMINATED,
    // PERMISSION_CHANGED, ROLE_CHANGED, USER_CREATED, USER_DELETED,
    // BRUTE_FORCE_DETECTED, SUSPICIOUS_ACTIVITY, IP_BLOCKED, etc.
    
    @Column(name = "sub_type", length = 50)
    private String subType;
    
    @Column(name = "description", length = 500)
    private String description;
    
    @Column(name = "severity", nullable = false, length = 10)
    private String severity;  // INFO, WARNING, CRITICAL, EMERGENCY
    
    @Column(name = "status", length = 20)
    private String status;  // PENDING, RESOLVED, IGNORED, ESCALATED
    
    @Column(name = "ip_address", length = 45)
    private String ipAddress;
    
    @Column(name = "user_agent", length = 500)
    private String userAgent;
    
    @Column(name = "event_time", nullable = false)
    private LocalDateTime eventTime;
    
    @Column(name = "metadata", length = 2000)
    private String metadata;
    
    @Column(name = "location", length = 100)
    private String location;  // Geographic location (city/country)
    
    @Column(name = "latitude")
    private Double latitude;
    
    @Column(name = "longitude")
    private Double longitude;
    
    @Column(name = "device_id", length = 100)
    private String deviceId;
    
    @Column(name = "session_id", length = 36)
    private String sessionId;
    
    @Column(name = "request_id", length = 36)
    private String requestId;
    
    @Column(name = "source_system", length = 50)
    private String sourceSystem;  // Which system generated the event
    
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
    
    @Column(name = "resolved_by", length = 36)
    private String resolvedBy;
    
    @Column(name = "resolution_notes", length = 500)
    private String resolutionNotes;
    
    @Column(name = "notification_sent", nullable = false)
    private boolean notificationSent = false;
    
    @Column(name = "notification_channel", length = 20)
    private String notificationChannel;  // EMAIL, SMS, PUSH, SLACK
    
    @Column(name = "is_escalated", nullable = false)
    private boolean isEscalated = false;
    
    @Column(name = "escalated_at")
    private LocalDateTime escalatedAt;
    
    @Column(name = "escalated_to", length = 36)
    private String escalatedTo;  // Admin user ID
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        if (eventTime == null) {
            eventTime = LocalDateTime.now();
        }
        if (severity == null) {
            severity = "INFO";
        }
        if (status == null) {
            status = "PENDING";
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        if (status != null && status.equals("RESOLVED") && resolvedAt == null) {
            resolvedAt = LocalDateTime.now();
        }
    }
    
    public boolean isCritical() {
        return "CRITICAL".equals(severity) || "EMERGENCY".equals(severity);
    }
    
    public boolean isResolved() {
        return "RESOLVED".equals(status);
    }
}