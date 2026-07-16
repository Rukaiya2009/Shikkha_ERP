package com.shikkhaerp.modules.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Body sent by the Main App's School Creation page when the developer clicks
 * "Create School". The developer enters the super-admin email (after calling
 * the school) plus an approval note that is included in the login email.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApproveSchoolRequest {

    @NotBlank(message = "Super admin email is required")
    @Email(message = "Invalid super admin email format")
    private String superAdminEmail;

    /** Preset or custom message included in the super-admin login email. */
    private String notes;
}
