-- Refactor agenda items from separate table to JSONB array in meetings table
-- This reduces database rows and improves scalability

-- Add agenda_items column to meetings table as JSONB array
ALTER TABLE meetings
ADD COLUMN IF NOT EXISTS agenda_items JSONB DEFAULT '[]';

COMMENT ON COLUMN meetings.agenda_items IS 'Array of agenda items with order. Format: [{"id": "uuid", "title": "...", "order": 0}]. Replaces meeting_agenda_items table.';

-- Note: We are NOT dropping the meeting_agenda_items table yet
-- Run a data migration first to move existing data if needed
-- DROP TABLE meeting_agenda_items; -- Uncomment after data migration
