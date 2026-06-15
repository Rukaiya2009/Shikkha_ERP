-- ============================================
-- USERS SEED DATA (10 rows)
-- Password for all users: 123456
-- ============================================

INSERT INTO users (id, email, password, name, phone, role, status, enabled, created_at, updated_at) VALUES 
('11111111-1111-1111-1111-111111111111', 'superadmin@shikkhaerp.com', '$2a$10$rVj5qKqKqKqKqKqKqKqKqO', 'Super Admin', '01710000001', 'SUPER_ADMIN', 'ACTIVE', true, NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'admin@school.com', '$2a$10$rVj5qKqKqKqKqKqKqKqKqO', 'School Admin', '01710000002', 'SCHOOL_ADMIN', 'ACTIVE', true, NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 'john.teacher@school.com', '$2a$10$rVj5qKqKqKqKqKqKqKqKqO', 'John Smith', '01710000003', 'TEACHER', 'ACTIVE', true, NOW(), NOW()),
('44444444-4444-4444-4444-444444444444', 'sarah.teacher@school.com', '$2a$10$rVj5qKqKqKqKqKqKqKqKqO', 'Sarah Johnson', '01710000004', 'TEACHER', 'ACTIVE', true, NOW(), NOW()),
('55555555-5555-5555-5555-555555555555', 'mike.teacher@school.com', '$2a$10$rVj5qKqKqKqKqKqKqKqKqO', 'Mike Brown', '01710000005', 'TEACHER', 'ACTIVE', true, NOW(), NOW()),
('66666666-6666-6666-6666-666666666666', 'rahim@school.com', '$2a$10$rVj5qKqKqKqKqKqKqKqKqO', 'Rahim Ahmed', '01710000006', 'STUDENT', 'ACTIVE', true, NOW(), NOW()),
('77777777-7777-7777-7777-777777777777', 'karim@school.com', '$2a$10$rVj5qKqKqKqKqKqKqKqKqO', 'Karim Hasan', '01710000007', 'STUDENT', 'ACTIVE', true, NOW(), NOW()),
('88888888-8888-8888-8888-888888888888', 'fatema@school.com', '$2a$10$rVj5qKqKqKqKqKqKqKqKqO', 'Fatema Begum', '01710000008', 'STUDENT', 'ACTIVE', true, NOW(), NOW()),
('99999999-9999-9999-9999-999999999999', 'sultana@school.com', '$2a$10$rVj5qKqKqKqKqKqKqKqKqO', 'Sultana Rahman', '01710000009', 'STUDENT', 'ACTIVE', true, NOW(), NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'hasan@school.com', '$2a$10$rVj5qKqKqKqKqKqKqKqKqO', 'Hasan Mahmud', '01710000010', 'STUDENT', 'ACTIVE', true, NOW(), NOW());