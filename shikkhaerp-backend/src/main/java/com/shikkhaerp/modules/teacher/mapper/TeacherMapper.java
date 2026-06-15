package com.shikkhaerp.modules.teacher.mapper;

import com.shikkhaerp.modules.teacher.dto.TeacherDto;
import com.shikkhaerp.modules.teacher.entity.Teacher;
import org.springframework.stereotype.Component;

@Component
public class TeacherMapper {
    
    public TeacherDto toDto(Teacher entity) {
        if (entity == null) return null;
        TeacherDto dto = new TeacherDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDesignation(entity.getDesignation());
        dto.setQualification(entity.getQualification());
        dto.setPhone(entity.getPhone());
        dto.setEmail(entity.getEmail());
        dto.setActive(entity.isActive());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
    
    public Teacher toEntity(TeacherDto dto) {
        if (dto == null) return null;
        Teacher entity = new Teacher();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setDesignation(dto.getDesignation());
        entity.setQualification(dto.getQualification());
        entity.setPhone(dto.getPhone());
        entity.setEmail(dto.getEmail());
        entity.setActive(dto.isActive());
        return entity;
    }
}