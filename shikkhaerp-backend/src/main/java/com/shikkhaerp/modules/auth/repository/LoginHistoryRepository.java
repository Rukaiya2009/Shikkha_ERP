//cat > src/main/java/com/shikkhaerp/modules/auth/repository/LoginHistoryRepository.java << 'EOF'
package com.shikkhaerp.modules.auth.repository;

import com.shikkhaerp.modules.auth.entity.LoginHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface LoginHistoryRepository extends JpaRepository<LoginHistory, UUID> {
    
    List<LoginHistory> findByUserIdOrderByLoginTimeDesc(String userId);
    
    List<LoginHistory> findByUserIdAndSuccessOrderByLoginTimeDesc(String userId, boolean success);
    
    List<LoginHistory> findByEmailOrderByLoginTimeDesc(String email);
    
    long countByUserIdAndSuccess(String userId, boolean success);
    
    @Query("SELECT l FROM LoginHistory l WHERE l.loginTime BETWEEN :start AND :end ORDER BY l.loginTime DESC")
    List<LoginHistory> findByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    @Query("SELECT COUNT(l) FROM LoginHistory l WHERE l.email = :email AND l.success = false AND l.loginTime > :since")
    long countFailedLogins(@Param("email") String email, @Param("since") LocalDateTime since);
}
