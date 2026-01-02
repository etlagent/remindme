'use client';

import { useState } from 'react';
import { Meeting } from '@/lib/types/decide';
import MeetingDetailsSection from './MeetingCardExpanded/MeetingDetailsSection';
import GoalMessageSection from './MeetingCardExpanded/GoalMessageSection';
import AgendaSection from './MeetingCardExpanded/AgendaSection';
import AttendeesSection from './MeetingCardExpanded/AttendeesSection';
import ContextBuilder from './MeetingCardExpanded/ContextBuilder';
import KeyIdeasSection from './MeetingCardExpanded/KeyIdeasSection';
import ConversationStrategySectionV2 from './MeetingCardExpanded/ConversationStrategySectionV2';
import PreparationNotesSection from './MeetingCardExpanded/PreparationNotesSection';
import MeetingSummarySection from './MeetingCardExpanded/MeetingSummarySection';

interface MeetingCardExpandedProps {
  meeting: Meeting;
  onUpdate: (updates: Partial<Meeting>) => Promise<Meeting>;
  onDelete: () => void;
}

export default function MeetingCardExpanded({
  meeting,
  onUpdate,
  onDelete
}: MeetingCardExpandedProps) {
  const [leftColumnCollapsed, setLeftColumnCollapsed] = useState(false);
  const [meetingType, setMeetingType] = useState('qualification');
  const [contextFields, setContextFields] = useState<Array<{ id: string; label: string; value: string; placeholder: string }>>([]);

  const handleContextChange = (newMeetingType: string, newContextFields: Array<{ id: string; label: string; value: string; placeholder: string }>) => {
    setMeetingType(newMeetingType);
    setContextFields(newContextFields);
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-6">
      <div className="flex gap-6">
        {/* Left Column - Meeting Details & Attendees (1/3 width, collapsible) */}
        {!leftColumnCollapsed && (
          <div className="w-1/3 space-y-6">
            <button
              onClick={() => setLeftColumnCollapsed(true)}
              className="mb-4 text-gray-500 hover:text-gray-700 transition-colors"
              title="Collapse details"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            <MeetingDetailsSection meeting={meeting} onUpdate={onUpdate} />
            <AttendeesSection meetingId={meeting.id} />
          </div>
        )}
        
        {/* Collapsed Left Column Button */}
        {leftColumnCollapsed && (
          <div className="flex-shrink-0">
            <button
              onClick={() => setLeftColumnCollapsed(false)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
              title="Expand details"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Right Column - Preparation Sections (2/3 width or full width when left is collapsed) */}
        <div className={`${leftColumnCollapsed ? 'flex-1' : 'flex-1'} space-y-6 border-l-2 border-purple-500 pl-6 overflow-x-hidden`}>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            The Ability to Pull in any conversations or meetings from with the business, from relationships, Notes etc.
          </div>
          
          <GoalMessageSection meeting={meeting} onUpdate={onUpdate} />
          
          <KeyIdeasSection meeting={meeting} onUpdate={onUpdate} />
          
          <AgendaSection meeting={meeting} onUpdate={onUpdate} />
          
          <ContextBuilder 
            meetingId={meeting.id} 
            onContextChange={handleContextChange}
          />
          
          <ConversationStrategySectionV2 
            meetingId={meeting.id}
            meetingType={meetingType}
            contextFields={contextFields}
          />
          
          <PreparationNotesSection meeting={meeting} onUpdate={onUpdate} />
          
          <MeetingSummarySection meeting={meeting} onUpdate={onUpdate} />
        </div>
      </div>
    </div>
  );
}
