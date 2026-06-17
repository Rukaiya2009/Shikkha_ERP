//cat > src/main/java/com/shikkhaerp/modules/auth/repository/LoginAlertRepository.java << 'EOF'
package com.shikkhaerp.modules.auth.repository;

import com.shikkhaerp.modules.auth.entity.LoginAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LoginAlertRepository extends JpaRepository<LoginAlert, UUID> {
    List<LoginAlert> findByUserIdAndIsReadFalse(String userId);
    List<LoginAlert> findByUserIdOrderByCreatedAtDesc(String userId);
    List<LoginAlert> findByIsReadFalse();
}
