'use client';

import { useState } from 'react';
import { Meeting } from '@/lib/types/decide';

interface PreparationNotesSectionProps {
  meeting: Meeting;
  onUpdate: (updates: Partial<Meeting>) => Promise<Meeting>;
}

export default function PreparationNotesSection({
  meeting,
  onUpdate
}: PreparationNotesSectionProps) {
  const [notes, setNotes] = useState(meeting.preparation_notes || '');

  const handleSave = async () => {
    await onUpdate({ preparation_notes: notes });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📝 Preparation Notes</h3>
      
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={handleSave}
        placeholder="Add any additional preparation notes, reminders, or thoughts about this meeting..."
        rows={6}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
        style={{ whiteSpace: 'pre-wrap' }}
      />
      
      <p className="text-xs text-gray-500 mt-2">
        {notes.length} characters • Auto-saved on blur
      </p>
    </div>
  );
}
