
package com.shikkhaerp.modules.user.service;

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

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Transactional
    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("User with email " + user.getEmail() + " already exists!");
        }
        
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        log.info("User created successfully: {} ({})", savedUser.getEmail(), savedUser.getRole());
        
        return savedUser;
    }
    
    @Transactional
    public User updateUser(String id, User updatedUser) {
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
    public void updateUserStatus(String id, boolean enabled) {
        User user = getUserById(id);
        user.setEnabled(enabled);
        user.setStatus(enabled ? User.UserStatus.ACTIVE : User.UserStatus.INACTIVE);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        log.info("User status updated: {} -> enabled={}", user.getEmail(), enabled);
    }
    
    public User getUserById(String id) {
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
    
    public Page<User> getAllUsers(int page, int size, String role, String status) {
        Pageable pageable = PageRequest.of(page, size);
        
        if (role != null && status != null) {
            return userRepository.findByRoleAndStatus(
                User.UserRole.valueOf(role), 
                User.UserStatus.valueOf(status), 
                pageable
            );
        } else if (role != null) {
            return userRepository.findByRole(User.UserRole.valueOf(role), pageable);
        } else if (status != null) {
            return userRepository.findByStatus(User.UserStatus.valueOf(status), pageable);
        }
        
        return userRepository.findAll(pageable);
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
