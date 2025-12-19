'use client';

import { useState } from 'react';
import { Meeting } from '@/lib/types/decide';

interface GoalMessageSectionProps {
  meeting: Meeting;
  onUpdate: (updates: Partial<Meeting>) => Promise<Meeting>;
}

export default function GoalMessageSection({
  meeting,
  onUpdate
}: GoalMessageSectionProps) {
  const [goal, setGoal] = useState(meeting.goal || '');
  const [keyMessage, setKeyMessage] = useState(meeting.key_message || '');

  const handleSaveGoal = async () => {
    await onUpdate({ goal });
  };

  const handleSaveMessage = async () => {
    await onUpdate({ key_message: keyMessage });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🎯 Goal & Message</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Meeting Goal
          </label>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onBlur={handleSaveGoal}
            placeholder="What do you want to accomplish in this meeting?"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Key Message
          </label>
          <textarea
            value={keyMessage}
            onChange={(e) => setKeyMessage(e.target.value)}
            onBlur={handleSaveMessage}
            placeholder="What's the main takeaway you want attendees to remember?"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      </div>
    </div>
  );
}
