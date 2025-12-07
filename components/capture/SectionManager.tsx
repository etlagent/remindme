/**
 * SECTION MANAGER COMPONENT
 * 
 * Orchestrates rendering of collapsible sections.
 * Features:
 * - Dynamic section rendering based on configuration
 * - User-configurable visibility and ordering
 * - Passes shared props to each section
 * - Manages expand/collapse state
 */

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CollapsibleSection } from "./sections/CollapsibleSection";
import { ContextSection } from "./sections/ContextSection";
import { LinkedInSection } from "./sections/LinkedInSection";
import { ConversationsSection } from "./sections/ConversationsSection";
import { FollowUpsSection } from "./sections/FollowUpsSection";
import { MemoriesSection } from "./sections/MemoriesSection";
import { ResearchSection } from "./sections/ResearchSection";
import { VoiceRecorderButton } from "./VoiceRecorderButton";
import { Badge } from "@/components/ui/badge";

export interface SectionConfig {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  visible: boolean;
  order: number;
}

interface SectionManagerProps {
  sections: SectionConfig[];
  expandedSections: Record<string, boolean>;
  onToggleSection: (sectionId: string) => void;
  editedPreview: any;
  setEditedPreview: (preview: any) => void;
  personName: string;
  personCompany: string;
  personRole: string;
  personLocation: string;
  isProcessing: boolean;
  handleSavePreviewEdits: () => void;
  handleApproveAndSave: (data: any) => void;
  setAiPreview: (preview: any) => void;
  setIsEditingPreview: (editing: boolean) => void;
  setShowRawNotes: (show: boolean) => void;
  // Context section props
  contextType?: string;
  setContextType?: (type: string) => void;
  persistentEvent?: string;
  setPersistentEvent?: (event: string) => void;
  showEventInput?: boolean;
  setShowEventInput?: (show: boolean) => void;
  showSessionFields?: boolean;
  setShowSessionFields?: (show: boolean) => void;
  sectionName?: string;
  setSectionName?: (name: string) => void;
  panelParticipants?: string;
  setPanelParticipants?: (participants: string) => void;
  linkedInUrls?: string;
  setLinkedInUrls?: (urls: string) => void;
  companyLinkedInUrls?: string;
  setCompanyLinkedInUrls?: (urls: string) => void;
  linkedInProfilePaste?: string;
  setLinkedInProfilePaste?: (paste: string) => void;
  handleParseLinkedInProfile?: () => void;
  isParsing?: boolean;
  // Voice recording props
  isRecording?: boolean;
  onToggleRecording?: () => void;
}

// Component mapping
const SECTION_COMPONENTS = {
  context: ContextSection,
  linkedin: LinkedInSection,
  conversations: ConversationsSection,
  followups: FollowUpsSection,
  memories: MemoriesSection,
  research: ResearchSection,
};

export function SectionManager({
  sections,
  expandedSections,
  onToggleSection,
  editedPreview,
  setEditedPreview,
  personName,
  personCompany,
  personRole,
  personLocation,
  isProcessing,
  handleSavePreviewEdits,
  handleApproveAndSave,
  setAiPreview,
  setIsEditingPreview,
  setShowRawNotes,
  // Context section props
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
  // Voice recording props
  isRecording,
  onToggleRecording,
}: SectionManagerProps) {
  // Sort by order, filter visible sections
  const visibleSections = sections
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  // Get badge counts for sections
  const getBadge = (sectionId: string) => {
    if (sectionId === 'conversations') {
      const count = editedPreview?.additional_notes?.length || 0;
      if (count > 0) {
        return <Badge variant="outline" className="text-xs">{count}</Badge>;
      }
    }
    if (sectionId === 'followups') {
      const count = (editedPreview?.follow_ups || editedPreview?.followUps)?.length || 0;
      if (count > 0) {
        return <Badge variant="outline" className="text-xs">{count}</Badge>;
      }
    }
    if (sectionId === 'memories') {
      const count = editedPreview?.memories?.length || 0;
      if (count > 0) {
        return <Badge variant="outline" className="text-xs">{count}</Badge>;
      }
    }
    if (sectionId === 'research') {
      const count = editedPreview?.research?.length || 0;
      if (count > 0) {
        return <Badge variant="outline" className="text-xs">{count}</Badge>;
      }
    }
    return null;
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Collapsible Sections */}
      <Card className="bg-white border-gray-200 p-4 space-y-2">
        {visibleSections.map((section) => {
          // Special handling for Context section with different props
          if (section.id === 'context') {
            return (
              <CollapsibleSection
                key={section.id}
                title={section.title}
                isExpanded={expandedSections[section.id] || false}
                onToggle={() => onToggleSection(section.id)}
                badge={getBadge(section.id)}
              >
                <ContextSection
                  contextType={contextType!}
                  setContextType={setContextType!}
                  persistentEvent={persistentEvent!}
                  setPersistentEvent={setPersistentEvent!}
                  showEventInput={showEventInput!}
                  setShowEventInput={setShowEventInput!}
                  showSessionFields={showSessionFields!}
                  setShowSessionFields={setShowSessionFields!}
                  sectionName={sectionName!}
                  setSectionName={setSectionName!}
                  panelParticipants={panelParticipants!}
                  setPanelParticipants={setPanelParticipants!}
                  linkedInUrls={linkedInUrls!}
                  setLinkedInUrls={setLinkedInUrls!}
                  companyLinkedInUrls={companyLinkedInUrls!}
                  setCompanyLinkedInUrls={setCompanyLinkedInUrls!}
                  linkedInProfilePaste={linkedInProfilePaste!}
                  setLinkedInProfilePaste={setLinkedInProfilePaste!}
                  handleParseLinkedInProfile={handleParseLinkedInProfile!}
                  isParsing={isParsing!}
                />
              </CollapsibleSection>
            );
          }

          // Get component for non-context sections
          const SectionComponent = SECTION_COMPONENTS[section.id as keyof typeof SECTION_COMPONENTS];
          
          if (!SectionComponent || section.id === 'context') {
            console.warn(`Section component not found for: ${section.id}`);
            return null;
          }

          // Render standard sections with standard props
          const Component = SectionComponent as React.ComponentType<{
            editedPreview: any;
            setEditedPreview: (preview: any) => void;
            personName: string;
            personCompany: string;
            personRole: string;
            personLocation: string;
          }>;

          return (
            <CollapsibleSection
              key={section.id}
              title={section.title}
              isExpanded={expandedSections[section.id] || false}
              onToggle={() => onToggleSection(section.id)}
              badge={getBadge(section.id)}
            >
              <Component
                editedPreview={editedPreview}
                setEditedPreview={setEditedPreview}
                personName={personName}
                personCompany={personCompany}
                personRole={personRole}
                personLocation={personLocation}
              />
            </CollapsibleSection>
          );
        })}
      </Card>

      {/* Save Button - Always visible at bottom */}
      {(personName?.trim() ||
        (editedPreview &&
          (editedPreview.people?.length > 0 ||
            editedPreview.conversations?.length > 0 ||
            editedPreview.follow_ups?.length > 0 ||
            editedPreview.memories?.length > 0 ||
            editedPreview.research?.length > 0))) && (
        <div className="flex gap-2 justify-between items-center">
          {/* Voice Recording Button - Left side */}
          <VoiceRecorderButton
            isRecording={isRecording || false}
            onToggle={onToggleRecording || (() => {})}
          />
          
          {/* Action Buttons - Right side */}
          <div className="flex gap-2">
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
            <Button
              onClick={() => {
                // Ensure we have the latest data including manual edits
                const dataToSave = editedPreview || {
                  people: [
                    {
                      name: personName,
                      company: personCompany,
                      role: personRole,
                      location: personLocation,
                    },
                  ],
                  conversations: [],
                  follow_ups: [],
                  memories: [],
                  research: [],
                };
                handleSavePreviewEdits();
                handleApproveAndSave(dataToSave);
              }}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isProcessing ? "Saving..." : "Save to Rolodex"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
