
package com.shikkhaerp.modules.auth.repository;

import com.shikkhaerp.modules.auth.entity.FailedLoginAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface FailedLoginAttemptRepository extends JpaRepository<FailedLoginAttempt, UUID> {
    
    List<FailedLoginAttempt> findByEmailOrderByAttemptTimeDesc(String email);
    
    List<FailedLoginAttempt> findByUserIdOrderByAttemptTimeDesc(String userId);
    
    @Query("SELECT COUNT(f) FROM FailedLoginAttempt f WHERE f.email = :email AND f.attemptTime > :since")
    long countByEmailAndAttemptTimeAfter(@Param("email") String email, @Param("since") LocalDateTime since);
    
    @Modifying
    @Transactional
    void deleteByEmail(String email);
    
    @Modifying
    @Transactional
    void deleteByAttemptTimeBefore(LocalDateTime date);
}
