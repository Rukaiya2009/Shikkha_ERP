package com.shikkhaerp.modules.demo.api;

import com.shikkhaerp.modules.demo.dto.DemoRequestDTO;
import com.shikkhaerp.modules.demo.dto.DemoRequestResponse;
import com.shikkhaerp.modules.demo.entity.PendingDemoRequest;
import com.shikkhaerp.modules.demo.service.DemoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/demo")
@RequiredArgsConstructor
@Slf4j
public class DemoController {

    private final DemoService demoService;

    // ==================== SUBMIT ====================
    @PostMapping("/request")   // ✅ original path
    public ResponseEntity<?> submitDemoRequest(@Valid @RequestBody DemoRequestDTO request) {
        log.info("📝 Demo submission request received for school: {}", request.getSchool().getName());
        try {
            String uuid = demoService.submitDemoRequest(request);
            DemoRequestResponse response = DemoRequestResponse.builder()
                    .success(true)
                    .message("Demo request submitted successfully")
                    .requestId(uuid)           // ✅ fixed field name
                    .email(request.getSuperAdmin().getEmail())
                    .build();
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to submit: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ==================== GET PENDING REQUEST ====================
    @GetMapping("/request/{uuid}")   // ✅ original path
    public ResponseEntity<?> getPendingRequest(@PathVariable String uuid) {
        log.info("🔍 Fetching demo request: {}", uuid);
        try {
            PendingDemoRequest request = demoService.getPendingRequest(uuid);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ==================== APPROVE ====================
    @PostMapping("/approve/{uuid}")   // ✅ original path
    public ResponseEntity<?> approveRequest(@PathVariable String uuid) {
        log.info("✅ Approving demo request: {}", uuid);
        try {
            demoService.approveRequest(uuid);   // ✅ service expects String
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "✅ Demo request approved successfully");
            response.put("requestId", uuid);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to approve: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ==================== REJECT ====================
    @PostMapping("/reject/{uuid}")   // ✅ original path
    public ResponseEntity<?> rejectRequest(
            @PathVariable String uuid,
            @RequestBody(required = false) Map<String, String> body) {
        log.info("❌ Rejecting demo request: {}", uuid);
        try {
            String reason = body != null ? body.getOrDefault("reason", "No reason provided") : "No reason provided";
            demoService.rejectRequest(uuid, reason);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "❌ Demo request rejected successfully");
            response.put("requestId", uuid);
            response.put("reason", reason);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to reject: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}