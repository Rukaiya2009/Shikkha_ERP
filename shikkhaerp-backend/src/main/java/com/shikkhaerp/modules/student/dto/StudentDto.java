package com.shikkhaerp.modules.student.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class StudentDto {
    private String id;
    private String userId;
    private String studentId;
    private String name;
    private String className;
    private String rollNumber;
    private String section;
    private String fatherName;
    private String motherName;
    private String phone;
    private String address;
    private LocalDate dateOfBirth;
    private String bloodGroup;
    private String admissionYear;
    private boolean active;
    private LocalDateTime createdAt;
}