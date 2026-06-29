package com.shikkhaerp.modules.auth.service;

import com.shikkhaerp.bootstrap.security.JwtUtil;
import com.shikkhaerp.modules.auth.dto.LoginRequest;
import com.shikkhaerp.modules.auth.dto.LoginResponse;
import com.shikkhaerp.modules.auth.dto.LogoutRequest;
import com.shikkhaerp.modules.auth.dto.LogoutResponse;
import com.shikkhaerp.modules.auth.dto.RegisterRequest;
import com.shikkhaerp.modules.auth.entity.RefreshToken;
import com.shikkhaerp.modules.auth.repository.RefreshTokenRepository;
import com.shikkhaerp.modules.user.entity.User;
import com.shikkhaerp.modules.user.entity.User.UserRole;
import com.shikkhaerp.modules.user.repository.UserRepository;
import com.shikkhaerp.modules.tenant.service.TenantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final TenantService tenantService;
    private final TokenBlacklistService tokenBlacklistService;
    
    @Transactional
    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        
        String schoolId = null;
        
        if (request.getRole() != UserRole.SUPER_ADMIN) {
            schoolId = tenantService.getCurrentSchoolId();
        }
        
        if (schoolId == null || schoolId.trim().isEmpty()) {
            schoolId = "1";
        }
        
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getFullName());
        user.setRole(request.getRole());
        user.setSchoolId(schoolId);
        user.setEnabled(true);
        user.setEmailVerified(true);
        user.setStatus(User.UserStatus.ACTIVE);
        
        User savedUser = userRepository.save(user);
        log.info("User registered: {} with role: {}", savedUser.getEmail(), savedUser.getRole());
        
        return savedUser;
    }
    
    @Transactional
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!user.isEnabled()) {
            throw new RuntimeException("Account is disabled");
        }
        
        if (user.isLocked()) {
            throw new RuntimeException("Account is locked");
        }
        
        user.recordLoginSuccess(null, null);
        userRepository.save(user);
        
        // FIXED: Convert Long to String using String.valueOf()
        String userId = String.valueOf(user.getId());
        String email = user.getEmail();
        String role = user.getRole().name();
        
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
            email,
            user.getPassword(),
            user.isEnabled(),
            true, true, true,
            java.util.Collections.singletonList(
                new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role)
            )
        );
        
        String accessToken = jwtUtil.generateToken(userDetails);
        String refreshToken = generateRefreshToken(userId);
        String redirectUrl = getDashboardUrl(user.getRole());
        
        RefreshToken refreshTokenEntity = new RefreshToken();
        refreshTokenEntity.setToken(refreshToken);
        refreshTokenEntity.setUserId(userId);
        refreshTokenEntity.setExpiryDate(LocalDateTime.now().plusDays(7));
        refreshTokenRepository.save(refreshTokenEntity);
        
        // FIXED: Convert Long to String using String.valueOf()
        LoginResponse.UserInfo userInfo = LoginResponse.UserInfo.builder()
            .id(String.valueOf(user.getId()))
            .email(user.getEmail())
            .fullName(user.getName())
            .role(convertToAuthRole(user.getRole()))
            .schoolId(user.getSchoolId())
            .build();
        
        log.info("User logged in: {}", email);
        
        return LoginResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .user(userInfo)
            .redirectUrl(redirectUrl)
            .build();
    }
    
    @Transactional
    public LoginResponse setupPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setEnabled(true);
        user.setStatus(User.UserStatus.ACTIVE);
        userRepository.save(user);

        // FIXED: Convert Long to String using String.valueOf()
        String userId = String.valueOf(user.getId());
        String userEmail = user.getEmail();
        String role = user.getRole().name();
        
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
            userEmail,
            user.getPassword(),
            user.isEnabled(),
            true, true, true,
            java.util.Collections.singletonList(
                new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role)
            )
        );
        
        String accessToken = jwtUtil.generateToken(userDetails);
        String refreshToken = generateRefreshToken(userId);

        RefreshToken refreshTokenEntity = new RefreshToken();
        refreshTokenEntity.setToken(refreshToken);
        refreshTokenEntity.setUserId(userId);
        refreshTokenEntity.setExpiryDate(LocalDateTime.now().plusDays(7));
        refreshTokenRepository.save(refreshTokenEntity);

        // FIXED: Convert Long to String using String.valueOf()
        LoginResponse.UserInfo userInfo = LoginResponse.UserInfo.builder()
            .id(String.valueOf(user.getId()))
            .email(user.getEmail())
            .fullName(user.getName())
            .role(convertToAuthRole(user.getRole()))
            .schoolId(user.getSchoolId())
            .build();

        log.info("Password setup completed for: {}", email);

        return LoginResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .user(userInfo)
            .redirectUrl(getDashboardUrl(user.getRole()))
            .build();
    }
    
    @Transactional
    public LogoutResponse logout(LogoutRequest request) {
        String refreshToken = request.getRefreshToken();
        
        if (refreshToken != null && !refreshToken.isEmpty()) {
            try {
                String email = jwtUtil.extractUsername(refreshToken);
                tokenBlacklistService.blacklistToken(refreshToken, email);
                refreshTokenRepository.deleteByToken(refreshToken);
                
                log.info("User logged out: {}", email);
                
                return LogoutResponse.builder()
                    .success(true)
                    .message("Logged out successfully")
                    .build();
                    
            } catch (Exception e) {
                log.warn("Error during logout: {}", e.getMessage());
                return LogoutResponse.builder()
                    .success(true)
                    .message("Logged out successfully")
                    .build();
            }
        }
        
        return LogoutResponse.builder()
            .success(true)
            .message("Logged out successfully")
            .build();
    }
    
    private String generateRefreshToken(String userId) {
        return UUID.randomUUID().toString() + "-" + userId;
    }
    
    private String getDashboardUrl(UserRole role) {
        switch (role) {
            case SUPER_ADMIN: return "/super-admin/dashboard";
            case SCHOOL_ADMIN: return "/school-admin/dashboard";
            case TEACHER: return "/teacher/dashboard";
            case STUDENT: return "/student/dashboard";
            case PARENT: return "/parent/dashboard";
            default: return "/dashboard";
        }
    }
    
    private com.shikkhaerp.modules.auth.entity.Role convertToAuthRole(UserRole role) {
        switch (role) {
            case SUPER_ADMIN: return com.shikkhaerp.modules.auth.entity.Role.SUPER_ADMIN;
            case SCHOOL_ADMIN: return com.shikkhaerp.modules.auth.entity.Role.SCHOOL_ADMIN;
            case TEACHER: return com.shikkhaerp.modules.auth.entity.Role.TEACHER;
            case STUDENT: return com.shikkhaerp.modules.auth.entity.Role.STUDENT;
            case PARENT: return com.shikkhaerp.modules.auth.entity.Role.PARENT;
            default: return com.shikkhaerp.modules.auth.entity.Role.STUDENT;
        }
    }
}