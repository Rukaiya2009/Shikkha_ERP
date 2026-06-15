package com.shikkhaerp.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemHealthDto {
    private String databaseStatus;
    private String serverStatus;
    private long uptime;
    private double cpuUsage;
    private double memoryUsage;
    private int activeSessions;
}
