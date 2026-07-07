package com.shikkhaerp.modules.user.api;

import com.shikkhaerp.core.dto.ApiResponse;
import com.shikkhaerp.modules.user.entity.User;
import com.shikkhaerp.modules.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;


@RestController
@RequestMapping("/users")
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
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String schoolId) {

        String effectiveSchoolId = resolveEffectiveSchoolId(schoolId);
        Page<User> userPage = userService.getAllUsers(page, size, role, status, effectiveSchoolId);
        return ApiResponse.success(toPageMap(userPage));
    }

    @GetMapping("/deleted")
    public ApiResponse<Map<String, Object>> getDeletedUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String schoolId) {

        String effectiveSchoolId = resolveEffectiveSchoolId(schoolId);
        Page<User> userPage = userService.getDeletedUsers(page, size, effectiveSchoolId);
        return ApiResponse.success(toPageMap(userPage));
    }

    @GetMapping("/statistics")
    public ApiResponse<Map<String, Long>> getUserStatistics() {
        return ApiResponse.success(userService.getUserStatistics());
    }

    @GetMapping("/{id}")
    public ApiResponse<User> getUserById(@PathVariable UUID id) {
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
    public ApiResponse<User> updateUser(@PathVariable UUID id, @RequestBody User user) {
        return ApiResponse.success(userService.updateUser(id, user), "User updated successfully!");
    }

    @PutMapping("/{id}/status")
    public ApiResponse<Void> updateUserStatus(@PathVariable UUID id, @RequestParam boolean enabled) {
        userService.updateUserStatus(id, enabled);
        return ApiResponse.success(null, enabled ? "User enabled successfully!" : "User disabled successfully!");
    }

    // ==================== NEW: soft delete / restore ====================

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteUser(@PathVariable UUID id) {
        String deletedBy = currentCallerEmail();
        userService.deleteUser(id, deletedBy);
        return ApiResponse.success(null, "User deleted successfully!");
    }

    @PutMapping("/{id}/restore")
    public ApiResponse<User> restoreUser(@PathVariable UUID id) {
        return ApiResponse.success(userService.restoreUser(id), "User restored successfully!");
    }

    @PostMapping("/{id}/resend-invite")
    public ApiResponse<Void> resendInvite(@PathVariable UUID id) {
        userService.resendInvite(id);
        return ApiResponse.success(null, "Invitation resent successfully!");
    }

    @GetMapping("/count")
    public ApiResponse<Long> getUserCount() {
        return ApiResponse.success(userService.getUserCount());
    }

    // ==================== helpers ====================

    /**
     * Resolves which schoolId should actually be used for a query.
     *
     * IMPORTANT: this does NOT trust whatever schoolId the client sent.
     * Super Admin / Developer may query any school (or all, if null).
     * Everyone else is force-scoped to their OWN schoolId, regardless of
     * what was passed in — this is the server-side enforcement that was
     * missing before. A School Admin calling this API directly with a
     * different schoolId, or none at all, still only ever gets their own
     * school's data back.
     *
     * ASSUMPTION: authentication.getName() returns the user's email —
     * this matches how login/JWT is normally wired in this app, but please
     * confirm against CustomUserDetailsService.java. If it returns something
     * else (e.g. a UUID), swap getUserByEmail() below accordingly.
     */
    private String resolveEffectiveSchoolId(String requestedSchoolId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            return requestedSchoolId; // shouldn't happen behind the JWT filter, but fail safe-ish
        }

        User caller = userService.getUserByEmail(auth.getName());
        boolean isPrivileged = caller.getRole() == User.UserRole.SUPER_ADMIN
                || caller.getRole() == User.UserRole.DEVELOPER;

        return isPrivileged ? requestedSchoolId : caller.getSchoolId();
    }

    private String currentCallerEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.getName() != null) ? auth.getName() : "system";
    }

    private Map<String, Object> toPageMap(Page<User> userPage) {
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
        return response;
    }
}