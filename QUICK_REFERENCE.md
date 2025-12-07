# 🚀 RemindMe - Quick Reference Guide

## File Navigation Map

### 🏠 Main Application Entry
```
app/page.tsx (298 lines)
├─ Orchestrates entire app
├─ Uses 8 custom hooks
├─ Renders split-view layout
└─ Manages authentication
```

### 📦 Type Definitions (START HERE)
```
lib/types.ts
├─ Person, Event, FollowUp interfaces
├─ AIOrganizedData structure
├─ PersonFormData
└─ All TypeScript types
```

### 🎨 Constants & Configuration
```
lib/constants.ts
├─ CONTEXT_TYPES (Event, Business, etc.)
├─ SECTIONS (Personal, Business, etc.)
├─ PRIORITY_LEVELS (Low, Medium, High)
└─ UI constants
```

---

## Component Hierarchy

### Left Panel (Capture)
```
PersonInfoForm
  ├─ Name input
  ├─ Company input
  ├─ Role input
  └─ Location input

ContextSelector
  └─ Event/Business/Colleague/Friends/Family

CaptureSection
  ├─ VoiceRecorder
  ├─ Text input (Textarea)
  ├─ LinkedInPasteInput
  └─ "Organize with AI" button

PreviewSection (when AI organizes)
  ├─ PersonCard
  ├─ AboutSection
  ├─ BackgroundSection
  │   ├─ Keywords
  │   ├─ Companies
  │   ├─ Industries
  │   ├─ Skills
  │   ├─ Technologies
  │   └─ Interests
  ├─ NotesSection
  ├─ FollowUpsSection
  └─ "Add Memory" button
```

### Right Panel (Library)
```
LibraryPanel
  ├─ Tabs (Contacts, Events, To-Do)
  ├─ PeopleList
  │   └─ SortablePersonCard (drag-and-drop)
  ├─ EventsList
  │   └─ SortableEventCard (drag-and-drop)
  └─ FollowUpsList
      └─ SortableFollowUpCard (drag-and-drop)
```

---

## Custom Hooks Reference

| Hook | File | What It Does |
|------|------|--------------|
| `useSpeechRecognition` | hooks/useSpeechRecognition.ts | Voice recording via Web Speech API |
| `useAIOrganization` | hooks/useAIOrganization.ts | Send notes to OpenAI for structuring |
| `useMemorySave` | hooks/useMemorySave.ts | Save to database with auth |
| `usePersonForm` | hooks/usePersonForm.ts | Manage person form fields |
| `usePeopleData` | hooks/usePeopleData.ts | Fetch/manage people from DB |
| `useEventsData` | hooks/useEventsData.ts | Fetch/manage events from DB |
| `useFollowUpsData` | hooks/useFollowUpsData.ts | Fetch/manage follow-ups from DB |
| `useDragAndDrop` | hooks/useDragAndDrop.ts | Handle drag-and-drop reordering |

---

## API Routes

| Route | File | Method | Purpose |
|-------|------|--------|---------|
| `/api/organize` | app/api/organize/route.ts | POST | AI organization with OpenAI |
| `/api/parse-linkedin` | app/api/parse-linkedin/route.ts | POST | Parse LinkedIn profile text |
| `/api/save-memory` | app/api/save-memory/route.ts | POST | Save to Supabase database |

---

## Database Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `people` | Contacts | name, company, role, skills, interests |
| `people_business_profiles` | LinkedIn data | about, experience, education, follower_count |
| `memories` | Notes/conversations | raw_text, keywords, companies, industries |
| `memory_people` | Link memories to people | memory_id, person_id |
| `events` | Conferences/meetings | name, date, location |
| `follow_ups` | Action items | description, priority, status, due_date |

---

## Common Tasks

### Add a New Context Type
1. Open `lib/constants.ts`
2. Add to `CONTEXT_TYPES` array
3. Import icon from lucide-react

### Add a New Person Field
1. Update `lib/types.ts` → `Person` interface
2. Update `lib/types.ts` → `PersonData` interface
3. Update `components/capture/PersonInfoForm.tsx` (add input)
4. Update `hooks/usePersonForm.ts` (add to state)
5. Update database migration (add column)

### Modify AI Organization
1. Open `app/api/organize/route.ts`
2. Update OpenAI prompt (lines 44-95)
3. Update response structure

### Change Library Layout
1. Open `components/library/LibraryPanel.tsx`
2. Modify tab structure or add new tab

### Update Drag-and-Drop Logic
1. Open `hooks/useDragAndDrop.ts`
2. Modify handler functions

---

## Data Flow Patterns

### Voice Recording → Save
```
1. User clicks mic
2. useSpeechRecognition → Web Speech API
3. transcript state updates
4. useEffect appends to captureText
5. User clicks "Organize"
6. useAIOrganization → POST /api/organize
7. OpenAI returns structured data
8. aiPreview state populated
9. PreviewSection renders
10. User edits and clicks "Add Memory"
11. useMemorySave → POST /api/save-memory
12. Database updated
13. usePeopleData.fetchPeople() refreshes library
```

### Load Person from Library
```
1. User clicks person card
2. usePeopleData.loadPersonIntoForm(personId)
3. Queries people, memories, follow_ups
4. Updates PersonInfoForm fields
5. Sets aiPreview with loaded data
6. PreviewSection renders
7. User can add more notes
8. Click "Add Memory" to update
```

---

## State Management Map

### Page-Level State (app/page.tsx)
- `captureText` - Raw notes text
- `contextType` - Event/Business/etc.
- `linkedInProfilePaste` - Pasted LinkedIn text
- `parsedProfileData` - Parsed LinkedIn object
- `isParsing` - Loading state for LinkedIn parse

### Hook-Managed State
- `useSpeechRecognition` → isRecording, transcript
- `useAIOrganization` → isProcessing, aiPreview
- `useMemorySave` → isSaving
- `usePersonForm` → personName, personCompany, etc.
- `usePeopleData` → people array
- `useEventsData` → events array
- `useFollowUpsData` → followUps array

### Component-Internal State
- `PreviewSection` → editedPreview (managed internally)
- `BackgroundSection` → isExpanded
- `AboutSection` → isExpanded

---

## File Size Quick Stats

| Category | File Count | Total Lines |
|----------|-----------|-------------|
| **Main Page** | 1 | 298 |
| **Hooks** | 8 | ~600 |
| **Library Components** | 7 | ~500 |
| **Capture Components** | 5 | ~300 |
| **Preview Components** | 6 | ~500 |
| **Layout Components** | 2 | ~100 |
| **Types & Constants** | 2 | ~400 |
| **API Routes** | 3 | ~500 |
| **Total** | 34 | ~3,200 |

---

## Key Principles Applied

1. **Single Responsibility** - Each file does ONE thing
2. **DRY (Don't Repeat Yourself)** - Reusable hooks and components
3. **Documentation First** - Every file explains itself
4. **Type Safety** - TypeScript types centralized
5. **Separation of Concerns** - UI, logic, data separated
6. **Composition** - Small components composed into larger ones

---

## Quick Debugging Guide

### Voice recording not working?
→ Check `hooks/useSpeechRecognition.ts`
→ Browser support (Chrome, Safari, Edge only)

### AI organization fails?
→ Check `hooks/useAIOrganization.ts`
→ Verify `OPENAI_API_KEY` in `.env.local`
→ Check API route: `/api/organize/route.ts`

### Save not working?
→ Check `hooks/useMemorySave.ts`
→ Verify Supabase auth token
→ Check API route: `/api/save-memory/route.ts`
→ Check RLS policies in Supabase

### Library not loading?
→ Check `hooks/usePeopleData.ts`
→ Verify authentication
→ Check Supabase connection

### Drag-and-drop not working?
→ Check `hooks/useDragAndDrop.ts`
→ Verify display_order column exists
→ Check activation constraints (250ms press)

---

## Environment Variables Required

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_key (optional)
PINECONE_INDEX_NAME=your_index_name (optional)
```

---

## File Location Quick Lookup

```
Want to modify...                  →  Go to...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Person input form                  →  components/capture/PersonInfoForm.tsx
Context type buttons               →  components/capture/ContextSelector.tsx
Voice recording                    →  hooks/useSpeechRecognition.ts
AI organization prompt             →  app/api/organize/route.ts
Preview editing                    →  components/preview/BackgroundSection.tsx
Save to database                   →  hooks/useMemorySave.ts
Library tabs                       →  components/library/LibraryPanel.tsx
Person card display                →  components/library/SortablePersonCard.tsx
Drag-and-drop logic                →  hooks/useDragAndDrop.ts
TypeScript types                   →  lib/types.ts
Constants (context types, etc.)    →  lib/constants.ts
Main page orchestration            →  app/page.tsx
```

---

## 🎓 Learning Path for New Developers

### Day 1: Understand Structure
1. Read `REFACTORING_COMPLETE.md`
2. Read `lib/types.ts` (understand data models)
3. Read `lib/constants.ts` (understand config)
4. Skim `app/page.tsx` (see how it all connects)

### Day 2: Understand Hooks
1. Read `hooks/usePeopleData.ts`
2. Read `hooks/useAIOrganization.ts`
3. Read `hooks/useMemorySave.ts`
4. Trace a save flow from UI → DB

### Day 3: Understand Components
1. Read `components/library/LibraryPanel.tsx`
2. Read `components/capture/CaptureSection.tsx`
3. Read `components/preview/PreviewSection.tsx`
4. See how they compose together

### Day 4: Understand API
1. Read `/api/organize/route.ts`
2. Read `/api/save-memory/route.ts`
3. Understand OpenAI integration
4. Understand Supabase operations

### Day 5: Make Changes
1. Try adding a new field to PersonInfoForm
2. Try adding a new context type
3. Try modifying the AI prompt
4. Test the full flow

---

**Happy coding! The codebase is well-documented and ready for you to explore. 🚀**
