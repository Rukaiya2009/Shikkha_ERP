package com.shikkhaerp.modules.school.repository;

import com.shikkhaerp.modules.school.entity.School;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SchoolRepository extends JpaRepository<School, String> {
    Optional<School> findByCode(String code);
    List<School> findByStatus(School.SchoolStatus status);
    long countByStatus(School.SchoolStatus status);
}
