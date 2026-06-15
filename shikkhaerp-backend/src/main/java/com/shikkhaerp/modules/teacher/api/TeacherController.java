package com.shikkhaerp.modules.teacher.api;

import com.shikkhaerp.core.dto.ApiResponse;
import com.shikkhaerp.modules.teacher.entity.Teacher;
import com.shikkhaerp.modules.teacher.service.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/v1/teachers")
@RequiredArgsConstructor
public class TeacherController {
    private final TeacherService teacherService;

    @PostMapping
    public ApiResponse<Teacher> create(@RequestBody Teacher teacher) {
        return ApiResponse.success(teacherService.create(teacher), "Teacher created successfully!");
    }

    @GetMapping
    public ApiResponse<List<Teacher>> getAll() {
        return ApiResponse.success(teacherService.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<Teacher> getById(@PathVariable String id) {
        return ApiResponse.success(teacherService.getById(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<Teacher> update(@PathVariable String id, @RequestBody Teacher teacher) {
        return ApiResponse.success(teacherService.update(id, teacher));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable String id) {
        teacherService.delete(id);
        return ApiResponse.success(null, "Teacher deleted successfully!");
    }
}