//cat > src/main/java/com/shikkhaerp/modules/auth/dto/LockDTO.java << 'EOF'
package com.shikkhaerp.modules.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LockDTO {
    private String userId;
    private boolean isLocked;
    private LocalDateTime lockedAt;
    private LocalDateTime unlocksAt;
    private String lockReason;
    private int failedAttempts;
}
