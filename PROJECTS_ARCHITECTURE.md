# Projects Feature - Architecture Documentation

## Overview
The Projects feature allows users to organize and develop project ideas, create associated tasks, and push them to the TODO workspace for scheduling. Projects serve as containers for brainstorming and task development before items are ready to be worked on.

## Current Implementation Status

### ✅ Completed Components
- **UI Pages**: `/projects` page with 2-column layout
- **Components**: ProjectsContainer, ProjectsList, ProjectWorkspace
- **API Routes**: GET, POST, PUT, DELETE for projects
- **Database Integration**: Basic CRUD operations
- **Task Association**: Tasks can be linked to projects via `project_id`

### 🚧 Needs Development
- **Folders/Categories**: Ability to organize projects into folders
- **Project Templates**: Quick-start templates for common project types
- **Enhanced Task Management**: Bulk operations, reordering, dependencies
- **Project Timeline/Milestones**: Visual planning tools
- **Project Notes**: Rich text notes and documentation per project
- **Project Archiving**: Soft delete/archive completed projects

---

## Database Schema

### Current Schema (to be renamed)
The current implementation uses `todo_projects` table. This needs to be renamed to `projects_main`.

### Proposed Schema with `projects_` Prefix

#### `projects_main` (currently `todo_projects`)
Primary projects table storing project metadata.

```sql
CREATE TABLE projects_main (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'template')),
  folder_id UUID REFERENCES projects_folders(id) ON DELETE SET NULL,
  color TEXT DEFAULT '#8B5CF6', -- Purple default
  icon TEXT DEFAULT '📁',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_main_user_id ON projects_main(user_id);
CREATE INDEX idx_projects_main_folder_id ON projects_main(folder_id);
CREATE INDEX idx_projects_main_status ON projects_main(status);
```

#### `projects_folders` (NEW)
Organize projects into folders/categories.

```sql
CREATE TABLE projects_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6B7280', -- Gray default
  icon TEXT DEFAULT '📂',
  parent_id UUID REFERENCES projects_folders(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_folders_user_id ON projects_folders(user_id);
CREATE INDEX idx_projects_folders_parent_id ON projects_folders(parent_id);
```

#### `projects_tasks` (NEW - separate from todo_workspace)
Tasks specifically for project planning (separate from scheduled tasks).

```sql
CREATE TABLE projects_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects_main(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'pushed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  estimated_minutes INTEGER,
  order_index INTEGER DEFAULT 0,
  parent_id UUID REFERENCES projects_tasks(id) ON DELETE CASCADE,
  is_milestone BOOLEAN DEFAULT false,
  due_date DATE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  pushed_to_workspace BOOLEAN DEFAULT false,
  workspace_todo_id UUID REFERENCES todo_workspace(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_tasks_user_id ON projects_tasks(user_id);
CREATE INDEX idx_projects_tasks_project_id ON projects_tasks(project_id);
CREATE INDEX idx_projects_tasks_parent_id ON projects_tasks(parent_id);
CREATE INDEX idx_projects_tasks_status ON projects_tasks(status);
```

#### `projects_notes` (NEW)
Rich text notes and documentation per project.

```sql
CREATE TABLE projects_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects_main(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'meeting', 'research', 'decision')),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_notes_user_id ON projects_notes(user_id);
CREATE INDEX idx_projects_notes_project_id ON projects_notes(project_id);
```

#### `projects_milestones` (NEW)
Timeline/milestone tracking for projects.

```sql
CREATE TABLE projects_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects_main(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_milestones_user_id ON projects_milestones(user_id);
CREATE INDEX idx_projects_milestones_project_id ON projects_milestones(project_id);
```

---

## TypeScript Types

### Location: `/lib/types/decide.ts`

#### Current Project Type (lines 49-56)
```typescript
export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}
```

#### Enhanced Types Needed
```typescript
export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  status: 'active' | 'archived' | 'template';
  folder_id?: string;
  color?: string;
  icon?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectFolder {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  parent_id?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectTask {
  id: string;
  user_id: string;
  project_id: string;
  text: string;
  description?: string;
  status: 'draft' | 'ready' | 'pushed';
  priority: 'low' | 'medium' | 'high';
  estimated_minutes?: number;
  order_index: number;
  parent_id?: string;
  is_milestone: boolean;
  due_date?: string;
  completed: boolean;
  completed_at?: string;
  pushed_to_workspace: boolean;
  workspace_todo_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectNote {
  id: string;
  user_id: string;
  project_id: string;
  title: string;
  content: string;
  note_type: 'general' | 'meeting' | 'research' | 'decision';
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectMilestone {
  id: string;
  user_id: string;
  project_id: string;
  title: string;
  description?: string;
  target_date: string;
  completed: boolean;
  completed_at?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}
```

---

## API Routes

### Current Routes (`/app/api/decide/projects/`)

#### `route.ts` - Main projects endpoint
- **GET** `/api/decide/projects` - Get all projects for user
- **POST** `/api/decide/projects` - Create new project

#### `[id]/route.ts` - Single project operations
- **PUT** `/api/decide/projects/[id]` - Update project
- **DELETE** `/api/decide/projects/[id]` - Delete project

### New Routes Needed

#### `/app/api/decide/projects/folders/route.ts`
- **GET** `/api/decide/projects/folders` - Get all folders
- **POST** `/api/decide/projects/folders` - Create folder

#### `/app/api/decide/projects/folders/[id]/route.ts`
- **PUT** `/api/decide/projects/folders/[id]` - Update folder
- **DELETE** `/api/decide/projects/folders/[id]` - Delete folder

#### `/app/api/decide/projects/[id]/tasks/route.ts`
- **GET** `/api/decide/projects/[id]/tasks` - Get project tasks
- **POST** `/api/decide/projects/[id]/tasks` - Create task in project

#### `/app/api/decide/projects/[id]/tasks/[taskId]/route.ts`
- **PUT** `/api/decide/projects/[id]/tasks/[taskId]` - Update task
- **DELETE** `/api/decide/projects/[id]/tasks/[taskId]` - Delete task

#### `/app/api/decide/projects/[id]/notes/route.ts`
- **GET** `/api/decide/projects/[id]/notes` - Get project notes
- **POST** `/api/decide/projects/[id]/notes` - Create note

#### `/app/api/decide/projects/[id]/milestones/route.ts`
- **GET** `/api/decide/projects/[id]/milestones` - Get milestones
- **POST** `/api/decide/projects/[id]/milestones` - Create milestone

---

## Component Structure

### Current Components (`/app/projects/components/`)

#### 1. `ProjectsContainer.tsx` (143 lines)
**Purpose**: Main container managing projects state and operations
**Key Features**:
- Fetches and manages projects list
- Handles project selection
- Create/delete project operations
- 2-column grid layout (list + workspace)

**State**:
```typescript
const [projects, setProjects] = useState<Project[]>([]);
const [selectedProject, setSelectedProject] = useState<Project | null>(null);
const [loading, setLoading] = useState(true);
```

#### 2. `ProjectsList.tsx` (155 lines)
**Purpose**: Left sidebar displaying all projects
**Key Features**:
- List all projects with visual indicators
- Inline create form
- Project selection
- Delete button on hover

#### 3. `ProjectWorkspace.tsx` (238 lines)
**Purpose**: Right panel for selected project details
**Key Features**:
- Display project header
- Tabbed interface (Tasks, Notes, Timeline)
- Task CRUD operations
- "Push to TODO List" button
- Currently only Tasks tab is functional

### Components That Need Development

#### 4. `ProjectFoldersPanel.tsx` (NEW)
**Purpose**: Manage folder structure for organizing projects
**Features Needed**:
- Tree view of folders
- Drag-and-drop to reorganize
- Create/rename/delete folders
- Nested folder support

#### 5. `ProjectTasksList.tsx` (NEW)
**Purpose**: Enhanced task management within projects
**Features Needed**:
- Drag-and-drop reordering
- Bulk selection and operations
- Task priority indicators
- Subtask support
- Status badges
- Estimated time display

#### 6. `ProjectNotesEditor.tsx` (NEW)
**Purpose**: Rich text editor for project notes
**Features Needed**:
- Rich text editing (consider TipTap or Quill)
- Multiple notes per project
- Note categories (meeting, research, decision)
- Markdown support

#### 7. `ProjectTimeline.tsx` (NEW)
**Purpose**: Visual timeline and milestone tracking
**Features Needed**:
- Milestone creation/editing
- Visual timeline view
- Due date indicators
- Progress tracking

---

## File Listing for New Chat Session

### Essential Files to Review

1. **Type Definitions**
   - `/lib/types/decide.ts` (lines 49-56 for Project type)

2. **API Routes**
   - `/app/api/decide/projects/route.ts`
   - `/app/api/decide/projects/[id]/route.ts`

3. **Page Component**
   - `/app/projects/page.tsx`

4. **Container & Components**
   - `/app/projects/components/ProjectsContainer.tsx`
   - `/app/projects/components/ProjectsList.tsx`
   - `/app/projects/components/ProjectWorkspace.tsx`

5. **Supporting Infrastructure**
   - `/lib/supabase.ts` (Supabase client configuration)
   - `/components/layout/GlobalModeHeader.tsx` (Navigation header)

### Database Files
- No schema files in repo - schemas managed via Supabase dashboard

---

## Integration Points

### With TODO Workspace System
- `todo_workspace` table has `project_id` field (optional UUID)
- Tasks can be linked to projects when created
- "Push to Tasks" functionality moves project tasks to workspace

### With Calendar/Scheduling
- TODO Workspace tasks have `scheduled_for` field
- Once pushed from projects, tasks can be scheduled on calendar
- `completed` status tracks task completion

---

## Migration Steps

### Database Renaming
1. Create new tables with `projects_` prefix
2. Migrate data from `todo_projects` to `projects_main`
3. Update all API routes to use new table names
4. Update TypeScript types
5. Test all CRUD operations
6. Drop old `todo_projects` table

### SQL for Renaming
```sql
-- Rename main table
ALTER TABLE todo_projects RENAME TO projects_main;

-- Add new fields to support enhanced features
ALTER TABLE projects_main 
ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'template')),
ADD COLUMN folder_id UUID REFERENCES projects_folders(id) ON DELETE SET NULL,
ADD COLUMN color TEXT DEFAULT '#8B5CF6',
ADD COLUMN icon TEXT DEFAULT '📁',
ADD COLUMN order_index INTEGER DEFAULT 0;

-- Create indexes for new fields
CREATE INDEX idx_projects_main_folder_id ON projects_main(folder_id);
CREATE INDEX idx_projects_main_status ON projects_main(status);
```

---

## Development Priorities

### Phase 1: Folder Organization
1. Create `projects_folders` table
2. Update Project type with `folder_id`
3. Build `ProjectFoldersPanel` component
4. Add folder selection to project creation
5. API routes for folder CRUD

### Phase 2: Enhanced Task Management
1. Create `projects_tasks` table (separate from workspace)
2. Build `ProjectTasksList` component with advanced features
3. Task reordering, priority, subtasks
4. Bulk operations (select, move, delete)
5. Better "Push to Workspace" flow

### Phase 3: Notes & Documentation
1. Create `projects_notes` table
2. Build `ProjectNotesEditor` component
3. Rich text editing with markdown
4. Note categories and organization

### Phase 4: Timeline & Milestones
1. Create `projects_milestones` table
2. Build `ProjectTimeline` component
3. Visual milestone tracking
4. Progress indicators

---

## Key Design Decisions

### Why Separate from TODO Workspace?
- Projects are for **planning and development**
- TODO Workspace is for **actionable, scheduled tasks**
- Clean separation of concerns
- Allows brainstorming without cluttering active task list

### Why Folders Instead of Tags?
- Hierarchical organization more intuitive
- Clear visual structure
- Easier drag-and-drop UX
- Can add tags later as complementary feature

### Why Separate Task Table?
- Project tasks may have different lifecycle
- Different fields/metadata (milestones, dependencies)
- Can be bulk-pushed to workspace when ready
- Prevents cluttering main todo_workspace table

---

## Current Limitations

1. **No Folders**: Projects in flat list
2. **Basic Tasks**: Tasks use workspace table, limited functionality
3. **No Notes**: No dedicated notes/documentation area
4. **No Timeline**: No visual project planning
5. **No Templates**: Can't quick-start from templates
6. **No Archiving**: Projects can only be deleted
7. **Manual Push**: No automated task conversion

---

## Next Steps for Implementation

1. **Immediate**: Rename tables from `todo_*` to `projects_*`
2. **Next**: Implement folder structure
3. **Then**: Separate projects_tasks table with enhanced features
4. **Finally**: Notes, timeline, and templates

---

## Testing Checklist

- [ ] Create project with folder assignment
- [ ] Move project between folders
- [ ] Create nested folders
- [ ] Add tasks to project
- [ ] Reorder tasks via drag-and-drop
- [ ] Push tasks to workspace (bulk)
- [ ] Add project notes
- [ ] Create milestones with dates
- [ ] Archive completed project
- [ ] Use project template
- [ ] Search/filter projects
- [ ] Delete project (cascade to tasks)

---

**Document Version**: 1.0
**Last Updated**: December 14, 2025
**Status**: Ready for folder implementation phase
