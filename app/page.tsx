"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Type, Image as ImageIcon, Users, Calendar, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AuthButton } from "@/components/AuthButton";

type Section = "all" | "personal" | "business" | "projects" | "relationships" | "todos" | "events" | "trips";

// Extend Window interface for browser speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function Home() {
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
  const [isContextExpanded, setIsContextExpanded] = useState(true);
  const recognitionRef = useRef<any>(null);
  const isProcessingRef = useRef(false);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && !recognitionRef.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false; // Stop after each phrase (snippet mode)
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          const transcript = event.results[event.results.length - 1][0].transcript;
          setCaptureText((prev) => {
            // If there's parsed profile data, append after the "---" line
            if (prev.includes('---\nAdd your notes below:')) {
              return prev + "\n" + transcript;
            }
            // Otherwise, just append normally
            return prev + (prev ? " " : "") + transcript;
          });
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
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
    } catch (error) {
      console.error("Error organizing notes:", error);
      alert("Failed to organize notes. Please try again.");
      setShowRawNotes(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveAndSave = async () => {
    if (!aiPreview) return;

    setIsProcessing(true);
    try {
      // Save to Supabase
      const response = await fetch("/api/save-memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: captureText,
          structuredData: aiPreview,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save memory");
      }

      // Clear form and reset
      setCaptureText("");
      setNoteCount(0);
      setAiPreview(null);
      setShowRawNotes(true);
      alert("Memory saved successfully!");
    } catch (error) {
      console.error("Error saving memory:", error);
      alert("Failed to save memory. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditRawNotes = () => {
    setAiPreview(null);
    setShowRawNotes(true);
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
      
      // Show parsed data in notes field for review
      const parsedSummary = `✅ Parsed LinkedIn Profile:

Name: ${data.name || 'Unknown'}
Company: ${data.company || 'Unknown'}
Role: ${data.role || 'Unknown'}
${data.follower_count ? `Followers: ${data.follower_count}` : ''}

About:
${data.about || 'No about section'}

Experience:
${data.experience?.map((exp: any) => `• ${exp.role} at ${exp.company} (${exp.dates})`).join('\n') || 'No experience listed'}

Education:
${data.education?.map((edu: any) => `• ${edu.school}${edu.degree ? ` - ${edu.degree}` : ''}`).join('\n') || 'No education listed'}

---
Add your notes below:
`;
      
      setCaptureText(parsedSummary);
      
      // Clear the paste field
      setLinkedInProfilePaste("");
    } catch (error) {
      console.error("Error parsing LinkedIn profile:", error);
      alert("Failed to parse LinkedIn profile. Please try again.");
    } finally {
      setIsParsing(false);
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
    { value: "personal", label: "Personal", icon: Users },
    { value: "business", label: "Business Meeting", icon: CheckSquare },
    { value: "todo", label: "ToDo/Task", icon: CheckSquare },
    { value: "project", label: "Project", icon: Type },
    { value: "trip", label: "Trip", icon: Calendar },
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
            RemindMe
          </h1>
          <AuthButton />
        </div>
      </header>

      {/* Main Split Screen */}
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[calc(100vh-120px)]">
          {/* Left: Capture Section */}
          <Card className="bg-white border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">Quick Capture</h2>
              {/* Screenshot Upload */}
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 bg-white hover:bg-gray-50 text-gray-600"
              >
                <ImageIcon className="mr-2 h-3 w-3" />
                Choose File
              </Button>
            </div>

            {/* Context Selector & Dynamic Fields */}
            <div className="mb-6 space-y-3 pb-4 border-b border-gray-200">
              {/* Context Type Selector - Always Visible */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckSquare className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Context Type</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {contextTypes.map((ctx) => (
                    <Badge
                      key={ctx.value}
                      onClick={() => setContextType(ctx.value)}
                      className={`cursor-pointer transition-colors ${
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

              {/* Collapsible Details Section */}
              {(contextType === "event" || contextType === "business" || contextType === "project" || contextType === "trip") && (
                <div>
                  <button
                    onClick={() => setIsContextExpanded(!isContextExpanded)}
                    className="w-full flex items-center justify-between py-2 hover:bg-gray-50 px-2 rounded transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-600">Additional Details</span>
                    <span className="text-gray-400 text-xs">
                      {isContextExpanded ? "▼ Hide" : "▶ Show"}
                    </span>
                  </button>

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
                      {/* LinkedIn URL */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-600">LinkedIn URL</span>
                        </div>
                        <input
                          type="text"
                          placeholder="https://linkedin.com/in/brian-griffin-64065719/"
                          value={linkedInUrls}
                          onChange={(e) => setLinkedInUrls(e.target.value)}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Will be saved to database</p>
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
            
            {/* Voice Recording */}
            <div className="mb-4">
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
              {!isRecording && captureText && (
                <p className="text-center text-xs text-gray-500 mt-1">
                  Tap again to add more
                </p>
              )}
            </div>

            {/* Text Input - Collapsible */}
            {showRawNotes && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Type className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Your notes</span>
                </div>
                <Textarea
                  value={captureText}
                  onChange={(e) => setCaptureText(e.target.value)}
                  placeholder="Describe how the person or moment felt, what excited you, any thoughts or ideas..."
                  className="min-h-[150px] bg-white border-gray-200 text-gray-800 placeholder:text-gray-400"
                />
              </div>
            )}

            {/* AI Preview */}
            {aiPreview && (
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">AI Organized Preview</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditRawNotes}
                    className="text-gray-600"
                  >
                    Edit Raw Notes
                  </Button>
                </div>

                <Card className="bg-gray-50 border-gray-200 p-4 space-y-3">
                  {aiPreview.people && aiPreview.people.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">People</h4>
                      {aiPreview.people.map((person: any, idx: number) => (
                        <div key={idx} className="mb-3 p-3 bg-white rounded border border-gray-200">
                          <p className="font-medium text-gray-800">{person.name || "Unknown"}</p>
                          {person.company && <p className="text-sm text-gray-600">{person.role} at {person.company}</p>}
                          {person.inspiration_level && (
                            <Badge className="mt-2 bg-blue-100 text-blue-700">
                              Inspiration: {person.inspiration_level}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {aiPreview.event && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Event</h4>
                      <p className="text-sm text-gray-600">{aiPreview.event.name}</p>
                      {aiPreview.event.date && <p className="text-xs text-gray-500">{aiPreview.event.date}</p>}
                    </div>
                  )}

                  {aiPreview.summary && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Summary</h4>
                      <p className="text-sm text-gray-600">{aiPreview.summary}</p>
                    </div>
                  )}

                  {aiPreview.follow_ups && aiPreview.follow_ups.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Follow-ups</h4>
                      {aiPreview.follow_ups.map((followUp: any, idx: number) => (
                        <div key={idx} className="text-sm text-gray-600 mb-1">
                          • {followUp.description}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Action Buttons */}
            {!aiPreview ? (
              <Button 
                onClick={handleOrganizeWithAI}
                disabled={isProcessing || !captureText.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {isProcessing ? "Processing..." : "Organize with AI"}
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button
                  onClick={handleApproveAndSave}
                  disabled={isProcessing}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                >
                  {isProcessing ? "Saving..." : "Approve & Save"}
                </Button>
                <Button
                  onClick={handleEditRawNotes}
                  variant="outline"
                  className="flex-1 border-gray-300"
                >
                  Cancel
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
                {mockPeople.map((person) => (
                  <Card key={person.id} className="bg-white border-gray-200 p-4 hover:bg-gray-50 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-800">{person.name}</h3>
                        <p className="text-sm text-gray-600">{person.role} at {person.company}</p>
                      </div>
                      <Badge
                        className={
                          person.inspiration === "high"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : person.inspiration === "medium"
                            ? "bg-amber-100 text-amber-700 border-amber-200"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                        }
                      >
                        {person.inspiration === "high" ? "⭐ Inspiring" : "Worth nurturing"}
                      </Badge>
                    </div>
                    <div className="flex gap-2 mb-2">
                      {person.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs border-gray-300 text-gray-600">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">Last met: {person.lastMet}</p>
                  </Card>
                ))}
              </TabsContent>

              {/* Events Tab */}
              <TabsContent value="events" className="space-y-4 mt-4">
                {mockEvents.map((event) => (
                  <Card key={event.id} className="bg-white border-gray-200 p-4 hover:bg-gray-50 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-800">{event.name}</h3>
                        <p className="text-sm text-gray-600">{event.date}</p>
                      </div>
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200">{event.peopleCount} people</Badge>
                    </div>
                    <div className="flex gap-2">
                      {event.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs border-gray-300 text-gray-600">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                ))}
              </TabsContent>

              {/* Follow-ups Tab */}
              <TabsContent value="followups" className="space-y-4 mt-4">
                <Card className="bg-white border-gray-200 p-4">
                  <div className="flex items-start gap-3">
                    <CheckSquare className="h-5 w-5 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">Send intro email to Sarah</h3>
                      <p className="text-sm text-gray-600 mb-2">About banking automation partnership</p>
                      <div className="flex gap-2">
                        <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">Due: Next week</Badge>
                        <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">High priority</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="bg-white border-gray-200 p-4">
                  <div className="flex items-start gap-3">
                    <CheckSquare className="h-5 w-5 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">Follow up with Marcus</h3>
                      <p className="text-sm text-gray-600 mb-2">Share deck about AI infrastructure project</p>
                      <div className="flex gap-2">
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">Due: This week</Badge>
                        <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">Medium priority</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
