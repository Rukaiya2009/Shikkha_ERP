package com.shikkhaerp.modules.student.api;

import com.shikkhaerp.core.dto.ApiResponse;
import com.shikkhaerp.modules.student.entity.Student;
import com.shikkhaerp.modules.student.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/students")
@RequiredArgsConstructor
public class StudentController {
    private final StudentService studentService;

    @PostMapping
    public ApiResponse<Student> create(@RequestBody Student student) {
        return ApiResponse.success(studentService.create(student), "Student created successfully!");
    }

    @GetMapping
    public ApiResponse<List<Student>> getAll() {
        return ApiResponse.success(studentService.getAll());
    }

    @GetMapping("/paginated")
    public ApiResponse<Map<String, Object>> getPaginatedStudents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        org.springframework.data.domain.Page<Student> studentPage = studentService.getPaginatedStudents(pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("content", studentPage.getContent());
        response.put("currentPage", studentPage.getNumber());
        response.put("totalItems", studentPage.getTotalElements());
        response.put("totalPages", studentPage.getTotalPages());
        response.put("pageSize", studentPage.getSize());
        response.put("hasNext", studentPage.hasNext());
        response.put("hasPrevious", studentPage.hasPrevious());
        
        return ApiResponse.success(response);
    }

    @GetMapping("/search")
    public ApiResponse<List<Student>> searchStudents(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String className,
            @RequestParam(required = false) String phone) {
        return ApiResponse.success(studentService.searchStudents(name, className, phone));
    }

    @GetMapping("/statistics")
    public ApiResponse<Map<String, Long>> getStudentStatistics() {
        return ApiResponse.success(studentService.getStudentStatistics());
    }

    @GetMapping("/active")
    public ApiResponse<List<Student>> getActiveStudents() {
        return ApiResponse.success(studentService.getActiveStudents());
    }

    @GetMapping("/check-roll")
    public ApiResponse<Map<String, Boolean>> checkRollNumber(
            @RequestParam String rollNumber,
            @RequestParam String className) {
        Map<String, Boolean> response = new HashMap<>();
        response.put("available", studentService.isRollNumberAvailable(rollNumber, className));
        return ApiResponse.success(response);
    }

    @GetMapping("/{id}")
    public ApiResponse<Student> getById(@PathVariable String id) {
        return ApiResponse.success(studentService.getById(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<Student> update(@PathVariable String id, @RequestBody Student student) {
        return ApiResponse.success(studentService.update(id, student));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable String id) {
        studentService.delete(id);
        return ApiResponse.success(null, "Student deleted successfully!");
    }
}
