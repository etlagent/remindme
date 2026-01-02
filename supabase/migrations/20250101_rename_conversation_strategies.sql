-- Rename conversation_strategies to meeting_conversation_strategies_active
-- for alphabetical grouping with other meeting tables

ALTER TABLE conversation_strategies 
RENAME TO meeting_conversation_strategies_active;

-- Update indexes
ALTER INDEX IF EXISTS idx_conversation_strategies_business_id 
RENAME TO idx_meeting_conversation_strategies_active_business_id;

ALTER INDEX IF EXISTS idx_conversation_strategies_user_id 
RENAME TO idx_meeting_conversation_strategies_active_user_id;

ALTER INDEX IF EXISTS idx_conversation_strategies_meeting_id 
RENAME TO idx_meeting_conversation_strategies_active_meeting_id;
