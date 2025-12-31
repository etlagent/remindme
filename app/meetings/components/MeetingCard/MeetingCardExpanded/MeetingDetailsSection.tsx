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

  const handleBlur = async (field: string, value: any) => {
    if (value !== meeting[field as keyof Meeting]) {
      await onUpdate({ [field]: value });
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
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
    </div>
  );
}
