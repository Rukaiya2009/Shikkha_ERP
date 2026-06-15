package com.shikkhaerp.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenderRatioDto {
    private long male;
    private long female;
    private long other;
    private double malePercentage;
    private double femalePercentage;
}
