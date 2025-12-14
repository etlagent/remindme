# RightPanel Refactoring Checklist

## Phase 1: COMPLETED ✅

- [x] Created views directory structure
- [x] Extracted LibraryView.tsx (12 lines)
- [x] Extracted BusinessNotesView.tsx (120 lines)  
- [x] Extracted BusinessFollowupsView.tsx (141 lines)
- [x] Extracted MeetingsView.tsx (732 lines)
- [x] Committed Phase 1 progress

**Status:** 4/6 views extracted (1,005 lines)

---

## Phase 2: PENDING ⏳

### Remaining Tasks:

- [ ] Extract PeopleView.tsx (840 lines)
  - Lines 1479-2319 from RightPanel.tsx
  - 3 tabs: Assigned/Library/Organization
  - Org chart with drag & drop
  - Team management
  - Edit person modal

- [ ] Extract ConversationsView.tsx (760 lines)
  - Lines 2650-3411 from RightPanel.tsx
  - AI strategy builder
  - Clarifying questions flow
  - Conversation steps display
  - Saved strategies

- [ ] Update RightPanel.tsx to router
  - Keep state & handlers (lines 37-833)
  - Replace views with component imports
  - Add router logic
  - Remove Pipeline view (lines 2321-2425)

- [ ] Update LeftPanel.tsx
  - Remove 'pipeline' from sectionOrder
  - Remove pipeline from sectionConfig

- [ ] Verify & Test
  - No code lost
  - Compilation successful
  - All functionality preserved

- [ ] Final Commit & Push
  - Use message template from plan
  - Push to remote

---

## Expected Results

**Before:**
- RightPanel.tsx: 3,420 lines

**After:**
- RightPanel.tsx: ~250 lines (93% reduction) ✨
- 6 view components: 2,605 lines total
- Pipeline removed: ~100 lines (moving to separate tab)

**Files Created:**
1. ✅ LibraryView.tsx
2. ✅ BusinessNotesView.tsx
3. ✅ BusinessFollowupsView.tsx
4. ✅ MeetingsView.tsx
5. ⏳ PeopleView.tsx (next session)
6. ⏳ ConversationsView.tsx (next session)

---

## Next Session Command

See `REFACTOR_PLAN_NEXT_SESSION.md` for copy-paste instructions.
