-- ============================================
-- STUDENTS SEED DATA (10 rows)
-- ============================================

INSERT INTO students (id, student_id, name, class_name, roll_number, phone, address, blood_group, admission_year, active, created_at, updated_at) VALUES 
(uuid_generate_v4(), 'STU2024001', 'Rahim Ahmed', 'Class 1', '101', '01710000011', 'Dhaka', 'A+', '2024', true, NOW(), NOW()),
(uuid_generate_v4(), 'STU2024002', 'Karim Hasan', 'Class 1', '102', '01710000012', 'Dhaka', 'B+', '2024', true, NOW(), NOW()),
(uuid_generate_v4(), 'STU2024003', 'Fatema Begum', 'Class 2', '201', '01710000013', 'Dhaka', 'O+', '2024', true, NOW(), NOW()),
(uuid_generate_v4(), 'STU2024004', 'Sultana Rahman', 'Class 2', '202', '01710000014', 'Dhaka', 'AB+', '2024', true, NOW(), NOW()),
(uuid_generate_v4(), 'STU2024005', 'Hasan Mahmud', 'Class 3', '301', '01710000015', 'Dhaka', 'A-', '2024', true, NOW(), NOW()),
(uuid_generate_v4(), 'STU2024006', 'Nadia Akter', 'Class 3', '302', '01710000016', 'Dhaka', 'B-', '2024', true, NOW(), NOW()),
(uuid_generate_v4(), 'STU2024007', 'Shahidul Islam', 'Class 4', '401', '01710000017', 'Dhaka', 'O-', '2024', true, NOW(), NOW()),
(uuid_generate_v4(), 'STU2024008', 'Nasrin Jahan', 'Class 4', '402', '01710000018', 'Dhaka', 'AB-', '2024', true, NOW(), NOW()),
(uuid_generate_v4(), 'STU2024009', 'Minhaz Uddin', 'Class 5', '501', '01710000019', 'Dhaka', 'A+', '2024', true, NOW(), NOW()),
(uuid_generate_v4(), 'STU2024010', 'Taslima Begum', 'Class 5', '502', '01710000020', 'Dhaka', 'B+', '2024', true, NOW(), NOW());