-- Add meeting_summary column to meetings table
ALTER TABLE meetings
ADD COLUMN IF NOT EXISTS meeting_summary TEXT;

COMMENT ON COLUMN meetings.meeting_summary IS 'Summary of what happened in the meeting after it concludes';
