package com.shikkhaerp.modules.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PendingRequestDTO {
    private String id;
    private DemoRequestDTO data;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}
