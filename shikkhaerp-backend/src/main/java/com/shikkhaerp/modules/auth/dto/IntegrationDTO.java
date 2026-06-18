//cat > src/main/java/com/shikkhaerp/modules/auth/dto/IntegrationDTO.java << 'EOF'
package com.shikkhaerp.modules.auth.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class IntegrationDTO {
    private String userId;
    private String provider;
    private String providerId;
    private String email;
    private String apiKey;
    private String name;
    private String permissions;
    private boolean isActive;
    private LocalDateTime expiresAt;
    private String endpoint;
    private String method;
}
