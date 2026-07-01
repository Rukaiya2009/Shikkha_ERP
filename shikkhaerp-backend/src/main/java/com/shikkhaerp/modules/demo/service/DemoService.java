package com.shikkhaerp.modules.demo.service;

import com.shikkhaerp.modules.demo.dto.DemoRequestDTO;
import com.shikkhaerp.modules.demo.entity.PendingDemoRequest;
import com.shikkhaerp.modules.demo.repository.PendingDemoRequestRepository;
import com.shikkhaerp.modules.notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DemoService {

    private final PendingDemoRequestRepository pendingDemoRequestRepository;
    private final EmailService emailService;

    @Transactional
    public String submitDemoRequest(DemoRequestDTO request) {
        log.info("Processing demo request for: {}", request.getSchoolName());

        String uuid = UUID.randomUUID().toString();

        // Generate secure single-use tokens (two UUIDs concatenated = 64 hex chars)
        String approvalToken = UUID.randomUUID().toString().replace("-", "")
            + UUID.randomUUID().toString().replace("-", "");
        String rejectionToken = UUID.randomUUID().toString().replace("-", "")
            + UUID.randomUUID().toString().replace("-", "");

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
        entity.setApprovalToken(approvalToken);
        entity.setRejectionToken(rejectionToken);
        entity.setApprovalTokenUsed(false);
        entity.setRejectionTokenUsed(false);

        pendingDemoRequestRepository.save(entity);
        log.info("Demo request saved with UUID: {}", uuid);

        // Emails are best-effort — a failure must not roll back the saved record
        try {
            emailService.sendDemoSubmissionConfirmation(entity);
            emailService.sendAdminNotification(entity);
        } catch (Exception e) {
            log.error("Email sending failed for demo request {} — record is still saved: {}",
                uuid, e.getMessage());
        }

        return uuid;
    }

    public PendingDemoRequest getPendingRequest(String uuid) {
        return pendingDemoRequestRepository.findByUuid(uuid)
            .orElseThrow(() -> new RuntimeException("Demo request not found: " + uuid));
    }

    // ── Existing UUID-based methods (used by authenticated admin frontend) ────

    @Transactional
    public void approveRequest(String uuid) {
        PendingDemoRequest request = getPendingRequest(uuid);
        request.setStatus("APPROVED");
        request.setApprovedAt(LocalDateTime.now());
        request.setApprovalTokenUsed(true);
        pendingDemoRequestRepository.save(request);
        log.info("Demo request approved: {}", uuid);

        String password = UUID.randomUUID().toString().substring(0, 10);
        emailService.sendDemoApprovalNotification(request, password);
    }

    @Transactional
    public void rejectRequest(String uuid, String reason) {
        PendingDemoRequest request = getPendingRequest(uuid);
        request.setStatus("REJECTED");
        request.setRejectedAt(LocalDateTime.now());
        request.setRejectReason(reason != null ? reason : "No reason provided");
        request.setRejectionTokenUsed(true);
        pendingDemoRequestRepository.save(request);
        log.info("Demo request rejected: {} — Reason: {}", uuid, reason);

        emailService.sendDemoRejectionNotification(request,
            reason != null ? reason : "No reason provided");
    }

    // ── New token-based methods (used by one-click email links) ───────────────

    @Transactional
    public PendingDemoRequest approveRequestByToken(String token) {
        PendingDemoRequest request = pendingDemoRequestRepository.findByApprovalToken(token)
            .orElseThrow(() -> new RuntimeException("Invalid approval link"));

        if (request.isApprovalTokenUsed())
            throw new RuntimeException("This approval link has already been used");
        if (request.isExpired())
            throw new RuntimeException("This approval link has expired (7-day window)");
        if (!"PENDING".equals(request.getStatus()))
            throw new RuntimeException("This request has already been "
                + request.getStatus().toLowerCase());

        request.setStatus("APPROVED");
        request.setApprovedAt(LocalDateTime.now());
        request.setApprovalTokenUsed(true);
        pendingDemoRequestRepository.save(request);
        log.info("Demo request approved via email token: {}", request.getUuid());

        String password = UUID.randomUUID().toString().substring(0, 10);
        emailService.sendDemoApprovalNotification(request, password);

        return request;
    }

    @Transactional
    public PendingDemoRequest rejectRequestByToken(String token, String reason) {
        PendingDemoRequest request = pendingDemoRequestRepository.findByRejectionToken(token)
            .orElseThrow(() -> new RuntimeException("Invalid rejection link"));

        if (request.isRejectionTokenUsed())
            throw new RuntimeException("This rejection link has already been used");
        if (request.isExpired())
            throw new RuntimeException("This rejection link has expired (7-day window)");
        if (!"PENDING".equals(request.getStatus()))
            throw new RuntimeException("This request has already been "
                + request.getStatus().toLowerCase());

        String finalReason = (reason != null && !reason.isBlank())
            ? reason : "No reason provided";

        request.setStatus("REJECTED");
        request.setRejectedAt(LocalDateTime.now());
        request.setRejectReason(finalReason);
        request.setRejectionTokenUsed(true);
        pendingDemoRequestRepository.save(request);
        log.info("Demo request rejected via email token: {}", request.getUuid());

        emailService.sendDemoRejectionNotification(request, finalReason);

        return request;
    }
}