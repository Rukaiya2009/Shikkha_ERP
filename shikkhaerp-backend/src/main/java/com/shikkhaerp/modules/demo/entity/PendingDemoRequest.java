//cat > src/main/java/com/shikkhaerp/modules/demo/entity/PendingDemoRequest.java << 'EOF'
package com.shikkhaerp.modules.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "pending_demo_requests")
public class PendingDemoRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String uuid;

    @Column(name = "school_name", nullable = false)
    private String schoolName;

    @Column(name = "school_address")
    private String schoolAddress;

    @Column(name = "school_phone")
    private String schoolPhone;

    @Column(name = "school_email")
    private String schoolEmail;

    @Column(name = "school_type")
    private String schoolType;

    @Column(name = "number_of_students")
    private Integer numberOfStudents;

    @Column(name = "number_of_teachers")
    private Integer numberOfTeachers;

    @Column(name = "super_admin_name", nullable = false)
    private String superAdminName;

    @Column(name = "super_admin_email", nullable = false)
    private String superAdminEmail;

    @Column(name = "super_admin_phone")
    private String superAdminPhone;

    @Column(name = "status")
    private String status = "PENDING";

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;

    @Column(name = "school_id")
    private UUID schoolId;

    @Column(name = "reject_reason")
    private String rejectReason;

    @Column(name = "request_data", columnDefinition = "jsonb")
    private String requestData;

    @PrePersist
    protected void onCreate() {
        if (status == null) status = "PENDING";
        if (expiresAt == null) expiresAt = LocalDateTime.now().plusDays(7);
    }

    public boolean isPending() {
        return "PENDING".equals(status);
    }

    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }
}
