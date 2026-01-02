-- Drop the single column approach if it exists
ALTER TABLE meetings DROP COLUMN IF EXISTS previous_meeting_id;

-- Create junction table for multiple previous meetings
CREATE TABLE IF NOT EXISTS meeting_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  related_meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  relationship_type TEXT DEFAULT 'previous', -- 'previous', 'related', 'follow-up'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(meeting_id, related_meeting_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_meeting_relationships_meeting_id ON meeting_relationships(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_relationships_related_meeting_id ON meeting_relationships(related_meeting_id);

-- RLS Policies
ALTER TABLE meeting_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their meeting relationships"
  ON meeting_relationships FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM meetings 
      WHERE meetings.id = meeting_relationships.meeting_id 
      AND meetings.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert their meeting relationships"
  ON meeting_relationships FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings 
      WHERE meetings.id = meeting_relationships.meeting_id 
      AND meetings.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete their meeting relationships"
  ON meeting_relationships FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM meetings 
      WHERE meetings.id = meeting_relationships.meeting_id 
      AND meetings.user_id::text = auth.uid()::text
    )
  );

-- Add comment
COMMENT ON TABLE meeting_relationships IS 'Junction table for linking meetings together (previous meetings, related meetings, etc)';
