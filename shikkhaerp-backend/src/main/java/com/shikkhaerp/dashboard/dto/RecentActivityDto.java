package com.shikkhaerp.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentActivityDto {
    private String id;
    private String action;
    private String user;
    private String userRole;
    private String details;
    private LocalDateTime timestamp;
}
