'use client';

import { useState } from 'react';
import { Meeting } from '@/lib/types/decide';

interface MeetingsCalendarProps {
  meetings: Meeting[];
  onMeetingClick: (meetingId: string) => void;
  onUpdateMeeting: (id: string, updates: Partial<Meeting>) => Promise<Meeting>;
}

export default function MeetingsCalendar({
  meetings,
  onMeetingClick,
  onUpdateMeeting
}: MeetingsCalendarProps) {
  const [viewDays, setViewDays] = useState(3);
  const [startDate, setStartDate] = useState(new Date());

  const handlePrevious = () => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() - 1);
    setStartDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() + 1);
    setStartDate(newDate);
  };

  const handleToday = () => {
    setStartDate(new Date());
  };

  const decreaseDays = () => {
    if (viewDays > 1) {
      setViewDays(viewDays - 2);
    }
  };

  const increaseDays = () => {
    if (viewDays < 14) {
      setViewDays(viewDays + 2);
    }
  };

  const generateDays = () => {
    const days = [];
    for (let i = 0; i < viewDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getMeetingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return meetings.filter(m => {
      // Handle both formats: "2025-12-19" and "2025-12-19T00:00:00+00:00"
      const meetingDateStr = m.meeting_date?.split('T')[0];
      return meetingDateStr === dateStr;
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const days = generateDays();
  const weeks = [];
  
  // Stack weeks if more than 7 days
  if (viewDays > 7) {
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
  } else {
    weeks.push(days);
  }

  return (
    <div className="space-y-4">
      {/* Calendar Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
          >
            Today
          </button>
          <div className="flex items-center gap-1 border border-gray-300 rounded-md">
            <button
              onClick={decreaseDays}
              className="px-2 py-1.5 hover:bg-gray-100 transition-colors"
              disabled={viewDays <= 1}
            >
              −
            </button>
            <span className="px-3 py-1.5 text-sm font-medium border-x border-gray-300">
              {viewDays}d
            </span>
            <button
              onClick={increaseDays}
              className="px-2 py-1.5 hover:bg-gray-100 transition-colors"
              disabled={viewDays >= 14}
            >
              +
            </button>
          </div>
          <button
            onClick={handlePrevious}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="text-sm text-gray-600">
          {formatDate(days[0])} - {formatDate(days[days.length - 1])}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-4">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${week.length}, 1fr)` }}>
            {week.map((day, dayIndex) => {
              const dayMeetings = getMeetingsForDate(day);
              const today = isToday(day);

              return (
                <div
                  key={dayIndex}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    console.log('Drag over calendar day');
                  }}
                  onDrop={async (e) => {
                    console.log('=== DROP EVENT FIRED ===');
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const meetingId = e.dataTransfer.getData('meetingId');
                    console.log('Meeting ID:', meetingId);
                    
                    if (meetingId) {
                      const dateStr = day.toISOString().split('T')[0];
                      console.log('Updating to date:', dateStr);
                      try {
                        await onUpdateMeeting(meetingId, { meeting_date: dateStr });
                        console.log('Update successful!');
                      } catch (error) {
                        console.error('Update failed:', error);
                      }
                    } else {
                      console.log('No meeting ID found');
                    }
                  }}
                  className={`rounded-lg border-2 border-dashed p-3 min-h-[400px] transition-all ${
                    today
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-600'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {/* Day Header */}
                  <div className="mb-2 pb-2 border-b border-gray-300">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {day.getDate()}
                    </div>
                  </div>

                  {/* Meetings */}
                  <div className="space-y-2">
                    {dayMeetings.map(meeting => (
                      <div
                        key={meeting.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = 'move';
                          e.dataTransfer.setData('application/json', JSON.stringify(meeting));
                          e.dataTransfer.setData('meetingId', meeting.id);
                        }}
                        className="relative w-full text-left p-2 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer group"
                      >
                        <div onClick={() => onMeetingClick(meeting.id)}>
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate pr-6">
                            {meeting.title}
                          </div>
                        </div>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await onUpdateMeeting(meeting.id, { meeting_date: null as any });
                            } catch (error) {
                              console.error('Error removing meeting from calendar:', error);
                            }
                          }}
                          className="absolute top-1 right-1 p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove from calendar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
