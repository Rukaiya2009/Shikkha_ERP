package com.shikkhaerp.modules.auth.workflow;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class AuthWorkflow {
    
    public enum RegistrationStatus {
        PENDING_VERIFICATION, EMAIL_VERIFIED, PHONE_VERIFIED, COMPLETED
    }
    
    public void sendVerificationEmail(String email, String token) {
        log.info("Sending verification email to: {} with token: {}", email, token);
        // Implement email sending logic
    }
    
    public void sendVerificationSms(String phone, String otp) {
        log.info("Sending verification SMS to: {} with OTP: {}", phone, otp);
        // Implement SMS sending logic
    }
}