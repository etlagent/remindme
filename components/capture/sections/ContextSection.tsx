/**
 * CONTEXT SECTION COMPONENT
 * 
 * Section for capturing context information like event/conference details,
 * business meetings, social media links, and LinkedIn profile scraping.
 * 
 * This is for INPUTTING data to be scraped/processed, NOT for displaying
 * the final LinkedIn profile information (that's LinkedInSection).
 */

import { Type, Users, Calendar, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ContextSectionProps {
  // Context state
  contextType: string;
  setContextType: (type: string) => void;
  
  // Event fields
  persistentEvent: string;
  setPersistentEvent: (event: string) => void;
  showEventInput: boolean;
  setShowEventInput: (show: boolean) => void;
  
  // Session fields
  showSessionFields: boolean;
  setShowSessionFields: (show: boolean) => void;
  sectionName: string;
  setSectionName: (name: string) => void;
  panelParticipants: string;
  setPanelParticipants: (participants: string) => void;
  
  // LinkedIn fields
  linkedInUrls: string;
  setLinkedInUrls: (urls: string) => void;
  companyLinkedInUrls: string;
  setCompanyLinkedInUrls: (urls: string) => void;
  linkedInProfilePaste: string;
  setLinkedInProfilePaste: (paste: string) => void;
  
  // Handlers
  handleParseLinkedInProfile: () => void;
  isParsing: boolean;
}

const contextTypes = [
  { value: "event", label: "Event/Conference" },
  { value: "business", label: "Business Meeting" },
  { value: "colleague", label: "Colleague" },
  { value: "friends", label: "Friends" },
  { value: "family", label: "Family" },
];

export function ContextSection({
  contextType,
  setContextType,
  persistentEvent,
  setPersistentEvent,
  showEventInput,
  setShowEventInput,
  showSessionFields,
  setShowSessionFields,
  sectionName,
  setSectionName,
  panelParticipants,
  setPanelParticipants,
  linkedInUrls,
  setLinkedInUrls,
  companyLinkedInUrls,
  setCompanyLinkedInUrls,
  linkedInProfilePaste,
  setLinkedInProfilePaste,
  handleParseLinkedInProfile,
  isParsing,
}: ContextSectionProps) {
  return (
    <div className="space-y-3">
      {/* Context Type Selector */}
      <div className="flex flex-wrap gap-2">
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

      {/* Dynamic Fields Based on Context */}
      <div className="space-y-3">
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

            {/* Session fields */}
            {showSessionFields && (
              <>
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
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600 w-32">Instagram:</span>
                    <input
                      type="text"
                      placeholder="https://instagram.com/username"
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600 w-32">Facebook:</span>
                    <input
                      type="text"
                      placeholder="https://facebook.com/username"
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600 w-32">TikTok:</span>
                    <input
                      type="text"
                      placeholder="https://tiktok.com/@username"
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
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
          </>
        )}

        {/* Business Meeting Fields */}
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
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600 w-32">Instagram:</span>
                <input
                  type="text"
                  placeholder="https://instagram.com/username"
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600 w-32">Facebook:</span>
                <input
                  type="text"
                  placeholder="https://facebook.com/username"
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600 w-32">TikTok:</span>
                <input
                  type="text"
                  placeholder="https://tiktok.com/@username"
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
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

        {/* Trip fields */}
        {contextType === "trip" && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">Trip Name</span>
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
    </div>
  );
}
