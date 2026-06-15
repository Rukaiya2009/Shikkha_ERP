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
    
    // Email Verification Fields
    private boolean emailVerified = true;
    private String emailVerificationToken;
    private LocalDateTime emailVerificationTokenExpiry;
    
    private boolean phoneVerified = false;
    private boolean enabled = true;
    
    // Security fields
    private Integer loginAttempts = 0;
    private LocalDateTime lockedUntil;
    
    // Multi-tenant support
    private String schoolId;
    private String tenantId;
    
    // ===== AUDIT TRAIL =====
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
    
    // ===== SOFT DELETE (using deleted_at and deleted_by only) =====
    private LocalDateTime deletedAt;
    private String deletedBy;
    
    @Version
    private Long version = 0L;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (role == null) role = UserRole.STUDENT;
        if (status == null) status = UserStatus.PENDING_VERIFICATION;
        if (loginAttempts == null) loginAttempts = 0;
        if (role == UserRole.SUPER_ADMIN) {
            emailVerified = true;
            enabled = true;
            status = UserStatus.ACTIVE;
        } else {
            emailVerified = false;
            enabled = false;
            status = UserStatus.PENDING_VERIFICATION;
        }
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
    
    public enum UserRole {
        SUPER_ADMIN("Super Administrator"),
        SCHOOL_ADMIN("School Administrator"),
        TEACHER("Teacher"),
        STUDENT("Student"),
        PARENT("Parent");
        
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