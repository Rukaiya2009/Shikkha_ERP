//cat > src/main/java/com/shikkhaerp/modules/auth/dto/AdvancedSecurityDTO.java << 'EOF'
package com.shikkhaerp.modules.auth.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class AdvancedSecurityDTO {
    private String userId;
    private boolean twoFactorEnabled;
    private String secretKey;
    private String backupCode;
    private String deviceId;
    private String deviceName;
    private String deviceType;
    private boolean isTrusted;
    private String question;
    private String answer;
    private String ipAddress;
    private String country;
    private String city;
    private Double latitude;
    private Double longitude;
    private LocalDateTime createdAt;
}
