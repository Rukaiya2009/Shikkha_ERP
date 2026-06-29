//cat > src/main/java/com/shikkhaerp/modules/demo/dto/ApprovalResponseDTO.java << 'EOF'
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
public class ApprovalResponseDTO {
    private String status;
    private String message;
    private String tenantId;
    private String schoolId;
    private String userId;
    private LocalDateTime processedAt;
}
