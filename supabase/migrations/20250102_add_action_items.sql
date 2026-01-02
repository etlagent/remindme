-- Create meeting_action_items table
CREATE TABLE IF NOT EXISTS meeting_action_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  indent_level INTEGER DEFAULT 0,
  is_header BOOLEAN DEFAULT FALSE,
  completed BOOLEAN DEFAULT FALSE,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_meeting_action_items_meeting_id ON meeting_action_items(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_action_items_order ON meeting_action_items(meeting_id, order_index);

-- Enable RLS
ALTER TABLE meeting_action_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their meeting action items"
  ON meeting_action_items FOR SELECT
  USING (
    meeting_id IN (
      SELECT id FROM meetings WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their meeting action items"
  ON meeting_action_items FOR INSERT
  WITH CHECK (
    meeting_id IN (
      SELECT id FROM meetings WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their meeting action items"
  ON meeting_action_items FOR UPDATE
  USING (
    meeting_id IN (
      SELECT id FROM meetings WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their meeting action items"
  ON meeting_action_items FOR DELETE
  USING (
    meeting_id IN (
      SELECT id FROM meetings WHERE user_id = auth.uid()
    )
  );
