package com.shikkhaerp.modules.demo.api;

import com.shikkhaerp.modules.demo.dto.ApproveSchoolRequest;
import com.shikkhaerp.modules.demo.dto.DemoRequestDTO;
import com.shikkhaerp.modules.demo.dto.DemoRequestResponse;
import com.shikkhaerp.modules.demo.entity.PendingDemoRequest;
import com.shikkhaerp.modules.school.entity.School;
import com.shikkhaerp.modules.demo.service.DemoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/demo")
@RequiredArgsConstructor
@Slf4j
public class DemoController {

    private final DemoService demoService;

    @PostMapping("/submit")
    public ResponseEntity<?> submitDemoRequestFrontend(@Valid @RequestBody DemoRequestDTO request) {
        return handleSubmit(request);
    }

    @PostMapping("/request")
    public ResponseEntity<?> submitDemoRequest(@Valid @RequestBody DemoRequestDTO request) {
        return handleSubmit(request);
    }

    private ResponseEntity<?> handleSubmit(DemoRequestDTO request) {
        log.info("📝 Demo submission received for school: {}", request.getSchoolName());
        try {
            String uuid = demoService.submitDemoRequest(request);
            DemoRequestResponse response = DemoRequestResponse.builder()
                .success(true)
                .message("Demo request submitted successfully")
                .requestId(uuid)
                .email(request.getRequesterEmail())
                .build();
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to submit: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /** GET /demo/{uuid} — fetch a pending request for the approval page. */
    @GetMapping("/{uuid}")
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
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // ── Authenticated POST endpoints (developer approval page) ────────────────

    /** POST /demo/approve/{uuid} — developer supplies super-admin email + notes. */
    @PostMapping("/approve/{uuid}")
    public ResponseEntity<?> approveRequest(@PathVariable UUID uuid,
                                            @Valid @RequestBody ApproveSchoolRequest body) {
        log.info("✅ Approving demo request {} for admin {}", uuid, body.getSuperAdminEmail());
        try {
            School school = demoService.approveRequest(
                uuid.toString(), body.getSuperAdminEmail(), body.getNotes());
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "✅ School created successfully. Login email sent to the super admin.");
            response.put("requestId", uuid.toString());
            response.put("schoolId", school.getId());
            response.put("schoolName", school.getName());
            response.put("superAdminEmail", body.getSuperAdminEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to approve: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /** POST /demo/reject/{uuid} — optional { "reason": "..." } body. */
    @PostMapping("/reject/{uuid}")
    public ResponseEntity<?> rejectRequest(@PathVariable UUID uuid,
                                           @RequestBody(required = false) Map<String, String> body) {
        log.info("❌ Rejecting demo request: {}", uuid);
        try {
            String reason = body != null
                ? body.getOrDefault("reason", "No reason provided")
                : "No reason provided";
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

    // ── One-click email token endpoints ───────────────────────────────────────
    // Approve-by-token is intentionally disabled in v3.0 (the super-admin email
    // must be entered in the app). It returns a friendly page steering the
    // developer to the app. Reject-by-token still works.

    @GetMapping("/approve")
    public ResponseEntity<String> approveByToken(@RequestParam String token) {
        log.info("✅ Approve via email token (v3.0: steered to app)");
        try {
            demoService.approveRequestByToken(token); // throws with guidance in v3.0
            return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(infoCard(
                "Open the App", "This request is ready — open the ShikkhaERP app to finish approval."));
        } catch (Exception e) {
            return ResponseEntity.ok().contentType(MediaType.TEXT_HTML)
                .body(infoCard("Approve in the App", e.getMessage()));
        }
    }

    @GetMapping("/reject")
    public ResponseEntity<String> rejectFormByToken(@RequestParam String token) {
        String html = String.format("""
            <!DOCTYPE html>
            <html><head><meta charset="UTF-8"><title>Reject Demo Request</title>
            <style>
              body { font-family: Arial, sans-serif; display:flex; justify-content:center;
                     align-items:center; min-height:100vh; margin:0; background:#fff7ed; }
              .card { background:white; border-radius:12px; padding:48px;
                      box-shadow:0 4px 20px rgba(0,0,0,0.1); max-width:500px; width:100%%; }
              .icon { font-size:48px; text-align:center; margin-bottom:16px; }
              h1 { color:#ea580c; text-align:center; margin-bottom:8px; }
              p { color:#6b7280; text-align:center; margin-bottom:24px; }
              label { display:block; font-weight:bold; color:#374151; margin-bottom:8px; }
              textarea { width:100%%; padding:12px; border:1px solid #d1d5db; border-radius:8px;
                         font-size:14px; resize:vertical; min-height:100px; box-sizing:border-box; }
              button { width:100%%; padding:12px; background:#dc2626; color:white; border:none;
                       border-radius:8px; font-size:16px; cursor:pointer; margin-top:16px; }
              button:hover { background:#b91c1c; }
            </style></head><body>
              <div class="card">
                <div class="icon">⚠️</div>
                <h1>Reject Demo Request</h1>
                <p>Please provide a reason for rejection (optional).</p>
                <form method="GET" action="/api/demo/reject/confirm">
                  <input type="hidden" name="token" value="%s">
                  <label for="reason">Reason for Rejection</label>
                  <textarea id="reason" name="reason"
                    placeholder="e.g. Incomplete information, duplicate request..."></textarea>
                  <button type="submit">Confirm Rejection</button>
                </form>
              </div>
            </body></html>
            """, token);
        return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(html);
    }

    @GetMapping("/reject/confirm")
    public ResponseEntity<String> rejectByToken(@RequestParam String token,
                                                @RequestParam(required = false) String reason) {
        try {
            PendingDemoRequest request = demoService.rejectRequestByToken(token, reason);
            return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(infoCard(
                "Request Rejected",
                "The demo request for " + request.getSchoolName() + " has been rejected. "
                + "The applicant at " + request.getRequesterEmail() + " has been notified."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().contentType(MediaType.TEXT_HTML)
                .body(infoCard("Rejection Failed", e.getMessage()));
        }
    }

    private String infoCard(String title, String message) {
        return String.format("""
            <!DOCTYPE html>
            <html><head><meta charset="UTF-8"><title>%s</title>
            <style>
              body { font-family: Arial, sans-serif; display:flex; justify-content:center;
                     align-items:center; min-height:100vh; margin:0; background:#f8fafc; }
              .card { background:white; border-radius:12px; padding:48px;
                      box-shadow:0 4px 20px rgba(0,0,0,0.1); max-width:520px; text-align:center; }
              h1 { color:#111827; margin-bottom:8px; }
              p { color:#6b7280; line-height:1.6; }
            </style></head><body>
              <div class="card"><h1>%s</h1><p>%s</p></div>
            </body></html>
            """, title, title, message);
    }
}
