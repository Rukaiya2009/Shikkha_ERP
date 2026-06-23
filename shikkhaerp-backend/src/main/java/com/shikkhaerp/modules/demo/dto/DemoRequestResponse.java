package com.shikkhaerp.modules.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemoRequestResponse {
    private boolean success;
    private String message;
    private String requestId;
    private String email;
}
