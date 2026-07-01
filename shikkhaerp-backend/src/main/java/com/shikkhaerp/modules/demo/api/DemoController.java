package com.shikkhaerp.modules.demo.api;

import com.shikkhaerp.modules.demo.dto.DemoRequestDTO;
import com.shikkhaerp.modules.demo.dto.DemoRequestResponse;
import com.shikkhaerp.modules.demo.entity.PendingDemoRequest;
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
        log.info("📝 Demo submission request received (via /submit) for school: {}",
            request.getSchoolName());
        try {
            String uuid = demoService.submitDemoRequest(request);
            DemoRequestResponse response = DemoRequestResponse.builder()
                .success(true)
                .message("Demo request submitted successfully")
                .requestId(uuid)
                .email(request.getSuperAdminEmail())
                .build();
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to submit: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/request")
    public ResponseEntity<?> submitDemoRequest(@Valid @RequestBody DemoRequestDTO request) {
        log.info("📝 Demo submission request received (via /request) for school: {}",
            request.getSchoolName());
        try {
            String uuid = demoService.submitDemoRequest(request);
            DemoRequestResponse response = DemoRequestResponse.builder()
                .success(true)
                .message("Demo request submitted successfully")
                .requestId(uuid)
                .email(request.getSuperAdminEmail())
                .build();
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to submit: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

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
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ── Authenticated POST endpoints (for admin frontend) ────────────────────

    @PostMapping("/approve/{uuid}")
    public ResponseEntity<?> approveRequest(@PathVariable UUID uuid) {
        log.info("✅ Approving demo request: {}", uuid);
        try {
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

    @PostMapping("/reject/{uuid}")
    public ResponseEntity<?> rejectRequest(
            @PathVariable UUID uuid,
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

    // ── One-click email token endpoints (no auth required) ───────────────────

    @GetMapping("/approve")
    public ResponseEntity<String> approveByToken(@RequestParam String token) {
        log.info("✅ Approve via email token");
        try {
            PendingDemoRequest request = demoService.approveRequestByToken(token);
            String html = String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8">
                  <title>Demo Request Approved</title>
                  <style>
                    body { font-family: Arial, sans-serif; display: flex; justify-content: center;
                           align-items: center; min-height: 100vh; margin: 0; background: #f0fdf4; }
                    .card { background: white; border-radius: 12px; padding: 48px;
                            box-shadow: 0 4px 20px rgba(0,0,0,0.1); max-width: 500px; text-align: center; }
                    .icon { font-size: 64px; margin-bottom: 16px; }
                    h1 { color: #16a34a; margin-bottom: 8px; }
                    p { color: #6b7280; line-height: 1.6; }
                    .school { font-weight: bold; color: #111827; }
                    .badge { background: #dcfce7; color: #16a34a; padding: 4px 12px;
                             border-radius: 20px; font-size: 14px; display: inline-block; margin-top: 16px; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <div class="icon">✅</div>
                    <h1>Request Approved!</h1>
                    <p>The demo request for <span class="school">%s</span> has been approved.</p>
                    <p>Login credentials have been sent to <strong>%s</strong>.</p>
                    <span class="badge">Action Complete</span>
                  </div>
                </body>
                </html>
                """,
                request.getSchoolName(),
                request.getSuperAdminEmail()
            );
            return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(html);
        } catch (Exception e) {
            String html = String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8">
                  <title>Approval Failed</title>
                  <style>
                    body { font-family: Arial, sans-serif; display: flex; justify-content: center;
                           align-items: center; min-height: 100vh; margin: 0; background: #fef2f2; }
                    .card { background: white; border-radius: 12px; padding: 48px;
                            box-shadow: 0 4px 20px rgba(0,0,0,0.1); max-width: 500px; text-align: center; }
                    .icon { font-size: 64px; margin-bottom: 16px; }
                    h1 { color: #dc2626; margin-bottom: 8px; }
                    p { color: #6b7280; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <div class="icon">❌</div>
                    <h1>Approval Failed</h1>
                    <p>%s</p>
                  </div>
                </body>
                </html>
                """, e.getMessage());
            return ResponseEntity.badRequest()
                .contentType(MediaType.TEXT_HTML)
                .body(html);
        }
    }

    @GetMapping("/reject")
    public ResponseEntity<String> rejectFormByToken(@RequestParam String token) {
        log.info("📋 Reject form requested via email token");
        // Show a form so admin can enter a reason before confirming rejection
        String html = String.format("""
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <title>Reject Demo Request</title>
              <style>
                body { font-family: Arial, sans-serif; display: flex; justify-content: center;
                       align-items: center; min-height: 100vh; margin: 0; background: #fff7ed; }
                .card { background: white; border-radius: 12px; padding: 48px;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.1); max-width: 500px; width: 100%%; }
                .icon { font-size: 48px; text-align: center; margin-bottom: 16px; }
                h1 { color: #ea580c; text-align: center; margin-bottom: 8px; }
                p { color: #6b7280; text-align: center; margin-bottom: 24px; }
                label { display: block; font-weight: bold; color: #374151; margin-bottom: 8px; }
                textarea { width: 100%%; padding: 12px; border: 1px solid #d1d5db;
                           border-radius: 8px; font-size: 14px; resize: vertical;
                           min-height: 100px; box-sizing: border-box; }
                button { width: 100%%; padding: 12px; background: #dc2626; color: white;
                         border: none; border-radius: 8px; font-size: 16px;
                         cursor: pointer; margin-top: 16px; }
                button:hover { background: #b91c1c; }
              </style>
            </head>
            <body>
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
            </body>
            </html>
            """, token);
        return ResponseEntity.ok()
            .contentType(MediaType.TEXT_HTML)
            .body(html);
    }

    @GetMapping("/reject/confirm")
    public ResponseEntity<String> rejectByToken(
            @RequestParam String token,
            @RequestParam(required = false) String reason) {
        log.info("❌ Reject confirmed via email token");
        try {
            PendingDemoRequest request = demoService.rejectRequestByToken(token, reason);
            String html = String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8">
                  <title>Request Rejected</title>
                  <style>
                    body { font-family: Arial, sans-serif; display: flex; justify-content: center;
                           align-items: center; min-height: 100vh; margin: 0; background: #fef2f2; }
                    .card { background: white; border-radius: 12px; padding: 48px;
                            box-shadow: 0 4px 20px rgba(0,0,0,0.1); max-width: 500px; text-align: center; }
                    .icon { font-size: 64px; margin-bottom: 16px; }
                    h1 { color: #dc2626; margin-bottom: 8px; }
                    p { color: #6b7280; line-height: 1.6; }
                    .school { font-weight: bold; color: #111827; }
                    .badge { background: #fee2e2; color: #dc2626; padding: 4px 12px;
                             border-radius: 20px; font-size: 14px; display: inline-block; margin-top: 16px; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <div class="icon">❌</div>
                    <h1>Request Rejected</h1>
                    <p>The demo request for <span class="school">%s</span> has been rejected.</p>
                    <p>The applicant at <strong>%s</strong> has been notified.</p>
                    <span class="badge">Action Complete</span>
                  </div>
                </body>
                </html>
                """,
                request.getSchoolName(),
                request.getSuperAdminEmail()
            );
            return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(html);
        } catch (Exception e) {
            String html = String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8">
                  <title>Rejection Failed</title>
                  <style>
                    body { font-family: Arial, sans-serif; display: flex; justify-content: center;
                           align-items: center; min-height: 100vh; margin: 0; background: #fef2f2; }
                    .card { background: white; border-radius: 12px; padding: 48px;
                            box-shadow: 0 4px 20px rgba(0,0,0,0.1); max-width: 500px; text-align: center; }
                    .icon { font-size: 64px; margin-bottom: 16px; }
                    h1 { color: #dc2626; }
                    p { color: #6b7280; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <div class="icon">❌</div>
                    <h1>Rejection Failed</h1>
                    <p>%s</p>
                  </div>
                </body>
                </html>
                """, e.getMessage());
            return ResponseEntity.badRequest()
                .contentType(MediaType.TEXT_HTML)
                .body(html);
        }
    }
}