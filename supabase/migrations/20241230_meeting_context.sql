-- ============================================================================
-- MEETING_CONTEXT_SNAPSHOTS TABLE
-- Stores saved versions of meeting context for comparison and regeneration
-- ============================================================================
CREATE TABLE IF NOT EXISTS meeting_context_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  
  -- Snapshot metadata
  name TEXT, -- User-given name (e.g., "Initial Context", "Updated with feedback")
  version_number INTEGER NOT NULL, -- Auto-incrementing version (1, 2, 3...)
  is_active BOOLEAN DEFAULT false, -- Currently active/working version
  
  -- Context fields stored as JSONB array
  -- [{"field_id": "...", "label": "...", "value": "...", "field_order": 1, ...}, ...]
  fields JSONB NOT NULL DEFAULT '[]',
  
  meeting_type TEXT, -- 'qualification', 'sales', 'partnership', etc.
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MEETING_CONTEXT TABLE (Working/Active Context)
-- Stores current working context fields (auto-saved as user types)
-- ============================================================================
CREATE TABLE IF NOT EXISTS meeting_context (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  snapshot_id UUID REFERENCES meeting_context_snapshots(id) ON DELETE SET NULL, -- Link to snapshot if restored
  
  -- Field identification
  field_id TEXT NOT NULL, -- 'current_situation', 'what_we_know', 'custom_1234567890', etc.
  field_order INTEGER NOT NULL, -- Order in which fields are displayed
  
  -- Field content (both editable)
  label TEXT NOT NULL, -- Field title/name (e.g., "Current Situation", "What We Know")
  value TEXT, -- Field content/description
  placeholder TEXT, -- Placeholder text for empty fields
  
  -- Field type tracking
  is_custom BOOLEAN DEFAULT false, -- true for custom fields, false for default template fields
  meeting_type TEXT, -- 'qualification', 'sales', 'partnership', etc. (for template fields)
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
-- Snapshot indexes
CREATE INDEX IF NOT EXISTS idx_meeting_context_snapshots_meeting_id ON meeting_context_snapshots(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_context_snapshots_active ON meeting_context_snapshots(meeting_id, is_active);
CREATE INDEX IF NOT EXISTS idx_meeting_context_snapshots_version ON meeting_context_snapshots(meeting_id, version_number);

-- Working context indexes
CREATE INDEX IF NOT EXISTS idx_meeting_context_meeting_id ON meeting_context(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_context_order ON meeting_context(meeting_id, field_order);
CREATE INDEX IF NOT EXISTS idx_meeting_context_meeting_type ON meeting_context(meeting_type);
CREATE INDEX IF NOT EXISTS idx_meeting_context_snapshot_id ON meeting_context(snapshot_id);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================
-- Snapshot policies
ALTER TABLE meeting_context_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their meeting context snapshots"
  ON meeting_context_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_context_snapshots.meeting_id
      AND meetings.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert their meeting context snapshots"
  ON meeting_context_snapshots FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_context_snapshots.meeting_id
      AND meetings.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update their meeting context snapshots"
  ON meeting_context_snapshots FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_context_snapshots.meeting_id
      AND meetings.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete their meeting context snapshots"
  ON meeting_context_snapshots FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_context_snapshots.meeting_id
      AND meetings.user_id::text = auth.uid()::text
    )
  );

-- Working context policies
ALTER TABLE meeting_context ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their meeting context"
  ON meeting_context FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_context.meeting_id
      AND meetings.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert their meeting context"
  ON meeting_context FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_context.meeting_id
      AND meetings.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update their meeting context"
  ON meeting_context FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_context.meeting_id
      AND meetings.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete their meeting context"
  ON meeting_context FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_context.meeting_id
      AND meetings.user_id::text = auth.uid()::text
    )
  );

-- ============================================================================
-- TRIGGER FOR UPDATED_AT
-- ============================================================================
CREATE OR REPLACE FUNCTION update_meeting_context_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_meeting_context_snapshots_updated_at
  BEFORE UPDATE ON meeting_context_snapshots
  FOR EACH ROW
  EXECUTE FUNCTION update_meeting_context_updated_at();

CREATE TRIGGER trigger_update_meeting_context_updated_at
  BEFORE UPDATE ON meeting_context
  FOR EACH ROW
  EXECUTE FUNCTION update_meeting_context_updated_at();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE meeting_context_snapshots IS 'Saved versions of meeting context for comparison and regeneration. Users can save multiple snapshots and restore them later.';
COMMENT ON COLUMN meeting_context_snapshots.name IS 'User-given name for this context version (e.g., "Initial Context", "Updated with feedback")';
COMMENT ON COLUMN meeting_context_snapshots.version_number IS 'Auto-incrementing version number for ordering';
COMMENT ON COLUMN meeting_context_snapshots.is_active IS 'True if this is the currently active/working context';
COMMENT ON COLUMN meeting_context_snapshots.fields IS 'JSONB array of context fields with all their metadata';

COMMENT ON TABLE meeting_context IS 'Current working context fields (auto-saved). Each row represents one context card.';
COMMENT ON COLUMN meeting_context.field_id IS 'Unique identifier for the field type (e.g., current_situation, custom_1234567890)';
COMMENT ON COLUMN meeting_context.label IS 'User-editable field title (e.g., "Current Situation", "Their Pain Points")';
COMMENT ON COLUMN meeting_context.value IS 'User-entered content/description for this context field';
COMMENT ON COLUMN meeting_context.is_custom IS 'True if user created this field, false if from meeting type template';
COMMENT ON COLUMN meeting_context.meeting_type IS 'Meeting type this field belongs to (qualification, sales, partnership, etc.)';
COMMENT ON COLUMN meeting_context.snapshot_id IS 'Link to snapshot if this context was restored from a saved version';
