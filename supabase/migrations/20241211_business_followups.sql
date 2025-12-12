-- ============================================================================
-- BUSINESS_FOLLOWUPS TABLE
-- Follow-up actions related to a business (not tied to specific meetings)
-- ============================================================================
CREATE TABLE IF NOT EXISTS business_followups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium', -- 'high', 'medium', 'low'
  due_date DATE,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
  completed_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  display_order INTEGER
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_business_followups_business_id ON business_followups(business_id);
CREATE INDEX IF NOT EXISTS idx_business_followups_user_id ON business_followups(user_id);
CREATE INDEX IF NOT EXISTS idx_business_followups_status ON business_followups(status);
CREATE INDEX IF NOT EXISTS idx_business_followups_due_date ON business_followups(due_date);
CREATE INDEX IF NOT EXISTS idx_business_followups_display_order ON business_followups(display_order);

-- RLS Policies
ALTER TABLE business_followups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their business followups"
  ON business_followups FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their business followups"
  ON business_followups FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their business followups"
  ON business_followups FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their business followups"
  ON business_followups FOR DELETE
  USING (auth.uid()::text = user_id::text);
