package com.shikkhaerp.core.util;

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
    
    @Value("${spring.mail.username:}")
    private String fromEmail;
    
    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    public void sendVerificationEmail(String toEmail, String token) {
        String verificationUrl = baseUrl + "/api/v1/auth/verify-email?token=" + token;
        
        // Log the URL for testing (since email might not be configured)
        log.info("========================================");
        log.info("📧 VERIFICATION EMAIL WOULD BE SENT TO: {}", toEmail);
        log.info("🔗 VERIFICATION LINK: {}", verificationUrl);
        log.info("========================================");
        
        // Only send actual email if mail is configured
        if (fromEmail != null && !fromEmail.isEmpty() && !"dummy".equals(fromEmail)) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(toEmail);
                message.setSubject("ShikkhaERP - Verify Your Email");
                message.setText(String.format(
                    "Dear User,\n\n" +
                    "Thank you for registering with ShikkhaERP.\n\n" +
                    "Please click the link below to verify your email address:\n\n" +
                    "%s\n\n" +
                    "This link will expire in 24 hours.\n\n" +
                    "If you did not register, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "ShikkhaERP Team",
                    verificationUrl
                ));
                mailSender.send(message);
                log.info("Verification email sent to: {}", toEmail);
            } catch (Exception e) {
                log.warn("Failed to send email: {}", e.getMessage());
            }
        }
    }
    
    public void sendApprovalEmail(String toEmail, String name) {
        log.info("========================================");
        log.info("📧 APPROVAL EMAIL WOULD BE SENT TO: {}", toEmail);
        log.info("✅ Account approved for: {}", name);
        log.info("========================================");
        
        if (fromEmail != null && !fromEmail.isEmpty() && !"dummy".equals(fromEmail)) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(toEmail);
                message.setSubject("ShikkhaERP - Account Approved");
                message.setText(String.format(
                    "Dear %s,\n\n" +
                    "Your account has been approved.\n\n" +
                    "You can now login to ShikkhaERP.\n\n" +
                    "Best regards,\n" +
                    "ShikkhaERP Team",
                    name
                ));
                mailSender.send(message);
                log.info("Approval email sent to: {}", toEmail);
            } catch (Exception e) {
                log.warn("Failed to send email: {}", e.getMessage());
            }
        }
    }
}
