-- Add group_color column to todo_workspace table for visual task grouping
ALTER TABLE todo_workspace
ADD COLUMN IF NOT EXISTS group_color TEXT;

-- Create index for faster queries when filtering by group color
CREATE INDEX IF NOT EXISTS idx_todo_workspace_group_color ON todo_workspace(group_color);
