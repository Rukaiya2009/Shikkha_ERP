package com.shikkhaerp.modules.notification.service;

import com.shikkhaerp.modules.demo.entity.PendingDemoRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class EmailService {

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String ZEPTOMAIL_API_URL = "https://api.zeptomail.com/v1.1/email";

    @Value("${zeptomail.token}")
    private String zeptoMailToken;

    @Value("${spring.mail.username:shikkhaerp@itdatascience.com}")
    private String fromEmail;

    @Value("${app.company.admin.email}")
    private String adminEmail;

    @Value("${app.base-url:https://shikkha-erp.onrender.com}")
    private String baseUrl;

    public void sendEmail(String to, String subject, String body) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Accept", "application/json");
            headers.set("Authorization", zeptoMailToken);

            Map<String, Object> fromMap = new HashMap<>();
            fromMap.put("address", fromEmail);
            fromMap.put("name", "ShikkhaERP");

            List<Map<String, Object>> toList = new ArrayList<>();
            for (String recipient : to.split("[,;\\s]+")) {
                if (recipient.isBlank()) continue;
                Map<String, Object> emailAddress = new HashMap<>();
                emailAddress.put("address", recipient.trim());

                Map<String, Object> toEntry = new HashMap<>();
                toEntry.put("email_address", emailAddress);
                toList.add(toEntry);
            }

            Map<String, Object> payload = new HashMap<>();
            payload.put("from", fromMap);
            payload.put("to", toList);
            payload.put("subject", subject);
            payload.put("textbody", body);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                ZEPTOMAIL_API_URL, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("✅ Email sent to: {}", to);
            } else {
                log.error("❌ ZeptoMail returned unexpected status {} for: {}",
                    response.getStatusCode(), to);
                throw new RuntimeException("Email sending failed with status: "
                    + response.getStatusCode());
            }
        } catch (Exception e) {
            String tokenDebug = String.format(
                "TOKEN_LEN=%d TOKEN_START=[%s] TOKEN_END=[%s]",
                zeptoMailToken.length(),
                zeptoMailToken.substring(0, Math.min(20, zeptoMailToken.length())),
                zeptoMailToken.substring(Math.max(0, zeptoMailToken.length() - 10))
            );
            log.error("❌ Failed to send email to: {} | {}", to, tokenDebug, e);
            throw new RuntimeException("Email sending failed: "
                + e.getMessage() + " || " + tokenDebug);
        }
    }

    public void sendDemoSubmissionConfirmation(PendingDemoRequest request) {
        String subject = "Demo Request Received - ShikkhaERP";
        String body = String.format("""
            Dear %s,

            Thank you for your interest in ShikkhaERP!

            We have received your demo request for %s.
            Your request ID is: %s

            Our team will review your request and get back to you within 24-48 hours.

            Best regards,
            ShikkhaERP Team

            Need help? Contact us at support@shikkhaerp.com
            """,
            request.getSuperAdminName(),
            request.getSchoolName(),
            request.getUuid()
        );
        sendEmail(request.getSuperAdminEmail(), subject, body);
        log.info("📧 Demo submission confirmation sent to: {}", request.getSuperAdminEmail());
    }

    public void sendDemoApprovalNotification(PendingDemoRequest request, String password) {
        String subject = "Demo Request Approved - ShikkhaERP";
        String body = String.format("""
            Dear %s,

            Congratulations! Your demo request for %s has been APPROVED.

            Your temporary login credentials:
            URL: %s
            Email: %s
            Password: %s

            Please login and change your password immediately.

            Best regards,
            ShikkhaERP Team
            """,
            request.getSuperAdminName(),
            request.getSchoolName(),
            baseUrl,
            request.getSuperAdminEmail(),
            password
        );
        sendEmail(request.getSuperAdminEmail(), subject, body);
        log.info("📧 Demo approval notification sent to: {}", request.getSuperAdminEmail());
    }

    public void sendDemoRejectionNotification(PendingDemoRequest request, String reason) {
        String subject = "Demo Request Status Update - ShikkhaERP";
        String body = String.format("""
            Dear %s,

            Thank you for your interest in ShikkhaERP.

            We regret to inform you that your demo request for %s has been REJECTED.

            Reason: %s

            If you have any questions, please contact us at support@shikkhaerp.com

            Best regards,
            ShikkhaERP Team
            """,
            request.getSuperAdminName(),
            request.getSchoolName(),
            reason
        );
        sendEmail(request.getSuperAdminEmail(), subject, body);
        log.info("📧 Demo rejection notification sent to: {}", request.getSuperAdminEmail());
    }

    public void sendAdminNotification(PendingDemoRequest request) {
        String subject = "🔔 New Demo Request - " + request.getSchoolName();
        String body = String.format("""
            New demo request received!

            School: %s
            Address: %s
            Phone: %s
            Email: %s
            Super Admin: %s
            Super Admin Email: %s

            Request ID: %s

            View: %s/api/demo/%s
            Approve: %s/api/demo/approve/%s
            Reject: %s/api/demo/reject/%s
            """,
            request.getSchoolName(),
            request.getSchoolAddress(),
            request.getSchoolPhone(),
            request.getSchoolEmail(),
            request.getSuperAdminName(),
            request.getSuperAdminEmail(),
            request.getUuid(),
            baseUrl, request.getUuid(),
            baseUrl, request.getUuid(),
            baseUrl, request.getUuid()
        );
        sendEmail(adminEmail, subject, body);
        log.info("📧 Admin notification sent to: {}", adminEmail);
    }

    public void sendPasswordResetEmail(String email, String resetToken) {
        String subject = "Password Reset Request - ShikkhaERP";
        String body = String.format("""
            Hello,

            We received a request to reset your password for ShikkhaERP.

            Click the link below to reset your password:
            %s/api/auth/reset-password?token=%s

            This link will expire in 24 hours.

            If you did not request this, please ignore this email.

            Best regards,
            ShikkhaERP Team
            """,
            baseUrl,
            resetToken
        );
        sendEmail(email, subject, body);
        log.info("📧 Password reset email sent to: {}", email);
    }

    public void sendEmailVerification(String email, String verificationToken) {
        String subject = "Verify Your Email - ShikkhaERP";
        String body = String.format("""
            Hello,

            Welcome to ShikkhaERP!

            Please verify your email address by clicking the link below:
            %s/api/auth/verify-email?token=%s

            This link will expire in 24 hours.

            Best regards,
            ShikkhaERP Team
            """,
            baseUrl,
            verificationToken
        );
        sendEmail(email, subject, body);
        log.info("📧 Email verification sent to: {}", email);
    }

    public void sendWelcomeEmail(String email, String name, String password) {
        String subject = "Welcome to ShikkhaERP!";
        String body = String.format("""
            Hello %s,

            Welcome to ShikkhaERP!

            Your account has been created successfully.
            URL: %s
            Email: %s
            Password: %s

            Please login and change your password immediately.

            Best regards,
            ShikkhaERP Team
            """,
            name,
            baseUrl,
            email,
            password
        );
        sendEmail(email, subject, body);
        log.info("📧 Welcome email sent to: {}", email);
    }
}