package com.shikkhaerp.modules.auth.service;

import com.shikkhaerp.bootstrap.security.JwtUtil;
import com.shikkhaerp.modules.auth.entity.Role;
import com.shikkhaerp.modules.auth.repository.RefreshTokenRepository;
import com.shikkhaerp.modules.tenant.service.TenantService;
import com.shikkhaerp.modules.user.entity.User.UserRole;
import com.shikkhaerp.modules.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;

class AuthServiceTest {

    @Test
    void developerRoleShouldMapToDeveloperDashboardAndRole() throws Exception {
        AuthService authService = new AuthService(
                mock(UserRepository.class),
                mock(RefreshTokenRepository.class),
                mock(PasswordEncoder.class),
                mock(AuthenticationManager.class),
                mock(JwtUtil.class),
                mock(TenantService.class),
                mock(TokenBlacklistService.class),
                mock(LoginAttemptService.class)
        );

        Method getDashboardUrl = AuthService.class.getDeclaredMethod("getDashboardUrl", UserRole.class);
        getDashboardUrl.setAccessible(true);
        String redirectUrl = (String) getDashboardUrl.invoke(authService, UserRole.DEVELOPER);

        Method convertToAuthRole = AuthService.class.getDeclaredMethod("convertToAuthRole", UserRole.class);
        convertToAuthRole.setAccessible(true);
        Role authRole = (Role) convertToAuthRole.invoke(authService, UserRole.DEVELOPER);

        assertEquals("/developer/dashboard", redirectUrl);
        assertEquals(Role.DEVELOPER, authRole);
    }
}
