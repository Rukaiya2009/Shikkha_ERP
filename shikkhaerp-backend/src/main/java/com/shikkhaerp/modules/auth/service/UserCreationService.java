//cat > src/main/java/com/shikkhaerp/modules/auth/service/UserCreationService.java << 'EOF'
package com.shikkhaerp.modules.auth.service;

import com.shikkhaerp.modules.user.entity.User;
import com.shikkhaerp.modules.user.entity.User.UserRole;
import com.shikkhaerp.modules.user.entity.User.UserStatus;
import com.shikkhaerp.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserCreationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User createSchoolSuperAdmin(String email, String name, String phone, String schoolId) {
        // Check if user already exists
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("User with email " + email + " already exists");
        }

        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setPhone(phone);
        user.setSchoolId(schoolId);
        user.setRole(UserRole.SCHOOL_ADMIN);
        user.setStatus(UserStatus.PENDING_VERIFICATION);
        user.setEnabled(false);
        user.setEmailVerified(false);

        // Generate temporary password (user will set their own on first login)
        String tempPassword = UUID.randomUUID().toString().substring(0, 8);
        user.setPassword(passwordEncoder.encode(tempPassword));

        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }
}
