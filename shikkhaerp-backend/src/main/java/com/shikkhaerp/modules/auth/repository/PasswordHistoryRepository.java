//cat > src/main/java/com/shikkhaerp/modules/auth/repository/PasswordHistoryRepository.java << 'EOF'
package com.shikkhaerp.modules.auth.repository;

import com.shikkhaerp.modules.auth.entity.PasswordHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PasswordHistoryRepository extends JpaRepository<PasswordHistory, UUID> {
    
    @Query("SELECT p.passwordHash FROM PasswordHistory p WHERE p.userId = :userId ORDER BY p.createdAt DESC LIMIT :limit")
    List<String> findLastPasswordHashesWithLimit(@Param("userId") String userId, @Param("limit") int limit);
    
    long countByUserId(String userId);
    
    void deleteByUserId(String userId);
}
