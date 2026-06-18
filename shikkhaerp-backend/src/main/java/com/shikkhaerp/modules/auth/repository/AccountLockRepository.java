//cat > src/main/java/com/shikkhaerp/modules/auth/repository/AccountLockRepository.java << 'EOF'
package com.shikkhaerp.modules.auth.repository;

import com.shikkhaerp.modules.auth.entity.AccountLock;
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
public interface AccountLockRepository extends JpaRepository<AccountLock, UUID> {
    
    Optional<AccountLock> findByUserIdAndIsActiveTrue(String userId);
    
    Optional<AccountLock> findByEmailAndIsActiveTrue(String email);
    
    @Modifying
    @Transactional
    @Query("UPDATE AccountLock a SET a.isActive = false WHERE a.userId = :userId")
    void deactivateByUserId(@Param("userId") String userId);
    
    @Modifying
    @Transactional
    @Query("UPDATE AccountLock a SET a.isActive = false WHERE a.unlocksAt < :now")
    void deactivateExpiredLocks(@Param("now") LocalDateTime now);
}
