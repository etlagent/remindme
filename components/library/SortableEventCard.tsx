/**
 * SORTABLE EVENT CARD COMPONENT
 * 
 * Displays a draggable card for an event in the library.
 * Supports drag-and-drop reordering using @dnd-kit.
 * 
 * USED BY:
 * - components/library/EventsList.tsx
 * 
 * DEPENDENCIES:
 * - @dnd-kit/sortable (drag-and-drop functionality)
 * - @dnd-kit/utilities (CSS transform utilities)
 * - components/ui/card (shadcn Card component)
 * 
 * PROPS:
 * - event: Event object from database
 * 
 * FEATURES:
 * - Drag-and-drop to reorder
 * - Displays: event name, date, location
 * - Visual feedback while dragging
 * 
 * EXTRACTED FROM:
 * - app/page.tsx (lines 20-51)
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from "@/components/ui/card";
import type { Event } from "@/lib/types";

interface SortableEventCardProps {
  event: Event;
}

export function SortableEventCard({ event }: SortableEventCardProps) {
  // Setup drag-and-drop functionality
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: event.id });

  // Apply drag transform styles
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="bg-white border-gray-200 p-4 hover:bg-gray-50 transition-all cursor-move">
        {/* Event Header */}
        <div className="flex justify-between items-start mb-2">
          <div>
            {/* Event Name */}
            <h3 className="font-semibold text-gray-800">{event.name}</h3>
            
            {/* Event Date */}
            <p className="text-sm text-gray-600">
              {event.date 
                ? new Date(event.date).toLocaleDateString() 
                : 'No date'}
            </p>
          </div>
        </div>
        
        {/* Event Location */}
        {event.location && (
          <p className="text-xs text-gray-500">📍 {event.location}</p>
        )}
      </Card>
    </div>
  );
}
