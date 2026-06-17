//cat > src/main/java/com/shikkhaerp/modules/auth/service/AdvancedSecurityService.java << 'EOF'
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
public class AdvancedSecurityService {

    private final TwoFactorAuthRepository twoFactorAuthRepository;
    private final MfaBackupCodeRepository mfaBackupCodeRepository;
    private final DeviceInfoRepository deviceInfoRepository;
    private final SecurityQuestionRepository securityQuestionRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final IpWhitelistRepository ipWhitelistRepository;
    private final GeoLocationRepository geoLocationRepository;

    // ==================== Two Factor Auth ====================

    @Transactional
    public TwoFactorAuth enable2FA(String userId, String secretKey) {
        TwoFactorAuth auth = new TwoFactorAuth();
        auth.setUserId(userId);
        auth.setSecretKey(secretKey);
        auth.setEnabled(true);
        return twoFactorAuthRepository.save(auth);
    }

    @Transactional
    public void disable2FA(String userId) {
        twoFactorAuthRepository.findByUserId(userId).ifPresent(auth -> {
            auth.setEnabled(false);
            twoFactorAuthRepository.save(auth);
        });
    }

    public boolean is2FAEnabled(String userId) {
        return twoFactorAuthRepository.findByUserId(userId)
            .map(TwoFactorAuth::isEnabled)
            .orElse(false);
    }

    // ==================== MFA Backup Codes ====================

    @Transactional
    public List<MfaBackupCode> generateBackupCodes(String userId, int count) {
        // Delete existing unused codes
        List<MfaBackupCode> existing = mfaBackupCodeRepository.findByUserIdAndIsUsedFalse(userId);
        mfaBackupCodeRepository.deleteAll(existing);

        // Generate new codes
        List<MfaBackupCode> codes = new java.util.ArrayList<>();
        for (int i = 0; i < count; i++) {
            MfaBackupCode code = new MfaBackupCode();
            code.setUserId(userId);
            code.setBackupCode(UUID.randomUUID().toString().substring(0, 8));
            code.setUsed(false);
            codes.add(mfaBackupCodeRepository.save(code));
        }
        return codes;
    }

    public boolean validateBackupCode(String userId, String backupCode) {
        return mfaBackupCodeRepository.findByUserIdAndBackupCode(userId, backupCode)
            .map(code -> {
                if (!code.isUsed()) {
                    code.setUsed(true);
                    mfaBackupCodeRepository.save(code);
                    return true;
                }
                return false;
            })
            .orElse(false);
    }

    // ==================== Device Management ====================

    @Transactional
    public DeviceInfo registerDevice(String userId, String deviceId, String deviceName, String deviceType) {
        DeviceInfo device = new DeviceInfo();
        device.setUserId(userId);
        device.setDeviceId(deviceId);
        device.setDeviceName(deviceName);
        device.setDeviceType(deviceType);
        device.setTrusted(false);
        device.setLastUsed(LocalDateTime.now());
        return deviceInfoRepository.save(device);
    }

    @Transactional
    public void trustDevice(String userId, String deviceId) {
        deviceInfoRepository.findByUserIdAndDeviceId(userId, deviceId).ifPresent(device -> {
            device.setTrusted(true);
            deviceInfoRepository.save(device);
        });
    }

    public List<DeviceInfo> getUserDevices(String userId) {
        return deviceInfoRepository.findByUserId(userId);
    }

    public boolean isDeviceTrusted(String userId, String deviceId) {
        return deviceInfoRepository.findByUserIdAndDeviceId(userId, deviceId)
            .map(DeviceInfo::isTrusted)
            .orElse(false);
    }

    // ==================== Security Questions ====================

    public List<SecurityQuestion> getAllSecurityQuestions() {
        return securityQuestionRepository.findByIsActiveTrue();
    }

    @Transactional
    public UserAnswer saveUserAnswer(String userId, UUID questionId, String answer) {
        UserAnswer userAnswer = new UserAnswer();
        userAnswer.setUserId(userId);
        userAnswer.setQuestionId(questionId);
        userAnswer.setAnswer(answer);
        return userAnswerRepository.save(userAnswer);
    }

    public List<UserAnswer> getUserAnswers(String userId) {
        return userAnswerRepository.findByUserId(userId);
    }

    // ==================== IP Whitelist ====================

    @Transactional
    public IpWhitelist addIpToWhitelist(String ipAddress, String description) {
        IpWhitelist ip = new IpWhitelist();
        ip.setIpAddress(ipAddress);
        ip.setDescription(description);
        ip.setActive(true);
        return ipWhitelistRepository.save(ip);
    }

    @Transactional
    public void removeIpFromWhitelist(String ipAddress) {
        ipWhitelistRepository.findByIpAddress(ipAddress).ifPresent(ip -> {
            ip.setActive(false);
            ipWhitelistRepository.save(ip);
        });
    }

    public boolean isIpWhitelisted(String ipAddress) {
        return ipWhitelistRepository.findByIpAddress(ipAddress)
            .map(IpWhitelist::isActive)
            .orElse(false);
    }

    // ==================== GeoLocation ====================

    @Transactional
    public GeoLocation saveGeoLocation(String userId, String ipAddress, String country, String city,
                                       Double latitude, Double longitude) {
        GeoLocation location = new GeoLocation();
        location.setUserId(userId);
        location.setIpAddress(ipAddress);
        location.setCountry(country);
        location.setCity(city);
        location.setLatitude(latitude);
        location.setLongitude(longitude);
        return geoLocationRepository.save(location);
    }

    public List<GeoLocation> getUserGeoLocations(String userId) {
        return geoLocationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}
