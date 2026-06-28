package com.shikkhaerp.modules.demo.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ApprovalResponseDTO {
    private String status;
    private String message;
    private String tenantId;
    private String schoolId;
    private String userId;
    private LocalDateTime processedAt;
}