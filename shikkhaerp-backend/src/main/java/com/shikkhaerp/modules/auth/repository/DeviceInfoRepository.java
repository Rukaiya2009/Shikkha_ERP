package com.shikkhaerp.modules.auth.repository;

import com.shikkhaerp.modules.auth.entity.DeviceInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeviceInfoRepository extends JpaRepository<DeviceInfo, UUID> {
    List<DeviceInfo> findByUserId(String userId);
    Optional<DeviceInfo> findByUserIdAndDeviceId(String userId, String deviceId);
}
