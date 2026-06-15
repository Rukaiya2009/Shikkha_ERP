package com.shikkhaerp.modules.student.dto;

import lombok.Data;

@Data
public class CreateStudentRequest {
    private String name;
    private String className;
    private String rollNumber;
    private String section;
    private String fatherName;
    private String motherName;
    private String phone;
    private String address;
    private String bloodGroup;
}