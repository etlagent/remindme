-- Create research_results table for storing persistent research data per person
CREATE TABLE IF NOT EXISTS research_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Type of research: 'interest', 'company', 'tech_stack'
  type TEXT NOT NULL,
  
  -- Topic/title (e.g., 'Michigan Football', 'Acme Corp', 'Tech Stack')
  topic TEXT NOT NULL,
  
  -- Summary/overview text
  summary TEXT,
  
  -- Flexible JSON data for type-specific information
  data JSONB DEFAULT '{}'::jsonb,
  
  -- Array of links with source, url, label
  links JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT research_results_type_check CHECK (type IN ('interest', 'company', 'tech_stack'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_research_results_person_id ON research_results(person_id);
CREATE INDEX IF NOT EXISTS idx_research_results_user_id ON research_results(user_id);
CREATE INDEX IF NOT EXISTS idx_research_results_type ON research_results(type);

-- Enable Row Level Security
ALTER TABLE research_results ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own research results"
  ON research_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own research results"
  ON research_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own research results"
  ON research_results FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own research results"
  ON research_results FOR DELETE
  USING (auth.uid() = user_id);
