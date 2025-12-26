-- Create projects_overview table for storing Overview tab data
CREATE TABLE IF NOT EXISTS projects_overview (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects_main(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Executive Summary fields
  product_name TEXT,
  tagline TEXT,
  version TEXT,
  elevator_pitch TEXT,
  exec_summary_custom_fields JSONB DEFAULT '[]'::jsonb,
  
  -- Problem Statement fields
  the_problem TEXT,
  who_has_problem_primary TEXT,
  who_has_problem_secondary TEXT,
  market_size TEXT,
  problem_custom_fields JSONB DEFAULT '[]'::jsonb,
  
  -- Our Solution - What We're Building
  what_building TEXT,
  building_custom_fields JSONB DEFAULT '[]'::jsonb,
  
  -- Our Solution - How It Works (User Journey)
  how_it_works JSONB DEFAULT '[]'::jsonb,
  journey_custom_steps JSONB DEFAULT '[]'::jsonb,
  
  -- Our Solution - Key Differentiators
  key_differentiators JSONB DEFAULT '[]'::jsonb,
  differentiator_custom_fields JSONB DEFAULT '[]'::jsonb,
  
  -- Current Solutions & Their Failures
  competitors JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one overview per project
  UNIQUE(project_id)
);

-- Create index for faster lookups
CREATE INDEX idx_projects_overview_project_id ON projects_overview(project_id);
CREATE INDEX idx_projects_overview_user_id ON projects_overview(user_id);

-- Enable Row Level Security
ALTER TABLE projects_overview ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own project overviews
CREATE POLICY "Users can view their own project overviews"
  ON projects_overview
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own project overviews
CREATE POLICY "Users can create their own project overviews"
  ON projects_overview
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own project overviews
CREATE POLICY "Users can update their own project overviews"
  ON projects_overview
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own project overviews
CREATE POLICY "Users can delete their own project overviews"
  ON projects_overview
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_projects_overview_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER set_projects_overview_updated_at
  BEFORE UPDATE ON projects_overview
  FOR EACH ROW
  EXECUTE FUNCTION update_projects_overview_updated_at();

-- Grant permissions
GRANT ALL ON projects_overview TO authenticated;
GRANT ALL ON projects_overview TO service_role;
