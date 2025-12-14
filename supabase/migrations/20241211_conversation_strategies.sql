-- ============================================================================
-- CONVERSATION_STRATEGIES TABLE
-- AI-powered conversation roadmap builder
-- ============================================================================
CREATE TABLE IF NOT EXISTS conversation_strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT,
  situation TEXT,
  goal TEXT,
  context_sources JSONB DEFAULT '[]', -- ["linkedin", "conversations", "meetings", "notes", "memories"]
  attendee_ids JSONB DEFAULT '[]', -- Array of person IDs
  clarifying_qa JSONB DEFAULT '[]', -- [{"question": "...", "answer": "..."}]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CONVERSATION_STEPS TABLE
-- Individual steps in the conversation roadmap
-- ============================================================================
CREATE TABLE IF NOT EXISTS conversation_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_id UUID NOT NULL REFERENCES conversation_strategies(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  title TEXT,
  description TEXT,
  ai_suggestion TEXT,
  user_refinement TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversation_strategies_business_id ON conversation_strategies(business_id);
CREATE INDEX IF NOT EXISTS idx_conversation_strategies_user_id ON conversation_strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_steps_strategy_id ON conversation_steps(strategy_id);
CREATE INDEX IF NOT EXISTS idx_conversation_steps_order ON conversation_steps(strategy_id, step_order);

-- RLS Policies for conversation_strategies
ALTER TABLE conversation_strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their conversation strategies"
  ON conversation_strategies FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their conversation strategies"
  ON conversation_strategies FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their conversation strategies"
  ON conversation_strategies FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their conversation strategies"
  ON conversation_strategies FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- RLS Policies for conversation_steps
ALTER TABLE conversation_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their conversation steps"
  ON conversation_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_strategies
      WHERE conversation_strategies.id = conversation_steps.strategy_id
      AND conversation_strategies.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert their conversation steps"
  ON conversation_steps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversation_strategies
      WHERE conversation_strategies.id = conversation_steps.strategy_id
      AND conversation_strategies.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update their conversation steps"
  ON conversation_steps FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversation_strategies
      WHERE conversation_strategies.id = conversation_steps.strategy_id
      AND conversation_strategies.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete their conversation steps"
  ON conversation_steps FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM conversation_strategies
      WHERE conversation_strategies.id = conversation_steps.strategy_id
      AND conversation_strategies.user_id::text = auth.uid()::text
    )
  );
