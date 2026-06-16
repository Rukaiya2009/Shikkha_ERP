package com.shikkhaerp.modules.auth.repository;

import com.shikkhaerp.modules.auth.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    
    Optional<RefreshToken> findByToken(String token);
    
    List<RefreshToken> findByUserId(String userId);
    
    List<RefreshToken> findByUserIdAndIsRevokedFalse(String userId);
    
    void deleteByUserId(String userId);
    
    void deleteByToken(String token);
}
