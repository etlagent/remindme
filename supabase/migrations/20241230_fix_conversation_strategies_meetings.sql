-- ============================================================================
-- FIX CONVERSATION_STRATEGIES FOR MEETINGS SUPPORT
-- Make business_id nullable and add meeting-specific columns
-- ============================================================================

-- Make business_id nullable (for meeting-based strategies)
ALTER TABLE conversation_strategies 
  ALTER COLUMN business_id DROP NOT NULL;

-- Add meeting_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversation_strategies' 
    AND column_name = 'meeting_id'
  ) THEN
    ALTER TABLE conversation_strategies 
      ADD COLUMN meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE;
    
    CREATE INDEX IF NOT EXISTS idx_conversation_strategies_meeting_id 
      ON conversation_strategies(meeting_id);
  END IF;
END $$;

-- Add meeting_type column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversation_strategies' 
    AND column_name = 'meeting_type'
  ) THEN
    ALTER TABLE conversation_strategies 
      ADD COLUMN meeting_type TEXT;
  END IF;
END $$;

-- Ensure attendee_ids column exists (in case original migration didn't run)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversation_strategies' 
    AND column_name = 'attendee_ids'
  ) THEN
    ALTER TABLE conversation_strategies 
      ADD COLUMN attendee_ids JSONB DEFAULT '[]';
  END IF;
END $$;

-- Add constraint: either business_id or meeting_id must be set
ALTER TABLE conversation_strategies 
  DROP CONSTRAINT IF EXISTS check_business_or_meeting;

ALTER TABLE conversation_strategies 
  ADD CONSTRAINT check_business_or_meeting 
  CHECK (
    (business_id IS NOT NULL AND meeting_id IS NULL) OR 
    (business_id IS NULL AND meeting_id IS NOT NULL) OR
    (business_id IS NOT NULL AND meeting_id IS NOT NULL)
  );

-- Update RLS policies to handle both business and meeting contexts
DROP POLICY IF EXISTS "Users can view their conversation strategies" ON conversation_strategies;
CREATE POLICY "Users can view their conversation strategies"
  ON conversation_strategies FOR SELECT
  USING (
    auth.uid()::text = user_id::text
  );

DROP POLICY IF EXISTS "Users can insert their conversation strategies" ON conversation_strategies;
CREATE POLICY "Users can insert their conversation strategies"
  ON conversation_strategies FOR INSERT
  WITH CHECK (
    auth.uid()::text = user_id::text
  );

DROP POLICY IF EXISTS "Users can update their conversation strategies" ON conversation_strategies;
CREATE POLICY "Users can update their conversation strategies"
  ON conversation_strategies FOR UPDATE
  USING (
    auth.uid()::text = user_id::text
  );

DROP POLICY IF EXISTS "Users can delete their conversation strategies" ON conversation_strategies;
CREATE POLICY "Users can delete their conversation strategies"
  ON conversation_strategies FOR DELETE
  USING (
    auth.uid()::text = user_id::text
  );
