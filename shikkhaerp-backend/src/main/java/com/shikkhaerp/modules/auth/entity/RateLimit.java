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
@Table(name = "rate_limits")
public class RateLimit {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "user_id")
    private String userId;
    
    @Column(name = "ip_address")
    private String ipAddress;
    
    @Column(name = "endpoint", nullable = false)
    private String endpoint;
    
    @Column(name = "request_count")
    private int requestCount = 0;
    
    @Column(name = "window_start")
    private LocalDateTime windowStart;
    
    @Column(name = "reset_at")
    private LocalDateTime resetAt;
    
    @PrePersist
    protected void onCreate() {
        windowStart = LocalDateTime.now();
        resetAt = LocalDateTime.now().plusMinutes(1);
    }
}