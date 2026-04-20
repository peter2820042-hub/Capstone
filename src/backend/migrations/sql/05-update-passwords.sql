-- ============================================
-- Update Passwords Script
-- Run this to update passwords in the database
-- ============================================

-- Update admin password (username: admin, password: admin123)
-- Note: This requires bcrypt hash generation - run via Node.js script for actual password updates
-- The passwords column stores bcrypt hashes

-- For PostgreSQL, you cannot directly execute bcrypt in SQL
-- This is a placeholder - use the Node.js script (update-passwords.js) to update passwords

-- Example of how the update would look:
-- UPDATE admins SET password_hash = '$2a$10$...' WHERE username = 'admin';
-- UPDATE staffs SET password_hash = '$2a$10$...' WHERE username = 'staff';

-- To update passwords, use the Node.js script: node src/backend/migrations/js/update-passwords.js