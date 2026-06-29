package com.shikkhaerp.modules.demo.service;

import com.shikkhaerp.modules.demo.dto.DemoRequestDTO;
import com.shikkhaerp.modules.demo.entity.PendingDemoRequest;
import com.shikkhaerp.modules.demo.repository.PendingDemoRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DemoService {

    private final PendingDemoRequestRepository pendingDemoRequestRepository;

    public String submitDemoRequest(DemoRequestDTO request) {
        log.info("Processing demo request for: {}", request.getSchoolName());

        String uuid = UUID.randomUUID().toString();

        PendingDemoRequest entity = new PendingDemoRequest();
        entity.setUuid(uuid);
        entity.setSchoolName(request.getSchoolName());
        entity.setSchoolAddress(request.getAddress());
        entity.setSchoolPhone(request.getPhone());
        entity.setSchoolEmail(request.getEmail());
        entity.setSuperAdminName(request.getSuperAdminName());
        entity.setSuperAdminEmail(request.getSuperAdminEmail());
        entity.setSuperAdminPhone(request.getSuperAdminPhone());
        entity.setStatus("PENDING");
        entity.setCreatedAt(LocalDateTime.now());
        entity.setExpiresAt(LocalDateTime.now().plusDays(7));

        pendingDemoRequestRepository.save(entity);
        log.info("Demo request saved with UUID: {}", uuid);

        return uuid;
    }

    public PendingDemoRequest getPendingRequest(String uuid) {
        return pendingDemoRequestRepository.findByUuid(uuid)
                .orElseThrow(() -> new RuntimeException("Demo request not found: " + uuid));
    }

    public void approveRequest(String uuid) {
        PendingDemoRequest request = getPendingRequest(uuid);
        request.setStatus("APPROVED");
        pendingDemoRequestRepository.save(request);
        log.info("Demo request approved: {}", uuid);
    }

    public void rejectRequest(String uuid, String reason) {
        PendingDemoRequest request = getPendingRequest(uuid);
        request.setStatus("REJECTED");
        pendingDemoRequestRepository.save(request);
        log.info("Demo request rejected: {} - Reason: {}", uuid, reason);
    }
}