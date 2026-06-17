//cat > src/main/java/com/shikkhaerp/modules/auth/repository/GeoLocationRepository.java << 'EOF'
package com.shikkhaerp.modules.auth.repository;

import com.shikkhaerp.modules.auth.entity.GeoLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GeoLocationRepository extends JpaRepository<GeoLocation, UUID> {
    List<GeoLocation> findByUserIdOrderByCreatedAtDesc(String userId);
}
