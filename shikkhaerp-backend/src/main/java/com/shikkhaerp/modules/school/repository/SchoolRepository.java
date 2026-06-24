package com.shikkhaerp.modules.school.repository;

import com.shikkhaerp.modules.school.entity.School;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SchoolRepository extends JpaRepository<School, String> {

    Optional<School> findByCode(String code);

    Optional<School> findBySubdomain(String subdomain);

    List<School> findByStatus(School.SchoolStatus status);

    long countByStatus(School.SchoolStatus status);

    boolean existsByCode(String code);

    boolean existsBySubdomain(String subdomain);
}