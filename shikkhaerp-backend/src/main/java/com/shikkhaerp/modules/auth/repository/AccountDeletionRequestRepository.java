//cat > src/main/java/com/shikkhaerp/modules/auth/repository/AccountDeletionRequestRepository.java << 'EOF'
package com.shikkhaerp.modules.auth.repository;

import com.shikkhaerp.modules.auth.entity.AccountDeletionRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AccountDeletionRequestRepository extends JpaRepository<AccountDeletionRequest, UUID> {
    List<AccountDeletionRequest> findByUserId(String userId);
    List<AccountDeletionRequest> findByStatus(String status);
}
