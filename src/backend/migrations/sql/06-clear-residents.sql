-- ============================================
-- Clear Residents Data Script
-- Run this to delete all data from the residents table
-- ============================================

-- Delete all data from residents table
DELETE FROM residents;

-- Reset the serial ID sequence to start from 1
SELECT setval('residents_id_seq', 1, false);