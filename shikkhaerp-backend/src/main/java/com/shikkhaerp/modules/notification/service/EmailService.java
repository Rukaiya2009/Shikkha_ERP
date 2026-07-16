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

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class EmailService {

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String ZEPTOMAIL_API_URL = "https://api.zeptomail.com/v1.1/email";
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MMMM d, yyyy");

    @Value("${zeptomail.token}")
    private String zeptoMailToken;

    @Value("${spring.mail.username:shikkhaerp@itdatascience.com}")
    private String fromEmail;

    @Value("${app.company.admin.email}")
    private String adminEmail;

    @Value("${app.base-url:https://shikkha-erp.onrender.com}")
    private String baseUrl;

    @Value("${app.frontend-url:https://shikkha-erp.vercel.app}")
    private String frontendUrl;

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
            log.error("❌ Failed to send email to: {}", to, e);
            throw new RuntimeException("Email sending failed: " + e.getMessage());
        }
    }

    // ==================== v3.0 Demo workflow — 2 emails at submit, 1 at approve ====================

    /** Branch 1 — confirmation to the person who submitted the form (text only, no links). */
    public void sendDemoSubmissionConfirmation(PendingDemoRequest request) {
        String subject = "Demo Request Received - ShikkhaERP";
        String body = String.format("""
            Dear %s,

            Thank you for submitting a demo request for ShikkhaERP!

            We have received your application for %s.
            Your request ID is: %s

            Our team will review it within 72 hours and contact the school to
            finalise the super admin details.

            No action is required from you at this time.

            Best regards,
            ShikkhaERP Team

            Questions? Contact us at support@shikkhaerp.com
            """,
            safe(request.getRequesterName(), "Applicant"),
            request.getSchoolName(),
            request.getUuid()
        );
        sendEmail(request.getRequesterEmail(), subject, body);
        log.info("📧 Demo submission confirmation sent to requester: {}", request.getRequesterEmail());
    }

    /** Branch 2 — notification to the ITDataScience developer with the app approval link. */
    public void sendAdminNotification(PendingDemoRequest request) {
        String subject = "🔔 New Demo Request - " + request.getSchoolName();
        String appApprovalLink = frontendUrl + "/app/approve/" + request.getUuid();
        String rejectLink = baseUrl + "/api/demo/reject?token=" + request.getRejectionToken();

        String body = String.format("""
            Dear ITDataScience Team,

            A new ShikkhaERP demo request has been submitted and is pending review.

            📊 School Details:
            Name:    %s
            Type:    %s
            Branch:  %s
            Address: %s
            Phone:   %s
            Email:   %s

            👤 Requester:
            Name:  %s
            Email: %s
            Phone: %s

            🔗 Review and create this school (login required):
            %s

            You will need to:
            1. Call the school using the phone number above
            2. Obtain the super admin's email address
            3. Enter it on the approval page
            4. Select approval notes (preset or custom)
            5. Click "Create School"

            To reject without opening the app:
            %s

            Request ID: %s
            This request expires in 7 days.

            ShikkhaERP System
            """,
            request.getSchoolName(),
            safe(request.getSchoolType(), "HIGH_SCHOOL"),
            safe(request.getBranch(), "—"),
            safe(request.getSchoolAddress(), "—"),
            safe(request.getSchoolPhone(), "—"),
            safe(request.getSchoolEmail(), "—"),
            safe(request.getRequesterName(), "—"),
            safe(request.getRequesterEmail(), "—"),
            safe(request.getRequesterPhone(), "—"),
            appApprovalLink,
            rejectLink,
            request.getUuid()
        );
        sendEmail(adminEmail, subject, body);
        log.info("📧 Developer notification sent to: {}", adminEmail);
    }

    /** Branch 3 — login/setup link to the super admin, sent after approval (includes notes). */
    public void sendSuperAdminLoginEmail(String superAdminEmail, String schoolName,
                                         String token, String notes, LocalDateTime trialEnd) {
        String encodedEmail = URLEncoder.encode(superAdminEmail, StandardCharsets.UTF_8);
        String loginLink = frontendUrl + "/login?email=" + encodedEmail + "&token=" + token;
        String trialEndStr = trialEnd != null ? trialEnd.format(DATE_FMT) : "in 30 days";
        String note = (notes != null && !notes.isBlank())
            ? notes
            : "Congratulations! Your school has been approved for a 30-day free trial of ShikkhaERP.";

        String subject = "🎉 Your School is Approved — Set Up Your Admin Account";
        String body = String.format("""
            Dear Super Admin,

            %s

            You have been registered as the Super Administrator of %s.

            🔑 Set up your admin account using the link below:
            %s

            On that page:
            • Your email is already filled in (you cannot change it)
            • Enter a password of your choice
            • Confirm your password
            • Click "Create Account & Sign In"

            You will then be taken directly to your school's dashboard.

            ⏳ Your 30-day free trial expires on %s.

            Need help? Contact support@shikkhaerp.com

            Best regards,
            ShikkhaERP Team
            """,
            note,
            schoolName,
            loginLink,
            trialEndStr
        );
        sendEmail(superAdminEmail, subject, body);
        log.info("📧 Super admin login email sent to: {}", superAdminEmail);
    }

    /** Rejection notice to the requester. */
    public void sendDemoRejectionNotification(PendingDemoRequest request, String reason) {
        String subject = "Demo Request Status Update - ShikkhaERP";
        String body = String.format("""
            Dear %s,

            Thank you for your interest in ShikkhaERP.

            After reviewing your application for %s, we are unable to proceed at
            this time.

            Reason: %s

            If you have any questions, please contact us at support@shikkhaerp.com

            Best regards,
            ShikkhaERP Team
            """,
            safe(request.getRequesterName(), "Applicant"),
            request.getSchoolName(),
            safe(reason, "No reason provided")
        );
        sendEmail(request.getRequesterEmail(), subject, body);
        log.info("📧 Demo rejection notification sent to requester: {}", request.getRequesterEmail());
    }

    // ==================== Existing account emails (unchanged) ====================

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

    public void sendUserInvitation(String email, String name, String token) {
        String subject = "You've been invited to ShikkhaERP";
        String body = String.format("""
            Hello %s,

            You've been added to ShikkhaERP. To activate your account, set your
            password using the link below:

            %s/setup-password?token=%s

            This link will expire in 24 hours. If it expires, ask your admin to
            resend the invitation.

            Best regards,
            ShikkhaERP Team
            """,
            name,
            frontendUrl,
            token
        );
        sendEmail(email, subject, body);
        log.info("📧 User invitation sent to: {}", email);
    }

    private String safe(String value, String fallback) {
        return (value == null || value.isBlank()) ? fallback : value;
    }
}
