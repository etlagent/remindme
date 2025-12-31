-- ============================================================================
-- ADD RELATIONSHIP CIRCLE AND INTERACTION DETAILS TO PEOPLE TABLE
-- Created: 2024-12-28
-- Purpose: Support different types of social connections and detailed interaction logging
-- ============================================================================

-- Add relationship_circle field to categorize closeness
-- Options: 'inner_circle', 'professional', 'genuine_interest', 'acquaintance', 'brief_encounter'
ALTER TABLE people ADD COLUMN IF NOT EXISTS relationship_circle TEXT;

-- Add interaction_details field for free-form logging of any details
-- This can include: physical descriptions, conversation topics, where met, vibe, etc.
ALTER TABLE people ADD COLUMN IF NOT EXISTS interaction_details JSONB DEFAULT '[]'::jsonb;

-- Create index for filtering by relationship circle
CREATE INDEX IF NOT EXISTS idx_people_relationship_circle ON people(relationship_circle);

-- Add comments for documentation
COMMENT ON COLUMN people.relationship_circle IS 'Categorizes relationship closeness: inner_circle, professional, genuine_interest, acquaintance, brief_encounter';
COMMENT ON COLUMN people.interaction_details IS 'Array of timestamped interaction logs with any/all details about the person';

-- Example interaction_details structure:
-- [
--   {
--     "date": "2024-12-27T23:00:00Z",
--     "details": "Met at The Dive Bar. Bartender named Mike. Plays guitar in band called Velvet Noise. Irish accent, friendly vibe.",
--     "location": "The Dive Bar on Main St"
--   }
-- ]
