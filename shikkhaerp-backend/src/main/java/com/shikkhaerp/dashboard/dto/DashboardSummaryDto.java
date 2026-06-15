package com.shikkhaerp.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDto {
    private long totalStudents;
    private long totalTeachers;
    private long totalParents;
    private long totalClasses;
    private long totalUsers;
    private double totalRevenue;
    private double monthlyRevenue;
    private long pendingFees;
    private long todayAttendance;
    private double attendancePercentage;
}
