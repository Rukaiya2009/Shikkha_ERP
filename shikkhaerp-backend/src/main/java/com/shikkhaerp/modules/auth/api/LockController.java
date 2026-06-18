//cat > src/main/java/com/shikkhaerp/modules/auth/api/LockController.java << 'EOF'
package com.shikkhaerp.modules.auth.api;

import com.shikkhaerp.modules.auth.dto.LockDTO;
import com.shikkhaerp.modules.auth.entity.AccountLock;
import com.shikkhaerp.modules.auth.service.AccountLockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/lock")
@RequiredArgsConstructor
public class LockController {

    private final AccountLockService accountLockService;

    @GetMapping("/user/{userId}/status")
    public ResponseEntity<LockDTO> getLockStatus(@PathVariable String userId) {
        boolean isLocked = accountLockService.isAccountLocked(userId);
        Optional<AccountLock> lock = accountLockService.getActiveLock(userId);
        
        LockDTO dto = LockDTO.builder()
            .userId(userId)
            .isLocked(isLocked)
            .lockedAt(lock.map(AccountLock::getLockedAt).orElse(null))
            .unlocksAt(lock.map(AccountLock::getUnlocksAt).orElse(null))
            .lockReason(lock.map(AccountLock::getLockReason).orElse(null))
            .failedAttempts(lock.map(AccountLock::getFailedAttempts).orElse(0))
            .build();
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/user/{userId}/unlock")
    public ResponseEntity<String> unlockAccount(@PathVariable String userId) {
        accountLockService.unlockAccount(userId);
        return ResponseEntity.ok("Account unlocked successfully");
    }
}
