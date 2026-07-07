package com.shikkhaerp.modules.user.service;

import com.shikkhaerp.modules.notification.service.EmailService;
import com.shikkhaerp.modules.user.entity.User;
import com.shikkhaerp.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    // CHANGED: this used to accept and encode whatever password the client
    // sent. It no longer does — ANY password on the incoming `user` object
    // is ignored. A random, unusable placeholder is generated internally,
    // the account is created as PENDING_VERIFICATION, and an invite email
    // is sent with a link the new user uses to set their OWN password via
    // /auth/setup-password. This matches the international-standard invite
    // pattern (Slack/GitHub/Google Workspace) instead of an admin knowing
    // or transmitting someone else's password.
    @Transactional
    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("User with email " + user.getEmail() + " already exists!");
        }

        String placeholder = UUID.randomUUID().toString();
        user.setPassword(passwordEncoder.encode(placeholder));
        user.setStatus(User.UserStatus.PENDING_VERIFICATION);
        user.setEnabled(false);
        user.setEmailVerified(false);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        String token = UUID.randomUUID().toString();
        user.generateEmailVerificationToken(token);

        User savedUser = userRepository.save(user);

        emailService.sendUserInvitation(savedUser.getEmail(), savedUser.getName(), token);

        log.info("User invited: {} ({}) — pending verification", savedUser.getEmail(), savedUser.getRole());

        return savedUser;
    }

    @Transactional
    public User updateUser(UUID id, User updatedUser) {
        User existingUser = getUserById(id);

        if (updatedUser.getName() != null) existingUser.setName(updatedUser.getName());
        if (updatedUser.getPhone() != null) existingUser.setPhone(updatedUser.getPhone());
        if (updatedUser.getAddress() != null) existingUser.setAddress(updatedUser.getAddress());
        if (updatedUser.getRole() != null) existingUser.setRole(updatedUser.getRole());
        if (updatedUser.getStatus() != null) existingUser.setStatus(updatedUser.getStatus());

        existingUser.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(existingUser);
        log.info("User updated successfully: {}", savedUser.getEmail());

        return savedUser;
    }

    @Transactional
    public void updateUserStatus(UUID id, boolean enabled) {
        User user = getUserById(id);
        user.setEnabled(enabled);
        user.setStatus(enabled ? User.UserStatus.ACTIVE : User.UserStatus.INACTIVE);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        log.info("User status updated: {} -> enabled={}", user.getEmail(), enabled);
    }

    // ==================== soft delete / restore ====================

    @Transactional
    public User deleteUser(UUID id, String deletedBy) {
        User user = getUserById(id);
        user.softDelete(deletedBy);
        User saved = userRepository.save(user);
        log.info("User soft-deleted: {} (by {})", saved.getEmail(), deletedBy);
        return saved;
    }

    @Transactional
    public User restoreUser(UUID id) {
        User user = getUserById(id);
        user.restore();
        User saved = userRepository.save(user);
        log.info("User restored: {}", saved.getEmail());
        return saved;
    }

    public Page<User> getDeletedUsers(int page, int size, String schoolId) {
        Pageable pageable = PageRequest.of(page, size);
        return userRepository.findDeletedUsers(schoolId, pageable);
    }

    // ==================== NEW: resend invite ====================
    // For when a PENDING_VERIFICATION user's 24-hour token expires before
    // they click it. Generates a fresh token and re-sends the email —
    // does nothing (and shouldn't) for users who already completed setup.

    @Transactional
    public User resendInvite(UUID id) {
        User user = getUserById(id);

        if (user.getStatus() != User.UserStatus.PENDING_VERIFICATION) {
            throw new RuntimeException("This user has already completed account setup.");
        }

        String token = UUID.randomUUID().toString();
        user.generateEmailVerificationToken(token);
        userRepository.save(user);

        emailService.sendUserInvitation(user.getEmail(), user.getName(), token);
        log.info("Invitation resent to: {}", user.getEmail());

        return user;
    }

    public User getUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Page<User> getAllUsers(int page, int size, String role, String status, String schoolId) {
        Pageable pageable = PageRequest.of(page, size);

        User.UserRole roleEnum = (role != null && !role.isBlank()) ? User.UserRole.valueOf(role) : null;
        User.UserStatus statusEnum = (status != null && !status.isBlank()) ? User.UserStatus.valueOf(status) : null;

        return userRepository.findActiveUsersWithFilters(roleEnum, statusEnum, schoolId, pageable);
    }

    public Map<String, Long> getUserStatistics() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", userRepository.count());
        stats.put("students", userRepository.countByRole(User.UserRole.STUDENT));
        stats.put("teachers", userRepository.countByRole(User.UserRole.TEACHER));
        stats.put("admins", userRepository.countByRole(User.UserRole.SUPER_ADMIN));
        stats.put("active", userRepository.countByStatus(User.UserStatus.ACTIVE));
        stats.put("inactive", userRepository.countByStatus(User.UserStatus.INACTIVE));
        return stats;
    }

    public List<User> searchUsers(String keyword) {
        return userRepository.searchByName(keyword);
    }

    public List<User> getUsersByRole(User.UserRole role) {
        return userRepository.findByRole(role);
    }

    public long getUserCount() {
        return userRepository.count();
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}