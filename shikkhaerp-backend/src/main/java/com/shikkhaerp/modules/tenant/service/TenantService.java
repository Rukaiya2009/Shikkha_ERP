package com.shikkhaerp.modules.tenant.service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
public class TenantService {
    
    private static final String DEFAULT_SCHOOL_ID = "1";
    
    public String getCurrentSchoolId() {
        // Method 1: From Subdomain
        String schoolId = getSchoolIdFromSubdomain();
        if (schoolId != null) return schoolId;
        
        // Method 2: From Header
        schoolId = getSchoolIdFromHeader();
        if (schoolId != null) return schoolId;
        
        // Method 3: Default (for development)
        return DEFAULT_SCHOOL_ID;
    }
    
    private String getSchoolIdFromSubdomain() {
        HttpServletRequest request = getCurrentRequest();
        if (request == null) return null;
        
        String serverName = request.getServerName();
        String[] parts = serverName.split("\\.");
        
        // Check if first part is a school subdomain
        if (parts.length >= 2) {
            String subdomain = parts[0];
            // Map subdomain to school ID (you can use a mapping table)
            if (subdomain.matches("school\\d+")) {
                return subdomain.replace("school", "");
            }
        }
        return null;
    }
    
    private String getSchoolIdFromHeader() {
        HttpServletRequest request = getCurrentRequest();
        if (request == null) return null;
        
        String headerValue = request.getHeader("X-School-ID");
        if (headerValue != null && !headerValue.isEmpty()) {
            return headerValue;
        }
        return null;
    }
    
    private HttpServletRequest getCurrentRequest() {
        ServletRequestAttributes attributes = 
            (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }
}
