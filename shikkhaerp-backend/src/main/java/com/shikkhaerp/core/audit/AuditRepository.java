package com.shikkhaerp.core.audit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditRepository extends JpaRepository<AuditLog, String> {
    
    // Find audit logs by user ID
    Page<AuditLog> findByUserId(String userId, Pageable pageable);
    
    // Find audit logs by action
    List<AuditLog> findByAction(String action);
    
    // Find audit logs by entity
    List<AuditLog> findByEntityTypeAndEntityId(String entityType, String entityId);
    
    // Find audit logs by date range
    List<AuditLog> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    // Find recent audit logs
    @Query("SELECT a FROM AuditLog a ORDER BY a.createdAt DESC")
    Page<AuditLog> findRecentAuditLogs(Pageable pageable);
    
    // Count by user and action
    long countByUserIdAndAction(String userId, String action);
    
    // Find failed actions
    @Query("SELECT a FROM AuditLog a WHERE a.success = false ORDER BY a.createdAt DESC")
    List<AuditLog> findFailedActions(Pageable pageable);
    
    // Search audit logs
    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:userId IS NULL OR a.userId = :userId) AND " +
           "(:action IS NULL OR a.action = :action) AND " +
           "(:startDate IS NULL OR a.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR a.createdAt <= :endDate)")
    Page<AuditLog> searchAuditLogs(@Param("userId") String userId,
                                    @Param("action") String action,
                                    @Param("startDate") LocalDateTime startDate,
                                    @Param("endDate") LocalDateTime endDate,
                                    Pageable pageable);
}