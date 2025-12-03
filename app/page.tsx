"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Mic, Type, Image as ImageIcon, Users, Calendar, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AuthButton } from "@/components/AuthButton";
import { supabase } from "@/lib/supabase";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Section = "all" | "personal" | "business" | "projects" | "relationships" | "todos" | "events" | "trips";

// Sortable Event Card Component
function SortableEventCard({ event }: { event: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: event.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="bg-white border-gray-200 p-4 hover:bg-gray-50 transition-all cursor-move">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-gray-800">{event.name}</h3>
            <p className="text-sm text-gray-600">{event.date ? new Date(event.date).toLocaleDateString() : 'No date'}</p>
          </div>
        </div>
        {event.location && (
          <p className="text-xs text-gray-500">📍 {event.location}</p>
        )}
      </Card>
    </div>
  );
}

// Sortable Follow-up Card Component
function SortableFollowUpCard({ followUp }: { followUp: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: followUp.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="bg-white border-gray-200 p-4 hover:bg-gray-50 transition-all cursor-move">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <p className="text-sm text-gray-800">{followUp.description}</p>
          </div>
          <Badge
            className={
              followUp.priority === "high"
                ? "bg-red-100 text-red-700 border-red-200"
                : followUp.priority === "medium"
                ? "bg-amber-100 text-amber-700 border-amber-200"
                : "bg-gray-100 text-gray-700 border-gray-200"
            }
          >
            {followUp.priority || 'medium'}
          </Badge>
        </div>
        <p className="text-xs text-gray-500">
          Status: {followUp.status || 'pending'}
        </p>
      </Card>
    </div>
  );
}

// Sortable Person Card Component
function SortablePersonCard({ person, onLoad }: { person: any; onLoad: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: person.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card 
        className="bg-white border-gray-200 p-4 hover:bg-gray-50 transition-all cursor-move"
        onClick={(e) => {
          if (!isDragging) {
            onLoad(person.id);
          }
        }}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-gray-800">{person.name}</h3>
            <p className="text-sm text-gray-600">
              {person.role && person.company ? `${person.role} at ${person.company}` : person.role || person.company || 'No details'}
            </p>
          </div>
          {person.inspiration_level && (
            <Badge
              className={
                person.inspiration_level === "high"
                  ? "bg-green-100 text-green-700 border-green-200"
                  : person.inspiration_level === "medium"
                  ? "bg-amber-100 text-amber-700 border-amber-200"
                  : "bg-gray-100 text-gray-700 border-gray-200"
              }
            >
              {person.inspiration_level === "high" ? "⭐ Inspiring" : "Worth nurturing"}
            </Badge>
          )}
        </div>
        {person.interests && person.interests.length > 0 && (
          <div className="flex gap-2 mb-2">
            {person.interests.slice(0, 3).map((interest: string, idx: number) => (
              <Badge key={idx} variant="outline" className="text-xs border-gray-300 text-gray-600">
                {interest}
              </Badge>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-500">
          Added: {new Date(person.created_at).toLocaleDateString()}
        </p>
      </Card>
    </div>
  );
}

// Extend Window interface for browser speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function Home() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>("all");
  const [captureText, setCaptureText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [noteCount, setNoteCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiPreview, setAiPreview] = useState<any>(null);
  const [showRawNotes, setShowRawNotes] = useState(true);
  const [contextType, setContextType] = useState<string>("event"); // event, personal, business, todo, project, trip
  const [persistentEvent, setPersistentEvent] = useState("");
  const [showEventInput, setShowEventInput] = useState(false);
  const [showSessionFields, setShowSessionFields] = useState(false);
  const [sectionName, setSectionName] = useState("");
  const [panelParticipants, setPanelParticipants] = useState("");
  const [linkedInUrls, setLinkedInUrls] = useState("");
  const [companyLinkedInUrls, setCompanyLinkedInUrls] = useState("");
  const [linkedInProfilePaste, setLinkedInProfilePaste] = useState("");
  const [parsedProfileData, setParsedProfileData] = useState<any>(null);
  const [parsedProfilesArray, setParsedProfilesArray] = useState<any[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isParsingUrls, setIsParsingUrls] = useState(false);
  const [isContextExpanded, setIsContextExpanded] = useState(false);
  const [isEditingPreview, setIsEditingPreview] = useState(false);
  const [editedPreview, setEditedPreview] = useState<any>(null);
  const [showLinkedInData, setShowLinkedInData] = useState(false);
  const [showAboutMe, setShowAboutMe] = useState(false);
  const [editedMainNotes, setEditedMainNotes] = useState("");
  const [personName, setPersonName] = useState("");
  const [personCompany, setPersonCompany] = useState("");
  const [authUser, setAuthUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [personRole, setPersonRole] = useState("");
  const [personLocation, setPersonLocation] = useState("");
  const [additionalFields, setAdditionalFields] = useState<Array<{id: string, value: string}>>([]);
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
  const [showConversations, setShowConversations] = useState(false);
  const [showFollowUps, setShowFollowUps] = useState(false);
  const [showMemories, setShowMemories] = useState(false);
  const [people, setPeople] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const recognitionRef = useRef<any>(null);
  const isProcessingRef = useRef(false);

  // Store the latest transcript
  const [latestTranscript, setLatestTranscript] = useState("");

  // Fetch people from database
  const fetchPeople = async () => {
    try {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      console.log("📚 Loaded people:", data?.length);
      setPeople(data || []);
    } catch (error) {
      console.error("Error fetching people:", error);
    }
  };

  // Fetch events from database
  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
        return;
      }
      console.log("📅 Loaded events:", data?.length);
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    }
  };

  // Fetch follow-ups from database
  const fetchFollowUps = async () => {
    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .select('*')
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching follow-ups:", error);
        setFollowUps([]);
        return;
      }
      console.log("✅ Loaded follow-ups:", data?.length);
      setFollowUps(data || []);
    } catch (error) {
      console.error("Error fetching follow-ups:", error);
      setFollowUps([]);
    }
  };

  // Handle drag end for people
  const handlePeopleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = people.findIndex((p) => p.id === active.id);
      const newIndex = people.findIndex((p) => p.id === over.id);

      const newPeople = arrayMove(people, oldIndex, newIndex);
      setPeople(newPeople);

      // Update display_order in database
      try {
        const updates = newPeople.map((person, index) => ({
          id: person.id,
          display_order: index
        }));

        for (const update of updates) {
          await supabase
            .from('people')
            .update({ display_order: update.display_order })
            .eq('id', update.id);
        }
      } catch (error) {
        console.error("Error updating order:", error);
      }
    }
  };

  // Handle drag end for events
  const handleEventsDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = events.findIndex((e) => e.id === active.id);
      const newIndex = events.findIndex((e) => e.id === over.id);

      const newEvents = arrayMove(events, oldIndex, newIndex);
      setEvents(newEvents);

      try {
        const updates = newEvents.map((event, index) => ({
          id: event.id,
          display_order: index
        }));

        for (const update of updates) {
          await supabase
            .from('events')
            .update({ display_order: update.display_order })
            .eq('id', update.id);
        }
      } catch (error) {
        console.error("Error updating order:", error);
      }
    }
  };

  // Handle drag end for follow-ups
  const handleFollowUpsDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = followUps.findIndex((f) => f.id === active.id);
      const newIndex = followUps.findIndex((f) => f.id === over.id);

      const newFollowUps = arrayMove(followUps, oldIndex, newIndex);
      setFollowUps(newFollowUps);

      try {
        const updates = newFollowUps.map((followUp, index) => ({
          id: followUp.id,
          display_order: index
        }));

        for (const update of updates) {
          await supabase
            .from('follow_ups')
            .update({ display_order: update.display_order })
            .eq('id', update.id);
        }
      } catch (error) {
        console.error("Error updating order:", error);
      }
    }
  };

  // Load person data into form
  const loadPersonIntoForm = async (personId: string) => {
    try {
      // Fetch person with their memories and follow-ups
      const { data: person, error: personError } = await supabase
        .from('people')
        .select('*')
        .eq('id', personId)
        .single();

      if (personError) throw personError;

      // Fetch memories linked to this person
      const { data: memories, error: memoriesError } = await supabase
        .from('memory_people')
        .select('memory_id, memories(*)')
        .eq('person_id', personId);

      // Fetch follow-ups for this person
      const { data: followUps, error: followUpsError } = await supabase
        .from('follow_ups')
        .select('*')
        .eq('person_id', personId);

      // Populate form fields
      setPersonName(person.name || '');
      setPersonCompany(person.company || '');
      setPersonRole(person.role || '');
      setLinkedInUrls(person.linkedin_url || '');
      setCompanyLinkedInUrls(person.company_linkedin_url || '');

      // Load notes from memories
      if (memories && memories.length > 0) {
        const notes = memories
          .map((m: any) => m.memories?.raw_text)
          .filter(Boolean)
          .join('\n\n');
        setCaptureText(notes);
      }

      // Create preview with person data
      const previewData = {
        people: [person],
        additional_notes: memories?.map((m: any) => {
          const memory = m.memories;
          return {
            text: memory?.raw_text || '',
            date: memory?.created_at ? new Date(memory.created_at).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' }) : ''
          };
        }).filter((note: any) => note.text) || [],
        follow_ups: followUps?.map((f: any) => ({
          description: f.description || '',
          priority: f.priority || 'medium',
          status: f.status || 'pending'
        })).filter((fu: any) => fu.description) || []
      };

      setAiPreview(previewData);
      setEditedPreview(JSON.parse(JSON.stringify(previewData)));
      setIsEditingPreview(true);
      setShowRawNotes(false);

      console.log('✅ Loaded person into form:', person.name);
    } catch (error) {
      console.error('Error loading person:', error);
      alert('Failed to load person data');
    }
  };

  // Setup sensors for drag (requires long press on touch devices)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  // Check auth status on mount and load people
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

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && !recognitionRef.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true; // Keep listening
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          const transcript = event.results[event.results.length - 1][0].transcript;
          if (transcript.trim()) {
            setLatestTranscript(transcript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          if (event.error !== 'aborted' && event.error !== 'no-speech') {
            alert(`Speech recognition error: ${event.error}`);
          }
          setIsListening(false);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsListening(false);
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, []);

  // Handle transcript when it changes
  useEffect(() => {
    if (latestTranscript) {
      // If in preview mode (aiPreview exists), add to My Notes
      if (aiPreview && editedPreview) {
        const notes = editedPreview.additional_notes || [];
        const today = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
        const newNote = {
          date: today,
          text: latestTranscript.trim()
        };
        const newNotes = [newNote, ...notes];
        setEditedPreview({...editedPreview, additional_notes: newNotes});
      } else {
        // Otherwise, add to capture text with date
        const today = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
        const newText = `${today} - ${latestTranscript.trim()}`;
        setCaptureText((prev) => prev ? `${newText}\n${prev}` : newText);
      }
      setLatestTranscript(""); // Clear after processing
    }
  }, [latestTranscript, aiPreview, editedPreview]);

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Safari, or Edge.");
      return;
    }

    if (isListening) {
      // Stop recording
      recognitionRef.current.stop();
      setIsListening(false);
      setIsRecording(false);
    } else {
      // Start recording
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setIsRecording(true);
      } catch (error) {
        console.error("Error starting speech recognition:", error);
      }
    }
  };

  const handleOrganizeWithAI = async () => {
    if (!captureText.trim() && !parsedProfileData && parsedProfilesArray.length === 0) {
      alert("Please add some notes or parse LinkedIn profile(s)!");
      return;
    }

    setIsProcessing(true);
    setShowRawNotes(false);

    try {
      // Call OpenAI API to structure only the user's notes (not LinkedIn data)
      const response = await fetch("/api/organize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          rawText: captureText,
          contextType: contextType,
          persistentEvent: persistentEvent || null,
          sectionName: sectionName || null,
          panelParticipants: panelParticipants || null,
          linkedInUrls: linkedInUrls || null,
          companyLinkedInUrls: companyLinkedInUrls || null,
          parsedProfileData: parsedProfileData, // Single profile
          parsedProfilesArray: parsedProfilesArray.length > 0 ? parsedProfilesArray : null, // Multiple profiles
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to organize notes");
      }

      const data = await response.json();
      setAiPreview(data);
      setEditedPreview(JSON.parse(JSON.stringify(data))); // Set up for editing immediately
      
      // Get the notes without date (date will be displayed separately)
      const rawNotes = captureText.split('---')[1]?.trim() || captureText.split('Add your notes below:')[1]?.trim() || captureText;
      setEditedMainNotes(rawNotes);
      
      setIsEditingPreview(true); // Go straight to edit mode
      setShowRawNotes(false);
    } catch (error) {
      console.error("Error organizing notes:", error);
      alert("Failed to organize notes. Please try again.");
      setShowRawNotes(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDirectSave = async () => {
    setIsProcessing(true);
    try {
      // Build structured data from form fields
      const structuredData = {
        people: [{
          name: personName,
          company: personCompany,
          role: personRole,
          linkedin_url: linkedInUrls,
          company_linkedin_url: companyLinkedInUrls,
        }],
        additional_notes: editedPreview?.additional_notes || [],
        follow_ups: editedPreview?.follow_ups || [],
        context_type: contextType,
      };

      // Get auth token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log("💾 Save attempt - Session check:", { 
        hasSession: !!session, 
        hasToken: !!session?.access_token,
        sessionError 
      });
      
      if (!session) {
        alert("Please sign in to save contacts. You may need to refresh the page after signing in.");
        setIsProcessing(false);
        return;
      }

      console.log("💾 Sending save request with token (first 20 chars):", session.access_token.substring(0, 20) + "...");

      // Save to Supabase
      const response = await fetch("/api/save-memory", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          rawText: captureText,
          structuredData: structuredData,
        }),
      });
      
      console.log("💾 Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Save failed:", errorData);
        throw new Error(errorData.error || "Failed to save contact");
      }

      // Clear form and reset
      setCaptureText("");
      setEditedMainNotes("");
      setNoteCount(0);
      setAiPreview(null);
      setShowRawNotes(true);
      setPersonName("");
      setPersonCompany("");
      setPersonRole("");
      setEditedPreview(null);
      setIsEditingPreview(false);
      setLinkedInProfilePaste("");
      setLinkedInUrls("");
      setCompanyLinkedInUrls("");
      
      // Refresh people list
      await fetchPeople();
      
      alert("Contact saved successfully! Check the Library on the right.");
    } catch (error) {
      console.error("Error saving contact:", error);
      alert("Failed to save contact. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveAndSave = async (dataToSave?: any) => {
    if (!aiPreview) return;

    setIsProcessing(true);
    try {
      // Use provided data or fall back to aiPreview
      const finalData = dataToSave || aiPreview;
      
      // Save to Supabase
      const response = await fetch("/api/save-memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: editedMainNotes || captureText, // Use edited notes if available
          structuredData: finalData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save memory");
      }

      // Clear form and reset
      setCaptureText("");
      setEditedMainNotes("");
      setNoteCount(0);
      setAiPreview(null);
      setShowRawNotes(true);
      setPersonName("");
      setPersonCompany("");
      setPersonRole("");
      setEditedPreview(null);
      setIsEditingPreview(false);
      setLinkedInProfilePaste("");
      setLinkedInUrls("");
      setCompanyLinkedInUrls("");
      alert("Contact saved successfully! Check the Library on the right.");
    } catch (error) {
      console.error("Error saving memory:", error);
      alert("Failed to save memory. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditPreview = () => {
    setIsEditingPreview(true);
    setEditedPreview(JSON.parse(JSON.stringify(aiPreview))); // Deep copy
  };

  const handleSavePreviewEdits = () => {
    setAiPreview(editedPreview);
    setIsEditingPreview(false);
  };

  const handleCancelPreviewEdit = () => {
    setIsEditingPreview(false);
    setEditedPreview(null);
  };

  const handleParseLinkedInProfile = async () => {
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

      if (!response.ok) {
        throw new Error("Failed to parse LinkedIn profile");
      }

      const data = await response.json();
      setParsedProfileData(data);
      
      // Auto-fill person info fields
      setPersonName(data.name || "");
      setPersonCompany(data.company || "");
      setPersonRole(data.role || "");
      
      // Clear the paste field
      setLinkedInProfilePaste("");
      
      // Auto-organize with AI to populate background fields
      setIsProcessing(true);
      setIsParsing(false); // Done parsing, now organizing
      
      try {
        // Create a text summary of the LinkedIn profile for AI to process
        const profileSummary = `LinkedIn Profile Data:
Name: ${data.name || 'Unknown'}
Company: ${data.company || 'Unknown'}
Role: ${data.role || 'Unknown'}
${data.follower_count ? `Followers: ${data.follower_count}` : ''}

About: ${data.about || 'No about section'}

Experience:
${data.experience?.map((exp: any) => `- ${exp.role} at ${exp.company} (${exp.dates})`).join('\n') || 'No experience listed'}

Education:
${data.education?.map((edu: any) => `- ${edu.school}${edu.degree ? ` - ${edu.degree}` : ''}`).join('\n') || 'No education listed'}

Skills: ${data.skills?.join(', ') || 'No skills listed'}

${captureText ? `\nAdditional Notes:\n${captureText}` : ''}`;

        const organizeResponse = await fetch("/api/organize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            rawText: profileSummary,
            contextType: contextType,
            persistentEvent: persistentEvent || null,
            sectionName: sectionName || null,
            panelParticipants: panelParticipants || null,
            linkedInUrls: linkedInUrls || null,
            companyLinkedInUrls: companyLinkedInUrls || null,
            parsedProfileData: data,
            parsedProfilesArray: null,
          }),
        });

        if (!organizeResponse.ok) {
          throw new Error("Failed to organize");
        }

        const organizedData = await organizeResponse.json();
        setAiPreview(organizedData);
        setEditedPreview(JSON.parse(JSON.stringify(organizedData)));
        
        // Initialize empty notes for user to add
        setEditedMainNotes("");
        
        setIsEditingPreview(true);
        setShowRawNotes(false);
        
      } catch (orgError) {
        console.error("Error auto-organizing:", orgError);
        alert("Profile parsed but failed to auto-organize. You can still add notes and organize manually.");
      }
      
    } catch (error) {
      console.error("Error parsing LinkedIn profile:", error);
      alert("Failed to parse LinkedIn profile. Please try again.");
      setIsParsing(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleParseLinkedInUrls = async () => {
    const urls = linkedInUrls.split('\n').filter(url => url.trim());
    
    if (urls.length === 0) {
      alert("Please paste LinkedIn URLs (one per line)!");
      return;
    }

    setIsParsingUrls(true);
    const parsedProfiles: any[] = [];

    try {
      for (const url of urls) {
        const response = await fetch("/api/parse-linkedin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            profileText: `LinkedIn URL: ${url.trim()}`,
            isUrl: true 
          }),
        });

        if (response.ok) {
          const data = await response.json();
          data.linkedin_url = url.trim();
          parsedProfiles.push(data);
        }
      }

      setParsedProfilesArray(parsedProfiles);
      
      const names = parsedProfiles.map(p => p.name || 'Unknown').join(', ');
      alert(`✅ Parsed ${parsedProfiles.length} profiles:\n${names}\n\nAdd your panel notes below, then click "Organize with AI" to save all.`);
      
    } catch (error) {
      console.error("Error parsing LinkedIn URLs:", error);
      alert("Failed to parse some LinkedIn URLs. Please try again.");
    } finally {
      setIsParsingUrls(false);
    }
  };

  const contextTypes = [
    { value: "event", label: "Event/Conference", icon: Calendar },
    { value: "business", label: "Business Meeting", icon: CheckSquare },
    { value: "colleague", label: "Colleague", icon: Users },
    { value: "friends", label: "Friends", icon: Users },
    { value: "family", label: "Family", icon: Users },
  ];

  const sections: { value: Section; label: string }[] = [
    { value: "all", label: "All" },
    { value: "personal", label: "Personal" },
    { value: "business", label: "Business" },
    { value: "projects", label: "Projects" },
    { value: "relationships", label: "Relationships" },
    { value: "todos", label: "ToDos" },
    { value: "events", label: "Events" },
    { value: "trips", label: "Trips" },
  ];

  // Mock data
  const mockPeople = [
    {
      id: 1,
      name: "Sarah Chen",
      company: "FinTech Innovations",
      role: "VP Product",
      tags: ["business", "events"],
      inspiration: "high",
      lastMet: "2 days ago",
    },
    {
      id: 2,
      name: "Marcus Johnson",
      company: "CloudScale AI",
      role: "CTO",
      tags: ["business", "projects"],
      inspiration: "medium",
      lastMet: "1 week ago",
    },
  ];

  const mockEvents = [
    {
      id: 1,
      name: "YC Mixer - SF",
      date: "Nov 28, 2025",
      peopleCount: 5,
      tags: ["business", "events"],
    },
    {
      id: 2,
      name: "Miami Tech Week",
      date: "Nov 15, 2025",
      peopleCount: 12,
      tags: ["business", "trips"],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            Relationship Builder
          </h1>
          <AuthButton />
        </div>
      </header>

      {/* Main Split Screen */}
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[calc(100vh-120px)]">
          {/* Left: Capture Section */}
          <Card className="bg-white border-gray-200 shadow-sm p-6">
            {/* Person Info with Buttons - Always Visible */}
            <div className="mb-3 pb-3 border-b border-gray-200">
              <div className="bg-white p-4 rounded border border-gray-200 space-y-2 relative">
                {/* Buttons in top right */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCaptureText("");
                      setAiPreview(null);
                      setEditedPreview(null);
                      setIsEditingPreview(false);
                      setPersonName("");
                      setPersonCompany("");
                      setPersonRole("");
                      setPersonLocation("");
                      setAdditionalFields([]);
                      setShowAdditionalDetails(false);
                      setLinkedInProfilePaste("");
                      setLinkedInUrls("");
                      setCompanyLinkedInUrls("");
                      setPersistentEvent("");
                      setSectionName("");
                      setPanelParticipants("");
                    }}
                    className="border-gray-300 bg-white hover:bg-gray-50 text-gray-600"
                  >
                    Clear
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 bg-white hover:bg-gray-50 text-gray-600"
                  >
                    <ImageIcon className="mr-2 h-3 w-3" />
                    Choose File
                  </Button>
                </div>
                {/* Name */}
                <input
                  type="text"
                  placeholder="Name"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full font-bold text-xl text-gray-800 border-0 p-0 focus:outline-none focus:ring-0 placeholder:text-gray-400"
                />
                
                {/* Company */}
                <input
                  type="text"
                  placeholder="Company"
                  value={personCompany}
                  onChange={(e) => setPersonCompany(e.target.value)}
                  className="w-full text-base text-gray-700 border-0 p-0 focus:outline-none focus:ring-0 placeholder:text-gray-400"
                />
                
                {/* Role */}
                <input
                  type="text"
                  placeholder="Role / Title"
                  value={personRole}
                  onChange={(e) => setPersonRole(e.target.value)}
                  className="w-full text-base text-gray-700 border-0 p-0 focus:outline-none focus:ring-0 placeholder:text-gray-400"
                />
                
                {/* Location */}
                <input
                  type="text"
                  placeholder="Location"
                  value={personLocation}
                  onChange={(e) => setPersonLocation(e.target.value)}
                  className="w-full text-base text-gray-700 border-0 p-0 focus:outline-none focus:ring-0 placeholder:text-gray-400"
                />
                
              </div>
            </div>

            {/* Context Selector & Dynamic Fields */}
            <div className="mb-3 space-y-3 pb-3 border-b border-gray-200">
              {/* Context Type Selector - Always Visible */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">Context</span>
                    <div className="flex flex-nowrap gap-2 ml-2">
                      {contextTypes.map((ctx) => (
                        <Badge
                          key={ctx.value}
                          onClick={() => setContextType(ctx.value)}
                          className={`cursor-pointer transition-colors whitespace-nowrap ${
                            contextType === ctx.value
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {ctx.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {(contextType === "event" || contextType === "business" || contextType === "colleague" || contextType === "project" || contextType === "trip") && (
                    <button
                      onClick={() => setIsContextExpanded(!isContextExpanded)}
                      className="text-gray-400 text-xs hover:text-gray-600"
                    >
                      {isContextExpanded ? "▼ Hide" : "▶ Show"}
                    </button>
                  )}
                </div>
              </div>

              {/* Collapsible Details Section */}
              {(contextType === "event" || contextType === "business" || contextType === "colleague" || contextType === "project" || contextType === "trip") && (
                <div>

                  {isContextExpanded && (
                    <div className="space-y-3 mt-3">
                      {/* Dynamic Fields Based on Context */}
                      {/* Event Context Fields */}
                      {contextType === "event" && (
                <>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600">Event Name</span>
                    </div>
                    <div className="flex gap-2">
                      {!showEventInput && !persistentEvent ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowEventInput(true)}
                          className="text-gray-600 border-dashed"
                        >
                          + Set Event
                        </Button>
                      ) : showEventInput ? (
                        <>
                          <input
                            type="text"
                            placeholder="e.g., Tech Summit 2025"
                            value={persistentEvent}
                            onChange={(e) => setPersistentEvent(e.target.value)}
                            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => setShowEventInput(false)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Set
                          </Button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-100 text-blue-700 px-3 py-1">
                            {persistentEvent}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setPersistentEvent("");
                              setShowEventInput(false);
                            }}
                            className="text-gray-500 h-6 px-2"
                          >
                            ✕
                          </Button>
                        </div>
                      )}
                      
                      {!showSessionFields && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSessionFields(true)}
                          className="text-gray-600 border-dashed"
                        >
                          + Set Session
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Event-specific fields */}
              {contextType === "event" && (
                <>
                  {/* Session fields - only show when "+ Set Session" is clicked */}
                  {showSessionFields && (
                    <>
                      {/* Section Name */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Type className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-600">Session Name</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowSessionFields(false);
                              setSectionName("");
                              setPanelParticipants("");
                              setLinkedInUrls("");
                            }}
                            className="text-gray-500 h-6 px-2"
                          >
                            ✕ Remove Session
                          </Button>
                        </div>
                        <input
                          type="text"
                          placeholder="e.g., AI in Healthcare Panel"
                          value={sectionName}
                          onChange={(e) => setSectionName(e.target.value)}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Panel Participants */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-600">Panel Participants</span>
                        </div>
                        <input
                          type="text"
                          placeholder="e.g., Sarah Chen, Mike Johnson, Lisa Park"
                          value={panelParticipants}
                          onChange={(e) => setPanelParticipants(e.target.value)}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* LinkedIn Profile URLs */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-600">LinkedIn URLs</span>
                        </div>
                        <textarea
                          placeholder="Paste LinkedIn URLs (one per line) - will be saved for later"
                          value={linkedInUrls}
                          onChange={(e) => setLinkedInUrls(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>
                    </>
                  )}

                  {/* 1-on-1 Contact Fields - Only show when session is NOT set */}
                  {!showSessionFields && (
                    <>
                      <div className="space-y-2">
                        {/* Instagram */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-600 w-32">Instagram:</span>
                          <input
                            type="text"
                            placeholder="https://instagram.com/username"
                            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        {/* Facebook */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-600 w-32">Facebook:</span>
                          <input
                            type="text"
                            placeholder="https://facebook.com/username"
                            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        {/* TikTok */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-600 w-32">TikTok:</span>
                          <input
                            type="text"
                            placeholder="https://tiktok.com/@username"
                            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        {/* LinkedIn */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-600 w-32">LinkedIn:</span>
                          <input
                            type="text"
                            placeholder="https://linkedin.com/in/brian-griffin-64065719/"
                            value={linkedInUrls}
                            onChange={(e) => setLinkedInUrls(e.target.value)}
                            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        {/* LinkedIn Company */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-600 w-32">LinkedIn Company:</span>
                          <input
                            type="text"
                            placeholder="https://linkedin.com/company/example-company/"
                            value={companyLinkedInUrls}
                            onChange={(e) => setCompanyLinkedInUrls(e.target.value)}
                            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Paste Entire LinkedIn Profile */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Type className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-600">Paste LinkedIn Profile (optional)</span>
                          </div>
                          <Button
                            onClick={handleParseLinkedInProfile}
                            disabled={isParsing || !linkedInProfilePaste.trim()}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {isParsing ? "Parsing..." : "Parse Profile"}
                          </Button>
                        </div>
                        <textarea
                          placeholder="Copy entire LinkedIn profile and paste here, then click 'Parse Profile' to extract full details..."
                          value={linkedInProfilePaste}
                          onChange={(e) => setLinkedInProfilePaste(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-xs"
                        />
                        <p className="text-xs text-gray-500 mt-1">Desktop: Ctrl+A → Ctrl+C → paste. Mobile: Desktop mode → Select All → Copy</p>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Business Meeting fields */}
              {contextType === "business" && (
                <>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600">Meeting With</span>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g., Sarah Chen, Mike Johnson"
                      value={panelParticipants}
                      onChange={(e) => setPanelParticipants(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600">LinkedIn Profile URLs</span>
                    </div>
                    <textarea
                      placeholder="Paste personal LinkedIn profile URLs (one per line)"
                      value={linkedInUrls}
                      onChange={(e) => setLinkedInUrls(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600">Company LinkedIn URLs</span>
                    </div>
                    <textarea
                      placeholder="Paste company LinkedIn URLs (one per line)"
                      value={companyLinkedInUrls}
                      onChange={(e) => setCompanyLinkedInUrls(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  {/* Paste Entire LinkedIn Profile */}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Type className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">Paste LinkedIn Profile</span>
                      </div>
                      <Button
                        onClick={handleParseLinkedInProfile}
                        disabled={isParsing || !linkedInProfilePaste.trim()}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isParsing ? "Parsing..." : "Parse Profile"}
                      </Button>
                    </div>
                    <textarea
                      placeholder="Copy entire LinkedIn profile and paste here, then click 'Parse Profile' to extract information..."
                      value={linkedInProfilePaste}
                      onChange={(e) => setLinkedInProfilePaste(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-xs"
                    />
                    <p className="text-xs text-gray-500 mt-1">Desktop: Ctrl+A on profile → Ctrl+C → paste. Mobile: Desktop mode → Select All → Copy</p>
                  </div>
                </>
              )}

              {/* Colleague fields */}
              {contextType === "colleague" && (
                <>
                  <div className="space-y-2">
                    {/* Instagram */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600 w-32">Instagram:</span>
                      <input
                        type="text"
                        placeholder="https://instagram.com/username"
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    {/* Facebook */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600 w-32">Facebook:</span>
                      <input
                        type="text"
                        placeholder="https://facebook.com/username"
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    {/* TikTok */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600 w-32">TikTok:</span>
                      <input
                        type="text"
                        placeholder="https://tiktok.com/@username"
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    {/* LinkedIn */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600 w-32">LinkedIn:</span>
                      <input
                        type="text"
                        placeholder="https://linkedin.com/in/brian-griffin-64065719/"
                        value={linkedInUrls}
                        onChange={(e) => setLinkedInUrls(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    {/* LinkedIn Company */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600 w-32">LinkedIn Company:</span>
                      <input
                        type="text"
                        placeholder="https://linkedin.com/company/example-company/"
                        value={companyLinkedInUrls}
                        onChange={(e) => setCompanyLinkedInUrls(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Paste Entire LinkedIn Profile */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Type className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">Paste LinkedIn Profile (optional)</span>
                      </div>
                      <Button
                        onClick={handleParseLinkedInProfile}
                        disabled={isParsing || !linkedInProfilePaste.trim()}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isParsing ? "Parsing..." : "Parse Profile"}
                      </Button>
                    </div>
                    <textarea
                      placeholder="Copy entire LinkedIn profile and paste here, then click 'Parse Profile' to extract full details..."
                      value={linkedInProfilePaste}
                      onChange={(e) => setLinkedInProfilePaste(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-xs"
                    />
                    <p className="text-xs text-gray-500 mt-1">Desktop: Ctrl+A on profile → Ctrl+C → paste. Mobile: Desktop mode → Select All → Copy</p>
                  </div>
                </>
              )}

              {/* Project fields */}
              {contextType === "project" && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Type className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">Project Name</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g., Website Redesign"
                    value={sectionName}
                    onChange={(e) => setSectionName(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Trip fields */}
              {contextType === "trip" && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">Trip/Destination</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g., Tokyo Business Trip"
                    value={persistentEvent}
                    onChange={(e) => setPersistentEvent(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Voice Recording - Always visible */}
            <div className="mb-3">
              <Button
                onClick={handleMicClick}
                className={`w-full h-16 text-base font-medium transition-all ${
                  isRecording
                    ? "bg-red-100 hover:bg-red-200 text-red-700 animate-pulse"
                    : "bg-blue-50 hover:bg-blue-100 text-blue-700"
                }`}
              >
                <Mic className={`mr-2 h-5 w-5 ${isRecording ? "animate-pulse" : ""}`} />
                {isRecording ? "Recording..." : "Tap to Record"}
              </Button>
              {isRecording && (
                <p className="text-center text-xs text-gray-600 mt-1">
                  Speak naturally...
                </p>
              )}
            </div>

            {/* Preview Sections - Always Visible */}
            <div className="mb-6 space-y-2">
              <Card className="bg-white border-gray-200 p-4 space-y-2">
                      {/* LinkedIn Data (Collapsible) - Always Visible */}
                      <div className="pb-4 border-b border-gray-200">
                        <button
                          onClick={() => setShowLinkedInData(!showLinkedInData)}
                          className="w-full flex items-center justify-between font-semibold text-gray-700 mb-2 hover:text-gray-900"
                        >
                          <span>LinkedIn</span>
                          <span>{showLinkedInData ? '▼' : '▶'}</span>
                        </button>
                        {showLinkedInData && (
                        <div className="space-y-3">
                            {/* Keywords */}
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Keywords</h4>
                        <input
                          type="text"
                          placeholder="Add keyword (press Enter)"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                              const newKeywords = [...(editedPreview?.keywords || []), e.currentTarget.value.trim()];
                              setEditedPreview(editedPreview ? {...editedPreview, keywords: newKeywords} : {keywords: newKeywords});
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        {(editedPreview?.keywords && editedPreview.keywords.length > 0) ? (
                          <div className="flex flex-wrap gap-2">
                            {(editedPreview?.keywords || []).map((keyword: string, idx: number) => (
                              <Badge 
                                key={idx} 
                                className="bg-blue-100 text-blue-700 text-xs cursor-pointer hover:bg-red-100 hover:text-red-700"
                                onClick={() => {
                                  const newKeywords = (editedPreview?.keywords || []).filter((_: any, i: number) => i !== idx);
                                  setEditedPreview(editedPreview ? {...editedPreview, keywords: newKeywords} : {keywords: newKeywords});
                                }}
                              >
                                {keyword} ×
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic">No keywords yet</p>
                        )}
                      </div>

                      {/* Companies */}
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Companies</h4>
                        <input
                          type="text"
                          placeholder="Add company (press Enter)"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                              const newCompanies = [...(editedPreview?.companies || []), e.currentTarget.value.trim()];
                              setEditedPreview(editedPreview ? {...editedPreview, companies: newCompanies} : {companies: newCompanies});
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        {(editedPreview?.companies && editedPreview.companies.length > 0) ? (
                          <div className="flex flex-wrap gap-2">
                            {(editedPreview?.companies || []).map((company: string, idx: number) => (
                              <Badge 
                                key={idx} 
                                className="bg-purple-100 text-purple-700 text-xs cursor-pointer hover:bg-red-100 hover:text-red-700"
                                onClick={() => {
                                  const newCompanies = (editedPreview?.companies || []).filter((_: any, i: number) => i !== idx);
                                  setEditedPreview(editedPreview ? {...editedPreview, companies: newCompanies} : {companies: newCompanies});
                                }}
                              >
                                {company} ×
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic">No companies yet</p>
                        )}
                      </div>

                      {/* Industries */}
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Industries</h4>
                        <input
                          type="text"
                          placeholder="Add industry (press Enter)"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                              const newIndustries = [...(editedPreview?.industries || []), e.currentTarget.value.trim()];
                              setEditedPreview(editedPreview ? {...editedPreview, industries: newIndustries} : {industries: newIndustries});
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        {(editedPreview?.industries && editedPreview.industries.length > 0) ? (
                          <div className="flex flex-wrap gap-2">
                            {(editedPreview?.industries || []).map((industry: string, idx: number) => (
                              <Badge 
                                key={idx} 
                                className="bg-green-100 text-green-700 text-xs cursor-pointer hover:bg-red-100 hover:text-red-700"
                                onClick={() => {
                                  const newIndustries = (editedPreview?.industries || []).filter((_: any, i: number) => i !== idx);
                                  setEditedPreview(editedPreview ? {...editedPreview, industries: newIndustries} : {industries: newIndustries});
                                }}
                              >
                                {industry} ×
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic">No industries yet</p>
                        )}
                      </div>

                      {/* Skills */}
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Skills</h4>
                        <input
                          type="text"
                          placeholder="Add skill (press Enter)"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                              const person = editedPreview.people?.[0];
                              if (person) {
                                const newSkills = [...(person.skills || []), e.currentTarget.value.trim()];
                                const updatedPerson = {...person, skills: newSkills};
                                const updatedPeople = [...(editedPreview.people || [])];
                                updatedPeople[0] = updatedPerson;
                                setEditedPreview({...editedPreview, people: updatedPeople});
                              }
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        {(editedPreview?.people?.[0]?.skills && editedPreview.people[0].skills.length > 0) ? (
                          <div className="flex flex-wrap gap-2">
                            {(editedPreview?.people?.[0]?.skills || []).map((skill: string, idx: number) => (
                              <Badge 
                                key={idx} 
                                className="bg-amber-100 text-amber-700 text-xs cursor-pointer hover:bg-red-100 hover:text-red-700"
                                onClick={() => {
                                  const person = editedPreview?.people?.[0];
                                  if (person) {
                                    const newSkills = (person.skills || []).filter((_: any, i: number) => i !== idx);
                                    const updatedPerson = {...person, skills: newSkills};
                                    const updatedPeople = [...(editedPreview?.people || [])];
                                    updatedPeople[0] = updatedPerson;
                                    setEditedPreview(editedPreview ? {...editedPreview, people: updatedPeople} : {people: updatedPeople});
                                  }
                                }}
                              >
                                {skill} ×
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic">No skills yet</p>
                        )}
                      </div>

                      {/* Technologies */}
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Technologies</h4>
                        <input
                          type="text"
                          placeholder="Add technology (press Enter)"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                              const person = editedPreview.people?.[0];
                              if (person) {
                                const newTechnologies = [...(person.technologies || []), e.currentTarget.value.trim()];
                                const updatedPerson = {...person, technologies: newTechnologies};
                                const updatedPeople = [...(editedPreview.people || [])];
                                updatedPeople[0] = updatedPerson;
                                setEditedPreview({...editedPreview, people: updatedPeople});
                              }
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        {(editedPreview?.people?.[0]?.technologies && editedPreview.people[0].technologies.length > 0) ? (
                          <div className="flex flex-wrap gap-2">
                            {(editedPreview?.people?.[0]?.technologies || []).map((tech: string, idx: number) => (
                              <Badge 
                                key={idx} 
                                className="bg-cyan-100 text-cyan-700 text-xs cursor-pointer hover:bg-red-100 hover:text-red-700"
                                onClick={() => {
                                  const person = editedPreview?.people?.[0];
                                  if (person) {
                                    const newTechnologies = (person.technologies || []).filter((_: any, i: number) => i !== idx);
                                    const updatedPerson = {...person, technologies: newTechnologies};
                                    const updatedPeople = [...(editedPreview?.people || [])];
                                    updatedPeople[0] = updatedPerson;
                                    setEditedPreview(editedPreview ? {...editedPreview, people: updatedPeople} : {people: updatedPeople});
                                  }
                                }}
                              >
                                {tech} ×
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic">No technologies yet</p>
                        )}
                      </div>

                      {/* Interests */}
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Interests</h4>
                        <input
                          type="text"
                          placeholder="Add interest (press Enter)"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                              const person = editedPreview.people?.[0];
                              if (person) {
                                const newInterests = [...(person.interests || []), e.currentTarget.value.trim()];
                                const updatedPerson = {...person, interests: newInterests};
                                const updatedPeople = [...(editedPreview.people || [])];
                                updatedPeople[0] = updatedPerson;
                                setEditedPreview({...editedPreview, people: updatedPeople});
                              }
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        {(editedPreview?.people?.[0]?.interests && editedPreview.people[0].interests.length > 0) ? (
                          <div className="flex flex-wrap gap-2">
                            {(editedPreview?.people?.[0]?.interests || []).map((interest: string, idx: number) => (
                              <Badge 
                                key={idx} 
                                className="bg-pink-100 text-pink-700 text-xs cursor-pointer hover:bg-red-100 hover:text-red-700"
                                onClick={() => {
                                  const person = editedPreview?.people?.[0];
                                  if (person) {
                                    const newInterests = (person.interests || []).filter((_: any, i: number) => i !== idx);
                                    const updatedPerson = {...person, interests: newInterests};
                                    const updatedPeople = [...(editedPreview?.people || [])];
                                    updatedPeople[0] = updatedPerson;
                                    setEditedPreview(editedPreview ? {...editedPreview, people: updatedPeople} : {people: updatedPeople});
                                  }
                                }}
                              >
                                {interest} ×
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic">No interests yet</p>
                        )}
                      </div>
                          </div>
                          )}
                        </div>

                      {/* Conversations */}
                      <div className="pb-4 border-b border-gray-200">
                        <button
                          onClick={() => setShowConversations(!showConversations)}
                          className="w-full flex items-center justify-between font-semibold text-gray-700 mb-2 hover:text-gray-900"
                        >
                          <span>Conversations</span>
                          <span>{showConversations ? '▼' : '▶'}</span>
                        </button>
                        {showConversations && (
                        <>
                        <textarea
                          placeholder="Add note (Enter to save, Shift+Enter for new line)"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2 resize-none overflow-hidden"
                          rows={1}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && e.currentTarget.value.trim()) {
                              e.preventDefault();
                              const notes = editedPreview?.additional_notes || [];
                              const today = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
                              const newNote = {
                                date: today,
                                text: e.currentTarget.value.trim()
                              };
                              const newNotes = [newNote, ...notes];
                              setEditedPreview(editedPreview ? {...editedPreview, additional_notes: newNotes} : {additional_notes: newNotes});
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        {editedPreview?.additional_notes && editedPreview.additional_notes.length > 0 ? (
                          <div className="space-y-2">
                            {editedPreview.additional_notes.map((note: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                                <span className="text-sm text-gray-600 flex-shrink-0">
                                  {note.date || new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}
                                </span>
                                <span className="text-sm text-gray-700 flex-1">• {note.text || note}</span>
                                <button
                                  onClick={() => {
                                    const newNotes = (editedPreview?.additional_notes || []).filter((_: any, i: number) => i !== idx);
                                    setEditedPreview(editedPreview ? {...editedPreview, additional_notes: newNotes} : {additional_notes: newNotes});
                                  }}
                                  className="text-red-600 hover:text-red-700 text-xs font-bold"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic">No notes yet</p>
                        )}
                        </>
                        )}
                      </div>

                      {/* Follow-ups */}
                      <div className="pb-4 border-b border-gray-200">
                        <button
                          onClick={() => setShowFollowUps(!showFollowUps)}
                          className="w-full flex items-center justify-between font-semibold text-gray-700 mb-2 hover:text-gray-900"
                        >
                          <span>Follow-ups</span>
                          <span>{showFollowUps ? '▼' : '▶'}</span>
                        </button>
                        {showFollowUps && (
                        <>
                        <textarea
                          placeholder="Add follow-up action (Enter to save, Shift+Enter for new line)"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2 resize-none overflow-hidden"
                          rows={1}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && e.currentTarget.value.trim()) {
                              e.preventDefault();
                              const followUps = editedPreview?.follow_ups || editedPreview?.followUps || [];
                              const newFollowUps = [...followUps, { description: e.currentTarget.value.trim(), priority: 'medium' }];
                              setEditedPreview(editedPreview ? {...editedPreview, follow_ups: newFollowUps, followUps: undefined} : {follow_ups: newFollowUps});
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        {((editedPreview?.follow_ups || editedPreview?.followUps)?.length > 0) ? (
                          <div className="space-y-2">
                            {(editedPreview?.follow_ups || editedPreview?.followUps || []).map((followUp: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                                <span className="text-sm text-gray-700 flex-1">• {followUp.description}</span>
                                <button
                                  onClick={() => {
                                    const followUps = editedPreview?.follow_ups || editedPreview?.followUps || [];
                                    const newFollowUps = followUps.filter((_: any, i: number) => i !== idx);
                                    setEditedPreview(editedPreview ? {...editedPreview, follow_ups: newFollowUps, followUps: undefined} : {follow_ups: newFollowUps});
                                  }}
                                  className="text-red-600 hover:text-red-700 text-xs font-bold"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic">No follow-ups yet</p>
                        )}
                        </>
                        )}
                      </div>

                      {/* Memories */}
                      <div className="pb-4">
                        <button
                          onClick={() => setShowMemories(!showMemories)}
                          className="w-full flex items-center justify-between font-semibold text-gray-700 mb-2 hover:text-gray-900"
                        >
                          <span>Memories</span>
                          <span>{showMemories ? '▼' : '▶'}</span>
                        </button>
                        {showMemories && (
                        <>
                        <textarea
                          placeholder="Add a memory or something to remember"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2 resize-none overflow-hidden"
                          rows={1}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && e.currentTarget.value.trim()) {
                              e.preventDefault();
                              const memories = editedPreview?.memories || [];
                              const today = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
                              const newMemory = {
                                date: today,
                                text: e.currentTarget.value.trim()
                              };
                              const newMemories = [newMemory, ...memories];
                              setEditedPreview(editedPreview ? {...editedPreview, memories: newMemories} : {memories: newMemories});
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        {editedPreview?.memories && editedPreview.memories.length > 0 ? (
                          <div className="space-y-2">
                            {(editedPreview?.memories || []).map((memory: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                                <span className="text-sm text-gray-600 flex-shrink-0">
                                  {memory.date || new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}
                                </span>
                                <span className="text-sm text-gray-700 flex-1">• {memory.text || memory}</span>
                                <button
                                  onClick={() => {
                                    const newMemories = (editedPreview?.memories || []).filter((_: any, i: number) => i !== idx);
                                    setEditedPreview(editedPreview ? {...editedPreview, memories: newMemories} : {memories: newMemories});
                                  }}
                                  className="text-red-600 hover:text-red-700 text-xs font-bold"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic">No memories yet</p>
                        )}
                        </>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => {
                            handleSavePreviewEdits();
                            handleApproveAndSave(editedPreview);
                          }}
                          disabled={isProcessing}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {isProcessing ? "Saving..." : "Save to Rolodex"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setAiPreview(null);
                            setIsEditingPreview(false);
                            setShowRawNotes(true);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                </Card>
              </div>

            {/* Action Buttons */}
            {!aiPreview && personName.trim() && (
              <div className="flex justify-end">
                <Button 
                  onClick={handleDirectSave}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                >
                  {isProcessing ? "Saving..." : "Save to Relationship Builder"}
                </Button>
              </div>
            )}
          </Card>

          {/* Right: Library Section */}
          <Card className="bg-white border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Library</h2>

            {/* Section Filter */}
            <div className="mb-6 flex flex-wrap gap-2">
              {sections.map((section) => (
                <Badge
                  key={section.value}
                  variant={activeSection === section.value ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    activeSection === section.value
                      ? "bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-200"
                      : "border-gray-300 bg-white hover:bg-gray-50 text-gray-600"
                  }`}
                  onClick={() => setActiveSection(section.value)}
                >
                  {section.label}
                </Badge>
              ))}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="people" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                <TabsTrigger value="people" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
                  <Users className="mr-2 h-4 w-4" />
                  People
                </TabsTrigger>
                <TabsTrigger value="events" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
                  <Calendar className="mr-2 h-4 w-4" />
                  Events
                </TabsTrigger>
                <TabsTrigger value="followups" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Follow-ups
                </TabsTrigger>
              </TabsList>

              {/* People Tab */}
              <TabsContent value="people" className="space-y-4 mt-4">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handlePeopleDragEnd}
                >
                  <SortableContext
                    items={people.map(p => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {people.map((person) => (
                      <SortablePersonCard key={person.id} person={person} onLoad={loadPersonIntoForm} />
                    ))}
                  </SortableContext>
                </DndContext>
              </TabsContent>

              {/* Events Tab */}
              <TabsContent value="events" className="space-y-4 mt-4">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleEventsDragEnd}
                >
                  <SortableContext
                    items={events.map(e => e.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {events.map((event) => (
                      <SortableEventCard key={event.id} event={event} />
                    ))}
                  </SortableContext>
                </DndContext>
              </TabsContent>

              {/* Follow-ups Tab */}
              <TabsContent value="followups" className="space-y-4 mt-4">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleFollowUpsDragEnd}
                >
                  <SortableContext
                    items={followUps.map(f => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {followUps.map((followUp) => (
                      <SortableFollowUpCard key={followUp.id} followUp={followUp} />
                    ))}
                  </SortableContext>
                </DndContext>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
