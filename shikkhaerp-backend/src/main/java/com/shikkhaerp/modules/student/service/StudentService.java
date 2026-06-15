package com.shikkhaerp.modules.student.service;

import com.shikkhaerp.modules.student.entity.Student;
import com.shikkhaerp.modules.student.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StudentService {
    private final StudentRepository studentRepository;

    public Student create(Student student) {
        return studentRepository.save(student);
    }

    public List<Student> getAll() {
        return studentRepository.findAll();
    }

    public Student getById(String id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found!"));
    }

    public Student update(String id, Student student) {
        Student existing = getById(id);
        existing.setName(student.getName());
        existing.setClassName(student.getClassName());
        existing.setPhone(student.getPhone());
        existing.setAddress(student.getAddress());
        return studentRepository.save(existing);
    }

    public void delete(String id) {
        Student student = getById(id);
        student.setActive(false);
        studentRepository.save(student);
    }

    public Page<Student> getPaginatedStudents(Pageable pageable) {
        return studentRepository.findAll(pageable);
    }

    public List<Student> searchStudents(String name, String className, String phone) {
        return studentRepository.searchStudents(name, className, phone);
    }

    public Map<String, Long> getStudentStatistics() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", studentRepository.count());
        stats.put("active", studentRepository.countByActiveTrue());
        return stats;
    }

    public List<Student> getActiveStudents() {
        return studentRepository.findByActiveTrue();
    }

    public boolean isRollNumberAvailable(String rollNumber, String className) {
        return !studentRepository.existsByRollNumberAndClassName(rollNumber, className);
    }
}
