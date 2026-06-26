package com.shikkhaerp.modules.demo.service;

import com.shikkhaerp.modules.demo.dto.DemoRequestDTO;
import com.shikkhaerp.modules.demo.entity.PendingDemoRequest;
import com.shikkhaerp.modules.demo.repository.PendingDemoRequestRepository;
import com.shikkhaerp.modules.school.entity.School;
import com.shikkhaerp.modules.school.repository.SchoolRepository;
import com.shikkhaerp.modules.user.entity.User;
import com.shikkhaerp.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DemoService {

    private final PendingDemoRequestRepository pendingDemoRequestRepository;
    private final SchoolRepository schoolRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public String submitDemoRequest(DemoRequestDTO request) {
        // Generate UUID
        String uuid = "req_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);

        // Create entity
        PendingDemoRequest entity = new PendingDemoRequest();
        entity.setUuid(uuid);
        entity.setSchoolName(request.getSchool().getName());
        entity.setSchoolAddress(request.getSchool().getAddress());
        entity.setSchoolPhone(request.getSchool().getPhone());
        entity.setSchoolEmail(request.getSchool().getEmail());
        entity.setSchoolType(request.getSchool().getType());
        entity.setNumberOfStudents(request.getSchool().getNumberOfStudents());
        entity.setNumberOfTeachers(request.getSchool().getNumberOfTeachers());
        entity.setSuperAdminName(request.getSuperAdmin().getName());
        entity.setSuperAdminEmail(request.getSuperAdmin().getEmail());
        entity.setSuperAdminPhone(request.getSuperAdmin().getPhone());
        entity.setStatus("PENDING");

        // Save to database
        pendingDemoRequestRepository.save(entity);

        log.info("Demo request submitted with UUID: {}", uuid);

        // TODO: Send confirmation email
        return uuid;
    }

    @Transactional
    public PendingDemoRequest getPendingRequest(String uuid) {
        return pendingDemoRequestRepository.findByUuid(uuid)
                .orElseThrow(() -> new RuntimeException("Request not found with UUID: " + uuid));
    }

    @Transactional
    public void approveRequest(String uuid) {
        PendingDemoRequest request = getPendingRequest(uuid);

        if (!request.isPending()) {
            throw new RuntimeException("Request is already " + request.getStatus());
        }

        if (request.isExpired()) {
            request.setStatus("EXPIRED");
            pendingDemoRequestRepository.save(request);
            throw new RuntimeException("Request has expired");
        }

        // =============================================
        // 1. CREATE SCHOOL
        // =============================================
        School school = new School();
        school.setName(request.getSchoolName());
        school.setAddress(request.getSchoolAddress());
        school.setPhone(request.getSchoolPhone());
        school.setEmail(request.getSchoolEmail());
        school.setStatus(School.SchoolStatus.ACTIVE);

        // Generate unique code and subdomain
        String base = request.getSchoolName().toLowerCase()
                .replaceAll("[^a-z0-9]", "-")
                .replaceAll("-+", "-")
                .trim()
                .replaceAll("^-|-$", "");
        String unique = UUID.randomUUID().toString().substring(0, 6);
        String code = base + "-" + unique;
        String subdomain = base + "-" + unique;

        // Ensure uniqueness
        while (schoolRepository.existsByCode(code)) {
            unique = UUID.randomUUID().toString().substring(0, 6);
            code = base + "-" + unique;
            subdomain = base + "-" + unique;
        }

        school.setCode(code);
        school.setSubdomain(subdomain);

        // Trial period
        school.setTrialStart(LocalDateTime.now());
        school.setTrialEnd(LocalDateTime.now().plusDays(30));
        school.setSubscriptionPlan("TRIAL");
        school.setSubscriptionExpiry(LocalDateTime.now().plusDays(30));

        School savedSchool = schoolRepository.save(school);

        // =============================================
        // 2. CREATE SUPER ADMIN USER
        // =============================================
        User superAdmin = new User();
        superAdmin.setEmail(request.getSuperAdminEmail());
        superAdmin.setName(request.getSuperAdminName());
        superAdmin.setPhone(request.getSuperAdminPhone());
        superAdmin.setPassword(passwordEncoder.encode("Temporary@123")); // Temporary password
        superAdmin.setRole(User.UserRole.SUPER_ADMIN);
        superAdmin.setSchoolId(savedSchool.getId());
        superAdmin.setEnabled(true);
        superAdmin.setStatus(User.UserStatus.ACTIVE);

        userRepository.save(superAdmin);

        // =============================================
        // 3. UPDATE PENDING REQUEST
        // =============================================
        request.setStatus("APPROVED");
        request.setApprovedAt(LocalDateTime.now());
        request.setSchoolId(UUID.fromString(savedSchool.getId()));
        pendingDemoRequestRepository.save(request);

        // =============================================
        // 4. SEND APPROVAL EMAIL
        // =============================================
        // TODO: Implement approval email sending
        log.info("Approval email would be sent to: {}", superAdmin.getEmail());

        log.info("Demo request approved: {} | School: {} | Admin: {}",
                uuid, savedSchool.getName(), superAdmin.getEmail());
    }
}