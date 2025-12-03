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

-- Add display_order column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS display_order INTEGER;

UPDATE events 
SET display_order = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) - 1 as row_num
  FROM events
) AS subquery
WHERE events.id = subquery.id;

-- Add display_order column to follow_ups table
ALTER TABLE follow_ups ADD COLUMN IF NOT EXISTS display_order INTEGER;

UPDATE follow_ups 
SET display_order = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) - 1 as row_num
  FROM follow_ups
) AS subquery
WHERE follow_ups.id = subquery.id;
