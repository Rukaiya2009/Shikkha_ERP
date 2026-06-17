//cat > src/main/java/com/shikkhaerp/modules/auth/entity/AuditLog.java << 'EOF'
package com.shikkhaerp.modules.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "audit_logs")
public class AuditLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "user_id")
    private String userId;
    
    @Column(name = "email")
    private String email;
    
    @Column(name = "action", nullable = false)
    private String action;
    
    @Column(name = "resource", nullable = false)
    private String resource;
    
    @Column(name = "resource_id")
    private String resourceId;
    
    @Column(name = "old_value", length = 2000)
    private String oldValue;
    
    @Column(name = "new_value", length = 2000)
    private String newValue;
    
    @Column(name = "ip_address")
    private String ipAddress;
    
    @Column(name = "user_agent")
    private String userAgent;
    
    @Column(name = "status")
    private String status;
    
    @Column(name = "error_message")
    private String errorMessage;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
