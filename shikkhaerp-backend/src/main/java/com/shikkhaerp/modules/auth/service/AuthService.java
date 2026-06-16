package com.shikkhaerp.modules.auth.service;

import com.shikkhaerp.modules.auth.dto.LoginRequest;
import com.shikkhaerp.modules.auth.dto.LoginResponse;
import com.shikkhaerp.modules.auth.dto.RegisterRequest;
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

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final TenantService tenantService;
    
    @Transactional
    public User register(RegisterRequest request) {
        // Check if user exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        
        // Determine school ID
        String schoolId = request.getSchoolId();
        
        // If schoolId is not provided in request, get from tenant context
        if (schoolId == null || schoolId.trim().isEmpty()) {
            if (request.getRole() != UserRole.SUPER_ADMIN) {
                schoolId = tenantService.getCurrentSchoolId();
            }
        }
        
        // Validate school_id for non-super_admin roles
        if (request.getRole() != UserRole.SUPER_ADMIN && 
            (schoolId == null || schoolId.trim().isEmpty())) {
            throw new RuntimeException("School ID is required for " + request.getRole());
        }
        
        // Create user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getFullName());
        user.setRole(request.getRole());
        user.setSchoolId(schoolId);
        
        return userRepository.save(user);
    }
    
    @Transactional
    public LoginResponse login(LoginRequest request) {
        // Authenticate
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        // Get user
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user is enabled
        if (!user.isEnabled()) {
            throw new RuntimeException("Account is disabled");
        }
        
        // Check if user is locked
        if (user.isLocked()) {
            throw new RuntimeException("Account is locked");
        }
        
        // Record successful login
        user.recordLoginSuccess(null, null);
        userRepository.save(user);
        
        // Generate tokens
        String userId = user.getId();
        String email = user.getEmail();
        String role = user.getRole().name();
        
        String accessToken = tokenProvider.generateToken(userId, email, role);
        String refreshToken = tokenProvider.generateRefreshToken(userId);
        String redirectUrl = getDashboardUrl(user.getRole());
        
        // Build response
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
