'use client';

import { useState } from 'react';
import { useMeetings } from './hooks/useMeetings';
import MeetingsLayout from './components/MeetingsLayout';
import { GlobalModeHeader } from '@/components/layout/GlobalModeHeader';

export default function MeetingsPage() {
  const {
    meetings,
    loading,
    error,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    reorderMeetings
  } = useMeetings();

  const [expandedMeetingId, setExpandedMeetingId] = useState<string | null>(null);
  const [calendarExpanded, setCalendarExpanded] = useState(false);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedMeetings, setSelectedMeetings] = useState<Set<string>>(new Set());
  const [inlineExpandedMeetingId, setInlineExpandedMeetingId] = useState<string | null>(null);

  if (loading && meetings.length === 0) {
    return (
      <>
        <GlobalModeHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-500">Loading meetings...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <GlobalModeHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <GlobalModeHeader />
      <MeetingsLayout
        meetings={meetings}
        expandedMeetingId={expandedMeetingId}
        setExpandedMeetingId={setExpandedMeetingId}
        calendarExpanded={calendarExpanded}
        setCalendarExpanded={setCalendarExpanded}
        multiSelectMode={multiSelectMode}
        setMultiSelectMode={setMultiSelectMode}
        selectedMeetings={selectedMeetings}
        setSelectedMeetings={setSelectedMeetings}
        inlineExpandedMeetingId={inlineExpandedMeetingId}
        setInlineExpandedMeetingId={setInlineExpandedMeetingId}
        onCreateMeeting={createMeeting}
        onUpdateMeeting={updateMeeting}
        onDeleteMeeting={deleteMeeting}
        onReorderMeetings={reorderMeetings}
      />
    </>
  );
}
