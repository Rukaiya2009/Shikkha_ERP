//cat > src/main/java/com/shikkhaerp/modules/auth/repository/IpWhitelistRepository.java << 'EOF'
package com.shikkhaerp.modules.auth.repository;

import com.shikkhaerp.modules.auth.entity.IpWhitelist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IpWhitelistRepository extends JpaRepository<IpWhitelist, UUID> {
    Optional<IpWhitelist> findByIpAddress(String ipAddress);
    List<IpWhitelist> findByIsActiveTrue();
}
