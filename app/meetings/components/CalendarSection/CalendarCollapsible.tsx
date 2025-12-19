'use client';

import { Meeting } from '@/lib/types/decide';
import MeetingsCalendar from './MeetingsCalendar';

interface CalendarCollapsibleProps {
  expanded: boolean;
  onToggle: () => void;
  meetings: Meeting[];
  onMeetingClick: (meetingId: string) => void;
  onUpdateMeeting: (id: string, updates: Partial<Meeting>) => Promise<Meeting>;
}

export default function CalendarCollapsible({
  expanded,
  onToggle,
  meetings,
  onMeetingClick,
  onUpdateMeeting
}: CalendarCollapsibleProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📅</span>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Calendar</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{expanded ? 'Collapse' : 'Expand'}</span>
          <svg
            className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Calendar Content */}
      {expanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <MeetingsCalendar
            meetings={meetings}
            onMeetingClick={onMeetingClick}
            onUpdateMeeting={onUpdateMeeting}
          />
        </div>
      )}
    </div>
  );
}
