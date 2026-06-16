package com.shikkhaerp.modules.auth.repository;

import com.shikkhaerp.modules.auth.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, UUID> {
    
    List<UserRole> findByUserId(String userId);
    
    List<UserRole> findByRoleId(String roleId);
    
    Optional<UserRole> findByUserIdAndRoleId(String userId, String roleId);
    
    void deleteByUserId(String userId);
    
    void deleteByRoleId(String roleId);
    
    boolean existsByUserIdAndRoleId(String userId, String roleId);
}