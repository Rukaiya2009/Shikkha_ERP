package com.shikkhaerp.modules.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PasswordChangeResponseDTO {
    private boolean success;
    private String message;
    private String userId;
}