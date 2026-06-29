package com.shikkhaerp.modules.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemoRequestDTO {
    // School fields (flat structure - matches frontend)
    private String schoolName;
    private String address;
    private String phone;
    private String email;
    private String type;
    private Integer students;
    private Integer teachers;
    
    // Super Admin fields (flat structure - matches frontend)
    private String superAdminName;
    private String superAdminEmail;
    private String superAdminPhone;
    
    // Terms
    private boolean agreeToTerms;
}