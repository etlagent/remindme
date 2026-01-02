'use client';

import { useState } from 'react';
import { Meeting } from '@/lib/types/decide';
import { supabase } from '@/lib/supabase';
import MeetingDetailsSection from './MeetingCardExpanded/MeetingDetailsSection';
import GoalMessageSection from './MeetingCardExpanded/GoalMessageSection';
import AgendaSection from './MeetingCardExpanded/AgendaSection';
import AttendeesSection from './MeetingCardExpanded/AttendeesSection';
import ContextBuilder from './MeetingCardExpanded/ContextBuilder';
import KeyIdeasSection from './MeetingCardExpanded/KeyIdeasSection';
import ConversationStrategySectionV2 from './MeetingCardExpanded/ConversationStrategySectionV2';
import PreparationNotesSection from './MeetingCardExpanded/PreparationNotesSection';
import MeetingSummarySection from './MeetingCardExpanded/MeetingSummarySection';
import PreviousMeetingSection from './MeetingCardExpanded/PreviousMeetingSection';
import ActionItemsSection from './MeetingCardExpanded/ActionItemsSection';

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
  const [previewMeeting, setPreviewMeeting] = useState<Meeting | null>(null);

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
            <PreparationNotesSection meeting={meeting} onUpdate={onUpdate} />
            <PreviousMeetingSection 
              meetingId={meeting.id} 
              currentMeetingBusinessId={meeting.business_id}
              onUpdate={onUpdate}
              onPreviewMeeting={setPreviewMeeting}
            />
            <ActionItemsSection meeting={meeting} onUpdate={onUpdate} />
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
        
        {/* Right Column - Preparation Sections or Preview (2/3 width or full width when left is collapsed) */}
        <div className={`${leftColumnCollapsed ? 'flex-1' : 'flex-1'} space-y-6 border-l-2 border-gray-300 pl-6 overflow-x-hidden`}>
          {previewMeeting ? (
            <div className="space-y-6">
              {/* Header with Link/Close buttons */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-300">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{previewMeeting.title}</h2>
                  <p className="text-xs text-gray-500">{new Date(previewMeeting.meeting_date).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      try {
                        const { error } = await supabase
                          .from('meeting_relationships')
                          .insert({
                            meeting_id: meeting.id,
                            related_meeting_id: previewMeeting.id,
                            relationship_type: 'previous'
                          });

                        if (error) {
                          if (error.code === '23505') {
                            alert('This meeting is already linked');
                          } else {
                            throw error;
                          }
                        } else {
                          alert('Meeting linked successfully!');
                          setPreviewMeeting(null);
                        }
                      } catch (err) {
                        console.error('Error linking meeting:', err);
                        alert('Failed to link meeting');
                      }
                    }}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Link
                  </button>
                  <button
                    onClick={() => setPreviewMeeting(null)}
                    className="px-3 py-1.5 text-gray-600 hover:text-gray-800 text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Goal Section */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    🎯 Goal
                  </h3>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Meeting Goal
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white min-h-[60px]">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {previewMeeting.goal || 'What do you want to accomplish in this meeting?'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Ideas Section */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    💡 Key Ideas
                  </h3>
                </div>
                {previewMeeting.key_ideas && previewMeeting.key_ideas.length > 0 ? (
                  <div className="space-y-2">
                    {previewMeeting.key_ideas.map((idea) => (
                      <div key={idea.id} className="flex items-center gap-3 p-2 bg-white rounded border border-gray-200">
                        <span className="text-gray-400">≡</span>
                        <span className="flex-1 text-sm text-gray-900">{idea.text}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm mb-1">No key ideas yet</p>
                    <p className="text-xs text-gray-400">💡 Add key points or messages you want to communicate during this meeting.</p>
                    <p className="text-xs text-gray-400">AI will use these when generating your conversation strategy.</p>
                  </div>
                )}
              </div>

              {/* Agenda Section */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    📋 Agenda
                  </h3>
                </div>
                {previewMeeting.agenda_items && previewMeeting.agenda_items.length > 0 ? (
                  <div className="space-y-2">
                    {previewMeeting.agenda_items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-2 bg-white rounded border border-gray-200">
                        <span className="text-gray-400">≡</span>
                        <span className="text-sm text-gray-600">{item.order}.</span>
                        <span className="flex-1 text-sm text-gray-900">{item.title}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No agenda items yet</p>
                  </div>
                )}
              </div>

              {/* Context Section */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    🎯 Context
                  </h3>
                </div>
                <p className="text-sm text-gray-500 italic">Context not available in preview</p>
              </div>

              {/* Conversation Strategy Section */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    💬 Conversation Strategy
                  </h3>
                </div>
                {previewMeeting.strategy_text ? (
                  <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap bg-white p-3 rounded border border-gray-200">
                    {previewMeeting.strategy_text}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No strategy generated yet</p>
                  </div>
                )}
              </div>

              {/* Meeting Summary Section */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    📝 Meeting Summary
                  </h3>
                </div>
                {previewMeeting.meeting_summary ? (
                  <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap bg-white p-3 rounded border border-gray-200">
                    {previewMeeting.meeting_summary}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No summary yet</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
          <>
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
            
            <MeetingSummarySection meeting={meeting} onUpdate={onUpdate} />
          </>
          )}
        </div>
      </div>
    </div>
  );
}
