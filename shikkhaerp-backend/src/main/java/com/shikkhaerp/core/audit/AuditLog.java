package com.shikkhaerp.core.audit;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "audit_logs")
public class AuditLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String userId;
    
    private String username;
    private String userRole;
    
    @Column(nullable = false)
    private String action;
    
    @Column(length = 2000)
    private String details;
    
    @Column(length = 4000)
    private String oldValue;
    
    @Column(length = 4000)
    private String newValue;
    
    private String entityType;
    private String entityId;
    
    private String ipAddress;
    private String userAgent;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    private boolean success;
    private String failureReason;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}