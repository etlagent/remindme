"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Type, Image as ImageIcon, Users, Calendar, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

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
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false; // Stop after each phrase (snippet mode)
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          // Increment note count and add numbered marker
          setNoteCount((prevCount) => {
            const newCount = prevCount + 1;
            setCaptureText((prev) => {
              const separator = prev ? "\n\n" : "";
              return prev + separator + `Note ${newCount}: ${transcript}`;
            });
            return newCount;
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
        recognitionRef.current.stop();
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
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-semibold text-gray-800">
            RemindMe
          </h1>
        </div>
      </header>

      {/* Main Split Screen */}
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[calc(100vh-120px)]">
          {/* Left: Capture Section */}
          <Card className="bg-white border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-700">Quick Capture</h2>
            
            {/* Voice Recording */}
            <div className="mb-6">
              <Button
                onClick={handleMicClick}
                className={`w-full h-32 text-lg font-semibold transition-all ${
                  isRecording
                    ? "bg-red-100 hover:bg-red-200 text-red-700 animate-pulse"
                    : "bg-blue-50 hover:bg-blue-100 text-blue-700"
                }`}
              >
                <Mic className="mr-2 h-8 w-8" />
                {isRecording ? "Recording... Tap to Stop" : "Tap to Record"}
              </Button>
              {isRecording && (
                <p className="text-center text-sm text-blue-600 mt-2">
                  Speak naturally about the person or moment...
                </p>
              )}
              {!isRecording && captureText && (
                <p className="text-center text-xs text-gray-500 mt-2">
                  Tap again to add more snippets
                </p>
              )}
            </div>

            {/* Text Input */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Type className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Or type/paste your notes</span>
              </div>
              <Textarea
                value={captureText}
                onChange={(e) => setCaptureText(e.target.value)}
                placeholder="Describe how the person or moment felt, what excited you, any thoughts or ideas..."
                className="min-h-[150px] bg-white border-gray-200 text-gray-800 placeholder:text-gray-400"
              />
            </div>

            {/* Screenshot Upload */}
            <div className="mb-6">
              <Button
                variant="outline"
                className="w-full border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Upload Screenshot from Notes
              </Button>
            </div>

            {/* Save Button */}
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              Save & Organize with AI
            </Button>
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
