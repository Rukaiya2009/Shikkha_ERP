package com.shikkhaerp.modules.auth.service;

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
import com.shikkhaerp.bootstrap.security.JwtTokenProvider;
import com.shikkhaerp.modules.tenant.service.TenantService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final TenantService tenantService;
    private final TokenBlacklistService tokenBlacklistService;
    
    @Transactional
    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        
        // =============================================
        // SCHOOL ID: Derived from tenant context
        // Frontend does NOT send schoolId
        // =============================================
        String schoolId = null;
        
        // SUPER_ADMIN doesn't need a school
        if (request.getRole() != UserRole.SUPER_ADMIN) {
            schoolId = tenantService.getCurrentSchoolId();
        }
        
        // =============================================
        // DEVELOPMENT: Use default school if still null
        // =============================================
        if (schoolId == null || schoolId.trim().isEmpty()) {
            schoolId = "1"; // Default school for development
        }
        
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getFullName());
        user.setRole(request.getRole());
        user.setSchoolId(schoolId);
        
        // Auto-verify for development
        user.setEnabled(true);
        user.setEmailVerified(true);
        user.setStatus(User.UserStatus.ACTIVE);
        
        return userRepository.save(user);
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
        
        String userId = user.getId();
        String email = user.getEmail();
        String role = user.getRole().name();
        
        String accessToken = tokenProvider.generateToken(userId, email, role);
        String refreshToken = tokenProvider.generateRefreshToken(userId);
        String redirectUrl = getDashboardUrl(user.getRole());
        
        RefreshToken refreshTokenEntity = new RefreshToken();
        refreshTokenEntity.setToken(refreshToken);
        refreshTokenEntity.setUserId(userId);
        refreshTokenEntity.setExpiryDate(LocalDateTime.now().plusDays(7));
        refreshTokenRepository.save(refreshTokenEntity);
        
        LoginResponse.UserInfo userInfo = LoginResponse.UserInfo.builder()
            .id(user.getId())
            .email(user.getEmail())
            .fullName(user.getName())
            .role(convertToAuthRole(user.getRole()))
            .schoolId(user.getSchoolId())
            .build();
        
        return LoginResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .user(userInfo)
            .redirectUrl(redirectUrl)
            .build();
    }
    
    @Transactional
    public LogoutResponse logout(LogoutRequest request) {
        String refreshToken = request.getRefreshToken();
        
        if (refreshToken != null && !refreshToken.isEmpty()) {
            try {
                String userId = tokenProvider.getUserIdFromToken(refreshToken);
                tokenBlacklistService.blacklistToken(refreshToken, userId);
                refreshTokenRepository.deleteByToken(refreshToken);
                
                return LogoutResponse.builder()
                    .success(true)
                    .message("Logged out successfully")
                    .build();
                    
            } catch (Exception e) {
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
