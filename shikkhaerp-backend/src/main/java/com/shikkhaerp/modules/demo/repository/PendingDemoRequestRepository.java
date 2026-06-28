package com.shikkhaerp.modules.demo.repository;

import com.shikkhaerp.modules.demo.entity.PendingDemoRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PendingDemoRequestRepository extends JpaRepository<PendingDemoRequest, Long> {  // ✅ Changed to Long

    Optional<PendingDemoRequest> findByUuid(String uuid);

    List<PendingDemoRequest> findByStatus(String status);

    List<PendingDemoRequest> findByStatusAndExpiresAtBefore(String status, LocalDateTime date);

    boolean existsByUuid(String uuid);

    void deleteByUuid(String uuid);
}