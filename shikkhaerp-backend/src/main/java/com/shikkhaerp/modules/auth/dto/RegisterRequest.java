package com.shikkhaerp.modules.auth.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import com.shikkhaerp.modules.user.entity.User.UserRole;

@Data
public class RegisterRequest {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    @NotBlank(message = "Full name is required")
    private String fullName;
    
    @NotNull(message = "Role is required")
    private UserRole role;  // ← Changed from Role to UserRole
    
    private String schoolId;
}