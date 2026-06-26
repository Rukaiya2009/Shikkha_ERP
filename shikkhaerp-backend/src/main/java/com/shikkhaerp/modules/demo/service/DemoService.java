package com.shikkhaerp.modules.demo.service;

import com.shikkhaerp.modules.demo.dto.DemoRequestDTO;
import com.shikkhaerp.modules.demo.entity.PendingDemoRequest;
import com.shikkhaerp.modules.demo.repository.PendingDemoRequestRepository;
import com.shikkhaerp.modules.school.entity.School;
import com.shikkhaerp.modules.school.repository.SchoolRepository;
import com.shikkhaerp.modules.user.entity.User;
import com.shikkhaerp.modules.user.repository.UserRepository;
import com.shikkhaerp.modules.auth.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DemoService {

    private final PendingDemoRequestRepository pendingDemoRequestRepository;
    private final SchoolRepository schoolRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;  // ✅ Injected

    @Value("${app.company.admin.email:admin@shikkhaerp.com}")
    private String companyAdminEmail;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    // ===================== SUBMIT =====================

    @Transactional
    public String submitDemoRequest(DemoRequestDTO request) {
        // Generate UUID
        String uuid = "req_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);

        // Create entity
        PendingDemoRequest entity = new PendingDemoRequest();
        entity.setUuid(uuid);
        entity.setSchoolName(request.getSchool().getName());
        entity.setSchoolAddress(request.getSchool().getAddress());
        entity.setSchoolPhone(request.getSchool().getPhone());
        entity.setSchoolEmail(request.getSchool().getEmail());
        entity.setSchoolType(request.getSchool().getType());
        entity.setNumberOfStudents(request.getSchool().getNumberOfStudents());
        entity.setNumberOfTeachers(request.getSchool().getNumberOfTeachers());
        entity.setSuperAdminName(request.getSuperAdmin().getName());
        entity.setSuperAdminEmail(request.getSuperAdmin().getEmail());
        entity.setSuperAdminPhone(request.getSuperAdmin().getPhone());
        entity.setStatus("PENDING");
        entity.setExpiresAt(LocalDateTime.now().plusDays(7));

        // Save to database
        pendingDemoRequestRepository.save(entity);

        log.info("Demo request submitted with UUID: {}", uuid);

        // ===== SEND CONFIRMATION EMAIL =====
        sendConfirmationEmail(
            request.getSuperAdmin().getEmail(),
            request.getSuperAdmin().getName(),
            request.getSchool().getName()
        );

        // ===== SEND NOTIFICATION EMAIL TO COMPANY ADMIN =====
        sendNotificationEmail(
            companyAdminEmail,
            request,
            uuid
        );

        return uuid;
    }

    // ===================== GET =====================

    @Transactional
    public PendingDemoRequest getPendingRequest(String uuid) {
        return pendingDemoRequestRepository.findByUuid(uuid)
                .orElseThrow(() -> new RuntimeException("Request not found with UUID: " + uuid));
    }

    // ===================== APPROVE =====================

    @Transactional
    public void approveRequest(String uuid) {
        PendingDemoRequest request = getPendingRequest(uuid);

        if (!request.isPending()) {
            throw new RuntimeException("Request is already " + request.getStatus());
        }

        if (request.isExpired()) {
            request.setStatus("EXPIRED");
            pendingDemoRequestRepository.save(request);
            throw new RuntimeException("Request has expired");
        }

        // 1. CREATE SCHOOL
        School school = new School();
        school.setName(request.getSchoolName());
        school.setAddress(request.getSchoolAddress());
        school.setPhone(request.getSchoolPhone());
        school.setEmail(request.getSchoolEmail());
        school.setStatus(School.SchoolStatus.ACTIVE);

        // Generate unique code and subdomain
        String base = request.getSchoolName().toLowerCase()
                .replaceAll("[^a-z0-9]", "-")
                .replaceAll("-+", "-")
                .trim()
                .replaceAll("^-|-$", "");
        String unique = UUID.randomUUID().toString().substring(0, 6);
        String code = base + "-" + unique;
        String subdomain = base + "-" + unique;

        while (schoolRepository.existsByCode(code)) {
            unique = UUID.randomUUID().toString().substring(0, 6);
            code = base + "-" + unique;
            subdomain = base + "-" + unique;
        }

        school.setCode(code);
        school.setSubdomain(subdomain);
        school.setTrialStart(LocalDateTime.now());
        school.setTrialEnd(LocalDateTime.now().plusDays(30));
        school.setSubscriptionPlan("TRIAL");
        school.setSubscriptionExpiry(LocalDateTime.now().plusDays(30));

        School savedSchool = schoolRepository.save(school);

        // 2. CREATE SUPER ADMIN USER
        User superAdmin = new User();
        superAdmin.setEmail(request.getSuperAdminEmail());
        superAdmin.setName(request.getSuperAdminName());
        superAdmin.setPhone(request.getSuperAdminPhone());
        superAdmin.setPassword(passwordEncoder.encode("Temporary@123"));
        superAdmin.setRole(User.UserRole.SUPER_ADMIN);
        superAdmin.setSchoolId(savedSchool.getId());
        superAdmin.setEnabled(true);
        superAdmin.setStatus(User.UserStatus.ACTIVE);

        userRepository.save(superAdmin);

        // 3. UPDATE PENDING REQUEST
        request.setStatus("APPROVED");
        request.setApprovedAt(LocalDateTime.now());
        request.setSchoolId(UUID.fromString(savedSchool.getId()));
        pendingDemoRequestRepository.save(request);

        // 4. SEND APPROVAL EMAIL
        sendApprovalEmail(
            superAdmin.getEmail(),
            superAdmin.getName(),
            savedSchool.getName(),
            savedSchool.getSubdomain()
        );

        log.info("Demo request approved: {} | School: {} | Admin: {}",
                uuid, savedSchool.getName(), superAdmin.getEmail());
    }

    // ===================== REJECT =====================

    @Transactional
    public void rejectRequest(String uuid, String reason) {
        PendingDemoRequest request = getPendingRequest(uuid);

        if (!request.isPending()) {
            throw new RuntimeException("Request is already " + request.getStatus());
        }

        request.setStatus("REJECTED");
        request.setRejectedAt(LocalDateTime.now());
        request.setRejectReason(reason);
        pendingDemoRequestRepository.save(request);

        // Send rejection email
        sendRejectionEmail(
            request.getSuperAdminEmail(),
            request.getSuperAdminName(),
            request.getSchoolName(),
            reason
        );

        log.info("Demo request rejected: {}", uuid);
    }

    // ===================== EMAIL HELPERS =====================

    private void sendConfirmationEmail(String to, String name, String schoolName) {
        String subject = "🎉 Demo Request Received – ShikkhaERP";
        String body = String.format("""
            Dear %s,

            Thank you for your interest in ShikkhaERP!

            We have received your demo request for %s. Our team will
            review your application and get back to you within 72 hours.

            If you have any questions, please contact support@shikkhaerp.com

            Best regards,
            ShikkhaERP Team
            """, name, schoolName);
        emailService.sendEmail(to, subject, body);
        log.info("Confirmation email sent to: {}", to);
    }

    private void sendNotificationEmail(String to, DemoRequestDTO request, String uuid) {
        String subject = "🔔 New Demo Request – " + request.getSchool().getName();
        String approvalUrl = frontendUrl + "/approve/" + uuid;
        String body = String.format("""
            Dear Company Super Admin,

            A new ShikkhaERP demo request has been submitted.

            School: %s
            Super Admin: %s (%s)
            Students: %d
            Teachers: %d

            Review and approve: %s

            Request ID: %s

            Best regards,
            ShikkhaERP System
            """,
            request.getSchool().getName(),
            request.getSuperAdmin().getName(),
            request.getSuperAdmin().getEmail(),
            request.getSchool().getNumberOfStudents() != null ? request.getSchool().getNumberOfStudents() : 0,
            request.getSchool().getNumberOfTeachers() != null ? request.getSchool().getNumberOfTeachers() : 0,
            approvalUrl,
            uuid
        );
        emailService.sendEmail(to, subject, body);
        log.info("Notification email sent to: {}", to);
    }

    private void sendApprovalEmail(String to, String name, String schoolName, String subdomain) {
        String subject = "🎉 Your School is Approved – Start Your 30-Day Free Trial!";
        String loginUrl = "https://" + subdomain + ".shikkhaerp.com/login";
        String body = String.format("""
            Dear %s,

            Congratulations! Your school, %s, has been approved for a
            30-day free trial of ShikkhaERP.

            Portal: %s
            Email: %s
            Temporary Password: Temporary@123

            Please log in and change your password immediately.

            Trial expires: %s

            Need help? Contact support@shikkhaerp.com

            Best regards,
            ShikkhaERP Team
            """,
            name,
            schoolName,
            loginUrl,
            to,
            LocalDateTime.now().plusDays(30)
        );
        emailService.sendEmail(to, subject, body);
        log.info("Approval email sent to: {}", to);
    }

    private void sendRejectionEmail(String to, String name, String schoolName, String reason) {
        String subject = "📋 Demo Request Update – ShikkhaERP";
        String body = String.format("""
            Dear %s,

            Thank you for your interest in ShikkhaERP.

            We have reviewed your demo request for %s. Unfortunately,
            we are unable to proceed with your request at this time.

            Reason: %s

            If you have any questions, please contact support@shikkhaerp.com

            Best regards,
            ShikkhaERP Team
            """, name, schoolName, reason);
        emailService.sendEmail(to, subject, body);
        log.info("Rejection email sent to: {}", to);
    }
}