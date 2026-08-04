package com.shikkhaerp.modules.auth.service;

import com.shikkhaerp.modules.auth.entity.LoginHistory;
import com.shikkhaerp.modules.auth.repository.LoginHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Unchanged from your version except for the two methods at the bottom —
 * getRecentLogins(limit) and getAllLogins() — which LoginHistoryController
 * needs and which did not exist. Everything above is byte-for-byte yours.
 *
 * The unused `java.util.UUID` import that the compiler was warning about has
 * been dropped while we were here.
 */
@Service
@RequiredArgsConstructor
public class LoginHistoryService {

    private final LoginHistoryRepository loginHistoryRepository;

    @Transactional
    public LoginHistory recordLogin(String userId, String email, String ipAddress,
                                    String userAgent, boolean success, String failureReason) {
        LoginHistory history = new LoginHistory();
        history.setUserId(userId);
        history.setEmail(email);
        history.setIpAddress(ipAddress);
        history.setUserAgent(userAgent);
        history.setSuccess(success);
        history.setFailureReason(failureReason);
        history.setLoginTime(LocalDateTime.now());
        return loginHistoryRepository.save(history);
    }

    public List<LoginHistory> getUserLoginHistory(String userId) {
        return loginHistoryRepository.findByUserIdOrderByLoginTimeDesc(userId);
    }

    public List<LoginHistory> getUserLoginHistoryByEmail(String email) {
        return loginHistoryRepository.findByEmailOrderByLoginTimeDesc(email);
    }

    public List<LoginHistory> getLoginHistoryByDateRange(LocalDateTime start, LocalDateTime end) {
        return loginHistoryRepository.findByDateRange(start, end);
    }

    public long countFailedLogins(String email, LocalDateTime since) {
        return loginHistoryRepository.countFailedLogins(email, since);
    }

    /* ───────────────────────── added for the console ───────────────────────── */

    /**
     * Newest first, capped. Uses a Pageable so the LIMIT happens in Postgres
     * rather than pulling the whole table into memory and trimming it here —
     * which matters as soon as the table has real volume.
     */
    public List<LoginHistory> getRecentLogins(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 5000));
        return loginHistoryRepository
                .findAll(PageRequest.of(0, safeLimit, Sort.by(Sort.Direction.DESC, "loginTime")))
                .getContent();
    }

    /** Every record, newest first. Unbounded — prefer getRecentLogins in a UI. */
    public List<LoginHistory> getAllLogins() {
        return loginHistoryRepository.findAll(Sort.by(Sort.Direction.DESC, "loginTime"));
    }
}
