//cat > src/main/java/com/shikkhaerp/modules/auth/entity/AccountLock.java << 'EOF'
package com.shikkhaerp.modules.auth.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "account_locks")
public class AccountLock {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    @Column(name = "email", nullable = false)
    private String email;
    
    @Column(name = "locked_at", nullable = false)
    private LocalDateTime lockedAt;
    
    @Column(name = "unlocks_at")
    private LocalDateTime unlocksAt;
    
    @Column(name = "lock_reason")
    private String lockReason;
    
    @Column(name = "is_active")
    private boolean isActive = true;
    
    @Column(name = "failed_attempts")
    private int failedAttempts = 0;
    
    @PrePersist
    protected void onCreate() {
        if (lockedAt == null) lockedAt = LocalDateTime.now();
        if (unlocksAt == null) unlocksAt = LocalDateTime.now().plusMinutes(30);
    }
    
    public boolean isLocked() {
        return isActive && unlocksAt != null && LocalDateTime.now().isBefore(unlocksAt);
    }
}
