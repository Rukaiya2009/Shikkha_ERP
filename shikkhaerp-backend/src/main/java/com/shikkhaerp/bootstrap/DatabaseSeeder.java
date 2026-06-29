package com.shikkhaerp.bootstrap;

import com.shikkhaerp.modules.user.entity.User;
import com.shikkhaerp.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ===== Load from environment variables =====
    @Value("${ADMIN_EMAIL:admin@shikkhaerp.com}")
    private String adminEmail;

    @Value("${ADMIN_PASSWORD:admin123}")
    private String adminPassword;

    @Value("${ADMIN_NAME:System Admin}")
    private String adminName;

    @Value("${ADMIN_ROLE:SUPER_ADMIN}")
    private String adminRole;

    @Value("${ADMIN_SCHOOL_ID:1}")
    private String adminSchoolId;

    @Override
    public void run(String... args) {
        try {
            // Check if admin exists
            if (userRepository.findByEmail(adminEmail).isEmpty()) {
                User admin = new User();
                admin.setEmail(adminEmail);
                admin.setPassword(passwordEncoder.encode(adminPassword));
                admin.setName(adminName);
                admin.setRole(User.UserRole.valueOf(adminRole));
                admin.setStatus(User.UserStatus.ACTIVE);
                admin.setEnabled(true);
                admin.setEmailVerified(true);
                admin.setSchoolId(adminSchoolId);
                
                userRepository.save(admin);
                log.info("✅ Admin user created: {}", adminEmail);
                log.info("🔑 Password: {}", adminPassword);
                log.info("⚠️  Please change the default password after first login!");
            } else {
                log.info("✅ Admin user already exists: {}", adminEmail);
            }
        } catch (IllegalArgumentException e) {
            log.error("❌ Invalid ADMIN_ROLE: {}. Must be one of: SUPER_ADMIN, SCHOOL_ADMIN, TEACHER, STUDENT, PARENT", adminRole);
        } catch (Exception e) {
            log.error("❌ Failed to create admin user: {}", e.getMessage());
        }
    }
}