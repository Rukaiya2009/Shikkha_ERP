package com.shikkhaerp.modules.auth.api;

import com.shikkhaerp.modules.auth.dto.LoginHistoryDTO;
import com.shikkhaerp.modules.auth.entity.LoginHistory;
import com.shikkhaerp.modules.auth.service.LoginHistoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

/**
 * Login history — the missing piece.
 *
 * LoginHistory, LoginHistoryRepository, LoginHistoryService and
 * LoginHistoryDTO all already existed, but nothing exposed them over HTTP, so
 * the Login history screen had no endpoint to read. This adds the four the
 * frontend calls, in the same style as AuditController.
 *
 * ── SECURITY ──────────────────────────────────────────────────────────────
 * These endpoints return IP addresses, user agents and email addresses for
 * every account on the platform. They must not be public. @PreAuthorize below
 * only takes effect if method security is switched on, so ALSO confirm your
 * SecurityConfig has something equivalent to:
 *
 *   .requestMatchers("/login-history/**", "/audit/**", "/security/**")
 *       .hasAnyRole("SUPER_ADMIN", "DEVELOPER")
 *
 * and that @EnableMethodSecurity is present on a config class. If method
 * security is NOT enabled, @PreAuthorize silently does nothing — which is
 * worse than not having it, because it looks protected.
 * ──────────────────────────────────────────────────────────────────────────
 */
@Slf4j
@RestController
@RequestMapping("/login-history")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN','DEVELOPER')")
public class LoginHistoryController {

    private final LoginHistoryService loginHistoryService;

    /** Newest first, capped. This is what the console loads by default. */
    @GetMapping("/recent")
    public ResponseEntity<List<LoginHistoryDTO>> getRecent(
            @RequestParam(defaultValue = "500") int limit) {
        List<LoginHistoryDTO> rows = loginHistoryService.getRecentLogins(limit)
                .stream()
                .map(LoginHistoryController::toDto)
                .toList();
        return ResponseEntity.ok(rows);
    }

    /**
     * Everything. Left in because the console offers it, but it is unbounded —
     * once the table is large, prefer /recent or /range.
     */
    @GetMapping("/all")
    public ResponseEntity<List<LoginHistoryDTO>> getAll() {
        List<LoginHistoryDTO> rows = loginHistoryService.getAllLogins()
                .stream()
                .map(LoginHistoryController::toDto)
                .toList();
        return ResponseEntity.ok(rows);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<LoginHistoryDTO>> getByUser(@PathVariable String userId) {
        List<LoginHistoryDTO> rows = loginHistoryService.getUserLoginHistory(userId)
                .stream()
                .map(LoginHistoryController::toDto)
                .toList();
        return ResponseEntity.ok(rows);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<List<LoginHistoryDTO>> getByEmail(@PathVariable String email) {
        List<LoginHistoryDTO> rows = loginHistoryService.getUserLoginHistoryByEmail(email)
                .stream()
                .map(LoginHistoryController::toDto)
                .toList();
        return ResponseEntity.ok(rows);
    }

    /** ISO-8601, e.g. /login-history/range?start=2026-07-01T00:00:00&end=2026-08-03T23:59:59 */
    @GetMapping("/range")
    public ResponseEntity<List<LoginHistoryDTO>> getByRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<LoginHistoryDTO> rows = loginHistoryService.getLoginHistoryByDateRange(start, end)
                .stream()
                .sorted(Comparator.comparing(LoginHistory::getLoginTime).reversed())
                .map(LoginHistoryController::toDto)
                .toList();
        return ResponseEntity.ok(rows);
    }

    /** Count of failed attempts for one email since a point in time. */
    @GetMapping("/failed-count")
    public ResponseEntity<Long> countFailed(
            @RequestParam String email,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime since) {
        return ResponseEntity.ok(loginHistoryService.countFailedLogins(email, since));
    }

    /* ─────────────────────────── mapping ─────────────────────────── */

    /**
     * Entity → DTO.
     *
     * Two shape mismatches worth knowing about:
     *   · The entity stores one `location` string ("Dhaka, Bangladesh") while
     *     the DTO has separate city / region / country. We split on the comma.
     *   · The entity has `deviceType`, which the DTO has no field for. The
     *     console derives device, browser and OS from `userAgent` instead, so
     *     nothing is lost — but if you want it typed, add `deviceType` to
     *     LoginHistoryDTO and set it here.
     */
    private static LoginHistoryDTO toDto(LoginHistory e) {
        String city = null;
        String region = null;
        String country = null;

        if (e.getLocation() != null && !e.getLocation().isBlank()) {
            String[] parts = e.getLocation().split("[,/]");
            if (parts.length == 1) {
                city = parts[0].trim();
            } else if (parts.length == 2) {
                city = parts[0].trim();
                country = parts[1].trim();
            } else {
                city = parts[0].trim();
                region = parts[1].trim();
                country = parts[parts.length - 1].trim();
            }
        }

        return LoginHistoryDTO.builder()
                .id(e.getId() != null ? e.getId().toString() : null)
                .userId(e.getUserId())
                .email(e.getEmail())
                .ipAddress(e.getIpAddress())
                .userAgent(e.getUserAgent())
                .loginTime(e.getLoginTime())
                .success(e.isSuccess())
                .status(e.isSuccess() ? "SUCCESS" : "FAILED")
                .failureReason(e.getFailureReason())
                .city(city)
                .region(region)
                .country(country)
                .build();
    }
}
