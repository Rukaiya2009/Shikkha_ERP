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
    User superAdmin = userCreationService.createSchoolSuperAdmin(
            request.getSuperAdminEmail(),
            request.getSuperAdminName(),
            request.getSuperAdminPhone(),
            savedSchool.getId()
    );

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
    sendApprovalEmail(
            superAdmin.getEmail(),
            superAdmin.getName(),
            savedSchool.getName(),
            savedSchool.getSubdomain()
    );

    log.info("Demo request approved: {} | School: {} | Admin: {}",
            uuid, savedSchool.getName(), superAdmin.getEmail());
}