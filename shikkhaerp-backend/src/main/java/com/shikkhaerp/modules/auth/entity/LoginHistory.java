
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
@Table(name = "login_history")
public class LoginHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    @Column(name = "email", nullable = false)
    private String email;
    
    @Column(name = "ip_address")
    private String ipAddress;
    
    @Column(name = "user_agent")
    private String userAgent;
    
    @Column(name = "login_time", nullable = false)
    private LocalDateTime loginTime;
    
    @Column(name = "success", nullable = false)
    private boolean success;
    
    @Column(name = "failure_reason")
    private String failureReason;
    
    @Column(name = "location")
    private String location;  // City/Country from IP
    
    @Column(name = "device_type")
    private String deviceType;
    
    @PrePersist
    protected void onCreate() {
        loginTime = LocalDateTime.now();
    }
}
