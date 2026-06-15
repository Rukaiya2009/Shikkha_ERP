-- ============================================
-- RUN ALL SEED DATA
-- Run this file to insert all seed data
-- ============================================

\echo '=== Seeding Users ==='
\i 01_users.sql

\echo '=== Seeding Students ==='
\i 02_students.sql

\echo '=== Seeding Teachers ==='
\i 03_teachers.sql

\echo '✅ All seed data inserted successfully!'