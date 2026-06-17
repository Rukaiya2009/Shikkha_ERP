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
@Table(name = "data_export_requests")
public class DataExportRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt;
    
    @Column(name = "status", nullable = false)
    private String status;  // PENDING, PROCESSING, COMPLETED, FAILED
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    @Column(name = "file_path")
    private String filePath;
    
    @Column(name = "error_message")
    private String errorMessage;
}