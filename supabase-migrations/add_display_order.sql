-- Add display_order column to people table for custom ordering
ALTER TABLE people ADD COLUMN IF NOT EXISTS display_order INTEGER;

-- Set initial display_order based on created_at (newest first)
UPDATE people 
SET display_order = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) - 1 as row_num
  FROM people
) AS subquery
WHERE people.id = subquery.id;
