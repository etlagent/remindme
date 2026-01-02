'use client';

import { useState } from 'react';
import { Meeting } from '@/lib/types/decide';
import CalendarCollapsible from './CalendarSection/CalendarCollapsible';
import MeetingCard from './MeetingCard/MeetingCard';

interface MeetingsLayoutProps {
  meetings: Meeting[];
  expandedMeetingId: string | null;
  setExpandedMeetingId: (id: string | null) => void;
  calendarExpanded: boolean;
  setCalendarExpanded: (expanded: boolean) => void;
  multiSelectMode: boolean;
  setMultiSelectMode: (mode: boolean) => void;
  selectedMeetings: Set<string>;
  setSelectedMeetings: (meetings: Set<string>) => void;
  inlineExpandedMeetingId: string | null;
  setInlineExpandedMeetingId: (id: string | null) => void;
  onCreateMeeting: (meetingData: Partial<Meeting>) => Promise<Meeting>;
  onUpdateMeeting: (id: string, updates: Partial<Meeting>) => Promise<Meeting>;
  onDeleteMeeting: (id: string) => Promise<void>;
  onReorderMeetings: (reorderedMeetings: Meeting[]) => Promise<void>;
}

export default function MeetingsLayout({
  meetings,
  expandedMeetingId,
  setExpandedMeetingId,
  calendarExpanded,
  setCalendarExpanded,
  multiSelectMode,
  setMultiSelectMode,
  selectedMeetings,
  setSelectedMeetings,
  inlineExpandedMeetingId,
  setInlineExpandedMeetingId,
  onCreateMeeting,
  onUpdateMeeting,
  onDeleteMeeting,
  onReorderMeetings
}: MeetingsLayoutProps) {
  const [showNewMeetingForm, setShowNewMeetingForm] = useState(false);
  const [draggedMeetingId, setDraggedMeetingId] = useState<string | null>(null);

  const handleCreateMeeting = async () => {
    try {
      console.log('Button clicked - creating meeting...');
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      console.log('Calling onCreateMeeting with data:', {
        title: 'New Meeting',
        meeting_date: tomorrow.toISOString().split('T')[0],
        status: 'draft',
      });

      const newMeeting = await onCreateMeeting({
        title: 'New Meeting',
        meeting_date: tomorrow.toISOString().split('T')[0],
        status: 'draft',
      });

      console.log('Meeting created:', newMeeting);
      setExpandedMeetingId(newMeeting.id);
    } catch (error) {
      console.error('Error in handleCreateMeeting:', error);
      alert('Failed to create meeting: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleMeetingDragStart = (meetingId: string) => {
    setDraggedMeetingId(meetingId);
  };

  const handleMeetingDragEnd = () => {
    setDraggedMeetingId(null);
  };

  const handleMeetingDrop = (targetMeetingId: string) => {
    if (!draggedMeetingId || draggedMeetingId === targetMeetingId) return;

    const draggedIndex = meetings.findIndex(m => m.id === draggedMeetingId);
    const targetIndex = meetings.findIndex(m => m.id === targetMeetingId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const reordered = [...meetings];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    onReorderMeetings(reordered);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meetings</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
        {/* Calendar Collapsible */}
        <CalendarCollapsible
          expanded={calendarExpanded}
          onToggle={() => setCalendarExpanded(!calendarExpanded)}
          meetings={meetings}
          onMeetingClick={(meetingId) => {
            setExpandedMeetingId(meetingId);
            const element = document.getElementById(`meeting-${meetingId}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
          onUpdateMeeting={onUpdateMeeting}
        />

        {/* Meetings Section Header with Inline Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center gap-6">
            <button
              onClick={handleCreateMeeting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              + Meetings
            </button>
            
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className="text-gray-900 dark:text-white font-medium">All</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Type:</span>
              <span className="text-gray-900 dark:text-white font-medium">All Meetings</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Date:</span>
              <span className="text-gray-900 dark:text-white font-medium">All Time</span>
            </div>
            
            <div className="flex-1"></div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {meetings.length} meetings
            </div>
          </div>
        </div>

        {/* Meeting Cards */}
        <div className="space-y-4">
          {meetings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-2">No meetings yet</p>
              <p className="text-sm">Click "+ Meeting" to create your first meeting</p>
            </div>
          ) : (
            meetings.map((meeting) => (
              <div
                key={meeting.id}
                id={`meeting-${meeting.id}`}
                draggable={expandedMeetingId !== meeting.id}
                onDragStart={(e) => {
                  console.log('=== DRAG START ===');
                  console.log('Meeting ID being dragged:', meeting.id);
                  handleMeetingDragStart(meeting.id);
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('application/json', JSON.stringify(meeting));
                  e.dataTransfer.setData('meetingId', meeting.id);
                  console.log('Drag data set');
                }}
                onDragEnd={handleMeetingDragEnd}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleMeetingDrop(meeting.id)}
                className={draggedMeetingId === meeting.id ? 'opacity-50' : ''}
              >
                <MeetingCard
                  meeting={meeting}
                  expanded={expandedMeetingId === meeting.id}
                  onToggle={() => setExpandedMeetingId(
                    expandedMeetingId === meeting.id ? null : meeting.id
                  )}
                  onUpdate={(updates) => onUpdateMeeting(meeting.id, updates)}
                  onDelete={() => onDeleteMeeting(meeting.id)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
