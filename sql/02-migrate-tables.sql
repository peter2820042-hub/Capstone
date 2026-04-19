-- ============================================
-- Migration Script - Add missing columns to existing tables
-- ============================================

-- ============================================
-- Add columns to bills table
-- ============================================
ALTER TABLE bills ADD COLUMN IF NOT EXISTS block VARCHAR(50);
ALTER TABLE bills ADD COLUMN IF NOT EXISTS bill_reference VARCHAR(100);
ALTER TABLE bills ADD COLUMN IF NOT EXISTS billing_period VARCHAR(100);
ALTER TABLE bills ADD COLUMN IF NOT EXISTS date_paid DATE;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE bills ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2);

-- ============================================
-- Add columns to violations table
-- ============================================
ALTER TABLE violations ADD COLUMN IF NOT EXISTS block VARCHAR(50);
ALTER TABLE violations ADD COLUMN IF NOT EXISTS lot_number VARCHAR(50);

-- ============================================
-- Add columns to audit_logs table
-- ============================================
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- ============================================
-- Add columns to notifications table
-- ============================================
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'unread';

-- ============================================
-- Add columns to admins table
-- ============================================
ALTER TABLE admins ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE admins ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE admins ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE admins ADD COLUMN IF NOT EXISTS profile_image TEXT;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- ============================================
-- Add columns to staffs table
-- ============================================
ALTER TABLE staffs ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE;
ALTER TABLE staffs ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE staffs ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE staffs ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE staffs ADD COLUMN IF NOT EXISTS profile_image TEXT;
ALTER TABLE staffs ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- ============================================
-- Add columns to residents table
-- ============================================
ALTER TABLE residents ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE;
ALTER TABLE residents ADD COLUMN IF NOT EXISTS passwords VARCHAR(255);
ALTER TABLE residents ADD COLUMN IF NOT EXISTS phase VARCHAR(50);
ALTER TABLE residents ADD COLUMN IF NOT EXISTS profile_image TEXT;
ALTER TABLE residents ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- ============================================
-- Add block column to violations table (migration)
-- ============================================
-- Note: This is a separate migration for adding block to violations
-- Check if column exists first, then add if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'violations' AND column_name = 'block'
  ) THEN
    ALTER TABLE violations ADD COLUMN block VARCHAR(50);
  END IF;
END $$;