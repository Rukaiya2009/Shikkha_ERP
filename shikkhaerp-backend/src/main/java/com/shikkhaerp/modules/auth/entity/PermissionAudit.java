package com.shikkhaerp.modules.auth.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "permission_audit")
public class PermissionAudit {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    @Column(name = "action", nullable = false)
    private String action;  // GRANT, REVOKE, UPDATE
    
    @Column(name = "role_id")
    private String roleId;
    
    @Column(name = "permission_id")
    private UUID permissionId;
    
    @Column(name = "details", length = 2000)
    private String details;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}