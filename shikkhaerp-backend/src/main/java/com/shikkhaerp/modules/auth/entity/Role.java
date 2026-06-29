package com.shikkhaerp.modules.auth.entity;

public enum Role {
    SUPER_ADMIN,
    SCHOOL_ADMIN,
    TEACHER,
    STUDENT,
    PARENT,
    DEVELOPER;
    
    public String getAuthority() {
        return "ROLE_" + this.name();
    }
}