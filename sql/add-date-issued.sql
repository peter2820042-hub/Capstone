-- Add date_issued column to bills table if it doesn't exist
ALTER TABLE bills ADD COLUMN IF NOT EXISTS date_issued DATE DEFAULT CURRENT_DATE;

-- Update existing records to have date_issued = created_at date if null
UPDATE bills SET date_issued = COALESCE(date_issued, created_at::date) WHERE date_issued IS NULL;

-- Update default status to 'pending' if currently 'unpaid'
ALTER TABLE bills ALTER COLUMN status SET DEFAULT 'pending';