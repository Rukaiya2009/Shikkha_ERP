package com.shikkhaerp.modules.teacher.dto;

import lombok.Data;

@Data
public class UpdateTeacherRequest {
    private String name;
    private String designation;
    private String qualification;
    private String specialization;
    private String phone;
    private String email;
    private String address;
}