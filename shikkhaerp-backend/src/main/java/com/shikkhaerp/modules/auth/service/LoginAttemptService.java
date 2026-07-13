package com.shikkhaerp.modules.auth.service;

import com.shikkhaerp.modules.user.entity.User;
import com.shikkhaerp.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

// Records failed logins in a SEPARATE transaction (REQUIRES_NEW).
// AuthService.login() is @Transactional and rethrows on bad credentials, which
// rolls back everything it did — including any attempt counter it saved. So the
// counter must be committed independently, or the account can never reach 5 and
// will never lock.
@Slf4j
@Service
@RequiredArgsConstructor
public class LoginAttemptService {

    private final UserRepository userRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordFailure(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.recordLoginFailure();
            userRepository.save(user);
            log.warn("Failed login for {} — attempt {} of 5{}",
                    email,
                    user.getLoginAttempts(),
                    user.isLocked() ? " — ACCOUNT NOW LOCKED for 30 minutes" : "");
        });
    }
}
