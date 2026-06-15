package com.shikkhaerp.modules.teacher.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class TeacherDto {
    private String id;
    private String userId;
    private String teacherId;
    private String name;
    private String designation;
    private String qualification;
    private String specialization;
    private String phone;
    private String email;
    private String address;
    private LocalDate joiningDate;
    private boolean active;
    private LocalDateTime createdAt;
}