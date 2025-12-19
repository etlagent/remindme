-- ============================================================================
-- PROJECTS FEATURE - COMPLETE STRUCTURE
-- Created: 2024-12-14
-- Purpose: Project planning, task organization, and workflow to TODO workspace
-- ============================================================================

-- ============================================================================
-- PROJECTS FOLDERS
-- Hierarchical organization for projects
-- ============================================================================
CREATE TABLE projects_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Folder details
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6B7280',
  icon TEXT DEFAULT '📂',
  
  -- Hierarchy
  parent_id UUID REFERENCES projects_folders(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX idx_projects_folders_user_id ON projects_folders(user_id);
CREATE INDEX idx_projects_folders_parent_id ON projects_folders(parent_id);

-- Updated at trigger
CREATE TRIGGER update_projects_folders_updated_at 
  BEFORE UPDATE ON projects_folders 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE projects_folders IS 'Hierarchical folders for organizing projects';


-- ============================================================================
-- PROJECTS MAIN
-- Primary projects table
-- ============================================================================
CREATE TABLE projects_main (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Project details
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'template')),
  
  -- Organization
  folder_id UUID REFERENCES projects_folders(id) ON DELETE SET NULL,
  color TEXT DEFAULT '#8B5CF6',
  icon TEXT DEFAULT '📁',
  order_index INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX idx_projects_main_user_id ON projects_main(user_id);
CREATE INDEX idx_projects_main_folder_id ON projects_main(folder_id);
CREATE INDEX idx_projects_main_status ON projects_main(status);

-- Updated at trigger
CREATE TRIGGER update_projects_main_updated_at 
  BEFORE UPDATE ON projects_main 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE projects_main IS 'Main projects table for project planning';


-- ============================================================================
-- PROJECTS TASKS
-- Tasks within projects (separate from todo_workspace for planning phase)
-- ============================================================================
CREATE TABLE projects_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects_main(id) ON DELETE CASCADE,
  
  -- Task details
  text TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'pushed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  
  -- Planning
  estimated_minutes INTEGER,
  order_index INTEGER DEFAULT 0,
  parent_id UUID REFERENCES projects_tasks(id) ON DELETE CASCADE, -- For subtasks
  is_milestone BOOLEAN DEFAULT false,
  due_date DATE,
  
  -- Completion tracking
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Workspace integration
  pushed_to_workspace BOOLEAN DEFAULT false,
  workspace_todo_id UUID REFERENCES todo_workspace(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX idx_projects_tasks_user_id ON projects_tasks(user_id);
CREATE INDEX idx_projects_tasks_project_id ON projects_tasks(project_id);
CREATE INDEX idx_projects_tasks_parent_id ON projects_tasks(parent_id);
CREATE INDEX idx_projects_tasks_status ON projects_tasks(status);
CREATE INDEX idx_projects_tasks_workspace_id ON projects_tasks(workspace_todo_id);

-- Updated at trigger
CREATE TRIGGER update_projects_tasks_updated_at 
  BEFORE UPDATE ON projects_tasks 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE projects_tasks IS 'Tasks within projects, separate from scheduled workspace tasks';
COMMENT ON COLUMN projects_tasks.parent_id IS 'Parent task ID for subtasks';
COMMENT ON COLUMN projects_tasks.workspace_todo_id IS 'Link to todo_workspace when pushed';


-- ============================================================================
-- PROJECTS NOTES
-- Documentation and notes per project
-- ============================================================================
CREATE TABLE projects_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects_main(id) ON DELETE CASCADE,
  
  -- Note details
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'meeting', 'research', 'decision')),
  order_index INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX idx_projects_notes_user_id ON projects_notes(user_id);
CREATE INDEX idx_projects_notes_project_id ON projects_notes(project_id);

-- Updated at trigger
CREATE TRIGGER update_projects_notes_updated_at 
  BEFORE UPDATE ON projects_notes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE projects_notes IS 'Rich text notes and documentation for projects';


-- ============================================================================
-- PROJECTS MILESTONES
-- Timeline and milestone tracking
-- ============================================================================
CREATE TABLE projects_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects_main(id) ON DELETE CASCADE,
  
  -- Milestone details
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE NOT NULL,
  order_index INTEGER DEFAULT 0,
  
  -- Completion tracking
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX idx_projects_milestones_user_id ON projects_milestones(user_id);
CREATE INDEX idx_projects_milestones_project_id ON projects_milestones(project_id);

-- Updated at trigger
CREATE TRIGGER update_projects_milestones_updated_at 
  BEFORE UPDATE ON projects_milestones 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE projects_milestones IS 'Timeline milestones for project tracking';


-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE projects_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects_main ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects_milestones ENABLE ROW LEVEL SECURITY;

-- Projects Folders Policies
CREATE POLICY "Users can view their own folders"
  ON projects_folders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own folders"
  ON projects_folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders"
  ON projects_folders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders"
  ON projects_folders FOR DELETE
  USING (auth.uid() = user_id);

-- Projects Main Policies
CREATE POLICY "Users can view their own projects"
  ON projects_main FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
  ON projects_main FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects_main FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects_main FOR DELETE
  USING (auth.uid() = user_id);

-- Projects Tasks Policies
CREATE POLICY "Users can view their own project tasks"
  ON projects_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own project tasks"
  ON projects_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own project tasks"
  ON projects_tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own project tasks"
  ON projects_tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Projects Notes Policies
CREATE POLICY "Users can view their own project notes"
  ON projects_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own project notes"
  ON projects_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own project notes"
  ON projects_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own project notes"
  ON projects_notes FOR DELETE
  USING (auth.uid() = user_id);

-- Projects Milestones Policies
CREATE POLICY "Users can view their own project milestones"
  ON projects_milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own project milestones"
  ON projects_milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own project milestones"
  ON projects_milestones FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own project milestones"
  ON projects_milestones FOR DELETE
  USING (auth.uid() = user_id);
