package com.shikkhaerp.modules.auth.api;

import com.shikkhaerp.modules.auth.dto.PasswordDTO;
import com.shikkhaerp.modules.auth.dto.PasswordChangeResponseDTO;
import com.shikkhaerp.modules.auth.service.PasswordService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/password")
@RequiredArgsConstructor
public class PasswordController {

    private final PasswordService passwordService;

    @PostMapping("/change")
    public ResponseEntity<PasswordChangeResponseDTO> changePassword(@RequestBody PasswordDTO request) {
        passwordService.changePassword(
            request.getEmail(),
            request.getOldPassword(),      // FIX: Changed from getCurrentPassword()
            request.getNewPassword()
        );
        return ResponseEntity.ok(
            PasswordChangeResponseDTO.builder()
                .success(true)
                .message("Password changed successfully")
                .email(request.getEmail())
                .status("SUCCESS")
                .build()
        );
    }

    @PostMapping("/reset")
    public ResponseEntity<PasswordChangeResponseDTO> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");
        
        passwordService.resetPassword(email, newPassword);
        return ResponseEntity.ok(
            PasswordChangeResponseDTO.builder()
                .success(true)
                .message("Password reset successfully")
                .email(email)
                .status("SUCCESS")
                .build()
        );
    }

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Boolean>> validatePassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        
        boolean isValid = passwordService.validatePassword(email, password);
        return ResponseEntity.ok(Map.of("valid", isValid));
    }

    @PostMapping("/check-reuse")
    public ResponseEntity<Map<String, Boolean>> checkPasswordReuse(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");
        
        boolean isReused = passwordService.isPasswordReused(email, newPassword);
        return ResponseEntity.ok(Map.of("reused", isReused));
    }

    @GetMapping("/history/count")
    public ResponseEntity<Map<String, Integer>> getPasswordHistoryCount(@RequestParam String email) {
        int count = passwordService.getPasswordHistoryCount(email);
        return ResponseEntity.ok(Map.of("count", count));
    }
}