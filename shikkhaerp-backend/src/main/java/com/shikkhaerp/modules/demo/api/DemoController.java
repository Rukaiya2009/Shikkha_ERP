package com.shikkhaerp.modules.demo.api;

import com.shikkhaerp.modules.demo.dto.DemoRequestDTO;
import com.shikkhaerp.modules.demo.dto.DemoRequestResponse;
import com.shikkhaerp.modules.demo.dto.PendingRequestDTO;
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
@RequestMapping("/demo")
@RequiredArgsConstructor
public class DemoController {

    private final DemoService demoService;

    // ===== TEST ENDPOINT =====
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }

    @PostMapping("/request")
    public ResponseEntity<?> submitDemoRequest(@Valid @RequestBody DemoRequestDTO request) {
        try {
            String uuid = demoService.submitDemoRequest(request);

            DemoRequestResponse response = DemoRequestResponse.builder()
                    .success(true)
                    .message("Demo request submitted successfully")
                    .requestId(uuid)
                    .email(request.getSuperAdmin().getEmail())
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to submit demo request", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/request/{uuid}")
    public ResponseEntity<?> getPendingRequest(@PathVariable String uuid) {
        try {
            PendingDemoRequest request = demoService.getPendingRequest(uuid);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", request);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to fetch pending request", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/approve/{uuid}")
    public ResponseEntity<?> approveRequest(@PathVariable String uuid) {
        try {
            demoService.approveRequest(uuid);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Demo request approved successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to approve request", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}