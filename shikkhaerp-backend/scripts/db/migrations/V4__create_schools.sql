CREATE TABLE IF NOT EXISTS schools (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(100) NOT NULL UNIQUE,
    address VARCHAR(500),
    phone VARCHAR(50),
    email VARCHAR(255),
    logo VARCHAR(500),
    status VARCHAR(50) DEFAULT 'PENDING',
    subscription_plan VARCHAR(50),
    subscription_expiry TIMESTAMP,
    established_year INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Insert sample schools
INSERT INTO schools (id, name, code, address, phone, email, status, subscription_plan, established_year, created_at, updated_at) VALUES 
('SCH001', 'Dhaka International School', 'DIS001', 'Dhaka, Bangladesh', '01710000001', 'info@dis.edu.bd', 'ACTIVE', 'PREMIUM', 2005, NOW(), NOW()),
('SCH002', 'Chittagong Grammar School', 'CGS002', 'Chittagong, Bangladesh', '01710000002', 'info@cgs.edu.bd', 'ACTIVE', 'STANDARD', 2010, NOW(), NOW()),
('SCH003', 'Rajshahi Cadet School', 'RCS003', 'Rajshahi, Bangladesh', '01710000003', 'info@rcs.edu.bd', 'ACTIVE', 'BASIC', 2015, NOW(), NOW()),
('SCH004', 'Sylhet International School', 'SIS004', 'Sylhet, Bangladesh', '01710000004', 'info@sis.edu.bd', 'ACTIVE', 'BASIC', 2018, NOW(), NOW()),
('SCH005', 'Khulna Public School', 'KPS005', 'Khulna, Bangladesh', '01710000005', 'info@kps.edu.bd', 'INACTIVE', 'TRIAL', 2020, NOW(), NOW());
