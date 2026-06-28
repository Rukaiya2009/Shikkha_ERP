// src/main/java/com/shikkhaerp/modules/demo/entity/PendingDemoRequest.java
package com.shikkhaerp.modules.demo.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "pending_demo_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PendingDemoRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 255)
    private String uuid;
    
    @Column(name = "school_name", nullable = false, length = 255)
    private String schoolName;
    
    @Column(name = "school_address", nullable = false, columnDefinition = "TEXT")
    private String schoolAddress;
    
    @Column(name = "school_phone", length = 50)
    private String schoolPhone;
    
    @Column(name = "school_email", length = 255)
    private String schoolEmail;
    
    @Column(name = "school_type", length = 50)
    private String schoolType;
    
    @Column(name = "number_of_students")
    private Integer numberOfStudents;
    
    @Column(name = "number_of_teachers")
    private Integer numberOfTeachers;
    
    @Column(name = "super_admin_name", nullable = false, length = 255)
    private String superAdminName;
    
    @Column(name = "super_admin_email", nullable = false, length = 255)
    private String superAdminEmail;
    
    @Column(name = "super_admin_phone", length = 50)
    private String superAdminPhone;
    
    @Column(nullable = false, length = 50)
    private String status;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
    
    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;
    
    @Column(name = "reject_reason", columnDefinition = "TEXT")
    private String rejectReason;
    
    @Column(name = "school_id")
    private UUID schoolId;
    
    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        status = "PENDING";
        if (uuid == null || uuid.isEmpty()) {
            uuid = "req_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        }
    }
}