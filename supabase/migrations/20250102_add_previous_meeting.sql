-- Add previous_meeting_id to meetings table
ALTER TABLE meetings
ADD COLUMN IF NOT EXISTS previous_meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL;

-- Create index for previous meeting lookups
CREATE INDEX IF NOT EXISTS idx_meetings_previous_meeting_id ON meetings(previous_meeting_id);

-- Add comment
COMMENT ON COLUMN meetings.previous_meeting_id IS 'Reference to a previous meeting to review its summary';
