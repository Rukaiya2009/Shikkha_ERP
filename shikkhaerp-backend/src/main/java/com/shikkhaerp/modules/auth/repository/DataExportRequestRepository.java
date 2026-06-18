//cat > src/main/java/com/shikkhaerp/modules/auth/repository/DataExportRequestRepository.java << 'EOF'
package com.shikkhaerp.modules.auth.repository;

import com.shikkhaerp.modules.auth.entity.DataExportRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DataExportRequestRepository extends JpaRepository<DataExportRequest, UUID> {
    List<DataExportRequest> findByUserId(String userId);
    List<DataExportRequest> findByStatus(String status);
}
