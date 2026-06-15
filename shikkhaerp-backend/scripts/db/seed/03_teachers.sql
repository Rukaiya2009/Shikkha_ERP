-- ============================================
-- TEACHERS SEED DATA (10 rows)
-- ============================================

INSERT INTO teachers (id, teacher_id, name, designation, qualification, phone, email, joining_date, active, created_at, updated_at) VALUES 
(uuid_generate_v4(), 'TCH2024001', 'John Smith', 'Senior Teacher', 'MSc in Mathematics', '01710000021', 'john@school.com', '2020-01-15', true, NOW(), NOW()),
(uuid_generate_v4(), 'TCH2024002', 'Sarah Johnson', 'English Teacher', 'MA in English', '01710000022', 'sarah@school.com', '2020-02-20', true, NOW(), NOW()),
(uuid_generate_v4(), 'TCH2024003', 'Mike Brown', 'Science Teacher', 'MSc in Physics', '01710000023', 'mike@school.com', '2020-03-10', true, NOW(), NOW()),
(uuid_generate_v4(), 'TCH2024004', 'Lisa Davis', 'History Teacher', 'MA in History', '01710000024', 'lisa@school.com', '2020-04-05', true, NOW(), NOW()),
(uuid_generate_v4(), 'TCH2024005', 'David Wilson', 'Geography Teacher', 'MA in Geography', '01710000025', 'david@school.com', '2020-05-12', true, NOW(), NOW()),
(uuid_generate_v4(), 'TCH2024006', 'Emma Taylor', 'Biology Teacher', 'MSc in Biology', '01710000026', 'emma@school.com', '2020-06-18', true, NOW(), NOW()),
(uuid_generate_v4(), 'TCH2024007', 'James Anderson', 'Chemistry Teacher', 'MSc in Chemistry', '01710000027', 'james@school.com', '2020-07-22', true, NOW(), NOW()),
(uuid_generate_v4(), 'TCH2024008', 'Maria Garcia', 'Physics Teacher', 'MSc in Physics', '01710000028', 'maria@school.com', '2020-08-30', true, NOW(), NOW()),
(uuid_generate_v4(), 'TCH2024009', 'Robert Martinez', 'Computer Teacher', 'MSc in CS', '01710000029', 'robert@school.com', '2020-09-14', true, NOW(), NOW()),
(uuid_generate_v4(), 'TCH2024010', 'Jennifer Lee', 'Art Teacher', 'BFA in Fine Arts', '01710000030', 'jennifer@school.com', '2020-10-25', true, NOW(), NOW());