-- Add original_query field to store the query/instructions for refresh
ALTER TABLE research_results 
ADD COLUMN IF NOT EXISTS original_query TEXT;

-- Add context_selections to store which context was used
ALTER TABLE research_results 
ADD COLUMN IF NOT EXISTS context_selections JSONB DEFAULT '{}'::jsonb;

-- This allows refresh to re-run with the exact same query and context
