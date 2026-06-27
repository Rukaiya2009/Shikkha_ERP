package com.shikkhaerp.modules.demo.api;

import com.shikkhaerp.modules.demo.dto.DemoRequestDTO;
import com.shikkhaerp.modules.demo.dto.DemoRequestResponse;
import com.shikkhaerp.modules.demo.entity.PendingDemoRequest;
import com.shikkhaerp.modules.demo.service.DemoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/demo")   // ✅ Changed to /api/demo
@CrossOrigin(origins = {
    "https://shikkha-erp-website.vercel.app",
    "https://shikkha-erp.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000"
}, allowCredentials = "true")
@RequiredArgsConstructor
public class DemoController {

    private final DemoService demoService;

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }

    @PostMapping("/request")
    public ResponseEntity<?> submitDemoRequest(@Valid @RequestBody DemoRequestDTO request) {
        log.info("📝 Received demo request for school: {}", request.getSchool().getName());
        
        try {
            String uuid = demoService.submitDemoRequest(request);
            
            DemoRequestResponse response = DemoRequestResponse.builder()
                    .success(true)
                    .message("Demo request submitted successfully")
                    .requestId(uuid)
                    .email(request.getSuperAdmin().getEmail())
                    .build();
            
            log.info("✅ Demo request submitted with UUID: {}", uuid);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to submit demo request: {}", e.getMessage(), e);
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to submit demo request: " + e.getMessage());
            error.put("error", e.getMessage());
            
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/request/{uuid}")
    public ResponseEntity<?> getPendingRequest(@PathVariable String uuid) {
        log.info("🔍 Fetching pending request: {}", uuid);
        
        try {
            PendingDemoRequest request = demoService.getPendingRequest(uuid);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", request);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to fetch request: {}", e.getMessage());
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/approve/{uuid}")
    public ResponseEntity<?> approveRequest(@PathVariable String uuid) {
        log.info("✅ Approving demo request: {}", uuid);
        
        try {
            demoService.approveRequest(uuid);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "✅ Demo request approved successfully");
            response.put("requestId", uuid);
            
            log.info("✅ Request approved: {}", uuid);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to approve request: {}", e.getMessage());
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to approve request: " + e.getMessage());
            error.put("error", e.getMessage());
            
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/reject/{uuid}")
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
            
            log.info("✅ Request rejected: {}", uuid);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to reject request: {}", e.getMessage());
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to reject request: " + e.getMessage());
            error.put("error", e.getMessage());
            
            return ResponseEntity.badRequest().body(error);
        }
    }
}