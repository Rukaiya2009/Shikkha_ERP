package com.shikkhaerp.modules.auth.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PasswordDTO {
    private String userId;
    private String newPassword;
    private String confirmPassword;
    private String currentPassword;
}