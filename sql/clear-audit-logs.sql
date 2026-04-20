-- ============================================
-- Clear Audit Logs Data
-- ============================================

-- First, get current count of audit logs
SELECT COUNT(*) AS current_audit_log_count FROM audit_logs;

-- Delete all audit logs data
DELETE FROM audit_logs;

-- Reset the auto-increment sequence back to 1
ALTER SEQUENCE audit_logs_id_seq RESTART WITH 1;

-- Verify the table is now empty
SELECT COUNT(*) AS remaining_audit_log_count FROM audit_logs;

-- Log that audit logs were cleared
INSERT INTO audit_logs (user_name, user_role, action, module, description, ip_address, status)
VALUES ('System', 'admin', 'Clear', 'Audit Logs', 'All audit logs have been cleared from the database', '127.0.0.1', 'success');