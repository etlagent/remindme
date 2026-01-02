'use client';

import { useState } from 'react';
import { Meeting } from '@/lib/types/decide';

interface MeetingDetailsSectionProps {
  meeting: Meeting;
  onUpdate: (updates: Partial<Meeting>) => Promise<Meeting>;
}

export default function MeetingDetailsSection({
  meeting,
  onUpdate
}: MeetingDetailsSectionProps) {
  const [formData, setFormData] = useState({
    title: meeting.title,
    meeting_date: meeting.meeting_date,
    location: meeting.location || '',
    business_id: meeting.business_id || ''
  });
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleBlur = async (field: string, value: any) => {
    if (value !== meeting[field as keyof Meeting]) {
      await onUpdate({ [field]: value });
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">📋 Meeting Details</h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-500 hover:text-gray-700 transition-transform"
          style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {!isCollapsed && (
        <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            onBlur={(e) => handleBlur('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date
          </label>
          <input
            type="date"
            value={formData.meeting_date?.split('T')[0] || ''}
            onChange={(e) => setFormData({ ...formData, meeting_date: e.target.value })}
            onBlur={(e) => handleBlur('meeting_date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            onBlur={(e) => handleBlur('location', e.target.value)}
            placeholder="Conference Room, Zoom, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      )}
    </div>
  );
}
