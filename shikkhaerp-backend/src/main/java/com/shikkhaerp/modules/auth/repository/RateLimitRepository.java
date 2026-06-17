//cat > src/main/java/com/shikkhaerp/modules/auth/repository/RateLimitRepository.java << 'EOF'
package com.shikkhaerp.modules.auth.repository;

import com.shikkhaerp.modules.auth.entity.RateLimit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RateLimitRepository extends JpaRepository<RateLimit, UUID> {
    
    Optional<RateLimit> findByUserIdAndEndpoint(String userId, String endpoint);
    
    Optional<RateLimit> findByIpAddressAndEndpoint(String ipAddress, String endpoint);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM RateLimit r WHERE r.resetAt < :now")
    void deleteExpiredRateLimits(@Param("now") LocalDateTime now);
}
