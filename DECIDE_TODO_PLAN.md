# Decide To Do - Implementation Plan

## Overview
A comprehensive task management system with habit tracking, AI-powered task breakdown, and business context integration.

---

## UI Structure - 3 Main Sections

```
┌────────────────────────────────────────────────────────────┐
│ 📊 HABIT TRACKER (Top - Collapsible)                      │
│    Calendar grid with daily checkoffs                     │
├────────────────────────────────────────────────────────────┤
│ 📝 TODO WORKSPACE (Middle - Collapsible)                  │
│    Process & extract TODOs from notes/meetings            │
├────────────────────────────────────────────────────────────┤
│ 🎯 TASKS & PLANNING (Bottom - Collapsible)                │
│    Full task management with priorities, calendar, etc.   │
└────────────────────────────────────────────────────────────┘
```

---

## File Structure (Target: 500-700 lines per file max)

### Main Page & Router
```
app/decide/
├── page.tsx                                    (~150 lines)
│   └── Main page component, loads 3 sections
│
├── layout.tsx                                  (~50 lines)
│   └── Decide To Do layout wrapper
│
└── components/
    ├── DecideContainer.tsx                     (~200 lines)
    │   └── Main container with state management
    │
    ├── SectionToggle.tsx                       (~100 lines)
    │   └── Collapsible section headers
    │
    └── DecideHeader.tsx                        (~150 lines)
        └── Top-level header with global actions
```

### Section 1: Habit Tracker
```
app/decide/components/habits/
├── HabitTracker.tsx                            (~250 lines)
│   └── Main habit tracker container
│
├── HabitGrid.tsx                               (~300 lines)
│   └── Calendar grid component
│
├── HabitRow.tsx                                (~150 lines)
│   └── Single habit row with checkboxes
│
├── HabitCell.tsx                               (~100 lines)
│   └── Individual day checkbox cell
│
├── HabitStats.tsx                              (~200 lines)
│   └── Progress bars, streaks, analytics
│
├── HabitManager.tsx                            (~350 lines)
│   └── Add/edit/delete habits modal
│
├── HabitMonthPicker.tsx                        (~150 lines)
│   └── Month navigation component
│
└── hooks/
    ├── useHabits.ts                            (~200 lines)
    │   └── Habit CRUD operations
    │
    ├── useHabitChecks.ts                       (~250 lines)
    │   └── Check/uncheck logic, streaks
    │
    └── useHabitStats.ts                        (~200 lines)
        └── Calculate completion rates, streaks
```

### Section 2: TODO Workspace
```
app/decide/components/workspace/
├── TodoWorkspace.tsx                           (~250 lines)
│   └── Main workspace container
│
├── WorkspaceLayout.tsx                         (~200 lines)
│   └── Left/Right panel layout
│
├── tabs/
│   ├── QuickCapture.tsx                        (~300 lines)
│   │   └── Bullet list quick entry
│   │
│   ├── PasteExtract.tsx                        (~350 lines)
│   │   └── Paste notes and extract TODOs
│   │
│   └── Brainstorm.tsx                          (~250 lines)
│       └── Free-form notes area
│
├── SourcePanel.tsx                             (~400 lines)
│   └── Left panel: meetings, convos, notes
│
├── TodoItem.tsx                                (~200 lines)
│   └── Single TODO item component
│
├── TodoBreakdown.tsx                           (~400 lines)
│   └── AI breakdown modal/interface
│
├── TodoPreview.tsx                             (~200 lines)
│   └── Preview TODOs before adding to tasks
│
└── hooks/
    ├── useWorkspace.ts                         (~250 lines)
    │   └── Workspace state management
    │
    ├── useAIExtraction.ts                      (~300 lines)
    │   └── AI extraction from notes
    │
    ├── useAIBreakdown.ts                       (~350 lines)
    │   └── AI task breakdown logic
    │
    └── useSourceImport.ts                      (~250 lines)
        └── Import from meetings/convos
```

### Section 3: Tasks & Planning
```
app/decide/components/tasks/
├── TasksPlanning.tsx                           (~250 lines)
│   └── Main tasks container
│
├── TasksLayout.tsx                             (~200 lines)
│   └── 3-panel layout (Left/Center/Right)
│
├── panels/
│   ├── TasksLeftPanel.tsx                      (~350 lines)
│   │   └── Calendar, filters, quick actions
│   │
│   ├── TasksCenterPanel.tsx                    (~400 lines)
│   │   └── Top 3, task lists, views
│   │
│   └── TasksRightPanel.tsx                     (~300 lines)
│       └── Week stats, calendar, sources
│
├── TaskCard.tsx                                (~350 lines)
│   └── Individual task card with subtasks
│
├── TaskForm.tsx                                (~300 lines)
│   └── Create/edit task form
│
├── Top3Selector.tsx                            (~250 lines)
│   └── Top 3 priority selection
│
├── TaskFilters.tsx                             (~200 lines)
│   └── Filter controls
│
├── WeekView.tsx                                (~350 lines)
│   └── Week calendar view
│
├── DayReview.tsx                               (~300 lines)
│   └── End of day review
│
├── WeekReview.tsx                              (~350 lines)
│   └── Week review with analytics
│
└── hooks/
    ├── useTasks.ts                             (~300 lines)
    │   └── Task CRUD operations
    │
    ├── useTaskPriority.ts                      (~200 lines)
    │   └── Priority management
    │
    ├── useTop3.ts                              (~250 lines)
    │   └── Top 3 selection logic
    │
    ├── useTaskScheduling.ts                    (~300 lines)
    │   └── Scheduling, carry-over
    │
    └── useTaskAnalytics.ts                     (~250 lines)
        └── Completion tracking, stats
```

### Shared Components
```
app/decide/components/shared/
├── CollapsibleSection.tsx                      (~150 lines)
│   └── Reusable collapsible container
│
├── PriorityBadge.tsx                           (~100 lines)
│   └── Priority indicator component
│
├── CategoryBadge.tsx                           (~100 lines)
│   └── Category (personal/business) badge
│
├── StreakIndicator.tsx                         (~100 lines)
│   └── Fire emoji with streak number
│
├── ProgressBar.tsx                             (~100 lines)
│   └── Reusable progress bar
│
├── AIButton.tsx                                (~150 lines)
│   └── AI action buttons (breakdown, extract)
│
├── DatePicker.tsx                              (~200 lines)
│   └── Date selection component
│
└── ConfirmDialog.tsx                           (~150 lines)
    └── Confirmation modal
```

### API Routes
```
app/api/decide/
├── habits/
│   ├── route.ts                                (~150 lines)
│   │   └── GET/POST habits
│   │
│   ├── [id]/route.ts                           (~150 lines)
│   │   └── PUT/DELETE single habit
│   │
│   └── check/route.ts                          (~200 lines)
│       └── POST check/uncheck habit
│
├── workspace/
│   ├── extract/route.ts                        (~300 lines)
│   │   └── POST AI extraction from notes
│   │
│   ├── breakdown/route.ts                      (~350 lines)
│   │   └── POST AI task breakdown
│   │
│   └── import/route.ts                         (~250 lines)
│       └── POST import from meetings/convos
│
├── tasks/
│   ├── route.ts                                (~200 lines)
│   │   └── GET/POST tasks
│   │
│   ├── [id]/route.ts                           (~200 lines)
│   │   └── PUT/DELETE single task
│   │
│   ├── top3/route.ts                           (~200 lines)
│   │   └── GET/POST top 3 for a day
│   │
│   └── carry-over/route.ts                     (~250 lines)
│       └── POST carry over tasks to next day
│
└── analytics/
    ├── habits/route.ts                         (~200 lines)
    │   └── GET habit completion stats
    │
    └── tasks/route.ts                          (~200 lines)
        └── GET task completion stats
```

### Database Types & Utilities
```
lib/types/
├── decide.ts                                   (~400 lines)
│   └── All TypeScript interfaces
│       - Habit, HabitCheck, HabitStreak
│       - WorkspaceTodo
│       - Task, DailyPlan
│       - Analytics types
│
└── decide-enums.ts                             (~100 lines)
    └── Enums for priorities, categories, etc.

lib/decide/
├── habits.ts                                   (~300 lines)
│   └── Habit utility functions
│
├── tasks.ts                                    (~350 lines)
│   └── Task utility functions
│
├── ai-extraction.ts                            (~400 lines)
│   └── AI extraction logic
│
├── ai-breakdown.ts                             (~400 lines)
│   └── AI breakdown logic
│
└── analytics.ts                                (~300 lines)
    └── Analytics calculations
```

### Database Migrations
```
supabase/migrations/
├── 20241214_decide_habits.sql                  (~150 lines)
│   └── Create habits and habit_checks tables
│
├── 20241214_decide_workspace.sql               (~100 lines)
│   └── Create todos_workspace table
│
├── 20241214_decide_tasks.sql                   (~200 lines)
│   └── Create tasks and daily_plans tables
│
└── 20241214_decide_indexes.sql                 (~100 lines)
    └── Performance indexes
```

---

## Database Schema

### Habits Tables
```sql
-- Habits (the habit definitions)
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habit checks (daily checkoffs)
CREATE TABLE habit_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL,
  checked BOOLEAN DEFAULT FALSE,
  checked_at TIMESTAMPTZ,
  UNIQUE(habit_id, date)
);

-- Indexes
CREATE INDEX idx_habits_user ON habits(user_id, order_index);
CREATE INDEX idx_habit_checks_user_date ON habit_checks(user_id, date);
CREATE INDEX idx_habit_checks_habit_date ON habit_checks(habit_id, date);
```

### Workspace Tables
```sql
-- Workspace TODOs (temporary processing area)
CREATE TABLE todos_workspace (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  text TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  
  -- Breakdown
  parent_id UUID REFERENCES todos_workspace(id) ON DELETE CASCADE,
  is_breakdown BOOLEAN DEFAULT FALSE,
  
  -- AI metadata
  ai_generated BOOLEAN DEFAULT FALSE,
  estimated_minutes INTEGER,
  
  -- Source
  source_type TEXT, -- 'manual', 'meeting', 'conversation', 'note'
  source_id UUID,
  
  -- Status
  status TEXT DEFAULT 'draft', -- 'draft', 'ready', 'converted'
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workspace_todos_user ON workspace_todos(user_id, status);
CREATE INDEX idx_workspace_todos_parent ON workspace_todos(parent_id);
```

### Tasks Tables
```sql
-- Tasks (organized task system)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  
  -- Priority & Category
  priority TEXT DEFAULT 'medium', -- 'high', 'medium', 'low'
  category TEXT DEFAULT 'personal', -- 'personal', 'business', 'both', 'habit'
  
  -- Hierarchy
  parent_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'todo', -- 'todo', 'in_progress', 'done', 'carried_over'
  is_top_three BOOLEAN DEFAULT FALSE,
  
  -- Dates
  scheduled_for DATE,
  completed_at TIMESTAMPTZ,
  carried_from DATE,
  
  -- Time
  estimated_minutes INTEGER,
  actual_minutes INTEGER,
  
  -- Context
  source_type TEXT, -- 'manual', 'workspace', 'meeting', 'conversation', 'habit'
  source_id UUID,
  business_id UUID REFERENCES businesses(id),
  
  -- Recurrence (for habits converted to tasks)
  recurring JSONB, -- {frequency, daysOfWeek, endsOn}
  
  -- AI
  ai_breakdown JSONB,
  
  tags TEXT[],
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily plans (top 3 selection, reviews)
CREATE TABLE daily_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL,
  
  top_three UUID[] DEFAULT '{}',
  scheduled UUID[] DEFAULT '{}',
  carried_over UUID[] DEFAULT '{}',
  
  day_review JSONB, -- {completedCount, notes, timestamp}
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- Indexes
CREATE INDEX idx_tasks_user_scheduled ON tasks(user_id, scheduled_for);
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_parent ON tasks(parent_id);
CREATE INDEX idx_daily_plans_user_date ON daily_plans(user_id, date);
```

---

## TypeScript Interfaces

### Habit Types
```typescript
interface Habit {
  id: string;
  userId: string;
  name: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface HabitCheck {
  id: string;
  habitId: string;
  userId: string;
  date: string; // 'YYYY-MM-DD'
  checked: boolean;
  checkedAt?: Date;
}

interface HabitStreak {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  lastCheckedDate: string;
}
```

### Workspace Types
```typescript
interface WorkspaceTodo {
  id: string;
  userId: string;
  text: string;
  orderIndex: number;
  
  // Breakdown
  parentId?: string;
  isBreakdown: boolean;
  subtasks?: WorkspaceTodo[];
  
  // AI
  aiGenerated: boolean;
  estimatedMinutes?: number;
  
  // Source
  sourceType?: 'manual' | 'meeting' | 'conversation' | 'note';
  sourceId?: string;
  
  // Status
  status: 'draft' | 'ready' | 'converted';
  
  createdAt: Date;
}
```

### Task Types
```typescript
interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  
  priority: 'high' | 'medium' | 'low';
  category: 'personal' | 'business' | 'both' | 'habit';
  
  parentId?: string;
  orderIndex: number;
  
  status: 'todo' | 'in_progress' | 'done' | 'carried_over';
  isTopThree: boolean;
  
  scheduledFor?: Date;
  completedAt?: Date;
  carriedFrom?: Date;
  
  estimatedMinutes?: number;
  actualMinutes?: number;
  
  sourceType?: 'manual' | 'workspace' | 'meeting' | 'conversation' | 'habit';
  sourceId?: string;
  businessId?: string;
  
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    daysOfWeek?: number[];
    endsOn?: Date;
  };
  
  aiBreakdown?: {
    subtasks: Task[];
    estimatedTime: string;
  };
  
  tags: string[];
  notes: string;
  
  createdAt: Date;
  updatedAt: Date;
}

interface DailyPlan {
  id: string;
  userId: string;
  date: Date;
  
  topThree: string[];
  scheduled: string[];
  carriedOver: string[];
  
  dayReview?: {
    completedCount: number;
    notes: string;
    timestamp: Date;
  };
  
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal: Basic structure and habit tracker**

Files to create:
- [ ] Database migrations (habits tables)
- [ ] `/app/decide/page.tsx` - Main page
- [ ] `/app/decide/components/DecideContainer.tsx`
- [ ] `/app/decide/components/habits/HabitTracker.tsx`
- [ ] `/app/decide/components/habits/HabitGrid.tsx`
- [ ] `/app/decide/components/habits/HabitRow.tsx`
- [ ] `/app/decide/components/habits/HabitCell.tsx`
- [ ] `/app/decide/components/habits/hooks/useHabits.ts`
- [ ] `/app/decide/components/habits/hooks/useHabitChecks.ts`
- [ ] `/app/api/decide/habits/route.ts`
- [ ] `/app/api/decide/habits/check/route.ts`
- [ ] `/lib/types/decide.ts` (habit types)

Deliverable: Working habit tracker with calendar grid, checkoffs, basic stats

---

### Phase 2: TODO Workspace (Week 2)
**Goal: Processing workspace with AI extraction**

Files to create:
- [ ] Database migrations (workspace_todos table)
- [ ] `/app/decide/components/workspace/TodoWorkspace.tsx`
- [ ] `/app/decide/components/workspace/WorkspaceLayout.tsx`
- [ ] `/app/decide/components/workspace/tabs/QuickCapture.tsx`
- [ ] `/app/decide/components/workspace/tabs/PasteExtract.tsx`
- [ ] `/app/decide/components/workspace/tabs/Brainstorm.tsx`
- [ ] `/app/decide/components/workspace/SourcePanel.tsx`
- [ ] `/app/decide/components/workspace/TodoItem.tsx`
- [ ] `/app/decide/components/workspace/hooks/useWorkspace.ts`
- [ ] `/app/decide/components/workspace/hooks/useAIExtraction.ts`
- [ ] `/app/api/decide/workspace/extract/route.ts`
- [ ] `/lib/decide/ai-extraction.ts`

Deliverable: Working workspace to capture and extract TODOs

---

### Phase 3: AI Breakdown (Week 3)
**Goal: AI task breakdown functionality**

Files to create:
- [ ] `/app/decide/components/workspace/TodoBreakdown.tsx`
- [ ] `/app/decide/components/workspace/hooks/useAIBreakdown.ts`
- [ ] `/app/api/decide/workspace/breakdown/route.ts`
- [ ] `/lib/decide/ai-breakdown.ts`

Deliverable: AI breakdown working in workspace

---

### Phase 4: Tasks & Planning (Week 4)
**Goal: Full task management system**

Files to create:
- [ ] Database migrations (tasks, daily_plans tables)
- [ ] `/app/decide/components/tasks/TasksPlanning.tsx`
- [ ] `/app/decide/components/tasks/TasksLayout.tsx`
- [ ] `/app/decide/components/tasks/panels/TasksLeftPanel.tsx`
- [ ] `/app/decide/components/tasks/panels/TasksCenterPanel.tsx`
- [ ] `/app/decide/components/tasks/panels/TasksRightPanel.tsx`
- [ ] `/app/decide/components/tasks/TaskCard.tsx`
- [ ] `/app/decide/components/tasks/TaskForm.tsx`
- [ ] `/app/decide/components/tasks/Top3Selector.tsx`
- [ ] `/app/decide/components/tasks/hooks/useTasks.ts`
- [ ] `/app/decide/components/tasks/hooks/useTop3.ts`
- [ ] `/app/api/decide/tasks/route.ts`
- [ ] `/app/api/decide/tasks/[id]/route.ts`
- [ ] `/app/api/decide/tasks/top3/route.ts`

Deliverable: Full task system with Top 3, scheduling

---

### Phase 5: Reviews & Analytics (Week 5)
**Goal: Day/week reviews and analytics**

Files to create:
- [ ] `/app/decide/components/tasks/DayReview.tsx`
- [ ] `/app/decide/components/tasks/WeekReview.tsx`
- [ ] `/app/decide/components/habits/HabitStats.tsx`
- [ ] `/app/decide/components/tasks/hooks/useTaskAnalytics.ts`
- [ ] `/app/decide/components/habits/hooks/useHabitStats.ts`
- [ ] `/app/api/decide/analytics/habits/route.ts`
- [ ] `/app/api/decide/analytics/tasks/route.ts`
- [ ] `/lib/decide/analytics.ts`

Deliverable: Review workflows and analytics dashboards

---

### Phase 6: Integration (Week 6)
**Goal: Connect with business context**

Files to create:
- [ ] `/app/decide/components/workspace/hooks/useSourceImport.ts`
- [ ] `/app/api/decide/workspace/import/route.ts`
- [ ] Integration with meetings API
- [ ] Integration with conversations API
- [ ] Integration with business notes API

Deliverable: Import follow-ups from business context

---

### Phase 7: Polish & Optimization (Week 7)
**Goal: Shared components, performance, mobile**

Files to create:
- [ ] All shared components in `/app/decide/components/shared/`
- [ ] Mobile responsive views
- [ ] Keyboard shortcuts
- [ ] Performance optimizations
- [ ] Error handling
- [ ] Loading states

Deliverable: Production-ready feature

---

## Naming Conventions

### Files
- Components: PascalCase (e.g., `HabitTracker.tsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useHabits.ts`)
- Utils: camelCase (e.g., `ai-extraction.ts`)
- Types: kebab-case (e.g., `decide-types.ts`)

### Variables & Functions
- Components: PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Types/Interfaces: PascalCase

### Database
- Tables: snake_case, plural (e.g., `habit_checks`)
- Columns: snake_case (e.g., `user_id`, `created_at`)

---

## Component Size Guidelines

### Target Sizes
- **Tiny (<100 lines)**: Badges, indicators, simple UI
- **Small (100-250 lines)**: Forms, modals, single-purpose components
- **Medium (250-500 lines)**: Complex components with state
- **Large (500-700 lines)**: Container components, complex logic
- **Consider Splitting (>700 lines)**: Evaluate if refactoring makes sense

### When to Consider Splitting
When a file reaches **500-700 lines**, ask:
1. Can sub-components be extracted?
2. Should hooks be moved to separate files?
3. Would presentation + container pattern help?
4. Are there shared utilities to extract?

**Important**: Don't truncate code to hit a line limit! The 500-700 range is a signal to *consider* refactoring, not a hard maximum. Keep code complete and functional.

---

## State Management Strategy

### Local State (useState)
- UI-only state (collapsed, selected tab)
- Form inputs
- Temporary data

### Custom Hooks
- Data fetching (habits, tasks)
- Complex logic (AI extraction, breakdown)
- Reusable operations

### Props
- Parent-to-child communication
- Callback functions
- Shared state

### Database (Supabase)
- All persistent data
- Real-time subscriptions where needed

---

## Testing Strategy

### Unit Tests
- Utility functions (`lib/decide/`)
- Custom hooks
- Simple components

### Integration Tests
- API routes
- Database operations
- Component interactions

### E2E Tests (Optional)
- Critical user flows
- Habit tracking workflow
- Task creation workflow

---

## Performance Considerations

### Optimization Strategies
- Lazy load heavy components
- Virtualize long lists (habit grid, task lists)
- Debounce AI calls
- Cache habit checks by month
- Memoize expensive calculations
- Optimize database queries with indexes

### Code Splitting
- Lazy load each section
- Dynamic imports for modals
- Separate bundles for AI features

---

## Next Steps

1. **Review this plan** - Make sure structure makes sense
2. **Adjust file organization** - Any changes needed?
3. **Start Phase 1** - Create foundation and habit tracker
4. **Iterate** - Build, test, refine each phase

---

## Questions to Address

- [ ] Should we add real-time collaboration features?
- [ ] Calendar sync (Google Calendar, Outlook) - Phase 6 or later?
- [ ] Notion/Todoist import - useful?
- [ ] Notifications/reminders - when to implement?
- [ ] Mobile app - separate plan?

---

**Ready to start building? Let's begin with Phase 1: Foundation & Habit Tracker!**
