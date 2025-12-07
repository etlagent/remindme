# CAREFUL REFACTORING PLAN V2
## RULE: PRESERVE EVERY DETAIL - ONLY EXTRACT TO COMPONENTS

## Approach:
1. Extract ONLY visual components
2. Keep ALL state in page.tsx
3. Pass state and callbacks as props
4. NO functionality changes
5. NO feature removal

---

## Components to Extract (Small, Safe Extractions)

### 1. PersonInfoCard Component
**Extract:** Lines ~969-1045  
**Purpose:** Name, company, role, location inputs with Clear/File buttons  
**Props:**
- personName, personCompany, personRole, personLocation (values)
- onNameChange, onCompanyChange, onRoleChange, onLocationChange (callbacks)
- onClear (callback)
**State:** REMAINS in page.tsx
**Complexity:** LOW ✅

### 2. ContextSelectorWithDynamicFields Component  
**Extract:** Lines ~1047-1511 (BIG SECTION!)
**Purpose:** Context badges + all dynamic fields (Event, Business, Colleague, etc.)
**Props:**
- contextType (value)
- onContextTypeChange (callback)
- isContextExpanded, setIsContextExpanded (state + callback)
- persistentEvent, setPersistentEvent
- showEventInput, setShowEventInput
- sectionName, setSectionName
- panelParticipants, setPanelParticipants  
- linkedInUrls, setLinkedInUrls
- companyLinkedInUrls, setCompanyLinkedInUrls
- linkedInProfilePaste, setLinkedInProfilePaste
- showSessionFields, setShowSessionFields
- isParsing
- onParseLinkedInProfile (callback)
**State:** REMAINS in page.tsx
**Complexity:** HIGH ⚠️ - BUT NECESSARY

### 3. VoiceRecorderButton Component
**Extract:** Lines ~1513-1531
**Purpose:** Voice recording button
**Props:**
- isRecording (value)
- onToggle (callback)
**State:** REMAINS in page.tsx
**Complexity:** LOW ✅

### 4. FourCollapsedSections Component
**Extract:** Lines ~1533-1983
**Purpose:** LinkedIn, Conversations, Follow-ups, Memories sections
**Props:**
- editedPreview (entire object)
- setEditedPreview (callback)
- showLinkedInData, setShowLinkedInData
- showConversations, setShowConversations
- showFollowUps, setShowFollowUps
- showMemories, setShowMemories
- onSave (callback)
- onCancel (callback)
- isProcessing
**State:** REMAINS in page.tsx
**Complexity:** HIGH ⚠️ - BUT NECESSARY

### 5. DirectSaveButton Component
**Extract:** Lines ~1986-1996
**Purpose:** "Save to Relationship Builder" button
**Props:**
- aiPreview (value)
- personName (value)
- onSave (callback)
- isProcessing (value)
**State:** REMAINS in page.tsx
**Complexity:** LOW ✅

---

## Files to Create

1. `components/capture/PersonInfoCard.tsx` (LOW risk)
2. `components/capture/ContextSelectorWithDynamicFields.tsx` (HIGH complexity but necessary)
3. `components/capture/VoiceRecorderButton.tsx` (LOW risk)
4. `components/capture/FourCollapsedSections.tsx` (HIGH complexity but necessary)
5. `components/capture/DirectSaveButton.tsx` (LOW risk)

---

## Refactoring Order (Safest First)

### Phase 1: Low Risk Extractions ✅
1. Extract PersonInfoCard  
2. Extract VoiceRecorderButton
3. Extract DirectSaveButton
4. TEST IMMEDIATELY

### Phase 2: High Complexity Extractions ⚠️
5. Extract FourCollapsedSections
6. TEST IMMEDIATELY

### Phase 3: Most Complex Extraction ⚠️⚠️
7. Extract ContextSelectorWithDynamicFields (This is the BIG one - 460+ lines!)
8. TEST IMMEDIATELY

---

## Testing Checklist After Each Phase

After EVERY extraction:
- [ ] Person info form works
- [ ] Context selector works  
- [ ] All dynamic fields show correctly for each context
- [ ] Event name input works
- [ ] Session fields work
- [ ] LinkedIn URLs work
- [ ] LinkedIn Company URLs work
- [ ] LinkedIn profile paste & parse works
- [ ] Voice recording works
- [ ] All 4 collapsed sections work:
  - [ ] LinkedIn section (Keywords, Companies, Industries, Skills, Tech, Interests)
  - [ ] Conversations section
  - [ ] Follow-ups section
  - [ ] Memories section
- [ ] Save button works
- [ ] All state persists correctly

---

## Key Principles

1. ✅ Extract ONLY visual components
2. ✅ Keep ALL state in page.tsx
3. ✅ Pass everything as props
4. ✅ NO logic changes
5. ✅ NO feature removal
6. ✅ Test after EVERY extraction
7. ✅ If anything breaks, REVERT IMMEDIATELY

---

## Expected Results

**Before:** 1 file, 2,098 lines  
**After:** 6 files total:
- page.tsx (~1,200 lines) - Still has ALL state and logic
- PersonInfoCard.tsx (~80 lines)
- VoiceRecorderButton.tsx (~30 lines)
- DirectSaveButton.tsx (~25 lines)
- FourCollapsedSections.tsx (~450 lines)
- ContextSelectorWithDynamicFields.tsx (~460 lines)

**Total lines:** ~2,245 lines (more because of prop declarations)  
**Benefit:** Easier to navigate, same functionality

---

## Next Step

Begin Phase 1 - Extract LOW RISK components first. Get approval before proceeding to Phase 2 and 3.
