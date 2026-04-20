-- ============================================
-- Seed Script - Create test resident accounts
-- ============================================

-- Delete all existing residents first (optional - for clean seeding)
-- DELETE FROM residents;

-- Create Resident 1: Block 1, Lot 1
INSERT INTO residents (username, passwords, full_name, lot_number, block, phase, email, phone, role, status)
VALUES (
  'resident_1', 
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 
  'Juan Dela Cruz', 
  '1', 
  '1', 
  '1', 
  'juan@email.com', 
  '09123456789', 
  'homeowner', 
  'active'
);

-- Create Resident 2: Block 1, Lot 2
INSERT INTO residents (username, passwords, full_name, lot_number, block, phase, email, phone, role, status)
VALUES (
  'resident_2', 
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 
  'Maria Santos', 
  '2', 
  '1', 
  '1', 
  'maria@email.com', 
  '09123456790', 
  'homeowner', 
  'active'
);

-- ============================================
-- Test Credentials Reference
-- ============================================
-- Admin:   username: admin,    password: admin123
-- Staff:   username: staff,    password: staff123
-- Resident 1: username: resident_1, password: user123 (Block 1, Lot 1)
-- Resident 2: username: resident_2, password: user123 (Block 1, Lot 2)
-- 
-- Note: Password hashes above are for 'user123'
-- If you need different passwords, generate new bcrypt hashes
