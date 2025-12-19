# Database Diagnostic Check for Missing Completed Tasks

## Issue
Completed TODO items keep disappearing from calendar view.

## What to Check in Supabase

### 1. Verify Columns Exist
Go to Supabase Dashboard → Table Editor → `todo_workspace` table

**Check these columns exist:**
- ✅ `scheduled_for` (type: DATE)
- ✅ `completed` (type: BOOLEAN, default: FALSE)

### 2. Check Current Data
Run this SQL query in Supabase SQL Editor:

```sql
-- Check how many tasks exist total
SELECT COUNT(*) as total_tasks FROM todo_workspace WHERE user_id = auth.uid();

-- Check how many have scheduled_for set
SELECT COUNT(*) as scheduled_tasks FROM todo_workspace 
WHERE user_id = auth.uid() AND scheduled_for IS NOT NULL;

-- Check how many are marked completed
SELECT COUNT(*) as completed_tasks FROM todo_workspace 
WHERE user_id = auth.uid() AND completed = TRUE;

-- Show all completed tasks and their scheduled dates
SELECT 
  id,
  text,
  scheduled_for,
  completed,
  created_at
FROM todo_workspace 
WHERE user_id = auth.uid() AND completed = TRUE
ORDER BY scheduled_for DESC;

-- Show all tasks with scheduled dates (including completed)
SELECT 
  id,
  text,
  scheduled_for,
  completed,
  status,
  created_at
FROM todo_workspace 
WHERE user_id = auth.uid() AND scheduled_for IS NOT NULL
ORDER BY scheduled_for DESC;
```

## Expected Results

If columns exist and data is saved correctly, you should see:
- Total tasks > 0
- Scheduled tasks > 0 (if you scheduled any)
- Completed tasks > 0 (if you marked any complete)
- The detail queries should show your tasks with dates

## If Columns Don't Exist

Run this SQL to create them:

```sql
-- Add columns if they don't exist
ALTER TABLE todo_workspace
ADD COLUMN IF NOT EXISTS scheduled_for DATE;

ALTER TABLE todo_workspace
ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_todo_workspace_scheduled_for
ON todo_workspace(scheduled_for);

CREATE INDEX IF NOT EXISTS idx_todo_workspace_completed
ON todo_workspace(completed);
```

## If Columns Exist But Data is NULL

This means updates aren't saving. Check:
1. API route is handling `scheduled_for` and `completed` fields
2. Frontend is sending correct data to API
3. No RLS (Row Level Security) policies blocking updates

## Next Steps

After running these queries, report back:
1. Do the columns exist? (YES/NO)
2. How many tasks in each category?
3. Any error messages from Supabase?
