-- ===============================
-- DATABASE CREATION
-- ===============================

CREATE DATABASE IF NOT EXISTS accounting_system;
USE accounting_system;

-- ===============================
-- 1. ROLES & USERS
-- ===============================

CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(150) UNIQUE,
    full_name VARCHAR(150),
    phone VARCHAR(50),
    department VARCHAR(100),
    role VARCHAR(50) DEFAULT 'Client',
    status ENUM('Active','Inactive','Pending') DEFAULT 'Active',
    avatar VARCHAR(255),
    last_login TIMESTAMP NULL,
    login_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

CREATE TABLE user_profiles (
    profile_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    address VARCHAR(255),
    phone VARCHAR(50),
    avatar_url VARCHAR(255),
    bio TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===============================
-- 2. TASKS & ASSIGNMENTS
-- ===============================

CREATE TABLE tasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    created_by INT,
    deadline DATE,
    status ENUM('not_started','in_progress','on_hold','done','archived') DEFAULT 'not_started',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE task_assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT,
    assigned_to INT,
    assigned_by INT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('assigned','in_progress','done','late') DEFAULT 'assigned',
    FOREIGN KEY (task_id) REFERENCES tasks(task_id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (assigned_by) REFERENCES users(id)
);

-- ===============================
-- 3. PROOFS & VERIFICATION
-- ===============================

CREATE TABLE proofs (
    proof_id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT,
    file_url VARCHAR(255),
    uploaded_by INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    FOREIGN KEY (assignment_id) REFERENCES task_assignments(assignment_id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- ===============================
-- 4. NOTIFICATIONS & ANNOUNCEMENTS
-- ===============================

CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    message TEXT,
    type ENUM('info','warning','success','error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE announcements (
    announcement_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    content TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ===============================
-- 5. REPORTS & LOGS
-- ===============================

CREATE TABLE reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    generated_by INT,
    type ENUM('system','task','performance') DEFAULT 'system',
    file_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by) REFERENCES users(id)
);

CREATE TABLE audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255),
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ===============================
-- 6. ARCHIVES & SETTINGS
-- ===============================

CREATE TABLE archives (
    archive_id INT AUTO_INCREMENT PRIMARY KEY,
    original_table VARCHAR(50),
    original_id INT,
    data JSON,
    archived_by INT,
    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason TEXT,
    FOREIGN KEY (archived_by) REFERENCES users(id)
);

CREATE TABLE settings (
    setting_id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ===============================
-- 7. OPTIONAL CLIENT MANAGEMENT
-- ===============================

CREATE TABLE clients (
    client_id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255),
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active','inactive') DEFAULT 'active',
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE client_tasks (
    client_task_id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT,
    task_id INT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(client_id),
    FOREIGN KEY (task_id) REFERENCES tasks(task_id)
);

-- Client Documents table
CREATE TABLE client_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    category ENUM('financial', 'tax', 'contracts', 'receipts', 'other') DEFAULT 'other',
    file_extension VARCHAR(10) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'deleted') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===============================
-- 8. INSERT SAMPLE DATA
-- ===============================

-- Insert roles
INSERT INTO roles (role_name, description) VALUES
('admin', 'Full system administrator with all permissions'),
('co-admin', 'Co-administrator with limited permissions'),
('client', 'Client user with restricted access');

-- Insert Admin User (1 only)
INSERT INTO users (role_id, username, password, email, full_name, role, status) VALUES
(1, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@accounting.com', 'System Administrator', 'admin', 'Active');

-- Insert Co-Admin User (1 only)
INSERT INTO users (role_id, username, password, email, full_name, role, status) VALUES
(2, 'coadmin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'coadmin@accounting.com', 'Co-Administrator', 'co-admin', 'Active');

-- Insert Client User (1 only)
INSERT INTO users (role_id, username, password, email, full_name, role, status) VALUES
(3, 'client', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client@accounting.com', 'Client User', 'client', 'Active');

-- Insert user profiles (1 per role)
INSERT INTO user_profiles (user_id, address, phone, bio) VALUES
(1, '123 Admin Street, City, State 12345', '+1234567890', 'System Administrator with full access permissions'),
(2, '456 CoAdmin Ave, City, State 12345', '+1234567891', 'Co-Administrator with limited permissions'),
(3, '789 Client Blvd, City, State 12345', '+1234567892', 'Client user with restricted access');

-- Insert client record linking to user account
INSERT INTO clients (created_by, company_name, contact_person, email, phone, address) VALUES
(1, 'Sample Client Company', 'Client User', 'client@accounting.com', '+1234567892', '789 Client Blvd, City, State 12345');

-- Invoices table
CREATE TABLE invoices (
    invoice_id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    client_id INT NOT NULL,
    client_user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('Pending', 'Paid', 'Overdue', 'Cancelled') DEFAULT 'Pending',
    due_date DATE NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_date TIMESTAMP NULL,
    description TEXT,
    FOREIGN KEY (client_id) REFERENCES clients(client_id) ON DELETE CASCADE,
    FOREIGN KEY (client_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Invoice items table
CREATE TABLE invoice_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE CASCADE
);

-- Insert sample invoices
INSERT INTO invoices (invoice_number, client_id, client_user_id, amount, tax_amount, total_amount, status, due_date, created_date, description) VALUES
('INV-2024-001', 1, 3, 2500.00, 250.00, 2750.00, 'Pending', '2024-12-30', '2024-12-01', 'Monthly Accounting Services - November 2024'),
('INV-2024-002', 1, 3, 1800.00, 180.00, 1980.00, 'Paid', '2024-11-30', '2024-11-01', 'Tax Preparation Services Q3 2024'),
('INV-2024-003', 1, 3, 3200.00, 320.00, 3520.00, 'Overdue', '2024-10-15', '2024-09-15', 'Annual Financial Audit Services');

-- Insert sample invoice items
INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_amount) VALUES
(1, 'Monthly Bookkeeping Services', 1, 1500.00, 1500.00),
(1, 'Financial Statement Preparation', 1, 800.00, 800.00),
(1, 'Payroll Processing', 1, 200.00, 200.00),
(2, 'Tax Return Preparation', 1, 1200.00, 1200.00),
(2, 'Tax Planning Consultation', 2, 300.00, 600.00),
(3, 'Annual Audit Services', 1, 2500.00, 2500.00),
(3, 'Financial Analysis Report', 1, 700.00, 700.00);

-- ===============================
-- 9. SECURITY TABLES
-- ===============================

-- User sessions for secure session management
CREATE TABLE user_sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_token (session_token),
    INDEX idx_user_sessions (user_id),
    INDEX idx_expires_at (expires_at)
);

-- Add this to your existing database
CREATE TABLE email_verification_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    verification_code VARCHAR(2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    used BOOLEAN DEFAULT FALSE,
    ip_address VARCHAR(45),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_codes (user_id),
    INDEX idx_email_codes (email),
    INDEX idx_expires_at (expires_at)
);

-- Login attempts tracking for rate limiting
CREATE TABLE login_attempts (
    attempt_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50),
    ip_address VARCHAR(45),
    success BOOLEAN DEFAULT FALSE,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    failure_reason VARCHAR(255),
    INDEX idx_username (username),
    INDEX idx_ip_address (ip_address),
    INDEX idx_attempted_at (attempted_at)
);

-- Remember me tokens
CREATE TABLE user_permissions (
    permission_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    permission_name VARCHAR(100) NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by INT,
    expires_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_permission (user_id, permission_name),
    INDEX idx_user_permissions (user_id),
    INDEX idx_permission_name (permission_name)
);

-- Password reset tokens
CREATE TABLE password_resets (
    reset_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reset_token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    used BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_reset_token (reset_token),
    INDEX idx_expires_at (expires_at)
);

-- Update existing users with hashed passwords (for demo purposes)
UPDATE users SET password = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' WHERE password != '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

-- ===============================
-- 10. FEEDBACK SYSTEM
-- ===============================

-- Create feedback table
CREATE TABLE feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    rating INT(1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
    message TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    status ENUM('pending', 'reviewed', 'published', 'archived') DEFAULT 'pending',
    is_public BOOLEAN DEFAULT FALSE,
    admin_notes TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    reviewed_by INT,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_rating (rating),
    INDEX idx_submitted_at (submitted_at)
);

-- Create feedback_stats table for tracking statistics
CREATE TABLE feedback_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    total_feedback INT DEFAULT 0,
    satisfied_clients INT DEFAULT 500,
    average_rating DECIMAL(3,2) DEFAULT 4.80,
    compliance_rate INT DEFAULT 100,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert initial stats record
INSERT INTO feedback_stats (total_feedback, satisfied_clients, average_rating, compliance_rate) 
VALUES (0, 500, 4.80, 100);

-- Create public testimonials view (for displaying on website)
CREATE VIEW public_testimonials AS
SELECT 
    id,
    name,
    rating,
    message,
    submitted_at
FROM feedback 
WHERE status = 'published' AND is_public = TRUE 
ORDER BY submitted_at DESC 
LIMIT 10;
