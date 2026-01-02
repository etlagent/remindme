-- Remove priority field from existing key_ideas JSONB data
-- This will strip the "priority" key from all key ideas objects in the array

UPDATE meetings
SET key_ideas = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', elem->>'id',
      'text', elem->>'text',
      'order', (elem->>'order')::int
    )
  )
  FROM jsonb_array_elements(key_ideas) AS elem
)
WHERE key_ideas IS NOT NULL 
  AND key_ideas != '[]'::jsonb
  AND jsonb_array_length(key_ideas) > 0;

COMMENT ON COLUMN meetings.key_ideas IS 'Array of key points/messages with order. Format: [{"id": "uuid", "text": "...", "order": 0}]. Ordered by drag-and-drop. Used by AI to generate conversation strategies.';
