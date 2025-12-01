"use client";

import { useState } from "react";
import { Mic, Type, Image as ImageIcon, Users, Calendar, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

type Section = "all" | "personal" | "business" | "projects" | "relationships" | "todos" | "events" | "trips";

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>("all");
  const [captureText, setCaptureText] = useState("");

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
    <div className="min-h-screen text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            RemindMe
          </h1>
        </div>
      </header>

      {/* Main Split Screen */}
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[calc(100vh-120px)]">
          {/* Left: Capture Section */}
          <Card className="bg-slate-800/50 border-white/10 backdrop-blur-lg p-6">
            <h2 className="text-xl font-semibold mb-6 text-blue-300">Quick Capture</h2>
            
            {/* Voice Recording */}
            <div className="mb-6">
              <Button
                onClick={() => setIsRecording(!isRecording)}
                className={`w-full h-32 text-lg font-semibold transition-all ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600 animate-pulse"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                <Mic className="mr-2 h-8 w-8" />
                {isRecording ? "Recording... Tap to Stop" : "Hold to Record"}
              </Button>
              {isRecording && (
                <p className="text-center text-sm text-blue-300 mt-2">
                  Speak naturally about the person or moment...
                </p>
              )}
            </div>

            {/* Text Input */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Type className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-400">Or type/paste your notes</span>
              </div>
              <Textarea
                value={captureText}
                onChange={(e) => setCaptureText(e.target.value)}
                placeholder="Describe how the person or moment felt, what excited you, any thoughts or ideas..."
                className="min-h-[150px] bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>

            {/* Screenshot Upload */}
            <div className="mb-6">
              <Button
                variant="outline"
                className="w-full border-white/10 bg-slate-900/30 hover:bg-slate-900/50 text-white"
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Upload Screenshot from Notes
              </Button>
            </div>

            {/* Save Button */}
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold">
              Save & Organize with AI
            </Button>
          </Card>

          {/* Right: Library Section */}
          <Card className="bg-slate-800/50 border-white/10 backdrop-blur-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-300">Library</h2>

            {/* Section Filter */}
            <div className="mb-6 flex flex-wrap gap-2">
              {sections.map((section) => (
                <Badge
                  key={section.value}
                  variant={activeSection === section.value ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    activeSection === section.value
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "border-white/20 bg-slate-900/30 hover:bg-slate-900/50 text-slate-300"
                  }`}
                  onClick={() => setActiveSection(section.value)}
                >
                  {section.label}
                </Badge>
              ))}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="people" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-900/50">
                <TabsTrigger value="people" className="data-[state=active]:bg-blue-600">
                  <Users className="mr-2 h-4 w-4" />
                  People
                </TabsTrigger>
                <TabsTrigger value="events" className="data-[state=active]:bg-blue-600">
                  <Calendar className="mr-2 h-4 w-4" />
                  Events
                </TabsTrigger>
                <TabsTrigger value="followups" className="data-[state=active]:bg-blue-600">
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Follow-ups
                </TabsTrigger>
              </TabsList>

              {/* People Tab */}
              <TabsContent value="people" className="space-y-4 mt-4">
                {mockPeople.map((person) => (
                  <Card key={person.id} className="bg-slate-900/50 border-white/10 p-4 hover:bg-slate-900/70 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-white">{person.name}</h3>
                        <p className="text-sm text-slate-400">{person.role} at {person.company}</p>
                      </div>
                      <Badge
                        className={
                          person.inspiration === "high"
                            ? "bg-green-600"
                            : person.inspiration === "medium"
                            ? "bg-yellow-600"
                            : "bg-slate-600"
                        }
                      >
                        {person.inspiration === "high" ? "⭐ Inspiring" : "Worth nurturing"}
                      </Badge>
                    </div>
                    <div className="flex gap-2 mb-2">
                      {person.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs border-white/20 text-slate-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">Last met: {person.lastMet}</p>
                  </Card>
                ))}
              </TabsContent>

              {/* Events Tab */}
              <TabsContent value="events" className="space-y-4 mt-4">
                {mockEvents.map((event) => (
                  <Card key={event.id} className="bg-slate-900/50 border-white/10 p-4 hover:bg-slate-900/70 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-white">{event.name}</h3>
                        <p className="text-sm text-slate-400">{event.date}</p>
                      </div>
                      <Badge className="bg-purple-600">{event.peopleCount} people</Badge>
                    </div>
                    <div className="flex gap-2">
                      {event.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs border-white/20 text-slate-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                ))}
              </TabsContent>

              {/* Follow-ups Tab */}
              <TabsContent value="followups" className="space-y-4 mt-4">
                <Card className="bg-slate-900/50 border-white/10 p-4">
                  <div className="flex items-start gap-3">
                    <CheckSquare className="h-5 w-5 text-blue-400 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">Send intro email to Sarah</h3>
                      <p className="text-sm text-slate-400 mb-2">About banking automation partnership</p>
                      <div className="flex gap-2">
                        <Badge className="bg-orange-600 text-xs">Due: Next week</Badge>
                        <Badge variant="outline" className="text-xs border-white/20 text-slate-300">High priority</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="bg-slate-900/50 border-white/10 p-4">
                  <div className="flex items-start gap-3">
                    <CheckSquare className="h-5 w-5 text-blue-400 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">Follow up with Marcus</h3>
                      <p className="text-sm text-slate-400 mb-2">Share deck about AI infrastructure project</p>
                      <div className="flex gap-2">
                        <Badge className="bg-blue-600 text-xs">Due: This week</Badge>
                        <Badge variant="outline" className="text-xs border-white/20 text-slate-300">Medium priority</Badge>
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
