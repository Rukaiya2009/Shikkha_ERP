package com.shikkhaerp.modules.auth.repository;

import com.shikkhaerp.modules.auth.entity.LoginHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface LoginHistoryRepository extends JpaRepository<LoginHistory, UUID> {
    
    List<LoginHistory> findByUserIdOrderByLoginTimeDesc(String userId);
    
    List<LoginHistory> findByUserIdAndSuccessOrderByLoginTimeDesc(String userId, boolean success);
    
    List<LoginHistory> findByEmailOrderByLoginTimeDesc(String email);
    
    long countByUserIdAndSuccess(String userId, boolean success);
}
