'use client';

import { Meeting } from '@/lib/types/decide';
import MeetingCardHeader from './MeetingCardHeader';
import MeetingCardExpanded from './MeetingCardExpanded';

interface MeetingCardProps {
  meeting: Meeting;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<Meeting>) => Promise<Meeting>;
  onDelete: () => void;
}

export default function MeetingCard({
  meeting,
  expanded,
  onToggle,
  onUpdate,
  onDelete
}: MeetingCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <MeetingCardHeader
        meeting={meeting}
        expanded={expanded}
        onToggle={onToggle}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
      
      {expanded && (
        <MeetingCardExpanded
          meeting={meeting}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}
