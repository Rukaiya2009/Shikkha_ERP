package com.shikkhaerp.modules.notification.service;

import com.shikkhaerp.modules.demo.entity.PendingDemoRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:shikkhaerp@zohomail.com}")
    private String fromEmail;

    @Value("${app.company.admin.email}")
    private String adminEmail;

    @Value("${app.base-url:https://shikkha-erp.onrender.com}")
    private String baseUrl;

    // =============================================
    // CORE EMAIL METHOD
    // =============================================

    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            message.setFrom(fromEmail);
            mailSender.send(message);
            log.info("✅ Email sent to: {}", to);
        } catch (Exception e) {
            log.error("❌ Failed to send email to: {}", to, e);
            throw new RuntimeException("Email sending failed: " + e.getMessage());
        }
    }

    // =============================================
    // DEMO REQUEST EMAILS
    // =============================================

    /**
     * Send demo submission confirmation to user
     */
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

    /**
     * Send demo approval notification to user
     */
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

    /**
     * Send demo rejection notification to user
     */
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

    /**
     * Send admin notification for new demo request
     */
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

    // =============================================
    // AUTH EMAILS (Password Reset, Verification)
    // =============================================

    /**
     * Send password reset email
     */
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

    /**
     * Send email verification email
     */
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

    /**
     * Send welcome email to new user
     */
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