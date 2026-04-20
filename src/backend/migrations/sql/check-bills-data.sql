-- Check bills data with date columns
SELECT id, amount, date_issued, due_date, status 
FROM bills 
ORDER BY id DESC 
LIMIT 5;