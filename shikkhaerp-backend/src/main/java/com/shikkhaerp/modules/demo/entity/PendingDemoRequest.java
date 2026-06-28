// src/main/java/com/shikkhaerp/modules/demo/entity/PendingDemoRequest.java
package com.shikkhaerp.modules.demo.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "pending_demo_requests")
@Data
public class PendingDemoRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private UUID uuid;
    
    @Column(nullable = false)
    private String schoolName;
    
    @Column(nullable = false)
    private String schoolAddress;
    
    @Column(nullable = false)
    private String adminEmail;
    
    @Column(nullable = false)
    private String adminName;
    
    @Column(nullable = false)
    private String adminPassword; // Will be hashed
    
    @Column(nullable = false)
    private String tenantName;
    
    private String subdomain;
    
    @Column(nullable = false)
    private String status; // PENDING, APPROVED, REJECTED
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime processedAt;
    private String processedBy;
    private String rejectionReason;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        status = "PENDING";
        if (uuid == null) {
            uuid = UUID.randomUUID();
        }
    }
}