package com.shikkhaerp.modules.auth.api;

import com.shikkhaerp.modules.auth.dto.PasswordDTO;
import com.shikkhaerp.modules.auth.service.PasswordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/password")
@RequiredArgsConstructor
public class PasswordController {

    private final PasswordService passwordService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/check-reuse")
    public ResponseEntity<Boolean> checkPasswordReuse(@RequestBody PasswordDTO dto) {
        boolean isReused = passwordService.isPasswordReused(dto.getUserId(), dto.getNewPassword());
        return ResponseEntity.ok(isReused);
    }

    @GetMapping("/history/{userId}/count")
    public ResponseEntity<Long> getPasswordHistoryCount(@PathVariable String userId) {
        long count = passwordService.getPasswordHistoryCount(userId);
        return ResponseEntity.ok(count);
    }
}