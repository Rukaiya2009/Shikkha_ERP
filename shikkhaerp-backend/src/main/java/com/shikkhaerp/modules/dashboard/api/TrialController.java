package com.shikkhaerp.modules.dashboard.api;

import com.shikkhaerp.modules.school.entity.School;
import com.shikkhaerp.modules.school.repository.SchoolRepository;
import com.shikkhaerp.modules.user.entity.User;
import com.shikkhaerp.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class TrialController {

    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;

    @GetMapping("/trial")
    public ResponseEntity<Map<String, Object>> getTrialInfo(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getSchoolId() == null) {
            throw new RuntimeException("User has no associated school");
        }

        School school = schoolRepository.findById(user.getSchoolId())
            .orElseThrow(() -> new RuntimeException("School not found"));

        LocalDate trialStart = school.getTrialStart().toLocalDate();
        LocalDate trialEnd = school.getTrialEnd().toLocalDate();
        LocalDate now = LocalDate.now();

        long daysRemaining = ChronoUnit.DAYS.between(now, trialEnd);
        long totalDays = ChronoUnit.DAYS.between(trialStart, trialEnd);

        Map<String, Object> response = new HashMap<>();
        response.put("schoolName", school.getName());
        response.put("trialStart", trialStart.toString());
        response.put("trialEnd", trialEnd.toString());
        response.put("daysRemaining", Math.max(0, daysRemaining));
        response.put("totalDays", totalDays);

        return ResponseEntity.ok(response);
    }
}