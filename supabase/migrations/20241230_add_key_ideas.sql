-- Add key_ideas column to meetings table as JSONB array
ALTER TABLE meetings
ADD COLUMN IF NOT EXISTS key_ideas JSONB DEFAULT '[]';

COMMENT ON COLUMN meetings.key_ideas IS 'Array of key points/messages with order. Format: [{"id": "uuid", "text": "...", "order": 0}]. Ordered by drag-and-drop. Used by AI to generate conversation strategies.';
