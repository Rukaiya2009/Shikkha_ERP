CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    student_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    class_name VARCHAR(100),
    roll_number VARCHAR(50),
    phone VARCHAR(50),
    address VARCHAR(500),
    blood_group VARCHAR(10),
    admission_year VARCHAR(10),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN DEFAULT FALSE,
    version BIGINT DEFAULT 0
);

CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_students_class_name ON students(class_name);