-- Rename conversation_steps to meeting_conversation_steps
-- for alphabetical grouping with other meeting tables

ALTER TABLE conversation_steps 
RENAME TO meeting_conversation_steps;

-- Update indexes
ALTER INDEX IF EXISTS idx_conversation_steps_strategy_id 
RENAME TO idx_meeting_conversation_steps_strategy_id;

ALTER INDEX IF EXISTS idx_conversation_steps_order 
RENAME TO idx_meeting_conversation_steps_order;
