-- ============================================
-- Database Tables for Sentrina
-- ============================================

-- Table 1: admins
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  position VARCHAR(100),
  profile_image TEXT,
  status VARCHAR(50) DEFAULT 'active',
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: staffs
CREATE TABLE IF NOT EXISTS staffs (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  position VARCHAR(100),
  profile_image TEXT,
  status VARCHAR(50) DEFAULT 'active',
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 3: residents (homeowners)
CREATE TABLE IF NOT EXISTS residents (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  passwords VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  lot_number VARCHAR(50),
  block VARCHAR(50),
  phase VARCHAR(50),
  email VARCHAR(255),
  phone VARCHAR(50),
  profile_image TEXT,
  role VARCHAR(50) DEFAULT 'homeowner',
  status VARCHAR(50) DEFAULT 'active',
  date_registered DATE DEFAULT CURRENT_DATE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 4: violations
CREATE TABLE IF NOT EXISTS violations (
  id SERIAL PRIMARY KEY,
  lot_number VARCHAR(50),
  resident_name VARCHAR(255),
  violation_type VARCHAR(100),
  description TEXT,
  date_issued DATE DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'pending',
  penalty DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 5: bills (for billing)
CREATE TABLE IF NOT EXISTS bills (
  id SERIAL PRIMARY KEY,
  lot_number VARCHAR(50),
  resident_name VARCHAR(255),
  bill_type VARCHAR(100),
  bill_reference VARCHAR(100),
  billing_period VARCHAR(100),
  amount DECIMAL(10,2) NOT NULL,
  date_issued DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  status VARCHAR(50) DEFAULT 'pending',
  date_paid DATE,
  payment_method VARCHAR(50),
  amount_paid DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 6: payments
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  lot_number VARCHAR(50),
  resident_name VARCHAR(255),
  bill_reference VARCHAR(100),
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE DEFAULT CURRENT_DATE,
  payment_method VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  approved_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 7: audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_name VARCHAR(255),
  user_role VARCHAR(50),
  action VARCHAR(100),
  module VARCHAR(100),
  description TEXT,
  ip_address VARCHAR(50),
  profile_image TEXT,
  status VARCHAR(50) DEFAULT 'success',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 8: notifications (for user notifications)
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES residents(id),
  title VARCHAR(255),
  message TEXT,
  type VARCHAR(50) DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Default Admin Account
-- ============================================
INSERT INTO admins (username, email, password_hash, full_name, status) VALUES
('admin', 'admin@sentrina.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'System Administrator', 'active')
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- Default Staff Account
-- ============================================
INSERT INTO staffs (username, email, password_hash, full_name, position, status) VALUES
('staff', 'staff@sentrina.com', '$2a$10$KvTqM9uLOickgx2ZMRZoMyeLJZAacfl7p92ldGxad68LJZdL17lhWy', 'Staff Member', 'General Staff', 'active')
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- Sample Residents
-- ============================================
INSERT INTO residents (username, passwords, full_name, lot_number, block, email, phone, role, status) VALUES
('juan101', NULL, 'Juan dela Cruz', '101', 'A', 'juan@example.com', '091234567890', 'homeowner', 'active'),
('maria102', NULL, 'Maria Santos', '102', 'A', 'maria@example.com', '091234567891', 'homeowner', 'active'),
('pedro201', NULL, 'Pedro Garcia', '201', 'B', 'pedro@example.com', '091234567892', 'homeowner', 'active'),
('ana202', NULL, 'Ana Reyes', '202', 'B', 'ana@example.com', '091234567893', 'homeowner', 'active')
ON CONFLICT DO NOTHING;

-- ============================================
-- Sample Violations
-- ============================================
INSERT INTO violations (lot_number, resident_name, violation_type, description, date_issued, status, penalty) VALUES
('101', 'Juan dela Cruz', 'Noise Violation', 'Loud music after 10 PM', '2026-03-15', 'pending', 500.00),
('102', 'Maria Santos', 'Illegal Parking', 'Parked in front of fire exit', '2026-03-20', 'settled', 300.00),
('201', 'Pedro Garcia', 'Garbage Violation', 'Improper waste disposal', '2026-03-25', 'pending', 200.00)
ON CONFLICT DO NOTHING;

-- ============================================
-- Sample Payments
-- ============================================
INSERT INTO payments (lot_number, resident_name, bill_reference, amount, payment_date, payment_method, status) VALUES
('102', 'Maria Santos', 'BILL-102-001', 1500.00, '2026-04-01', 'GCash', 'approved'),
('101', 'Juan dela Cruz', 'BILL-101-001', 1500.00, '2026-04-05', 'Cash', 'pending')
ON CONFLICT DO NOTHING;

-- ============================================
-- Sample Audit Logs
-- ============================================
INSERT INTO audit_logs (user_name, user_role, action, module, description, ip_address, profile_image, status) VALUES
('Peter Admin', 'admin', 'Login', 'Authentication', 'Admin logged in successfully', '127.0.0.1', NULL, 'success'),
('John Staff', 'staff', 'View', 'Residents', 'Staff viewed residents list', '127.0.0.1', NULL, 'success'),
('Peter Admin', 'admin', 'Create', 'Billing', 'Admin created new bill', '127.0.0.1', NULL, 'success')
ON CONFLICT DO NOTHING;

-- ============================================
-- Database Indexes
-- ============================================

-- Indexes for residents table
CREATE INDEX IF NOT EXISTS idx_residents_lot_number ON residents(lot_number);
CREATE INDEX IF NOT EXISTS idx_residents_block ON residents(block);
CREATE INDEX IF NOT EXISTS idx_residents_status ON residents(status);
CREATE INDEX IF NOT EXISTS idx_residents_username ON residents(username);

-- Indexes for violations table
CREATE INDEX IF NOT EXISTS idx_violations_lot_number ON violations(lot_number);
CREATE INDEX IF NOT EXISTS idx_violations_status ON violations(status);
CREATE INDEX IF NOT EXISTS idx_violations_date_issued ON violations(date_issued);

-- Indexes for bills table
CREATE INDEX IF NOT EXISTS idx_bills_lot_number ON bills(lot_number);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills(due_date);

-- Indexes for payments table
CREATE INDEX IF NOT EXISTS idx_payments_lot_number ON payments(lot_number);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);

-- Indexes for audit_logs table
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_name ON audit_logs(user_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_role ON audit_logs(user_role);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Indexes for notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);