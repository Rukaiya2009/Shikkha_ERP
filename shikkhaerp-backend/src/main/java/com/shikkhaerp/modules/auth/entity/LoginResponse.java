//cat > src/main/java/com/shikkhaerp/modules/auth/dto/LoginResponse.java << 'EOF'
package com.shikkhaerp.modules.auth.dto;

import lombok.Builder;
import lombok.Data;
import com.shikkhaerp.modules.auth.entity.Role;

@Data
@Builder
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    
    @Builder.Default
    private String tokenType = "Bearer";
    
    private UserInfo user;
    private String redirectUrl;
    
    @Data
    @Builder
    public static class UserInfo {
        private String id;
        private String email;
        private String fullName;
        private Role role;
        private String schoolId;
    }
}
