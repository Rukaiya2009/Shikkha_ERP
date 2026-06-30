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
import java.util.UUID;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "app_users")
@EntityListeners(AuditingEntityListener.class)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Column(unique = true, nullable = false, name = "email")
    private String email;

    @NotBlank(message = "Password is required")
    @Column(nullable = false, name = "password")
    private String password;

    @NotBlank(message = "Name is required")
    @Size(max = 100)
    @Column(nullable = false, name = "name")
    private String name;

    @Column(name = "phone")
    private String phone;

    @Column(name = "address")
    private String address;

    @Column(name = "profile_image")
    private String profileImage;

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private UserStatus status;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "last_login_ip")
    private String lastLoginIp;

    @Column(name = "last_login_user_agent")
    private String lastLoginUserAgent;

    @Column(name = "email_verified")
    private boolean emailVerified = true;

    @Column(name = "email_verification_token")
    private String emailVerificationToken;

    @Column(name = "email_verification_token_expiry")
    private LocalDateTime emailVerificationTokenExpiry;

    @Column(name = "phone_verified")
    private boolean phoneVerified = false;

    @Column(name = "enabled")
    private boolean enabled = true;

    @Column(name = "login_attempts")
    private Integer loginAttempts = 0;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    @Column(name = "school_id")
    private String schoolId;

    @Column(name = "tenant_id")
    private String tenantId;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @CreatedBy
    @Column(name = "created_by", updatable = false)
    private String createdBy;

    @LastModifiedBy
    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "deleted_by")
    private String deletedBy;

    @Version
    @Column(name = "version")
    private Long version = 0L;

    // ============ COMPATIBILITY GETTERS FOR EXISTING CODE ============

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return this.email;
    }

    public String getPassword() {
        return this.password;
    }

    public UserRole getRole() {
        return this.role;
    }

    public UserStatus getStatus() {
        return this.status;
    }

    public String getPhone() {
        return this.phone;
    }

    public String getAddress() {
        return this.address;
    }

    public boolean isEnabled() {
        return this.enabled && this.status == UserStatus.ACTIVE;
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

    // ============ EXISTING METHODS ============

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (role == null) role = UserRole.STUDENT;
        if (status == null) status = UserStatus.ACTIVE;
        if (loginAttempts == null) loginAttempts = 0;

        emailVerified = true;
        enabled = true;
        status = UserStatus.ACTIVE;
        phoneVerified = false;
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