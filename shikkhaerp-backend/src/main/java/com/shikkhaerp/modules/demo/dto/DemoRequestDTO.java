package com.shikkhaerp.modules.demo.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DemoRequestDTO {

    @Valid
    @NotNull
    private SchoolInfo school;

    @Valid
    @NotNull
    private SuperAdminInfo superAdmin;

    @Data
    public static class SchoolInfo {
        @NotBlank(message = "School name is required")
        private String name;

        private String address;
        private String phone;
        private String email;
        private String type;
        private Integer numberOfStudents;
        private Integer numberOfTeachers;
    }

    @Data
    public static class SuperAdminInfo {
        @NotBlank(message = "Super admin name is required")
        private String name;

        @NotBlank(message = "Super admin email is required")
        @Email(message = "Invalid email format")
        private String email;

        private String phone;
    }
}
