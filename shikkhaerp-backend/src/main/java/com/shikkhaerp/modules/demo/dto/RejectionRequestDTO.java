//cat > src/main/java/com/shikkhaerp/modules/demo/dto/RejectionRequestDTO.java << 'EOF'
package com.shikkhaerp.modules.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RejectionRequestDTO {
    private String reason;
}
