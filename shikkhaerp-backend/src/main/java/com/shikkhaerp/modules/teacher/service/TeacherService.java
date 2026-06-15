package com.shikkhaerp.modules.teacher.service;

import com.shikkhaerp.modules.teacher.entity.Teacher;
import com.shikkhaerp.modules.teacher.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TeacherService {
    private final TeacherRepository teacherRepository;

    public Teacher create(Teacher teacher) {
        return teacherRepository.save(teacher);
    }

    public List<Teacher> getAll() {
        return teacherRepository.findAll();
    }

    public Teacher getById(String id) {
        return teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found!"));
    }

    public Teacher update(String id, Teacher teacher) {
        Teacher existing = getById(id);
        existing.setName(teacher.getName());
        existing.setDesignation(teacher.getDesignation());
        existing.setPhone(teacher.getPhone());
        existing.setEmail(teacher.getEmail());
        return teacherRepository.save(existing);
    }

    public void delete(String id) {
        Teacher teacher = getById(id);
        teacher.setActive(false);
        teacherRepository.save(teacher);
    }
}