//cat > src/main/java/com/shikkhaerp/modules/auth/repository/SecurityEventRepository.java << 'EOF'
package com.shikkhaerp.modules.auth.repository;

import com.shikkhaerp.modules.auth.entity.SecurityEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface SecurityEventRepository extends JpaRepository<SecurityEvent, UUID> {
    
    List<SecurityEvent> findByUserIdOrderByEventTimeDesc(String userId);
    
    List<SecurityEvent> findByEventTypeOrderByEventTimeDesc(String eventType);
    
    List<SecurityEvent> findBySeverityOrderByEventTimeDesc(String severity);
    
    @Query("SELECT s FROM SecurityEvent s WHERE s.eventTime BETWEEN :start AND :end ORDER BY s.eventTime DESC")
    List<SecurityEvent> findByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
