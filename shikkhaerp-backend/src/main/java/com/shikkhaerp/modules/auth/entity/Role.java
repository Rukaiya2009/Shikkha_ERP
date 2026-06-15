package com.shikkhaerp.modules.auth.entity;

// This is a DTO enum for API responses only
// Maps to User.UserRole from the existing User entity
public enum Role {
    SUPER_ADMIN,
    SCHOOL_ADMIN,
    TEACHER,
    STUDENT,
    PARENT,
    ACCOUNTANT;

    public String getDefaultDashboard() {
        switch (this) {
            case SUPER_ADMIN:
                return "/super-admin/dashboard";
            case SCHOOL_ADMIN:
                return "/school-admin/dashboard";
            case TEACHER:
                return "/teacher/dashboard";
            case STUDENT:
                return "/student/dashboard";
            case PARENT:
                return "/parent/dashboard";
            case ACCOUNTANT:
                return "/accountant/dashboard";
            default:
                return "/dashboard";
        }
    }
}