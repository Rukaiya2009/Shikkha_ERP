package com.shikkhaerp.dashboard.service;

import com.shikkhaerp.modules.student.entity.Student;
import com.shikkhaerp.modules.student.repository.StudentRepository;
import com.shikkhaerp.modules.teacher.repository.TeacherRepository;
import com.shikkhaerp.modules.user.entity.User;
import com.shikkhaerp.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;

    private String getCurrentSchoolId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .map(User::getSchoolId)
                .orElse(null);
    }

    public Map<String, Object> getSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalStudents", studentRepository.count());
        summary.put("totalTeachers", teacherRepository.count());
        summary.put("totalUsers", userRepository.count());
        summary.put("totalClasses", 10);
        summary.put("totalRevenue", 1250000.0);
        summary.put("monthlyRevenue", 125000.0);
        summary.put("pendingFees", 45L);
        summary.put("todayAttendance", 1180L);
        summary.put("attendancePercentage", 94.5);
        return summary;
    }

    public List<Map<String, Object>> getRecentActivities() {
        List<Map<String, Object>> activities = new ArrayList<>();
        userRepository.findTop10ByOrderByCreatedAtDesc().forEach(user -> {
            Map<String, Object> activity = new HashMap<>();
            activity.put("action", "USER_REGISTERED");
            activity.put("user", user.getName());
            activity.put("userRole", user.getRole().name());
            activity.put("details", "New " + user.getRole().name() + " registered");
            activity.put("timestamp", user.getCreatedAt());
            activities.add(activity);
        });
        return activities;
    }

    public Map<String, Object> getEnrollmentTrend() {
        List<String> labels = Arrays.asList("Jan", "Feb", "Mar", "Apr", "May", "Jun");
        List<Long> datasets = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime startDate = now.minusMonths(i).withDayOfMonth(1);
            LocalDateTime endDate = startDate.plusMonths(1);
            datasets.add(studentRepository.countByCreatedAtBetween(startDate, endDate));
        }
        Map<String, Object> result = new HashMap<>();
        result.put("labels", labels);
        result.put("datasets", datasets);
        return result;
    }

    public Map<String, Object> getRevenueTrend() {
        List<String> labels = Arrays.asList("Jan", "Feb", "Mar", "Apr", "May", "Jun");
        List<Long> datasets = new ArrayList<>();
        for (int i = 0; i < labels.size(); i++) {
            datasets.add((long) (Math.random() * 50000) + 50000);
        }
        Map<String, Object> result = new HashMap<>();
        result.put("labels", labels);
        result.put("datasets", datasets);
        return result;
    }

    public List<Map<String, Object>> getClassDistribution() {
        List<Map<String, Object>> distribution = new ArrayList<>();
        String[] classes = {"Class 1", "Class 2", "Class 3", "Class 4", "Class 5", 
                            "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"};
        for (String className : classes) {
            Map<String, Object> item = new HashMap<>();
            item.put("className", className);
            item.put("studentCount", 0L);
            distribution.add(item);
        }
        return distribution;
    }

    // FIXED: Use Student.Gender enum instead of String
    public Map<String, Object> getGenderRatio() {
        long male = studentRepository.countByGender(Student.Gender.MALE);
        long female = studentRepository.countByGender(Student.Gender.FEMALE);
        long total = male + female;
        
        Map<String, Object> ratio = new HashMap<>();
        ratio.put("male", male);
        ratio.put("female", female);
        ratio.put("malePercentage", total > 0 ? (male * 100.0 / total) : 0);
        ratio.put("femalePercentage", total > 0 ? (female * 100.0 / total) : 0);
        return ratio;
    }

    public List<Map<String, Object>> getRecentUsers(int limit) {
        List<Map<String, Object>> recentUsers = new ArrayList<>();
        userRepository.findTop10ByOrderByCreatedAtDesc().stream().limit(limit).forEach(user -> {
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user.getId());
            userData.put("name", user.getName());
            userData.put("email", user.getEmail());
            userData.put("role", user.getRole().name());
            userData.put("status", user.isEnabled() ? "ACTIVE" : "INACTIVE");
            userData.put("createdAt", user.getCreatedAt());
            recentUsers.add(userData);
        });
        return recentUsers;
    }

    public Map<String, Object> getSystemHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("databaseStatus", "UP");
        health.put("serverStatus", "UP");
        health.put("apiVersion", "1.0.0");
        health.put("uptime", System.currentTimeMillis());
        health.put("activeSessions", 12);
        return health;
    }
}
