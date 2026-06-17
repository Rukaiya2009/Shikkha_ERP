//cat > src/main/java/com/shikkhaerp/modules/auth/repository/PermissionAuditRepository.java << 'EOF'
package com.shikkhaerp.modules.auth.repository;

import com.shikkhaerp.modules.auth.entity.PermissionAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PermissionAuditRepository extends JpaRepository<PermissionAudit, UUID> {
    List<PermissionAudit> findAllByOrderByCreatedAtDesc();
    List<PermissionAudit> findByUserIdOrderByCreatedAtDesc(String userId);
    List<PermissionAudit> findByActionOrderByCreatedAtDesc(String action);
}
