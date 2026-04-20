-- Insert test bill with hardcoded date
INSERT INTO bills (lot_number, block, resident_name, bill_type, amount, date_issued, due_date, status)
VALUES ('99', '9', 'Test Direct', 'Monthly Dues', 999.00, CURRENT_DATE, '2026-06-01', 'pending')
RETURNING *;