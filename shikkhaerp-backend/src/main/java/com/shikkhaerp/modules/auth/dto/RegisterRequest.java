package com.shikkhaerp.modules.auth.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import com.shikkhaerp.modules.user.entity.User.UserRole;  // ← USE EXISTING

@Data
public class RegisterRequest {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    @NotBlank(message = "Full name is required")
    private String fullName;  // Maps to 'name' in existing User entity
    
    @NotNull(message = "Role is required")
    private UserRole role;  // USING EXISTING UserRole enum
    
    private String schoolId;  // Maps to 'schoolId' in existing User entity
}