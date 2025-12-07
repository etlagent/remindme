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
import { ResearchSectionV2 as ResearchSection } from "./sections/ResearchSectionV2";
import { VoiceRecorderButton } from "./VoiceRecorderButton";
import { Badge } from "@/components/ui/badge";
import { Eye, X } from "lucide-react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface SectionConfig {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  visible: boolean;
  order: number;
}

interface SectionManagerProps {
  sections: SectionConfig[];
  setSections: (sections: SectionConfig[]) => void;
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
  // Person ID for research
  personId?: string;
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

// Sortable Section Wrapper Component
function SortableSection({ 
  section, 
  isExpanded, 
  onToggle, 
  badge, 
  children 
}: { 
  section: SectionConfig; 
  isExpanded: boolean; 
  onToggle: () => void; 
  badge?: React.ReactNode; 
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Don't render if not visible
  if (!section.visible) return null;

  return (
    <div ref={setNodeRef} style={style} className="cursor-move">
      <CollapsibleSection
        title={section.title}
        isExpanded={isExpanded}
        onToggle={onToggle}
        badge={badge}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      >
        {children}
      </CollapsibleSection>
    </div>
  );
}

export function SectionManager({
  sections,
  setSections,
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
  // Person ID
  personId,
}: SectionManagerProps) {
  // Setup drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  // Handle drag end - reorder sections
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);

      const reorderedSections = arrayMove(sections, oldIndex, newIndex).map((section, index) => ({
        ...section,
        order: index,
      }));

      setSections(reorderedSections);
      
      // Save to localStorage
      localStorage.setItem('sectionConfig', JSON.stringify(reorderedSections));
    }
  };

  // Toggle section visibility
  const handleToggleVisibility = (sectionId: string) => {
    const updatedSections = sections.map((s) =>
      s.id === sectionId ? { ...s, visible: !s.visible } : s
    );
    setSections(updatedSections);
    
    // Save to localStorage
    localStorage.setItem('sectionConfig', JSON.stringify(updatedSections));
  };

  // Sort by order and filter visible sections
  const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);
  
  // State for visibility settings panel
  const [showVisibilityPanel, setShowVisibilityPanel] = React.useState(false);

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
    <div>
      {/* Section Controls - Very tight spacing */}
      <div className="flex justify-end -mt-4 mb-1">
        <button
          onClick={() => setShowVisibilityPanel(!showVisibilityPanel)}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          title="Manage section visibility"
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>

      {/* Collapsible Sections */}
      <Card className="bg-white border-gray-200 p-4 space-y-2">
        {/* Visibility Settings Panel */}
        {showVisibilityPanel && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700">Show/Hide Sections</h4>
              <button
                onClick={() => setShowVisibilityPanel(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {sections.sort((a, b) => a.order - b.order).map((section) => (
                <label
                  key={section.id}
                  className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={section.visible}
                    onChange={() => handleToggleVisibility(section.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{section.title}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={visibleSections.map((s: SectionConfig) => s.id)}
            strategy={verticalListSortingStrategy}
          >
              {visibleSections.map((section: SectionConfig) => {
                // Special handling for Context section with different props
                if (section.id === 'context') {
                  return (
                    <SortableSection
                      key={section.id}
                      section={section}
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
                    </SortableSection>
                  );
                }

                // Get component for non-context sections
                const SectionComponent = SECTION_COMPONENTS[section.id as keyof typeof SECTION_COMPONENTS];
                
                if (!SectionComponent || section.id === 'context') {
                  console.warn(`Section component not found for: ${section.id}`);
                  return null;
                }

                // Render standard sections with standard props
                const Component = SectionComponent as React.ComponentType<any>;
                
                // Build props - add personId for research section
                const componentProps: any = {
                  editedPreview,
                  setEditedPreview,
                  personName,
                  personCompany,
                  personRole,
                  personLocation,
                };
                
                if (section.id === 'research') {
                  componentProps.personId = personId;
                }

                return (
                  <SortableSection
                    key={section.id}
                    section={section}
                    isExpanded={expandedSections[section.id] || false}
                    onToggle={() => onToggleSection(section.id)}
                    badge={getBadge(section.id)}
                  >
                    <Component {...componentProps} />
                  </SortableSection>
                );
              })}
          </SortableContext>
        </DndContext>
      </Card>

      {/* Action Buttons - Always visible at bottom */}
      <div className="flex gap-2 justify-between items-center mt-4">
        {/* Voice Recording Button - Left side */}
        <VoiceRecorderButton
          isRecording={isRecording || false}
          onToggle={onToggleRecording || (() => {})}
        />
        
        {/* Save/Cancel Buttons - Right side - show when there's any content */}
        {(personName || personCompany || personRole || personLocation || editedPreview) && (
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
              disabled={isProcessing || !personName}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isProcessing ? "Saving..." : "Save to Rolodex"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
