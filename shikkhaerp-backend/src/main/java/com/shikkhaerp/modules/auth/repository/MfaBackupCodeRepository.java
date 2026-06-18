package com.shikkhaerp.modules.auth.repository;

import com.shikkhaerp.modules.auth.entity.MfaBackupCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MfaBackupCodeRepository extends JpaRepository<MfaBackupCode, UUID> {
    List<MfaBackupCode> findByUserIdAndIsUsedFalse(String userId);
    Optional<MfaBackupCode> findByUserIdAndBackupCode(String userId, String backupCode);
    void deleteByUserId(String userId);
}