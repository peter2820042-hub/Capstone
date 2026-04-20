-- ============================================
-- Migration: Link Violations -> Bills -> Payments
-- This adds the necessary columns to link:
-- Violations (fine/penalty) -> Bills (generated fines) -> Payments (pending -> paid)
-- ============================================

-- ============================================
-- Add columns to bills table to link with violations
-- ============================================
ALTER TABLE bills ADD COLUMN IF NOT EXISTS violation_id INTEGER;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS related_type VARCHAR(50);

-- ============================================
-- Add columns to payments table to link with bills
-- ============================================
ALTER TABLE payments ADD COLUMN IF NOT EXISTS bill_id INTEGER;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_type VARCHAR(50);

-- ============================================
-- Add index for faster lookups
-- ============================================
CREATE INDEX IF NOT EXISTS idx_bills_violation_id ON bills(violation_id);
CREATE INDEX IF NOT EXISTS idx_payments_bill_id ON payments(bill_id);