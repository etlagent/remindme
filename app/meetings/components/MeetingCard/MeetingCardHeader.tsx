'use client';

import { Meeting } from '@/lib/types/decide';
import { useAttendees } from '../../hooks/useAttendees';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface MeetingCardHeaderProps {
  meeting: Meeting;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<Meeting>) => Promise<Meeting>;
  onDelete: () => void;
}

export default function MeetingCardHeader({
  meeting,
  expanded,
  onToggle,
  onUpdate,
  onDelete
}: MeetingCardHeaderProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [titleValue, setTitleValue] = useState(meeting.title);
  const [dateValue, setDateValue] = useState(meeting.meeting_date);
  const [businessName, setBusinessName] = useState<string | null>(null);

  useEffect(() => {
    if (meeting.business_id) {
      loadBusinessName();
    } else {
      setBusinessName(null);
    }
  }, [meeting.business_id]);

  const loadBusinessName = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('name')
        .eq('id', meeting.business_id)
        .single();

      if (data && !error) {
        setBusinessName(data.name);
      }
    } catch (err) {
      console.error('Error loading business name:', err);
    }
  };
  
  const handleSetStatus = async (status: 'draft' | 'preparing' | 'ready' | 'completed') => {
    await onUpdate({ status });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this meeting?')) {
      onDelete();
    }
  };

  const handleTitleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTitle(true);
  };

  const handleDateDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDate(true);
  };

  const handleTitleBlur = async () => {
    setEditingTitle(false);
    if (titleValue !== meeting.title) {
      await onUpdate({ title: titleValue });
    }
  };

  const handleDateBlur = async () => {
    setEditingDate(false);
    if (dateValue !== meeting.meeting_date) {
      await onUpdate({ meeting_date: dateValue });
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    } else if (e.key === 'Escape') {
      setTitleValue(meeting.title);
      setEditingTitle(false);
    }
  };

  const handleDateKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleDateBlur();
    } else if (e.key === 'Escape') {
      setDateValue(meeting.meeting_date);
      setEditingDate(false);
    }
  };

  const { attendees, fetchAttendees } = useAttendees(meeting.id);

  useEffect(() => {
    fetchAttendees();
  }, [fetchAttendees]);

  useEffect(() => {
    console.log('Header attendees for meeting', meeting.id, ':', attendees);
  }, [attendees, meeting.id]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  return (
    <div 
      onClick={onToggle}
      className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
    >
      {/* Date - Title (double-click to edit) */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {editingDate ? (
          <input
            type="date"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            onBlur={handleDateBlur}
            onKeyDown={handleDateKeyDown}
            onClick={(e) => e.stopPropagation()}
            autoFocus
            className="text-sm text-gray-900 dark:text-white font-medium px-2 py-1 border border-blue-500 rounded focus:outline-none"
          />
        ) : (
          <div
            onDoubleClick={(e) => {
              e.stopPropagation();
              handleDateDoubleClick(e);
            }}
            className="text-sm text-gray-900 dark:text-white font-medium flex-shrink-0 hover:text-blue-600"
          >
            {formatDate(meeting.meeting_date)}
          </div>
        )}
        
        <span className="text-gray-400">-</span>
        
        {businessName && (
          <>
            <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 flex-shrink-0">
              {businessName}
            </span>
            <span className="text-gray-400">-</span>
          </>
        )}
        
        {editingTitle ? (
          <input
            type="text"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            onClick={(e) => e.stopPropagation()}
            autoFocus
            className="text-lg font-semibold text-gray-900 dark:text-white px-2 py-1 border border-blue-500 rounded focus:outline-none flex-1 min-w-0"
          />
        ) : (
          <h3
            onDoubleClick={(e) => {
              e.stopPropagation();
              handleTitleDoubleClick(e);
            }}
            className="text-lg font-semibold text-gray-900 dark:text-white truncate min-w-0 hover:text-blue-600"
          >
            {meeting.title}
          </h3>
        )}
        
        {/* Attendees Pills */}
        {attendees.length > 0 && (
          <div className="flex gap-2 flex-shrink-0">
            {attendees.slice(0, 3).map((attendee) => (
              <span
                key={attendee.id}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200"
              >
                {attendee.people?.name || 'Unknown'}
              </span>
            ))}
            {attendees.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                +{attendees.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => handleSetStatus('completed')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            meeting.status === 'completed'
              ? 'bg-blue-600 text-white'
              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Complete
        </button>
        
        <button
          onClick={() => handleSetStatus('ready')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            meeting.status === 'ready'
              ? 'bg-green-600 text-white'
              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Ready
        </button>
        
        <button
          onClick={() => handleSetStatus('preparing')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            meeting.status === 'preparing'
              ? 'bg-yellow-600 text-white'
              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Prepare
        </button>
        
        <button
          onClick={handleDelete}
          className="px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
