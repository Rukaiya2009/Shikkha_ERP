package com.shikkhaerp.modules.user.workflow;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class UserWorkflow {
    
    public enum UserAction {
        CREATE, UPDATE, DELETE, ENABLE, DISABLE
    }
    
    public void logUserAction(String userId, UserAction action) {
        log.info("User action: {} performed by user: {}", action, userId);
    }
    
    public void sendWelcomeEmail(String email, String name) {
        log.info("Sending welcome email to: {} ({})", email, name);
        // Implement email sending
    }
}