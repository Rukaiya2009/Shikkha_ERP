//cat > src/main/java/com/shikkhaerp/modules/auth/repository/UserAnswerRepository.java << 'EOF'
package com.shikkhaerp.modules.auth.repository;

import com.shikkhaerp.modules.auth.entity.UserAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserAnswerRepository extends JpaRepository<UserAnswer, UUID> {
    List<UserAnswer> findByUserId(String userId);
}
