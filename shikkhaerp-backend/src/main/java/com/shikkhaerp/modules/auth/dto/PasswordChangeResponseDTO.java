package com.shikkhaerp.modules.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordChangeResponseDTO {
    private boolean success;
    private String message;
    private String userId;
    private String email;
    private Long timestamp;
    private String status;
}