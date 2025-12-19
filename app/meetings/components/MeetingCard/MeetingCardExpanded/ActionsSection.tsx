'use client';

import { Meeting } from '@/lib/types/decide';

interface ActionsSectionProps {
  meeting: Meeting;
  onUpdate: (updates: Partial<Meeting>) => Promise<Meeting>;
  onDelete: () => void;
}

export default function ActionsSection({
  meeting,
  onUpdate,
  onDelete
}: ActionsSectionProps) {
  const handleMarkReady = async () => {
    await onUpdate({ status: 'ready' });
  };

  const handleMarkCompleted = async () => {
    await onUpdate({ status: 'completed' });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this meeting?')) {
      onDelete();
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">⚡ Actions</h3>
      
      <div className="flex flex-wrap gap-3">
        {meeting.status !== 'ready' && meeting.status !== 'completed' && (
          <button
            onClick={handleMarkReady}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
          >
            ✅ Mark as Ready
          </button>
        )}

        {meeting.status !== 'completed' && (
          <button
            onClick={handleMarkCompleted}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            🎯 Mark as Completed
          </button>
        )}

        <button
          onClick={handleDelete}
          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors"
        >
          🗑️ Delete Meeting
        </button>

        {meeting.business_id && meeting.status === 'completed' && (
          <button
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
            disabled
          >
            📤 Send to Business.Meetings
          </button>
        )}
      </div>
    </div>
  );
}
