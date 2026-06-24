package com.shikkhaerp.modules.school.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "schools")
@EntityListeners(AuditingEntityListener.class)
public class School {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(unique = true, nullable = false)
    private String name;
    
    @Column(unique = true, nullable = false)
    private String code;
    
    private String address;
    private String phone;
    private String email;
    private String logo;
    
    @Enumerated(EnumType.STRING)
    private SchoolStatus status;
    
    private String subscriptionPlan;
    private LocalDateTime subscriptionExpiry;
    
    private Integer establishedYear;
    
    // ===== NEW FIELDS FOR DEMO WORKFLOW =====
    @Column(unique = true)
    private String subdomain;
    
    private LocalDateTime trialStart;
    private LocalDateTime trialEnd;
    // ========================================
    
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    public enum SchoolStatus {
        ACTIVE, INACTIVE, SUSPENDED, PENDING
    }
    
}