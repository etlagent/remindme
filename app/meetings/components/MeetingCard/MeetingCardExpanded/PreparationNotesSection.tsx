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
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    await onUpdate({ preparation_notes: notes });
  };

  const renderWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">📝 Preparation Notes</h3>
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
        <>
      {isEditing ? (
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => {
            handleSave();
            setIsEditing(false);
          }}
          placeholder="Add any additional preparation notes, reminders, or thoughts about this meeting..."
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
          style={{ whiteSpace: 'pre-wrap' }}
          autoFocus
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[150px] cursor-text font-mono text-sm bg-white hover:border-blue-400 transition-colors"
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {notes ? renderWithLinks(notes) : (
            <span className="text-gray-400 italic">
              Add any additional preparation notes, reminders, or thoughts about this meeting...
            </span>
          )}
        </div>
      )}
      
      <p className="text-xs text-gray-500 mt-2">
        {notes.length} characters • Auto-saved on blur • Click to edit
      </p>
      </>
      )}
    </div>
  );
}
