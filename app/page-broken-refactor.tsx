/**
 * MAIN PAGE - REMINDME APP
 * 
 * Primary interface for capturing and managing professional relationships.
 * Split-screen layout: Capture (left) and Library (right).
 * 
 * REFACTORED FROM:
 * - Original app/page.tsx (2,098 lines) reduced to ~250 lines
 * - Extracted components to /components/library, /components/capture, /components/layout
 * - Extracted hooks to /hooks
 * - Extracted types to /lib/types.ts
 * - Extracted constants to /lib/constants.ts
 * 
 * LAYOUT STRUCTURE:
 * ├── Header (app title + auth button)
 * └── SplitView
 *     ├── Left Panel (Capture)
 *     │   ├── PersonInfoForm (name, company, role, location)
 *     │   ├── ContextSelector (event, business, colleague, etc.)
 *     │   ├── CaptureSection (voice, text, LinkedIn paste, organize button)
 *     │   └── PreviewSection (AI-organized data editor)
 *     └── Right Panel (Library)
 *         └── LibraryPanel (tabs: Contacts, Events, To-Do)
 * 
 * CUSTOM HOOKS USED:
 * - useSpeechRecognition: Voice recording via Web Speech API
 * - useAIOrganization: Send notes to OpenAI for structuring
 * - useMemorySave: Save to database via API
 * - usePersonForm: Form state management
 * - usePeopleData: Fetch/manage people from database
 * - useEventsData: Fetch/manage events from database
 * - useFollowUpsData: Fetch/manage follow-ups from database
 * - useDragAndDrop: Reorder items with drag-and-drop
 * 
 * DATA FLOW:
 * 1. User types notes or uses voice recording
 * 2. Optional: Paste LinkedIn profile for auto-fill
 * 3. Click "Organize with AI" → sends to /api/organize
 * 4. AI extracts structured data (people, keywords, companies, follow-ups)
 * 5. User edits preview (add/remove items)
 * 6. Click "Add Memory" → sends to /api/save-memory
 * 7. Database saves: people, memories, follow-ups, events
 * 8. Library refreshes to show new contacts
 * 9. User can click contacts to load into form for adding more notes
 * 
 * KEY FEATURES:
 * - Voice-to-text recording
 * - AI-powered organization with OpenAI
 * - LinkedIn profile parsing
 * - Drag-and-drop reordering in library
 * - Real-time preview editing
 * - Multi-tab library (Contacts, Events, To-Do)
 * - Authentication with Supabase
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Layout Components
import { Header } from "@/components/layout/Header";
import { SplitView } from "@/components/layout/SplitView";

// Capture Components
import { PersonInfoForm } from "@/components/capture/PersonInfoForm";
import { ContextSelector } from "@/components/capture/ContextSelector";
import { CaptureSection } from "@/components/capture/CaptureSection";

// Preview Components
import { PreviewSection } from "@/components/preview/PreviewSection";

// Library Components
import { LibraryPanel } from "@/components/library/LibraryPanel";

// Custom Hooks
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useAIOrganization } from "@/hooks/useAIOrganization";
import { useMemorySave } from "@/hooks/useMemorySave";
import { usePersonForm } from "@/hooks/usePersonForm";
import { usePeopleData } from "@/hooks/usePeopleData";
import { useEventsData } from "@/hooks/useEventsData";
import { useFollowUpsData } from "@/hooks/useFollowUpsData";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";

// Types
import type { ContextType } from "@/lib/types";

export default function Home() {
  const router = useRouter();

  // ===================================================================
  // AUTHENTICATION STATE
  // ===================================================================
  const [authUser, setAuthUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // ===================================================================
  // CUSTOM HOOKS
  // ===================================================================
  
  // Speech recognition for voice recording
  const { isRecording, transcript, toggleListening, clearTranscript } = useSpeechRecognition();
  
  // AI organization
  const { isProcessing, aiPreview, organizeWithAI, setAiPreview } = useAIOrganization();
  
  // Memory save
  const { isSaving, saveMemory } = useMemorySave();
  
  // Person form state
  const { personForm, updateField, updateForm, clearForm } = usePersonForm();
  
  // Data management
  const { people, setPeople, fetchPeople, loadPersonIntoForm } = usePeopleData();
  const { events, setEvents, fetchEvents } = useEventsData();
  const { followUps, setFollowUps, fetchFollowUps } = useFollowUpsData();
  
  // Drag and drop handlers
  const { handlePeopleDragEnd, handleEventsDragEnd, handleFollowUpsDragEnd } = useDragAndDrop();

  // ===================================================================
  // LOCAL STATE (Minimal - most moved to hooks)
  // ===================================================================
  const [captureText, setCaptureText] = useState("");
  const [contextType, setContextType] = useState<ContextType>("event");
  const [linkedInProfilePaste, setLinkedInProfilePaste] = useState("");
  const [parsedProfileData, setParsedProfileData] = useState<any>(null);
  const [isParsing, setIsParsing] = useState(false);

  // ===================================================================
  // EFFECTS
  // ===================================================================

  /**
   * Check authentication status on mount
   * Load library data if authenticated
   */
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log("🔐 Auth Check:", {
        hasSession: !!session,
        user: session?.user?.email,
        error: error?.message
      });
      setAuthUser(session?.user || null);
      setAuthChecked(true);
      
      // Load data if authenticated
      if (session) {
        fetchPeople();
        fetchEvents();
        fetchFollowUps();
      }
    };
    checkAuth();
  }, []);

  /**
   * Handle voice transcript updates
   * Append transcript to notes when recording stops
   */
  useEffect(() => {
    if (transcript) {
      // Add to capture text with timestamp
      const today = new Date().toLocaleDateString('en-US', { 
        month: 'numeric', 
        day: 'numeric', 
        year: '2-digit' 
      });
      const newText = `${today} - ${transcript.trim()}`;
      setCaptureText((prev) => prev ? `${newText}\n${prev}` : newText);
      clearTranscript();
    }
  }, [transcript]);

  // ===================================================================
  // HANDLERS
  // ===================================================================

  /**
   * Handle LinkedIn profile paste and parsing
   */
  const handleParseLinkedIn = async () => {
    if (!linkedInProfilePaste.trim()) {
      alert("Please paste a LinkedIn profile first!");
      return;
    }

    setIsParsing(true);

    try {
      const response = await fetch("/api/parse-linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileText: linkedInProfilePaste }),
      });

      if (!response.ok) throw new Error("Failed to parse LinkedIn profile");

      const data = await response.json();
      setParsedProfileData(data);
      
      // Auto-fill person info fields
      updateForm({
        personName: data.name || "",
        personCompany: data.company || "",
        personRole: data.role || "",
        personLocation: "",
      });
      
      // Clear paste field
      setLinkedInProfilePaste("");
      
      // Auto-organize with AI
      await handleOrganize(data);
      
    } catch (error) {
      console.error("Error parsing LinkedIn profile:", error);
      alert("Failed to parse LinkedIn profile. Please try again.");
    } finally {
      setIsParsing(false);
    }
  };

  /**
   * Handle "Organize with AI" button click
   * AI preview is managed by useAIOrganization hook
   */
  const handleOrganize = async (profileData: any = null) => {
    await organizeWithAI(
      captureText,
      contextType,
      "", // persistentEvent
      "", // sectionName
      "", // panelParticipants
      "", // linkedInUrls
      "", // companyLinkedInUrls
      profileData || parsedProfileData,
      [] // parsedProfilesArray
    );
  };

  /**
   * Handle "Add Memory" button click (save to database)
   * This is called by PreviewSection with the edited data
   */
  const handleSave = async (editedData: any) => {
    const success = await saveMemory(captureText, editedData);
    
    if (success) {
      // Clear form and refresh library
      setCaptureText("");
      setAiPreview(null);
      setParsedProfileData(null);
      clearForm();
      
      // Refresh library data
      await fetchPeople();
      await fetchEvents();
      await fetchFollowUps();
      
      alert("Contact saved successfully! Check the Library on the right.");
    }
  };

  /**
   * Handle person card click in library
   * Loads person data into capture form
   */
  const handleLoadPerson = async (personId: string) => {
    const { person, previewData } = await loadPersonIntoForm(personId);
    
    if (person && previewData) {
      // Update form fields
      updateForm({
        personName: person.name || '',
        personCompany: person.company || '',
        personRole: person.role || '',
        personLocation: person.location || '',
      });
      
      // Set preview data (PreviewSection will manage editing)
      setAiPreview(previewData);
    }
  };

  /**
   * Handle form clear button
   */
  const handleClearAll = () => {
    setCaptureText("");
    setLinkedInProfilePaste("");
    setParsedProfileData(null);
    setAiPreview(null);
    clearForm();
  };

  // ===================================================================
  // RENDER
  // ===================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Split Screen Layout */}
      <SplitView
        left={
          <div className="space-y-4">
            {/* Person Info Form */}
            <PersonInfoForm
              personForm={personForm}
              onFieldChange={updateField}
              onClear={handleClearAll}
            />

            {/* Context Type Selector */}
            <ContextSelector
              value={contextType}
              onChange={setContextType}
            />

            {/* Capture Section (voice, text, LinkedIn, organize button) */}
            <CaptureSection
              captureText={captureText}
              onCaptureTextChange={setCaptureText}
              linkedInProfilePaste={linkedInProfilePaste}
              onLinkedInPasteChange={setLinkedInProfilePaste}
              onParseLinkedIn={handleParseLinkedIn}
              isParsing={isParsing}
              isRecording={isRecording}
              onToggleRecording={toggleListening}
              onOrganize={() => handleOrganize()}
              isProcessing={isProcessing}
            />

            {/* Preview Section (editable AI-organized data) */}
            {aiPreview && (
              <PreviewSection
                captureText={captureText}
                aiPreview={aiPreview}
                onSave={handleSave}
                isSaving={isSaving}
              />
            )}
          </div>
        }
        right={
          <LibraryPanel
            people={people}
            events={events}
            followUps={followUps}
            onPeopleDragEnd={(event) => handlePeopleDragEnd(event, people, setPeople)}
            onEventsDragEnd={(event) => handleEventsDragEnd(event, events, setEvents)}
            onFollowUpsDragEnd={(event) => handleFollowUpsDragEnd(event, followUps, setFollowUps)}
            onLoadPerson={handleLoadPerson}
          />
        }
      />
    </div>
  );
}
