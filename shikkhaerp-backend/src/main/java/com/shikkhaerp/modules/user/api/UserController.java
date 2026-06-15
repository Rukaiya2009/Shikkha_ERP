package com.shikkhaerp.modules.user.api;

import com.shikkhaerp.core.dto.ApiResponse;
import com.shikkhaerp.modules.user.entity.User;
import com.shikkhaerp.modules.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    
    @GetMapping
    public ApiResponse<List<User>> getAllUsers() {
        return ApiResponse.success(userService.getAllUsers());
    }
    
    @GetMapping("/all")
    public ApiResponse<Map<String, Object>> getAllUsersPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status) {
        
        org.springframework.data.domain.Page<User> userPage = userService.getAllUsers(page, size, role, status);
        
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("content", userPage.getContent());
        response.put("pageNumber", userPage.getNumber());
        response.put("pageSize", userPage.getSize());
        response.put("totalElements", userPage.getTotalElements());
        response.put("totalPages", userPage.getTotalPages());
        response.put("first", userPage.isFirst());
        response.put("last", userPage.isLast());
        response.put("hasNext", userPage.hasNext());
        response.put("hasPrevious", userPage.hasPrevious());
        
        return ApiResponse.success(response);
    }
    
    @GetMapping("/statistics")
    public ApiResponse<Map<String, Long>> getUserStatistics() {
        return ApiResponse.success(userService.getUserStatistics());
    }
    
    @GetMapping("/{id}")
    public ApiResponse<User> getUserById(@PathVariable String id) {
        return ApiResponse.success(userService.getUserById(id));
    }
    
    @GetMapping("/email/{email}")
    public ApiResponse<User> getUserByEmail(@PathVariable String email) {
        return ApiResponse.success(userService.getUserByEmail(email));
    }
    
    @GetMapping("/role/{role}")
    public ApiResponse<List<User>> getUsersByRole(@PathVariable String role) {
        return ApiResponse.success(userService.getUsersByRole(User.UserRole.valueOf(role)));
    }
    
    @GetMapping("/search")
    public ApiResponse<List<User>> searchUsers(@RequestParam String keyword) {
        return ApiResponse.success(userService.searchUsers(keyword));
    }
    
    @PostMapping
    public ApiResponse<User> createUser(@RequestBody User user) {
        return ApiResponse.success(userService.createUser(user), "User created successfully!");
    }
    
    @PutMapping("/{id}")
    public ApiResponse<User> updateUser(@PathVariable String id, @RequestBody User user) {
        return ApiResponse.success(userService.updateUser(id, user), "User updated successfully!");
    }
    
    @PutMapping("/{id}/status")
    public ApiResponse<Void> updateUserStatus(@PathVariable String id, @RequestParam boolean enabled) {
        userService.updateUserStatus(id, enabled);
        return ApiResponse.success(null, enabled ? "User enabled successfully!" : "User disabled successfully!");
    }
    
    @GetMapping("/count")
    public ApiResponse<Long> getUserCount() {
        return ApiResponse.success(userService.getUserCount());
    }
}