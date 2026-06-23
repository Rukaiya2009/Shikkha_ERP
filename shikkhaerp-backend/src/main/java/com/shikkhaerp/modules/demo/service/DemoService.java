//mkdir -p src/main/java/com/shikkhaerp/modules/demo/service

//cat > src/main/java/com/shikkhaerp/modules/demo/service/DemoService.java << 'EOF'
package com.shikkhaerp.modules.demo.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shikkhaerp.modules.demo.dto.DemoRequestDTO;
import com.shikkhaerp.modules.demo.entity.PendingDemoRequest;
import com.shikkhaerp.modules.demo.repository.PendingDemoRequestRepository;
import com.shikkhaerp.modules.auth.service.EmailService;
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
    private final EmailService emailService;
    private final ObjectMapper objectMapper;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.company.admin.email:admin@shikkhaerp.com}")
    private String companyAdminEmail;

    @Transactional
    public String submitDemoRequest(DemoRequestDTO request) {
        // Generate unique UUID
        String uuid = "req_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);

        // Create pending request
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

        // Store full request data as JSON
        try {
            pendingRequest.setRequestData(objectMapper.writeValueAsString(request));
        } catch (Exception e) {
            log.error("Failed to serialize request data", e);
        }

        pendingDemoRequestRepository.save(pendingRequest);

        // Send confirmation email to the requester
        sendConfirmationEmail(request.getSuperAdmin().getEmail(), request.getSuperAdmin().getName(), request.getSchool().getName());

        // Send notification email to company super admin
        sendNotificationEmail(companyAdminEmail, request, uuid);

        log.info("Demo request submitted with UUID: {}", uuid);
        return uuid;
    }

    public PendingDemoRequest getPendingRequest(String uuid) {
        return pendingDemoRequestRepository.findByUuid(uuid)
                .orElseThrow(() -> new RuntimeException("Demo request not found"));
    }

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

        // TODO: Create School
        // TODO: Create Super Admin User
        // TODO: Generate Subdomain
        // TODO: Set Trial Period

        request.setStatus("APPROVED");
        request.setApprovedAt(LocalDateTime.now());
        pendingDemoRequestRepository.save(request);

        // Send approval email to school super admin
        sendApprovalEmail(
            request.getSuperAdminEmail(),
            request.getSuperAdminName(),
            request.getSchoolName(),
            "school-" + request.getSchoolName().toLowerCase().replace(" ", "-")
        );

        log.info("Demo request approved: {}", uuid);
    }

    private void sendConfirmationEmail(String to, String name, String schoolName) {
        String subject = "🎉 Demo Request Received – ShikkhaERP";
        String body = String.format("""
            Dear %s,

            Thank you for your interest in ShikkhaERP!

            We have received your demo request for %s. Our team will
            review your application and get back to you within 72 hours.

            📌 What happens next:
            - Our team will review your request
            - You'll receive an approval email
            - You'll get access to your 30-day free trial

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

            📊 Request Details:
            - School: %s
            - Super Admin: %s (%s)
            - Students: %d
            - Teachers: %d

            🔗 Click here to review and approve:
            %s

            Request ID: %s
            Submitted: %s

            Best regards,
            ShikkhaERP System
            """,
            request.getSchool().getName(),
            request.getSuperAdmin().getName(),
            request.getSuperAdmin().getEmail(),
            request.getSchool().getNumberOfStudents() != null ? request.getSchool().getNumberOfStudents() : 0,
            request.getSchool().getNumberOfTeachers() != null ? request.getSchool().getNumberOfTeachers() : 0,
            approvalUrl,
            uuid,
            LocalDateTime.now()
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

            🔑 Login Details:
            Portal: %s
            Email: %s

            📋 What you can do now:
            1. Log in using the link above
            2. Set your password
            3. Start managing your school!

            ⏳ Trial expires: %s

            Need help? Check our documentation or contact support.

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
}
