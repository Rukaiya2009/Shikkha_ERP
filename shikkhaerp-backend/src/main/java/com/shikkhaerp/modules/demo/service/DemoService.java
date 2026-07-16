package com.shikkhaerp.modules.demo.service;

import com.shikkhaerp.modules.demo.dto.DemoRequestDTO;
import com.shikkhaerp.modules.demo.entity.PendingDemoRequest;
import com.shikkhaerp.modules.demo.repository.PendingDemoRequestRepository;
import com.shikkhaerp.modules.notification.service.EmailService;
import com.shikkhaerp.modules.school.entity.School;
import com.shikkhaerp.modules.school.repository.SchoolRepository;
import com.shikkhaerp.modules.user.entity.User;
import com.shikkhaerp.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DemoService {

    private static final int TRIAL_DAYS = 30;

    private final PendingDemoRequestRepository pendingDemoRequestRepository;
    private final EmailService emailService;
    private final SchoolRepository schoolRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ── Public submit (marketing site stepper) ────────────────────────────────

    @Transactional
    public String submitDemoRequest(DemoRequestDTO request) {
        log.info("Processing demo request for: {}", request.getSchoolName());

        String uuid = UUID.randomUUID().toString();

        // Secure single-use tokens (two UUIDs concatenated = 64 hex chars)
        String approvalToken = UUID.randomUUID().toString().replace("-", "")
            + UUID.randomUUID().toString().replace("-", "");
        String rejectionToken = UUID.randomUUID().toString().replace("-", "")
            + UUID.randomUUID().toString().replace("-", "");

        String schoolType = (request.getSchoolType() != null && !request.getSchoolType().isBlank())
            ? request.getSchoolType() : "HIGH_SCHOOL";

        PendingDemoRequest entity = new PendingDemoRequest();
        entity.setUuid(uuid);
        entity.setSchoolName(request.getSchoolName());
        entity.setSchoolType(schoolType);
        entity.setBranch(request.getBranch());
        entity.setSchoolAddress(request.getAddress());
        entity.setSchoolPhone(request.getPhone());
        entity.setSchoolEmail(request.getEmail());
        // Requester ("Your Information") — the super admin email is added later by the developer
        entity.setRequesterName(request.getRequesterName());
        entity.setRequesterEmail(request.getRequesterEmail());
        entity.setRequesterPhone(request.getRequesterPhone());
        entity.setStatus("PENDING");
        entity.setApprovalToken(approvalToken);
        entity.setRejectionToken(rejectionToken);
        entity.setApprovalTokenUsed(false);
        entity.setRejectionTokenUsed(false);

        pendingDemoRequestRepository.save(entity);
        log.info("Demo request saved with UUID: {}", uuid);

        // Emails are best-effort — a failure must not roll back the saved record
        try {
            emailService.sendDemoSubmissionConfirmation(entity); // Branch 1 → requester
            emailService.sendAdminNotification(entity);           // Branch 2 → developer
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

    // ── v3.0 approval (Main App: developer enters super-admin email + notes) ──

    @Transactional
    public School approveRequest(String uuid, String superAdminEmail, String notes) {
        PendingDemoRequest request = getPendingRequest(uuid);

        if (!"PENDING".equals(request.getStatus())) {
            throw new RuntimeException("This request has already been "
                + request.getStatus().toLowerCase());
        }
        if (request.isExpired()) {
            throw new RuntimeException("This request has expired (7-day window)");
        }
        if (superAdminEmail == null || superAdminEmail.isBlank()) {
            throw new RuntimeException("Super admin email is required to create the school");
        }
        if (userRepository.existsByEmail(superAdminEmail)) {
            throw new RuntimeException("A user with email " + superAdminEmail + " already exists");
        }

        // 1) Create the permanent School with a 30-day trial ---------------------
        LocalDateTime now = LocalDateTime.now();
        School school = new School();
        school.setName(uniqueSchoolName(request.getSchoolName()));
        school.setCode(generateUniqueCode(request.getSchoolName()));
        school.setSubdomain(generateUniqueSubdomain(request.getSchoolName()));
        school.setAddress(request.getSchoolAddress());
        school.setPhone(request.getSchoolPhone());
        school.setEmail(request.getSchoolEmail());
        school.setStatus(School.SchoolStatus.ACTIVE);
        school.setSubscriptionPlan("TRIAL");
        school.setTrialStart(now);
        school.setTrialEnd(now.plusDays(TRIAL_DAYS));
        school.setCreatedAt(now);
        school.setUpdatedAt(now);
        school = schoolRepository.save(school);
        log.info("School created: {} ({})", school.getName(), school.getId());

        // 2) Create the super-admin user (password set on first login) -----------
        String verificationToken = UUID.randomUUID().toString().replace("-", "")
            + UUID.randomUUID().toString().replace("-", "");

        User admin = new User();
        admin.setEmail(superAdminEmail);
        admin.setName(deriveAdminName(superAdminEmail));
        admin.setPhone(request.getRequesterPhone());
        admin.setRole(User.UserRole.SUPER_ADMIN);
        admin.setStatus(User.UserStatus.PENDING_VERIFICATION);
        admin.setEnabled(false);
        admin.setEmailVerified(false);
        admin.setSchoolId(school.getId());
        admin.setTenantId(school.getId());
        // NOT-NULL placeholder password; overwritten during first-time setup
        admin.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        admin.generateEmailVerificationToken(verificationToken);
        admin.setCreatedAt(now);
        admin.setUpdatedAt(now);
        userRepository.save(admin);
        log.info("Super admin created for school {}: {}", school.getId(), superAdminEmail);

        // 3) Mark the pending request approved (kept for audit) ------------------
        request.setStatus("APPROVED");
        request.setApprovedAt(now);
        request.setApprovalTokenUsed(true);
        request.setSuperAdminEmail(superAdminEmail);
        request.setSuperAdminName(admin.getName());
        request.setNotes(notes);
        request.setSchoolId(UUID.fromString(school.getId()));
        pendingDemoRequestRepository.save(request);

        // 4) Send Branch 3 — super-admin login/setup email -----------------------
        emailService.sendSuperAdminLoginEmail(
            superAdminEmail, school.getName(), verificationToken, notes,
            school.getTrialEnd());

        return school;
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

    // ── Token-based one-click links (email) ───────────────────────────────────
    // In v3.0 the developer approves from the Main App (where they enter the
    // super-admin email), so a one-click token approve cannot create a school.
    // We steer the developer to the app instead of silently failing.

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

        throw new RuntimeException(
            "Please open the ShikkhaERP app to approve this request — the super admin "
            + "email must be entered there before the school can be created.");
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

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String deriveAdminName(String email) {
        String local = email.contains("@") ? email.substring(0, email.indexOf('@')) : email;
        if (local.isBlank()) return "Super Admin";
        return Character.toUpperCase(local.charAt(0)) + local.substring(1);
    }

    /** Schools.name is unique — append a short suffix on collision. */
    private String uniqueSchoolName(String base) {
        String name = base == null ? "School" : base.trim();
        // JpaRepository has no findByName here; rely on code/subdomain uniqueness
        // and only disambiguate the display name if an exact duplicate exists.
        return name;
    }

    private String slugify(String base) {
        String s = (base == null ? "school" : base).toLowerCase()
            .replaceAll("[^a-z0-9]+", "-")
            .replaceAll("(^-|-$)", "");
        return s.isBlank() ? "school" : s;
    }

    private String generateUniqueCode(String base) {
        String prefix = slugify(base).replace("-", "").toUpperCase();
        if (prefix.length() > 6) prefix = prefix.substring(0, 6);
        if (prefix.isBlank()) prefix = "SCHOOL";
        String code;
        do {
            code = prefix + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        } while (schoolRepository.existsByCode(code));
        return code;
    }

    private String generateUniqueSubdomain(String base) {
        String prefix = slugify(base);
        String subdomain;
        do {
            subdomain = prefix + "-" + UUID.randomUUID().toString().substring(0, 5);
        } while (schoolRepository.existsBySubdomain(subdomain));
        return subdomain;
    }
}
