//cat > src/main/java/com/shikkhaerp/modules/auth/service/ComplianceService.java << 'EOF'
package com.shikkhaerp.modules.auth.service;

import com.shikkhaerp.modules.auth.entity.*;
import com.shikkhaerp.modules.auth.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ComplianceService {

    private final UserConsentRepository userConsentRepository;
    private final DataExportRequestRepository dataExportRequestRepository;
    private final AccountDeletionRequestRepository accountDeletionRequestRepository;
    private final LoginAlertRepository loginAlertRepository;
    private final PermissionAuditRepository permissionAuditRepository;

    // ==================== User Consent (GDPR) ====================

    @Transactional
    public UserConsent recordConsent(String userId, String consentType, String ipAddress) {
        UserConsent consent = new UserConsent();
        consent.setUserId(userId);
        consent.setConsentType(consentType);
        consent.setGranted(true);
        consent.setGrantedAt(LocalDateTime.now());
        consent.setIpAddress(ipAddress);
        return userConsentRepository.save(consent);
    }

    @Transactional
    public void revokeConsent(String userId, String consentType) {
        userConsentRepository.findByUserId(userId).stream()
            .filter(c -> c.getConsentType().equals(consentType))
            .forEach(c -> {
                c.setGranted(false);
                userConsentRepository.save(c);
            });
    }

    public List<UserConsent> getUserConsents(String userId) {
        return userConsentRepository.findByUserId(userId);
    }

    // ==================== Data Export (GDPR) ====================

    @Transactional
    public DataExportRequest requestDataExport(String userId) {
        DataExportRequest request = new DataExportRequest();
        request.setUserId(userId);
        request.setRequestedAt(LocalDateTime.now());
        request.setStatus("PENDING");
        return dataExportRequestRepository.save(request);
    }

    @Transactional
    public void completeDataExport(UUID requestId, String filePath) {
        dataExportRequestRepository.findById(requestId).ifPresent(req -> {
            req.setStatus("COMPLETED");
            req.setCompletedAt(LocalDateTime.now());
            req.setFilePath(filePath);
            dataExportRequestRepository.save(req);
        });
    }

    // ==================== Account Deletion (GDPR) ====================

    @Transactional
    public AccountDeletionRequest requestAccountDeletion(String userId, String email) {
        AccountDeletionRequest request = new AccountDeletionRequest();
        request.setUserId(userId);
        request.setEmail(email);
        request.setRequestedAt(LocalDateTime.now());
        request.setStatus("PENDING");
        return accountDeletionRequestRepository.save(request);
    }

    @Transactional
    public void confirmAccountDeletion(UUID requestId) {
        accountDeletionRequestRepository.findById(requestId).ifPresent(req -> {
            req.setStatus("CONFIRMED");
            req.setConfirmedAt(LocalDateTime.now());
            accountDeletionRequestRepository.save(req);
        });
    }

    // ==================== Login Alerts ====================

    @Transactional
    public LoginAlert createLoginAlert(String userId, String email, String alertType, String message) {
        LoginAlert alert = new LoginAlert();
        alert.setUserId(userId);
        alert.setEmail(email);
        alert.setAlertType(alertType);
        alert.setMessage(message);
        alert.setRead(false);
        alert.setCreatedAt(LocalDateTime.now());
        return loginAlertRepository.save(alert);
    }

    public List<LoginAlert> getUnreadAlerts(String userId) {
        return loginAlertRepository.findByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAlertAsRead(UUID alertId) {
        loginAlertRepository.findById(alertId).ifPresent(alert -> {
            alert.setRead(true);
            loginAlertRepository.save(alert);
        });
    }

    // ==================== Permission Audit ====================

    @Transactional
    public PermissionAudit logPermissionChange(String userId, String action, String roleId, UUID permissionId, String details) {
        PermissionAudit audit = new PermissionAudit();
        audit.setUserId(userId);
        audit.setAction(action);
        audit.setRoleId(roleId);
        audit.setPermissionId(permissionId);
        audit.setDetails(details);
        audit.setCreatedAt(LocalDateTime.now());
        return permissionAuditRepository.save(audit);
    }

    public List<PermissionAudit> getPermissionAuditLogs() {
        return permissionAuditRepository.findAllByOrderByCreatedAtDesc();
    }
}
