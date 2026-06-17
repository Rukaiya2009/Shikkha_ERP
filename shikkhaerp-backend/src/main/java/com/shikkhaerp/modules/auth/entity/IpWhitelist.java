package com.shikkhaerp.modules.auth.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ip_whitelist")
public class IpWhitelist {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "ip_address", nullable = false, unique = true)
    private String ipAddress;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "is_active")
    private boolean isActive = true;
}