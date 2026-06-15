package com.shikkhaerp.modules.student.mapper;

import com.shikkhaerp.modules.student.dto.StudentDto;
import com.shikkhaerp.modules.student.entity.Student;
import org.springframework.stereotype.Component;

@Component
public class StudentMapper {
    
    public StudentDto toDto(Student entity) {
        if (entity == null) return null;
        StudentDto dto = new StudentDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setClassName(entity.getClassName());
        dto.setRollNumber(entity.getRollNumber());
        dto.setPhone(entity.getPhone());
        dto.setAddress(entity.getAddress());
        dto.setActive(entity.isActive());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
    
    public Student toEntity(StudentDto dto) {
        if (dto == null) return null;
        Student entity = new Student();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setClassName(dto.getClassName());
        entity.setRollNumber(dto.getRollNumber());
        entity.setPhone(dto.getPhone());
        entity.setAddress(dto.getAddress());
        entity.setActive(dto.isActive());
        return entity;
    }
}