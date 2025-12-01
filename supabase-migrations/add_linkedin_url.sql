-- Add linkedin_url column to people table
ALTER TABLE people ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_people_linkedin_url ON people(linkedin_url);
