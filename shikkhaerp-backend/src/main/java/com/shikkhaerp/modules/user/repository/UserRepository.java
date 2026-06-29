package com.shikkhaerp.modules.user.repository;

import com.shikkhaerp.modules.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    
    // ===== Basic Queries =====
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByEmailAndEnabledTrue(String email);
    
    boolean existsByEmail(String email);
    
    // ===== Find by Role =====
    
    List<User> findByRole(User.UserRole role);
    
    Page<User> findByRole(User.UserRole role, Pageable pageable);
    
    // ===== Find by Status =====
    
    List<User> findByStatus(User.UserStatus status);
    
    Page<User> findByStatus(User.UserStatus status, Pageable pageable);
    
    // ===== Find by Role and Status =====
    
    Page<User> findByRoleAndStatus(User.UserRole role, User.UserStatus status, Pageable pageable);
    
    // ===== Search by Name (for UserService) =====
    
    @Query("SELECT u FROM User u WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<User> searchByName(@Param("name") String name);
    
    // ===== Search by Keyword =====
    
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<User> searchUsers(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<User> searchUsersList(@Param("keyword") String keyword);
    
    // ===== Count Queries =====
    
    long countByRole(User.UserRole role);
    
    long countByStatus(User.UserStatus status);
    
    long countBySchoolId(String schoolId);
    
    long countByEmailVerified(boolean emailVerified);
    
    // ===== Find by Email Verification Status =====
    
    List<User> findByEmailVerified(boolean emailVerified);
    
    // ===== Find by School/Tenant (Multi-tenant support) =====
    
    List<User> findBySchoolId(String schoolId);
    
    Page<User> findBySchoolId(String schoolId, Pageable pageable);
    
    // ===== Find Recent Users =====
    
    List<User> findTop10ByOrderByCreatedAtDesc();
    
    @Query("SELECT u FROM User u ORDER BY u.createdAt DESC")
    Page<User> findRecentUsers(Pageable pageable);
    
    // ===== Find by Verification Token =====
    
    Optional<User> findByEmailVerificationToken(String token);
    
    // ===== Check if email is verified =====
    
    boolean existsByEmailAndEmailVerifiedTrue(String email);
    
    // ===== ADD THESE METHODS FOR COMPATIBILITY =====
    
    /**
     * Find user by email - used by CustomUserDetailsService
     */
    Optional<User> findUserByEmail(String email);
    
    /**
     * Count active users (for dashboard)
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.status = 'ACTIVE'")
    long countActiveUsers();
    
    /**
     * Get users by status with custom sorting
     */
    @Query("SELECT u FROM User u WHERE u.status = :status ORDER BY u.createdAt DESC")
    List<User> findByStatusOrderByCreatedAtDesc(@Param("status") User.UserStatus status);
    
    /**
     * Find users with specific role (used by UserService for role-based operations)
     */
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.status = 'ACTIVE'")
    List<User> findActiveUsersByRole(@Param("role") User.UserRole role);
    
    /**
     * Count users by school (if schoolId is not null)
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.schoolId IS NOT NULL")
    long countUsersWithSchool();
    
    /**
     * Count users by status and role combination
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.status = :status AND u.role = :role")
    long countByStatusAndRole(@Param("status") User.UserStatus status, @Param("role") User.UserRole role);
    
    /**
     * Find users with login attempts exceeded (for security)
     */
    @Query("SELECT u FROM User u WHERE u.loginAttempts >= 5 AND u.lockedUntil IS NOT NULL")
    List<User> findLockedUsers();
    
    /**
     * Search users by name or email (used by UserService)
     */
    @Query("SELECT u FROM User u WHERE " +
           "(:keyword IS NULL OR LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:status IS NULL OR u.status = :status) AND " +
           "(:schoolId IS NULL OR u.schoolId = :schoolId)")
    Page<User> findUsersWithFilters(
            @Param("keyword") String keyword,
            @Param("role") User.UserRole role,
            @Param("status") User.UserStatus status,
            @Param("schoolId") String schoolId,
            Pageable pageable
    );
}