//cat > src/main/java/com/shikkhaerp/bootstrap/security/JwtAuthenticationFilter.java << 'ENDOFFILE'
package com.shikkhaerp.bootstrap.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    // Public endpoints must NEVER have their token validated. The browser
    // attaches whatever accessToken is in localStorage to every request — so a
    // stale/expired token would otherwise be validated on /auth/login itself,
    // fail, and return 401 "Authentication failed" BEFORE the login request
    // reached the login endpoint. That locks the user out of logging in with
    // correct credentials, recoverable only by clearing localStorage.
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return uri.contains("/auth/")
            || uri.contains("/public/")
            || uri.contains("/demo/")
            || uri.contains("/actuator/health");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // CRITICAL: only JWT PARSING/VALIDATION happens inside this try block.
        // filterChain.doFilter(...) must stay OUTSIDE it — otherwise every
        // exception thrown anywhere downstream (e.g. "User with email X already
        // exists!") gets caught here and mislabelled as 401 "Authentication
        // failed", which makes the frontend interceptor log the user out on
        // ordinary validation errors.
        try {
            final String jwt = authHeader.substring(7);
            final String userEmail = jwtUtil.extractUsername(jwt);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

                if (jwtUtil.validateToken(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.debug("Authentication successful for user: {}", userEmail);
                }
            }
        } catch (Exception e) {
            // An invalid token on a PROTECTED endpoint: clear the context and let
            // the request continue as anonymous. Spring Security will then reject
            // it, and the frontend interceptor will refresh or redirect. We do NOT
            // write a 401 here, so business errors are never mistaken for auth ones.
            log.warn("JWT validation failed: {}", e.getMessage());
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
