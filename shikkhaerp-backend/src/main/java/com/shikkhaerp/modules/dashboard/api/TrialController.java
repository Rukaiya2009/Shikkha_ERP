package com.shikkhaerp.modules.dashboard.api;

import com.shikkhaerp.modules.school.entity.School;
import com.shikkhaerp.modules.school.repository.SchoolRepository;
import com.shikkhaerp.modules.user.entity.User;
import com.shikkhaerp.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * Trial / subscription banner data for the logged-in user.
 *
 * DESIGN RULE: this endpoint feeds a *decorative banner*. It must never fail the
 * request. Every branch returns 200 with a well-formed body and lets the client
 * decide what to render via `accountType` / `showTrialBanner`. The previous
 * version threw RuntimeException for missing school -> the global handler turned
 * that into a 400 -> WelcomeDashboard blanked out entirely.
 *
 * Role handling note: only DEVELOPER is a platform-level (tenant-less) role.
 * SUPER_ADMIN is a *school's* top admin and DOES belong to a school, so it must
 * not be short-circuited as a platform account. Tenant-less-ness is detected by
 * schoolId being null/blank, not by role name.
 *
 * Role/status are compared by String name() so this class stays independent of
 * which package the UserRole / SchoolStatus enums live in.
 */
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@Slf4j
public class TrialController {

    /** Roles that belong to ITDataScience, not to any tenant school. */
    private static final Set<String> PLATFORM_ROLES = Set.of("DEVELOPER");

    private static final String TYPE_PLATFORM = "PLATFORM";
    private static final String TYPE_TRIAL    = "TRIAL";
    private static final String TYPE_PAID     = "PAID";
    private static final String TYPE_UNKNOWN  = "UNKNOWN";

    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;

    @GetMapping("/trial")
    public ResponseEntity<Map<String, Object>> getTrialInfo(Authentication authentication) {

        if (authentication == null || authentication.getName() == null) {
            // Should be unreachable behind the JWT filter, but never 500 here.
            return ResponseEntity.ok(shell(TYPE_UNKNOWN, ""));
        }

        final String email = authentication.getName();
        Optional<User> maybeUser = userRepository.findByEmail(email);

        if (maybeUser.isEmpty()) {
            // Valid JWT but the user row is gone (deleted / different DB).
            log.warn("/user/trial: authenticated email {} has no user row", email);
            return ResponseEntity.ok(shell(TYPE_UNKNOWN, ""));
        }

        final User user = maybeUser.get();
        final String role = user.getRole() == null ? "" : user.getRole().name();
        final String schoolId = user.getSchoolId();

        // ---- 1. Platform staff: no tenant, no trial ----------------------
        if (PLATFORM_ROLES.contains(role)) {
            return ResponseEntity.ok(shell(TYPE_PLATFORM, "ShikkhaERP Platform"));
        }

        // ---- 2. Tenant-less user (e.g. the bootstrap owner account) ------
        if (schoolId == null || schoolId.isBlank()) {
            log.debug("/user/trial: user {} (role {}) has no schoolId", email, role);
            return ResponseEntity.ok(shell(TYPE_PLATFORM, "ShikkhaERP Platform"));
        }

        // ---- 3. schoolId points at a row that isn't there ----------------
        Optional<School> maybeSchool = schoolRepository.findById(schoolId);
        if (maybeSchool.isEmpty()) {
            // Data-integrity problem, NOT a client error. Log loudly, degrade quietly.
            log.error("/user/trial: user {} references schoolId '{}' which does not exist. "
                    + "Check ADMIN_SCHOOL_ID / the schools table.", email, schoolId);
            return ResponseEntity.ok(shell(TYPE_UNKNOWN, ""));
        }

        final School school = maybeSchool.get();
        final String schoolName = school.getName() == null ? "" : school.getName();
        final String status = school.getStatus() == null ? "" : school.getStatus().name();

        final LocalDateTime trialStartAt = school.getTrialStart();
        final LocalDateTime trialEndAt = school.getTrialEnd();

        // ---- 4. Paid / directly-purchased school -------------------------
        // A school that was bought outright never had a trial window written,
        // so no trialEnd == perpetual/paid. (See note at the bottom of this
        // file: the durable fix is an explicit planType column.)
        if (trialEndAt == null || status.contains("PAID") || status.contains("SUBSCRIB")) {
            Map<String, Object> body = shell(TYPE_PAID, schoolName);
            body.put("showTrialBanner", false);
            return ResponseEntity.ok(body);
        }

        // ---- 5. Trial school ---------------------------------------------
        final LocalDate today = LocalDate.now();
        final LocalDate trialEnd = trialEndAt.toLocalDate();
        final LocalDate trialStart = trialStartAt != null
                ? trialStartAt.toLocalDate()
                : trialEnd.minusDays(30); // sane fallback if start was never set

        long daysRemaining = ChronoUnit.DAYS.between(today, trialEnd);
        long totalDays = ChronoUnit.DAYS.between(trialStart, trialEnd);
        if (totalDays <= 0) {
            totalDays = 30; // never let the client divide by zero
        }

        Map<String, Object> body = shell(TYPE_TRIAL, schoolName);
        body.put("trialStart", trialStart.toString());
        body.put("trialEnd", trialEnd.toString());
        body.put("daysRemaining", Math.max(0, daysRemaining));
        body.put("totalDays", totalDays);
        body.put("expired", daysRemaining < 0);
        body.put("showTrialBanner", true);
        return ResponseEntity.ok(body);
    }

    /**
     * Every response has an identical key set so the client never has to
     * null-check a missing property — only read `accountType` /
     * `showTrialBanner` and branch on that.
     */
    private Map<String, Object> shell(String accountType, String schoolName) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("accountType", accountType);   // PLATFORM | TRIAL | PAID | UNKNOWN
        m.put("schoolName", schoolName);
        m.put("trialStart", null);
        m.put("trialEnd", null);
        m.put("daysRemaining", 0L);
        m.put("totalDays", 0L);
        m.put("expired", false);
        m.put("showTrialBanner", false);
        return m;
    }
}

/*
 * FOLLOW-UP (needs School.java, which I don't currently have):
 *
 * The trialEnd == null heuristic above is an interim measure. The durable model
 * for "customer bought outright, no trial" is an explicit column on School:
 *
 *     @Enumerated(EnumType.STRING)
 *     @Column(name = "plan_type", nullable = false, length = 20)
 *     private PlanType planType = PlanType.TRIAL;   // TRIAL | PAID
 *
 *     @Column(name = "subscription_start") private LocalDate subscriptionStart;
 *     @Column(name = "subscription_end")   private LocalDate subscriptionEnd;
 *
 * Because prod runs ddl-auto: validate, Hibernate will NOT add these for you —
 * they need a manual migration against Supabase first (same lesson as the
 * super_admin_name NOT NULL fix):
 *
 *     ALTER TABLE schools
 *       ADD COLUMN IF NOT EXISTS plan_type VARCHAR(20) NOT NULL DEFAULT 'TRIAL',
 *       ADD COLUMN IF NOT EXISTS subscription_start DATE,
 *       ADD COLUMN IF NOT EXISTS subscription_end   DATE;
 *
 * Run the ALTER first, then deploy the entity change — never the reverse.
 */