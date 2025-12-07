# COMPLETE FEATURE INVENTORY - DO NOT REMOVE ANYTHING

## Before ANY refactoring, verify ALL these features are preserved:

### 1. PERSON INFO FORM (Lines ~969-1045)
- [x] Name input field
- [x] Company input field  
- [x] Role/Title input field
- [x] Location input field
- [x] Clear button (top right)
- [x] Choose File button (top right)

### 2. CONTEXT SELECTOR (Lines ~1047-1080)
- [x] Context type badges (Event, Business, Colleague, Friends, Family)
- [x] Active state highlighting (blue for selected)
- [x] Show/Hide button for expandable details
- [x] Context icon (CheckSquare)

### 3. DYNAMIC CONTEXT FIELDS - EVENT (Lines ~1082-1330)
#### Event Name Section
- [x] "Set Event" button (when no event set)
- [x] Event name input field (when adding)
- [x] "Set" button to confirm event
- [x] Event badge display (when set)
- [x] "X" button to remove event

#### Session Fields (shown when "+ Set Session" clicked)
- [x] "+ Set Session" button
- [x] Session Name input
- [x] Panel Participants input
- [x] LinkedIn URLs textarea (multiple URLs, one per line)
- [x] "X Remove Session" button

#### 1-on-1 Contact Fields (shown when NO session)
- [x] Instagram URL input
- [x] Facebook URL input
- [x] TikTok URL input
- [x] LinkedIn personal URL input
- [x] LinkedIn Company URL input
- [x] "Paste LinkedIn Profile" section
- [x] LinkedIn profile paste textarea
- [x] "Parse Profile" button

### 4. CONTEXT FIELDS - OTHER TYPES
Need to verify what shows for:
- [ ] Business context
- [ ] Colleague context
- [ ] Friends context
- [ ] Family context
- [ ] Project context (if exists)
- [ ] Trip context (if exists)

### 5. CAPTURE SECTION (Need to find exact lines)
- [ ] Voice recorder button (mic)
- [ ] Text input textarea
- [ ] "Organize with AI" button

### 6. THE 4 MAIN COLLAPSED SECTIONS (Lines 1533-1983)
ALL ALWAYS VISIBLE - Shown in Card component

#### LinkedIn Section (Lines 1536-1794) - Collapsible
- [x] "LinkedIn" header button with ▶/▼ toggle
- [x] showLinkedInData state toggle
- [x] Keywords section:
  - [x] Input field (press Enter to add)
  - [x] Badge list with × to remove
  - [x] Blue badges
- [x] Companies section:
  - [x] Input field (press Enter to add)
  - [x] Badge list with × to remove
  - [x] Purple badges
- [x] Industries section:
  - [x] Input field (press Enter to add)
  - [x] Badge list with × to remove
  - [x] Green badges
- [x] Skills section:
  - [x] Input field (press Enter to add)
  - [x] Badge list with × to remove
  - [x] Amber badges
  - [x] Stored in editedPreview.people[0].skills
- [x] Technologies section:
  - [x] Input field (press Enter to add)
  - [x] Badge list with × to remove
  - [x] Cyan badges
  - [x] Stored in editedPreview.people[0].technologies
- [x] Interests section:
  - [x] Input field (press Enter to add)
  - [x] Badge list with × to remove
  - [x] Pink badges
  - [x] Stored in editedPreview.people[0].interests

#### Conversations Section (Lines 1796-1851) - Collapsible
- [x] "Conversations" header button with ▶/▼ toggle
- [x] showConversations state toggle
- [x] Textarea for adding notes (Enter to save, Shift+Enter for new line)
- [x] Note list with:
  - [x] Date display (MM/DD/YY format)
  - [x] Note text with bullet
  - [x] × delete button
  - [x] Stored in editedPreview.additional_notes array
- [x] Empty state message

#### Follow-ups Section (Lines 1853-1901) - Collapsible  
- [x] "Follow-ups" header button with ▶/▼ toggle
- [x] showFollowUps state toggle
- [x] Textarea for adding follow-ups (Enter to save, Shift+Enter for new line)
- [x] Follow-up list with:
  - [x] Description text with bullet
  - [x] × delete button
  - [x] Stored in editedPreview.follow_ups or editedPreview.followUps
- [x] Empty state message

#### Memories Section (Lines 1903-1958) - Collapsible
- [x] "Memories" header button with ▶/▼ toggle
- [x] showMemories state toggle
- [x] Textarea for adding memories (Enter to save, Shift+Enter for new line)
- [x] Memory list with:
  - [x] Date display (MM/DD/YY format)
  - [x] Memory text with bullet
  - [x] × delete button
  - [x] Stored in editedPreview.memories array
- [x] Empty state message

### 7. LIBRARY PANEL (Right side)
- [ ] Tabs (Contacts, Events, To-Do)
- [ ] Drag-and-drop cards
- [ ] Person cards
- [ ] Event cards
- [ ] Follow-up cards

### 8. STATE VARIABLES (Need to preserve ALL)
- [ ] personName, personCompany, personRole, personLocation
- [ ] contextType
- [ ] persistentEvent, showEventInput
- [ ] sectionName, panelParticipants
- [ ] linkedInUrls, companyLinkedInUrls
- [ ] linkedInProfilePaste
- [ ] showSessionFields
- [ ] isContextExpanded
- [ ] captureText
- [ ] aiPreview, editedPreview
- [ ] isEditingPreview
- [ ] showLinkedInData, showAboutMe
- [ ] people, events, followUps arrays
- [ ] All other state

### 9. FUNCTIONS TO PRESERVE
- [ ] handleParseLinkedInProfile
- [ ] handleOrganizeWithAI
- [ ] handleSave
- [ ] handleDragEnd functions
- [ ] loadPersonIntoForm
- [ ] All other handlers

## REFACTORING RULES:
1. ❌ DO NOT REMOVE ANY INPUTS
2. ❌ DO NOT REMOVE ANY BUTTONS  
3. ❌ DO NOT REMOVE ANY SECTIONS
4. ❌ DO NOT CHANGE ANY FUNCTIONALITY
5. ✅ ONLY extract into separate components
6. ✅ PRESERVE all state
7. ✅ PRESERVE all handlers
8. ✅ PRESERVE exact UI layout
9. ✅ PRESERVE all conditional logic

## NEXT STEP:
Complete this inventory by finding ALL remaining features before ANY refactoring.
