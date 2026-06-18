//cat > src/main/java/com/shikkhaerp/modules/auth/repository/ApiKeyRepository.java << 'EOF'
package com.shikkhaerp.modules.auth.repository;

import com.shikkhaerp.modules.auth.entity.ApiKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKey, UUID> {
    Optional<ApiKey> findByApiKey(String apiKey);
    Optional<ApiKey> findByUserIdAndName(String userId, String name);
    void deleteByUserId(String userId);
}
