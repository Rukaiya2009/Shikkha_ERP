package com.shikkhaerp.modules.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecurityStatsDTO {
    
    // ===== Summary Counts =====
    private long totalEvents;
    private long totalFailedAttempts;
    private long totalSuccessfulAttempts;
    private long totalAccountLocks;
    private long totalAccountUnlocks;
    private long totalAuditLogs;
    private long totalSecurityEvents;
    private long totalBlockedEvents;
    private long totalSuspiciousActivities;
    
    // ===== Time Period =====
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    private String period; // TODAY, WEEK, MONTH, CUSTOM
    
    // ===== Breakdowns =====
    private Map<String, Long> eventTypeCounts;
    private Map<String, Long> severityCounts;
    private Map<String, Long> statusCounts;
    private Map<String, Long> eventCategoryCounts;
    private Map<String, Long> sourceCounts; // WEB, MOBILE, API, ADMIN
    
    // ===== User Stats =====
    private long uniqueUsers;
    private long activeUsers;
    private long lockedUsers;
    private long usersWithFailedAttempts;
    private Map<String, Long> topUsersByEvents;
    private Map<String, Long> topUsersByFailedAttempts;
    
    // ===== Geographic Stats =====
    private Map<String, Long> eventsByCountry;
    private Map<String, Long> eventsByCity;
    private Map<String, Long> eventsByIpAddress;
    
    // ===== Time-based Stats =====
    private Map<String, Long> eventsByHour;
    private Map<String, Long> eventsByDayOfWeek;
    private Map<String, Long> eventsByDate;
    
    // ===== Device Stats =====
    private Map<String, Long> eventsByDevice;
    private Map<String, Long> eventsByUserAgent;
    
    // ===== Rates & Averages =====
    private double successRate;
    private double failureRate;
    private double averageEventsPerUser;
    private double averageFailedAttemptsPerUser;
    
    // ===== Security Score =====
    private int securityScore; // 0-100
    private String securityGrade; // A, B, C, D, F
    private String riskLevel; // LOW, MEDIUM, HIGH, CRITICAL
    
    // ===== Recent Events =====
    private java.util.List<SecurityEventDTO> recentEvents;
    private java.util.List<SecurityEventDTO> criticalEvents;
    
    // ===== Additional Info =====
    private Map<String, Object> additionalMetrics;
    private String notes;
    
    // ===== Factory Methods =====
    
    public static SecurityStatsDTOBuilder empty() {
        return SecurityStatsDTO.builder()
            .totalEvents(0)
            .totalFailedAttempts(0)
            .totalSuccessfulAttempts(0)
            .totalAccountLocks(0)
            .totalAccountUnlocks(0)
            .totalAuditLogs(0)
            .totalSecurityEvents(0)
            .totalBlockedEvents(0)
            .totalSuspiciousActivities(0)
            .securityScore(100)
            .securityGrade("A")
            .riskLevel("LOW");
    }
    
    public static SecurityStatsDTOBuilder forPeriod(LocalDateTime start, LocalDateTime end, String period) {
        return SecurityStatsDTO.builder()
            .periodStart(start)
            .periodEnd(end)
            .period(period);
    }
    
    // ===== Helper Methods =====
    
    public double getSuccessRate() {
        if (totalEvents == 0) return 0.0;
        return (double) totalSuccessfulAttempts / totalEvents * 100;
    }
    
    public double getFailureRate() {
        if (totalEvents == 0) return 0.0;
        return (double) totalFailedAttempts / totalEvents * 100;
    }
    
    public double getAverageEventsPerUser() {
        if (uniqueUsers == 0) return 0.0;
        return (double) totalEvents / uniqueUsers;
    }
    
    public boolean hasCriticalEvents() {
        return criticalEvents != null && !criticalEvents.isEmpty();
    }
    
    public boolean isHighRisk() {
        return "HIGH".equals(riskLevel) || "CRITICAL".equals(riskLevel);
    }
}