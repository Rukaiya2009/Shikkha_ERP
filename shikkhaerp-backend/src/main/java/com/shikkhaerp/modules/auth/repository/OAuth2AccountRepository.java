//cat > src/main/java/com/shikkhaerp/modules/auth/repository/OAuth2AccountRepository.java << 'EOF'
package com.shikkhaerp.modules.auth.repository;

import com.shikkhaerp.modules.auth.entity.OAuth2Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OAuth2AccountRepository extends JpaRepository<OAuth2Account, UUID> {
    Optional<OAuth2Account> findByProviderAndProviderId(String provider, String providerId);
}
