# RightPanel Refactoring - Part 2 Instructions

## PASTE THIS IN NEXT THREAD TO CONTINUE

---

## Current Progress (Completed)

✅ **Phase 1: Extracted 4 views from RightPanel** (DONE)
- `LibraryView.tsx` (12 lines) - lines 3413-3418
- `BusinessNotesView.tsx` (120 lines) - lines 2549-2647  
- `BusinessFollowupsView.tsx` (141 lines) - lines 2427-2546
- `MeetingsView.tsx` (732 lines) - lines 836-1476

**Total extracted:** 1,005 lines  
**Original RightPanel:** 3,420 lines (unchanged - still has all original code)

---

## Next Steps (Part 2)

### Step 1: Extract PeopleView (840 lines)

**Source:** Lines 1479-2319 in `RightPanel.tsx`

**File to create:** `/app/business/components/views/PeopleView.tsx`

**Extract exactly from line 1479 to 2319 including:**
- Tab switcher (Assigned/Library/Organization)
- Assigned people view with remove functionality
- Library view with search, filters, tabs, bulk selection
- Organization view with:
  - Hierarchical org chart by levels
  - Drag & drop people and teams
  - Placeholder person creation
  - Edit person modal
  - Team creation and management
  - Reporting relationships with visual lines

**Required imports:**
```typescript
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BusinessWithRelations, Person, PeopleViewMode, Business } from '@/lib/types';
import OrgChartPerson from '../OrgChartPerson';
```

**Props needed (from RightPanel state):**
- business, allPeople, searchQuery, selectedFilter, isLoadingPeople
- peopleViewMode, setPeopleViewMode
- selectedPeopleIds, setSelectedPeopleIds
- assignedPeople (derived from business.people)
- orgChartPeople, setOrgChartPeople
- teams, setTeams
- visibleLevels, setVisibleLevels
- draggedPersonId, setDraggedPersonId
- draggedPersonFromList, setDraggedPersonFromList
- selectedPersonForDetails, setSelectedPersonForDetails
- showPlaceholderForm, setShowPlaceholderForm
- placeholderName, setPlaceholderName, placeholderTitle, setPlaceholderTitle
- editingPerson, setEditingPerson, editForm, setEditForm
- draggedTeamId, setDraggedTeamId
- orgHierarchy, setOrgHierarchy
- connectingFrom, isDraggingConnection, dragLineStart, dragLineEnd
- All handler functions: loadPeople, togglePersonSelection, handleAssignPerson, handleBulkAssign, handleAddPersonToOrgChart, handleRemovePersonFromOrgChart, handleDragStart, handleTeamDragStart, handleDragOver, handleHierarchyDrop, handleCreateTeam, handleDropOnTeam, handleEditPerson, handleSavePersonDetails, getLevelLabel, getOrgChartByLevels, handleMouseMove, handleAddPlaceholder
- onReloadBusiness, allBusinesses

---

### Step 2: Extract ConversationsView (760 lines)

**Source:** Lines 2650-3411 in `RightPanel.tsx`

**File to create:** `/app/business/components/views/ConversationsView.tsx`

**Extract exactly from line 2650 to 3411 including:**
- Context sources checkboxes (LinkedIn, Conversations, Meetings, Notes, Memories)
- Situation and goal inputs
- Attendee selection
- Clarifying questions flow with answers
- Strategy generation (2-phase: questions → final strategy)
- Conversation steps display (horizontal/vertical layouts)
- Step management (add, AI suggestions)
- Saved strategies list
- Collapsible build form

**Required imports:**
```typescript
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BusinessWithRelations, Person } from '@/lib/types';
```

**Props needed:**
- business, allPeople
- conversationStrategies, setConversationStrategies
- selectedStrategy, setSelectedStrategy
- newStrategy, setNewStrategy
- conversationSteps, setConversationSteps
- isGeneratingStrategy, setIsGeneratingStrategy
- clarifyingQuestions, setClarifyingQuestions
- clarifyingAnswers, setClarifyingAnswers
- isBuildFormCollapsed, setIsBuildFormCollapsed

---

### Step 3: Update RightPanel.tsx to be a Router

**Replace the entire RightPanel function** (lines 26-3419) with:

```typescript
export default function RightPanel({
  workspaceView,
  business,
  meeting,
  person,
  onViewChange,
  onReloadBusiness,
  allBusinesses,
  onBusinessSelect,
  saveOrgChartRef
}: RightPanelProps) {
  // All existing useState declarations (keep lines 37-122 exactly as-is)
  // All existing useEffect hooks (keep lines 125-400 exactly as-is)
  // All existing handler functions (keep lines 402-833 exactly as-is)

  // VIEW ROUTING
  if (workspaceView === 'meeting') {
    return <MeetingsView {...meetingsViewProps} />;
  }

  if (workspaceView === 'people') {
    return <PeopleView {...peopleViewProps} />;
  }

  if (workspaceView === 'followups') {
    return <BusinessFollowupsView {...followupsViewProps} />;
  }

  if (workspaceView === 'notes') {
    return <BusinessNotesView {...notesViewProps} />;
  }

  if (workspaceView === 'conversations') {
    return <ConversationsView {...conversationsViewProps} />;
  }

  // Skip pipeline view (removed - will be separate top-level tab)

  // Default fallback
  return <LibraryView />;
}
```

**Add imports at top:**
```typescript
import MeetingsView from './views/MeetingsView';
import PeopleView from './views/PeopleView';
import BusinessFollowupsView from './views/BusinessFollowupsView';
import BusinessNotesView from './views/BusinessNotesView';
import ConversationsView from './views/ConversationsView';
import LibraryView from './views/LibraryView';
```

---

### Step 4: Remove Pipeline from LeftPanel

**File:** `/app/business/components/LeftPanel.tsx`

**Remove pipeline from sectionOrder array** (line 394-402):
```typescript
// BEFORE:
const [sectionOrder, setSectionOrder] = useState<string[]>([
  'people',
  'meetings',
  'pipeline',  // ← REMOVE THIS
  'notes',
  'research',
  'followups',
  'conversations'
]);

// AFTER:
const [sectionOrder, setSectionOrder] = useState<string[]>([
  'people',
  'meetings',
  'notes',
  'research',
  'followups',
  'conversations'
]);
```

**Remove pipeline section config** (around line 796-803):
```typescript
// REMOVE this entry from sectionConfig:
pipeline: { label: 'Pipeline', view: 'pipeline' as WorkspaceView, hasExpand: false },
```

---

### Step 5: Remove Pipeline View Code from RightPanel

**Delete lines 2321-2425** (Pipeline/Kanban View section):
```typescript
// DELETE THIS ENTIRE SECTION:
// Pipeline / Kanban View
if (workspaceView === 'pipeline') {
  const stages: Array<{key: Business['stage'], label: string, color: string}> = [
    // ... all pipeline code ...
  ];
  // ... entire pipeline render ...
}
```

---

### Step 6: Verify Line Counts

After refactoring:
- **RightPanel.tsx:** Should be ~200-250 lines (just state + router)
- **Total new files:** 6 view files
- **Total lines distributed:** ~2,780 lines (excluding pipeline ~100 lines)

**Final structure:**
```
app/business/components/
├── LeftPanel.tsx (no pipeline section)
├── RightPanel.tsx (router only, ~250 lines)
├── OrgChartPerson.tsx
├── SortableSectionButton.tsx
└── views/
    ├── LibraryView.tsx (12 lines)
    ├── BusinessNotesView.tsx (120 lines)
    ├── BusinessFollowupsView.tsx (141 lines)
    ├── MeetingsView.tsx (732 lines)
    ├── PeopleView.tsx (840 lines)
    └── ConversationsView.tsx (760 lines)
```

---

## Commit Message Template

```
refactor: complete RightPanel extraction into view components

Phase 2 completion:
- Extracted PeopleView.tsx (840 lines) - 3 tabs with org chart
- Extracted ConversationsView.tsx (760 lines) - AI strategy builder
- Updated RightPanel.tsx to router pattern (~250 lines)
- Removed Pipeline view (will be separate top-level tab)
- Removed Pipeline section from LeftPanel

Results:
- Main RightPanel: 3,420 → ~250 lines (93% reduction)
- 6 modular view components created
- All functionality preserved exactly
- Zero logic changes, pure extraction refactor

Total views:
1. LibraryView (12 lines)
2. BusinessNotesView (120 lines)
3. BusinessFollowupsView (141 lines)
4. MeetingsView (732 lines)
5. PeopleView (840 lines)
6. ConversationsView (760 lines)
```

---

## EXACT INSTRUCTIONS FOR NEXT SESSION

**Copy-paste this into next thread:**

```
Continue the RightPanel refactoring from Part 1.

I need you to:

1. Read /Users/ephraimalbaro/CascadeProjects/remindme/REFACTOR_PLAN_NEXT_SESSION.md

2. Extract PeopleView:
   - Read lines 1479-2319 from RightPanel.tsx
   - Create /app/business/components/views/PeopleView.tsx
   - Copy content EXACTLY (no changes)
   - Add proper imports and props interface

3. Extract ConversationsView:
   - Read lines 2650-3411 from RightPanel.tsx  
   - Create /app/business/components/views/ConversationsView.tsx
   - Copy content EXACTLY (no changes)
   - Add proper imports and props interface

4. Update RightPanel.tsx:
   - Keep all state and handlers (lines 37-833)
   - Replace view code with router pattern
   - Add view component imports
   - Remove Pipeline view code (lines 2321-2425)

5. Update LeftPanel.tsx:
   - Remove 'pipeline' from sectionOrder array
   - Remove pipeline from sectionConfig

6. Verify no code lost, test compilation

7. Commit with message from plan

8. Push to git

This is pure extraction refactoring - preserve ALL code exactly.
```

---

## Critical Reminders

- ✅ **Pure extraction** - no condensing, no logic changes
- ✅ **Exact line-by-line copy** from original
- ✅ **All CSS classes preserved**
- ✅ **All API calls preserved**
- ✅ **All formatting preserved**
- ✅ **Props interfaces must match exact state usage**

---

## File Locations Reference

```
Original file: /Users/ephraimalbaro/CascadeProjects/remindme/app/business/components/RightPanel.tsx
Working directory: /Users/ephraimalbaro/CascadeProjects/remindme
```
