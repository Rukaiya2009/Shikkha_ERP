package com.shikkhaerp.modules.auth.repository;

import com.shikkhaerp.modules.auth.entity.SecurityQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SecurityQuestionRepository extends JpaRepository<SecurityQuestion, UUID> {
    List<SecurityQuestion> findByIsActiveTrue();
}
