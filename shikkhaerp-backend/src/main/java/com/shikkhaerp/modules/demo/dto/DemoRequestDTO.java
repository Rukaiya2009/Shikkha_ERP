package com.shikkhaerp.modules.demo.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemoRequestDTO {

    @NotNull(message = "School information is required")
    @Valid
    private School school;

    @NotNull(message = "Super admin information is required")
    @Valid
    private SuperAdmin superAdmin;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class School {
        @NotBlank(message = "School name is required")
        private String name;

        @NotBlank(message = "Address is required")
        private String address;

        @NotBlank(message = "Phone is required")
        private String phone;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        private String type;

        private Integer numberOfStudents;

        private Integer numberOfTeachers;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SuperAdmin {
        @NotBlank(message = "Super admin name is required")
        private String name;

        @NotBlank(message = "Super admin email is required")
        @Email(message = "Invalid email format")
        private String email;

        private String phone;
    }

    public String getSchoolName() {
        return school != null ? school.getName() : null;
    }

    public String getAddress() {
        return school != null ? school.getAddress() : null;
    }

    public String getPhone() {
        return school != null ? school.getPhone() : null;
    }

    public String getEmail() {
        return school != null ? school.getEmail() : null;
    }

    public String getType() {
        return school != null ? school.getType() : null;
    }

    public Integer getStudents() {
        return school != null ? school.getNumberOfStudents() : null;
    }

    public Integer getTeachers() {
        return school != null ? school.getNumberOfTeachers() : null;
    }

    public String getSuperAdminName() {
        return superAdmin != null ? superAdmin.getName() : null;
    }

    public String getSuperAdminEmail() {
        return superAdmin != null ? superAdmin.getEmail() : null;
    }

    public String getSuperAdminPhone() {
        return superAdmin != null ? superAdmin.getPhone() : null;
    }
}