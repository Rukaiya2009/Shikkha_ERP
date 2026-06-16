package com.shikkhaerp.modules.auth.repository;

import com.shikkhaerp.modules.auth.entity.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, UUID> {
    
    List<RolePermission> findByRoleId(String roleId);
    
    List<RolePermission> findByPermissionId(UUID permissionId);
    
    Optional<RolePermission> findByRoleIdAndPermissionId(String roleId, UUID permissionId);
    
    List<RolePermission> findByRoleIdAndIsActiveTrue(String roleId);
    
    void deleteByRoleId(String roleId);
    
    void deleteByPermissionId(UUID permissionId);
    
    boolean existsByRoleIdAndPermissionId(String roleId, UUID permissionId);
    
    long countByRoleId(String roleId);
}
