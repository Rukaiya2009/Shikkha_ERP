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

import java.util.UUID;

@RestController
@RequestMapping("/api/demo")
@RequiredArgsConstructor
@Slf4j
public class DemoController {

    private final DemoService demoService;

    /**
     * 1. Submit a new demo request
     * POST /api/demo/submit
     */
    @PostMapping("/submit")
    public ResponseEntity<DemoRequestResponse> submitDemoRequest(@Valid @RequestBody DemoRequestDTO request) {
        log.info("📝 Demo submission request received for school: {}", request.getSchool().getName());
        String uuid = demoService.submitDemoRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(DemoRequestResponse.builder()
                        .uuid(uuid)
                        .message("Demo request submitted successfully")
                        .status("PENDING")
                        .build());
    }

    /**
     * 2. Get pending demo request by UUID
     * GET /api/demo/{uuid}
     */
    @GetMapping("/{uuid}")
    public ResponseEntity<PendingDemoRequest> getPendingRequest(@PathVariable String uuid) {
        log.info("🔍 Fetching demo request: {}", uuid);
        PendingDemoRequest request = demoService.getPendingRequest(uuid);
        return ResponseEntity.ok(request);
    }

    /**
     * 3. ✅ APPROVE a demo request - Creates school, user, tenant
     * POST /api/demo/approve/{uuid}
     * Priority: P0
     */
    @PostMapping("/approve/{uuid}")
    public ResponseEntity<ApprovalResponseDTO> approveApplication(@PathVariable UUID uuid) {
        log.info("✅ Approve request received for UUID: {}", uuid);
        ApprovalResponseDTO response = demoService.approveApplication(uuid);
        return ResponseEntity.ok(response);
    }

    /**
     * 4. ❌ REJECT a demo request - Deletes pending record
     * POST /api/demo/reject/{uuid}
     * Priority: P1
     */
    @PostMapping("/reject/{uuid}")
    public ResponseEntity<Void> rejectApplication(
            @PathVariable UUID uuid,
            @Valid @RequestBody RejectionRequestDTO rejectionRequest) {
        log.info("❌ Reject request received for UUID: {}", uuid);
        demoService.rejectApplication(uuid, rejectionRequest.getReason());
        return ResponseEntity.ok().build();
    }
}