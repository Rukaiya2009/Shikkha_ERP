package com.shikkhaerp.bootstrap;

import com.shikkhaerp.modules.user.entity.User;
import com.shikkhaerp.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String devEmail = "farhanahoque251@gmail.com";

        // Skip if user already exists
        if (userRepository.existsByEmail(devEmail)) {
            log.info("👤 Developer user already exists – skipping seed");
            return;
        }

        User dev = new User();
        dev.setEmail(devEmail);
        dev.setName("Developer User");
        dev.setPassword(passwordEncoder.encode("Dev@123456")); // temporary – change after first login
        dev.setRole(User.UserRole.DEVELOPER);
        dev.setSchoolId(null);
        dev.setEnabled(true);
        dev.setStatus(User.UserStatus.ACTIVE);
        userRepository.save(dev);
        log.info("✅ Developer user seeded: {}", devEmail);
    }
}