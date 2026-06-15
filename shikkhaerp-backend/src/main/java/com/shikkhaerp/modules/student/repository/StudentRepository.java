package com.shikkhaerp.modules.student.repository;

import com.shikkhaerp.modules.student.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, String> {
    
    List<Student> findByActiveTrue();
    long countByActiveTrue();
    
    @Query("SELECT COUNT(s) FROM Student s WHERE s.createdAt BETWEEN :start AND :end")
    long countByCreatedAtBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    @Query("SELECT COUNT(s) FROM Student s WHERE s.gender = :gender")
    long countByGender(@Param("gender") Student.Gender gender);
    
    @Query("SELECT COUNT(s) FROM Student s WHERE s.className = :className")
    long countByClassName(@Param("className") String className);
    
    @Query("SELECT s FROM Student s WHERE " +
           "(:name IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:className IS NULL OR s.className = :className) AND " +
           "(:phone IS NULL OR s.phone = :phone)")
    List<Student> searchStudents(@Param("name") String name, 
                                  @Param("className") String className, 
                                  @Param("phone") String phone);
    
    boolean existsByRollNumberAndClassName(String rollNumber, String className);
}
