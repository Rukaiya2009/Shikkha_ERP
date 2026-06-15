package com.shikkhaerp.modules.student.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "students")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
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
    private String bloodGroup;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean active = true;
    
    // Add Gender field
    @Enumerated(EnumType.STRING)
    private Gender gender;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (studentId == null) {
            studentId = "STU" + System.currentTimeMillis();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum Gender {
        MALE, FEMALE, OTHER
    }
}
