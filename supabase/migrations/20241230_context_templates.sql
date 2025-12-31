-- ============================================================================
-- CONTEXT_TEMPLATES TABLE
-- Allows users to save and reuse context configurations across meetings
-- ============================================================================
CREATE TABLE IF NOT EXISTS context_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  
  -- Template metadata
  name TEXT NOT NULL, -- e.g., "Enterprise Sales Context", "Partnership Discovery"
  description TEXT,
  meeting_type TEXT, -- 'qualification', 'sales', 'partnership', etc.
  
  -- Template fields stored as JSONB array
  -- [{"field_id": "current_situation", "label": "Current Situation", "placeholder": "...", "is_custom": false}, ...]
  fields JSONB NOT NULL DEFAULT '[]',
  
  -- Usage tracking
  use_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_context_templates_user_id ON context_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_context_templates_meeting_type ON context_templates(meeting_type);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================
ALTER TABLE context_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their context templates"
  ON context_templates FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their context templates"
  ON context_templates FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their context templates"
  ON context_templates FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their context templates"
  ON context_templates FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- ============================================================================
-- TRIGGER FOR UPDATED_AT
-- ============================================================================
CREATE TRIGGER trigger_update_context_templates_updated_at
  BEFORE UPDATE ON context_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_meeting_context_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE context_templates IS 'Reusable context field configurations that users can save and apply to multiple meetings';
COMMENT ON COLUMN context_templates.fields IS 'JSONB array of field definitions with label, placeholder, and metadata';
