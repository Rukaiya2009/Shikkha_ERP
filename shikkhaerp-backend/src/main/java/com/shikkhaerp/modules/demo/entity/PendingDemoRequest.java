package com.shikkhaerp.modules.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "pending_demo_requests")
public class PendingDemoRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String uuid;

    // ── School information ───────────────────────────────────────────────────
    @Column(name = "school_name", nullable = false)
    private String schoolName;

    @Column(name = "school_address")
    private String schoolAddress;

    @Column(name = "school_phone")
    private String schoolPhone;

    @Column(name = "school_email")
    private String schoolEmail;

    @Column(name = "school_type")
    private String schoolType;

    /** New in v3.0 — school branch, e.g. "Main Campus". */
    @Column(name = "branch")
    private String branch;

    // ── Requester information ("Your Information" step) ───────────────────────
    @Column(name = "requester_name")
    private String requesterName;

    @Column(name = "requester_email")
    private String requesterEmail;

    @Column(name = "requester_phone")
    private String requesterPhone;

    // ── Super admin (entered by the developer at approval time — nullable) ────
    @Column(name = "super_admin_name")
    private String superAdminName;

    @Column(name = "super_admin_email")
    private String superAdminEmail;

    @Column(name = "super_admin_phone")
    private String superAdminPhone;

    // ── Lifecycle ────────────────────────────────────────────────────────────
    @Column(name = "status")
    private String status = "PENDING";

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;

    @Column(name = "school_id")
    private UUID schoolId;

    @Column(name = "reject_reason")
    private String rejectReason;

    /** Optional approval/rejection note written by the developer. */
    @Column(name = "notes", columnDefinition = "text")
    private String notes;

    @Column(name = "request_data", columnDefinition = "text")
    private String requestData;

    // ── Secure one-click email token fields ──────────────────────────────────
    @Column(name = "approval_token", unique = true)
    private String approvalToken;

    @Column(name = "rejection_token", unique = true)
    private String rejectionToken;

    @Column(name = "approval_token_used")
    private boolean approvalTokenUsed = false;

    @Column(name = "rejection_token_used")
    private boolean rejectionTokenUsed = false;
    // ─────────────────────────────────────────────────────────────────────────

    @PrePersist
    protected void onCreate() {
        if (status == null) status = "PENDING";
        if (expiresAt == null) expiresAt = LocalDateTime.now().plusDays(7);
    }

    public boolean isPending() {
        return "PENDING".equals(status);
    }

    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }
}
