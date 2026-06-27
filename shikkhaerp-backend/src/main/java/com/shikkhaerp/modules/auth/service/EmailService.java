//cat > src/main/java/com/shikkhaerp/modules/auth/service/AuthEmailService.java << 'EOF'
package com.shikkhaerp.modules.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    public void sendEmail(String to, String subject, String body) {
    try {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        message.setFrom("shikkhaerp@zohomail.com"); // ← Your Zoho email
        mailSender.send(message);
        log.info("Email sent to: {}", to);
    } catch (Exception e) {
        log.error("Failed to send email to: {}", to, e);
        throw new RuntimeException("Email sending failed: " + e.getMessage());
    }
}
}