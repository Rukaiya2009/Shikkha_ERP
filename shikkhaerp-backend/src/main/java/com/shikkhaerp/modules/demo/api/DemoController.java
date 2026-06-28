package com.shikkhaerp.modules.demo.api;

import com.shikkhaerp.modules.demo.dto.ApprovalResponseDTO;
import com.shikkhaerp.modules.demo.dto.DemoRequestDTO;
import com.shikkhaerp.modules.demo.dto.DemoRequestResponse;
import com.shikkhaerp.modules.demo.dto.RejectionRequestDTO;
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
import java.util.UUID;

@RestController
@RequestMapping("/api/demo")
@RequiredArgsConstructor
@Slf4j
public class DemoController {

    private final DemoService demoService;

    // ==================== SUBMIT ====================
    
    // ✅ NEW: /submit endpoint for frontend compatibility
    @PostMapping("/submit")
    public ResponseEntity<?> submitDemoRequestFrontend(@Valid @RequestBody DemoRequestDTO request) {
        log.info("📝 Demo submission request received (via /submit) for school: {}", request.getSchool().getName());
        try {
            String uuid = demoService.submitDemoRequest(request);
            DemoRequestResponse response = DemoRequestResponse.builder()
                    .success(true)
                    .message("Demo request submitted successfully")
                    .requestId(uuid)
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

    // ✅ Original: /request endpoint (kept for backward compatibility)
    @PostMapping("/request")
    public ResponseEntity<?> submitDemoRequest(@Valid @RequestBody DemoRequestDTO request) {
        log.info("📝 Demo submission request received (via /request) for school: {}", request.getSchool().getName());
        try {
            String uuid = demoService.submitDemoRequest(request);
            DemoRequestResponse response = DemoRequestResponse.builder()
                    .success(true)
                    .message("Demo request submitted successfully")
                    .requestId(uuid)
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
    
    // ✅ NEW: /{uuid} endpoint for frontend compatibility
    @GetMapping("/{uuid}")
    public ResponseEntity<?> getPendingRequestFrontend(@PathVariable String uuid) {
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

    // ✅ Original: /request/{uuid} endpoint (kept for backward compatibility)
    @GetMapping("/request/{uuid}")
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
    
    // ✅ NEW: /approve/{uuid} with UUID for frontend compatibility
    @PostMapping("/approve/{uuid}")
    public ResponseEntity<?> approveRequestFrontend(@PathVariable UUID uuid) {
        log.info("✅ Approving demo request: {}", uuid);
        try {
            // Convert UUID to String and call service
            demoService.approveRequest(uuid.toString());
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "✅ Demo request approved successfully");
            response.put("requestId", uuid.toString());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to approve: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ✅ Original: /approve/{uuid} with String (kept for backward compatibility)
    @PostMapping("/approve/string/{uuid}")
    public ResponseEntity<?> approveRequest(@PathVariable String uuid) {
        log.info("✅ Approving demo request: {}", uuid);
        try {
            demoService.approveRequest(uuid);
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
    
    // ✅ NEW: /reject/{uuid} with UUID for frontend compatibility
    @PostMapping("/reject/{uuid}")
    public ResponseEntity<?> rejectRequestFrontend(
            @PathVariable UUID uuid,
            @RequestBody(required = false) Map<String, String> body) {
        log.info("❌ Rejecting demo request: {}", uuid);
        try {
            String reason = body != null ? body.getOrDefault("reason", "No reason provided") : "No reason provided";
            demoService.rejectRequest(uuid.toString(), reason);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "❌ Demo request rejected successfully");
            response.put("requestId", uuid.toString());
            response.put("reason", reason);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to reject: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ✅ Original: /reject/{uuid} with String (kept for backward compatibility)
    @PostMapping("/reject/string/{uuid}")
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