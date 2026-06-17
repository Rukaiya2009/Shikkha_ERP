package com.shikkhaerp.modules.auth.repository;

import com.shikkhaerp.modules.auth.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    
    List<AuditLog> findByUserIdOrderByCreatedAtDesc(String userId);
    
    List<AuditLog> findByActionOrderByCreatedAtDesc(String action);
    
    List<AuditLog> findByResourceOrderByCreatedAtDesc(String resource);
    
    @Query("SELECT a FROM AuditLog a WHERE a.createdAt BETWEEN :start AND :end ORDER BY a.createdAt DESC")
    List<AuditLog> findByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    long countByAction(String action);
}