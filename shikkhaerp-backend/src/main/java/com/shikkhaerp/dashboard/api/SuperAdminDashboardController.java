package com.shikkhaerp.dashboard.api;

import com.shikkhaerp.core.dto.ApiResponse;
import com.shikkhaerp.dashboard.service.SuperAdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/v1/dashboard/superadmin")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class SuperAdminDashboardController {

    private final SuperAdminDashboardService dashboardService;

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getSystemStats() {
        return ApiResponse.success(dashboardService.getSystemStats());
    }

    @GetMapping("/schools")
    public ApiResponse<List<Map<String, Object>>> getAllSchools() {
        return ApiResponse.success(dashboardService.getAllSchools());
    }

    @GetMapping("/users")
    public ApiResponse<Map<String, Object>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(dashboardService.getAllUsers(page, size));
    }

    @GetMapping("/revenue")
    public ApiResponse<Map<String, Object>> getRevenueReport() {
        return ApiResponse.success(dashboardService.getRevenueReport());
    }

    @GetMapping("/system-health")
    public ApiResponse<Map<String, Object>> getSystemHealth() {
        return ApiResponse.success(dashboardService.getSystemHealth());
    }

    @GetMapping("/recent-activities")
    public ApiResponse<List<Map<String, Object>>> getRecentActivities() {
        return ApiResponse.success(dashboardService.getRecentActivities());
    }
}
