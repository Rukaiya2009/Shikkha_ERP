package com.shikkhaerp.modules.user.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Column(unique = true, nullable = false)
    private String email;
    
    @NotBlank(message = "Password is required")
    @Column(nullable = false)
    private String password;
    
    @NotBlank(message = "Name is required")
    @Size(max = 100)
    @Column(nullable = false)
    private String name;
    
    private String phone;
    private String address;
    private String profileImage;
    
    @Enumerated(EnumType.STRING)
    private UserRole role;
    
    @Enumerated(EnumType.STRING)
    private UserStatus status;
    
    private LocalDateTime lastLoginAt;
    private String lastLoginIp;
    private String lastLoginUserAgent;
    
    private boolean emailVerified = true;
    private String emailVerificationToken;
    private LocalDateTime emailVerificationTokenExpiry;
    
    private boolean phoneVerified = false;
    private boolean enabled = true;
    
    private Integer loginAttempts = 0;
    private LocalDateTime lockedUntil;
    
    private String schoolId;
    private String tenantId;
    
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    @CreatedBy
    @Column(updatable = false)
    private String createdBy;
    
    @LastModifiedBy
    private String updatedBy;
    
    private LocalDateTime deletedAt;
    private String deletedBy;
    
    @Version
    private Long version = 0L;
    
    // ============ COMPATIBILITY GETTERS FOR EXISTING CODE ============
    
    /**
     * Compatibility method - returns name field
     * Used by: UserService, DemoService, TeacherMapper, etc.
     */
    public String getName() {
        return this.name;
    }
    
    /**
     * Compatibility method - sets name field
     */
    public void setName(String name) {
        this.name = name;
    }
    
    /**
     * Compatibility method - returns email field
     * Used by: CustomUserDetailsService, UserService, etc.
     */
    public String getEmail() {
        return this.email;
    }
    
    /**
     * Compatibility method - returns password field
     * Used by: CustomUserDetailsService, PasswordService
     */
    public String getPassword() {
        return this.password;
    }
    
    /**
     * Compatibility method - returns role field
     * Used by: CustomUserDetailsService, UserService
     */
    public UserRole getRole() {
        return this.role;
    }
    
    /**
     * Compatibility method - returns status field
     * Used by: UserService
     */
    public UserStatus getStatus() {
        return this.status;
    }
    
    /**
     * Compatibility method - returns phone field
     * Used by: UserService
     */
    public String getPhone() {
        return this.phone;
    }
    
    /**
     * Compatibility method - returns address field
     * Used by: UserService
     */
    public String getAddress() {
        return this.address;
    }
    
    /**
     * Compatibility method - checks if user is enabled
     * Used by: CustomUserDetailsService
     */
    public boolean isEnabled() {
        return this.enabled && this.status == UserStatus.ACTIVE;
    }
    
    /**
     * Compatibility method - gets ID as Long (for backward compatibility)
     * Returns null if ID is not a number
     */
    public Long getId() {
        try {
            return this.id != null ? Long.parseLong(this.id) : null;
        } catch (NumberFormatException e) {
            return null;
        }
    }
    
    /**
     * Sets ID from Long (for backward compatibility)
     */
    public void setId(Long id) {
        this.id = id != null ? id.toString() : null;
    }
    
    // ============ SETTERS FOR COMPATIBILITY ============
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public void setRole(UserRole role) {
        this.role = role;
    }
    
    public void setStatus(UserStatus status) {
        this.status = status;
    }
    
    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.status = UserStatus.INACTIVE;
        }
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    // ============ EXISTING METHODS (unchanged) ============
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (role == null) role = UserRole.STUDENT;
        if (status == null) status = UserStatus.ACTIVE;
        if (loginAttempts == null) loginAttempts = 0;
        
        // DEVELOPMENT: Auto-verify all users
        emailVerified = true;
        enabled = true;
        status = UserStatus.ACTIVE;
        phoneVerified = false;  // <-- ADDED THIS LINE
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public void generateEmailVerificationToken(String token) {
        this.emailVerificationToken = token;
        this.emailVerificationTokenExpiry = LocalDateTime.now().plusHours(24);
    }
    
    public boolean isVerificationTokenValid(String token) {
        return token != null && 
               token.equals(this.emailVerificationToken) && 
               emailVerificationTokenExpiry != null &&
               emailVerificationTokenExpiry.isAfter(LocalDateTime.now());
    }
    
    public void verifyEmail() {
        this.emailVerified = true;
        this.emailVerificationToken = null;
        this.emailVerificationTokenExpiry = null;
        this.enabled = true;
        this.status = UserStatus.ACTIVE;
    }
    
    public void softDelete(String deletedBy) {
        this.deletedAt = LocalDateTime.now();
        this.deletedBy = deletedBy;
        this.enabled = false;
        this.status = UserStatus.INACTIVE;
    }
    
    public void restore() {
        this.deletedAt = null;
        this.deletedBy = null;
        this.enabled = true;
        this.status = UserStatus.ACTIVE;
    }
    
    public void recordLoginFailure() {
        this.loginAttempts++;
        if (this.loginAttempts >= 5) {
            this.lockedUntil = LocalDateTime.now().plusMinutes(30);
            this.status = UserStatus.LOCKED;
        }
    }
    
    public void recordLoginSuccess(String ip, String userAgent) {
        this.loginAttempts = 0;
        this.lockedUntil = null;
        this.lastLoginIp = ip;
        this.lastLoginUserAgent = userAgent;
        this.lastLoginAt = LocalDateTime.now();
        if (this.status == UserStatus.LOCKED) {
            this.status = UserStatus.ACTIVE;
        }
    }
    
    public boolean isLocked() {
        return lockedUntil != null && lockedUntil.isAfter(LocalDateTime.now());
    }
    
    // ============ ENUMS ============
    
    public enum UserRole {
        SUPER_ADMIN("Super Administrator"),
        SCHOOL_ADMIN("School Administrator"),
        TEACHER("Teacher"),
        STUDENT("Student"),
        PARENT("Parent"),
        DEVELOPER("Developer");
        
        private final String displayName;
        
        UserRole(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    public enum UserStatus {
        ACTIVE, INACTIVE, SUSPENDED, PENDING_VERIFICATION, LOCKED
    }
}