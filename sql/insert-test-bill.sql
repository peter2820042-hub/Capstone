-- Insert test bill with dates
INSERT INTO bills (lot_number, block, resident_name, bill_type, amount, date_issued, due_date, status)
VALUES ('1', '1', 'Test Resident', 'Monthly Dues', 500.00, '2026-04-15', '2026-05-15', 'pending')
RETURNING *;