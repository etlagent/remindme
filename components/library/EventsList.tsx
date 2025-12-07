/**
 * EVENTS LIST COMPONENT
 * 
 * Displays a sortable list of events with drag-and-drop reordering.
 * Wraps SortableEventCard components in a DnD context.
 * 
 * USED BY:
 * - components/library/LibraryPanel.tsx
 * 
 * DEPENDENCIES:
 * - @dnd-kit/core (DnD context and sensors)
 * - @dnd-kit/sortable (sortable context)
 * - components/library/SortableEventCard
 * 
 * PROPS:
 * - events: Array of Event objects
 * - onDragEnd: Callback when drag completes (updates display_order)
 * 
 * FEATURES:
 * - Drag-and-drop reordering
 * - Touch-friendly (requires press-and-hold before drag)
 * - Empty state when no events exist
 * 
 * DATA FLOW:
 * 1. User drags an event card
 * 2. onDragEnd fires with new order
 * 3. Parent updates database with new display_order
 * 4. List re-renders with updated order
 */

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableEventCard } from './SortableEventCard';
import { DRAG_ACTIVATION_CONSTRAINT, EMPTY_STATES } from '@/lib/constants';
import type { Event, DragEndEvent } from '@/lib/types';

interface EventsListProps {
  events: Event[];
  onDragEnd: (event: DragEndEvent) => void;
}

export function EventsList({ events, onDragEnd }: EventsListProps) {
  // Configure drag sensors (requires long press on touch devices)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: DRAG_ACTIVATION_CONSTRAINT,
    })
  );

  // Empty state
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>{EMPTY_STATES.NO_EVENTS}</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={events.map(e => e.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {events.map((event) => (
            <SortableEventCard
              key={event.id}
              event={event}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
