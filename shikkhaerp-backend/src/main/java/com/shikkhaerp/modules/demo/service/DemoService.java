//cat > src/main/java/com/shikkhaerp/modules/demo/service/DemoService.java << 'EOF'
package com.shikkhaerp.modules.demo.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shikkhaerp.modules.demo.dto.DemoRequestDTO;
import com.shikkhaerp.modules.demo.entity.PendingDemoRequest;
import com.shikkhaerp.modules.demo.repository.PendingDemoRequestRepository;
import com.shikkhaerp.modules.school.entity.School;
import com.shikkhaerp.modules.school.repository.SchoolRepository;
import com.shikkhaerp.modules.auth.service.EmailService;
import com.shikkhaerp.modules.auth.service.UserCreationService;
import com.shikkhaerp.modules.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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
    private final UserCreationService userCreationService;
    private final EmailService emailService;
    private final ObjectMapper objectMapper;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.company.admin.email:admin@shikkhaerp.com}")
    private String companyAdminEmail;

    // ==================== SUBMIT ====================

    @Transactional
    public String submitDemoRequest(DemoRequestDTO request) {
        String uuid = "req_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);

        PendingDemoRequest pendingRequest = new PendingDemoRequest();
        pendingRequest.setUuid(uuid);
        pendingRequest.setSchoolName(request.getSchool().getName());
        pendingRequest.setSchoolAddress(request.getSchool().getAddress());
        pendingRequest.setSchoolPhone(request.getSchool().getPhone());
        pendingRequest.setSchoolEmail(request.getSchool().getEmail());
        pendingRequest.setSchoolType(request.getSchool().getType());
        pendingRequest.setNumberOfStudents(request.getSchool().getNumberOfStudents());
        pendingRequest.setNumberOfTeachers(request.getSchool().getNumberOfTeachers());
        pendingRequest.setSuperAdminName(request.getSuperAdmin().getName());
        pendingRequest.setSuperAdminEmail(request.getSuperAdmin().getEmail());
        pendingRequest.setSuperAdminPhone(request.getSuperAdmin().getPhone());
        pendingRequest.setStatus("PENDING");
        pendingRequest.setExpiresAt(LocalDateTime.now().plusDays(7));

        try {
            pendingRequest.setRequestData(objectMapper.writeValueAsString(request));
        } catch (Exception e) {
            log.error("Failed to serialize request data", e);
        }

        pendingDemoRequestRepository.save(pendingRequest);

        sendConfirmationEmail(request.getSuperAdmin().getEmail(), request.getSuperAdmin().getName(), request.getSchool().getName());
        sendNotificationEmail(companyAdminEmail, request, uuid);

        log.info("Demo request submitted with UUID: {}", uuid);
        return uuid;
    }

    // ==================== GET ====================

    public PendingDemoRequest getPendingRequest(String uuid) {
        return pendingDemoRequestRepository.findByUuid(uuid)
                .orElseThrow(() -> new RuntimeException("Demo request not found"));
    }

    // ==================== APPROVE ====================

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

        // =============================================
        // 1. CREATE SCHOOL
        // =============================================
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

        // Ensure uniqueness
        while (schoolRepository.existsByCode(code)) {
            unique = UUID.randomUUID().toString().substring(0, 6);
            code = base + "-" + unique;
            subdomain = base + "-" + unique;
        }

        school.setCode(code);
        school.setSubdomain(subdomain);

        // Trial period
        school.setTrialStart(LocalDateTime.now());
        school.setTrialEnd(LocalDateTime.now().plusDays(30));
        school.setSubscriptionPlan("TRIAL");
        school.setSubscriptionExpiry(LocalDateTime.now().plusDays(30));

        School savedSchool = schoolRepository.save(school);

        // =============================================
        // 2. CREATE SUPER ADMIN USER
        // =============================================
        User superAdmin = userCreationService.createSchoolSuperAdmin(
                request.getSuperAdminEmail(),
                request.getSuperAdminName(),
                request.getSuperAdminPhone(),
                savedSchool.getId()
        );

        // =============================================
        // 3. UPDATE PENDING REQUEST
        // =============================================
        request.setStatus("APPROVED");
        request.setApprovedAt(LocalDateTime.now());
        request.setSchoolId(UUID.fromString(savedSchool.getId()));
        pendingDemoRequestRepository.save(request);

        // =============================================
        // 4. SEND APPROVAL EMAIL
        // =============================================
        sendApprovalEmail(
                superAdmin.getEmail(),
                superAdmin.getName(),
                savedSchool.getName(),
                savedSchool.getSubdomain()
        );

        log.info("Demo request approved: {} | School: {} | Admin: {}",
                uuid, savedSchool.getName(), superAdmin.getEmail());
    }

    // ==================== REJECT ====================

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

        sendRejectionEmail(request.getSuperAdminEmail(), request.getSuperAdminName(), request.getSchoolName(), reason);
        log.info("Demo request rejected: {}", uuid);
    }

    // ==================== EMAILS ====================

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

            You will set your password during first login.

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