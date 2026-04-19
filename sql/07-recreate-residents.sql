-- ============================================
-- Recreate Residents Table Script
-- This will drop and recreate the residents table
-- ============================================

-- Drop the residents table if it exists
DROP TABLE IF EXISTS residents CASCADE;

-- Recreate the residents table
CREATE TABLE residents (
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

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_residents_lot_number ON residents(lot_number);
CREATE INDEX IF NOT EXISTS idx_residents_block ON residents(block);
CREATE INDEX IF NOT EXISTS idx_residents_phase ON residents(phase);
CREATE INDEX IF NOT EXISTS idx_residents_status ON residents(status);
CREATE INDEX IF NOT EXISTS idx_residents_username ON residents(username);
