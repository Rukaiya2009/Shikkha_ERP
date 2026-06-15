package com.shikkhaerp.modules.user.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserDto {
    private String id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String role;
    private String status;
    private boolean enabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}