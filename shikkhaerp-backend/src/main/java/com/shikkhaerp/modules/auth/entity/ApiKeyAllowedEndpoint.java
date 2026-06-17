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
@Table(name = "api_key_allowed_endpoints")
public class ApiKeyAllowedEndpoint {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "api_key_id", nullable = false)
    private UUID apiKeyId;
    
    @Column(name = "endpoint", nullable = false)
    private String endpoint;
    
    @Column(name = "method")
    private String method;
}