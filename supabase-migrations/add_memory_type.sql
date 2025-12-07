-- Add memory_type column to memories table
-- 1 = memory/interaction (personal/experiential)
-- 2 = conversation (dialogue/discussion notes)

ALTER TABLE memories 
ADD COLUMN memory_type INTEGER DEFAULT 1;

-- Add comment to document the field
COMMENT ON COLUMN memories.memory_type IS '1=memory/interaction, 2=conversation';

-- Create index for faster filtering
CREATE INDEX idx_memories_memory_type ON memories(memory_type);
