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
@Table(name = "login_alerts")
public class LoginAlert {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    @Column(name = "email", nullable = false)
    private String email;
    
    @Column(name = "alert_type", nullable = false)
    private String alertType;  // SUSPICIOUS_IP, NEW_DEVICE, FAILED_ATTEMPTS
    
    @Column(name = "message")
    private String message;
    
    @Column(name = "is_read")
    private boolean isRead = false;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}