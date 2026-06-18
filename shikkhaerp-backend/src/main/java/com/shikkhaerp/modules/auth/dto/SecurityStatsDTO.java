package com.shikkhaerp.modules.auth.dto;

import lombok.Data;
import java.util.Map;

@Data
public class SecurityStatsDTO {
    private long totalFailedAttempts;
    private long totalAccountLocks;
    private long totalAuditLogs;
    private long totalSecurityEvents;
    private Map<String, Long> eventTypeCounts;
    private Map<String, Long> severityCounts;
}