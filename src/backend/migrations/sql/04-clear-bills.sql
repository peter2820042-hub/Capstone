-- ============================================
-- Clear Bills Data Script
-- Run this to delete all data from the bills table
-- ============================================

-- Delete all data from bills table
DELETE FROM bills;

-- Reset the serial ID sequence to start from 1
SELECT setval('bills_id_seq', 1, false);