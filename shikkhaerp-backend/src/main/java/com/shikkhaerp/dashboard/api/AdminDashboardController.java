package com.shikkhaerp.dashboard.api;

import com.shikkhaerp.core.dto.ApiResponse;
import com.shikkhaerp.dashboard.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/v1/dashboard/admin")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    @GetMapping("/summary")
    public ApiResponse<Map<String, Object>> getSummary() {
        return ApiResponse.success(dashboardService.getSummary());
    }

    @GetMapping("/recent-activities")
    public ApiResponse<List<Map<String, Object>>> getRecentActivities() {
        return ApiResponse.success(dashboardService.getRecentActivities());
    }

    @GetMapping("/enrollment-trend")
    public ApiResponse<Map<String, Object>> getEnrollmentTrend() {
        return ApiResponse.success(dashboardService.getEnrollmentTrend());
    }

    @GetMapping("/revenue-trend")
    public ApiResponse<Map<String, Object>> getRevenueTrend() {
        return ApiResponse.success(dashboardService.getRevenueTrend());
    }

    @GetMapping("/class-distribution")
    public ApiResponse<List<Map<String, Object>>> getClassDistribution() {
        return ApiResponse.success(dashboardService.getClassDistribution());
    }

    @GetMapping("/gender-ratio")
    public ApiResponse<Map<String, Object>> getGenderRatio() {
        return ApiResponse.success(dashboardService.getGenderRatio());
    }

    @GetMapping("/recent-users")
    public ApiResponse<List<Map<String, Object>>> getRecentUsers(@RequestParam(defaultValue = "5") int limit) {
        return ApiResponse.success(dashboardService.getRecentUsers(limit));
    }

    @GetMapping("/health")
    public ApiResponse<Map<String, Object>> getSystemHealth() {
        return ApiResponse.success(dashboardService.getSystemHealth());
    }
}
