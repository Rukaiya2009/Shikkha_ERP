package com.shikkhaerp.modules.auth.repository;

import com.shikkhaerp.modules.auth.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, UUID> {
    
    List<UserSession> findByUserId(String userId);
    
    List<UserSession> findByUserIdAndIsActiveTrue(String userId);
    
    Optional<UserSession> findBySessionToken(String sessionToken);
    
    void deleteByUserId(String userId);
    
    void deleteBySessionToken(String sessionToken);
    
    long countByUserIdAndIsActiveTrue(String userId);
}
