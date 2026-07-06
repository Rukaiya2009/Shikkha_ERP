package com.shikkhaerp.bootstrap;

import com.shikkhaerp.modules.user.entity.User;
import com.shikkhaerp.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${ADMIN_EMAIL:admin@shikkhaerp.com}")
    private String adminEmails;

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
            // Split emails by comma or space
            List<String> emailList = Arrays.stream(adminEmails.split("[,;\\s]+"))
                .map(String::trim)
                .filter(email -> !email.isEmpty())
                .toList();

            int createdCount = 0;
            
            for (String email : emailList) {
                if (userRepository.findByEmail(email).isEmpty()) {
                    User admin = new User();
                    admin.setEmail(email);
                    admin.setPassword(passwordEncoder.encode(adminPassword));
                    admin.setName(adminName);
                    admin.setRole(User.UserRole.valueOf(adminRole));
                    admin.setStatus(User.UserStatus.ACTIVE);
                    admin.setEnabled(true);
                    admin.setEmailVerified(true);
                    admin.setSchoolId(adminSchoolId);
                    
                    userRepository.save(admin);
                    createdCount++;
                    log.info("✅ Admin user created: {}", email);
                } else {
                    log.info("✅ Admin already exists: {}", email);
                }
            }

            if (createdCount > 0) {
                log.info("✅ Created {} admin user(s) with password: {}", createdCount, adminPassword);
                log.info("⚠️  Please change the default password after first login!");
            }

        } catch (IllegalArgumentException e) {
            log.error("❌ Invalid ADMIN_ROLE: {}. Must be one of: SUPER_ADMIN, SCHOOL_ADMIN, TEACHER, STUDENT, PARENT, DEVELOPER", adminRole);
        } catch (Exception e) {
            log.error("❌ Failed to create admin user(s): {}", e.getMessage());
        }
    }
}