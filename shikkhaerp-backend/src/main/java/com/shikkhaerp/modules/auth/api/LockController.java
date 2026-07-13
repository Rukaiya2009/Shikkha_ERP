package com.shikkhaerp.modules.auth.api;

import com.shikkhaerp.modules.auth.dto.LockDTO;
import com.shikkhaerp.modules.auth.service.AccountLockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/lock")
@RequiredArgsConstructor
public class LockController {

    private final AccountLockService accountLockService;

    @GetMapping("/{userId}/status")
    public ResponseEntity<LockDTO> getLockStatus(@PathVariable String userId) {
        LockDTO lock = accountLockService.getAccountLockStatus(userId);
        return ResponseEntity.ok(lock);
    }

    @PostMapping("/{userId}/lock")
    public ResponseEntity<LockDTO> lockAccount(
            @PathVariable String userId,
            @RequestParam String email,
            @RequestParam String reason) {
        LockDTO lock = accountLockService.lockAccount(userId, email, reason);
        return ResponseEntity.ok(lock);
    }

    @PostMapping("/{userId}/unlock")
    public ResponseEntity<LockDTO> unlockAccount(
            @PathVariable String userId,
            @RequestParam String email,
            @RequestParam String reason) {
        LockDTO unlock = accountLockService.unlockAccount(userId, email, reason);
        return ResponseEntity.ok(unlock);
    }

    @GetMapping("/{userId}/is-locked")
    public ResponseEntity<Boolean> isAccountLocked(@PathVariable String userId) {
        boolean locked = accountLockService.isAccountLocked(userId);
        return ResponseEntity.ok(locked);
    }
}