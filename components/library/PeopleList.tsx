/**
 * PEOPLE LIST COMPONENT
 * 
 * Displays a sortable list of people with drag-and-drop reordering.
 * Wraps SortablePersonCard components in a DnD context.
 * 
 * USED BY:
 * - components/library/LibraryPanel.tsx
 * 
 * DEPENDENCIES:
 * - @dnd-kit/core (DnD context and sensors)
 * - @dnd-kit/sortable (sortable context)
 * - components/library/SortablePersonCard
 * 
 * PROPS:
 * - people: Array of Person objects
 * - onDragEnd: Callback when drag completes (updates display_order)
 * - onLoadPerson: Callback when person card is clicked
 * 
 * FEATURES:
 * - Drag-and-drop reordering
 * - Touch-friendly (requires press-and-hold before drag)
 * - Empty state when no people exist
 * 
 * DATA FLOW:
 * 1. User drags a person card
 * 2. onDragEnd fires with new order
 * 3. Parent updates database with new display_order
 * 4. List re-renders with updated order
 */

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortablePersonCard } from './SortablePersonCard';
import { DRAG_ACTIVATION_CONSTRAINT, EMPTY_STATES } from '@/lib/constants';
import type { Person, DragEndEvent } from '@/lib/types';

interface PeopleListProps {
  people: Person[];
  onDragEnd: (event: DragEndEvent) => void;
  onLoadPerson: (personId: string) => void;
}

export function PeopleList({ people, onDragEnd, onLoadPerson }: PeopleListProps) {
  // Configure drag sensors (requires long press on touch devices)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: DRAG_ACTIVATION_CONSTRAINT,
    })
  );

  // Empty state
  if (people.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>{EMPTY_STATES.NO_PEOPLE}</p>
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
        items={people.map(p => p.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {people.map((person) => (
            <SortablePersonCard
              key={person.id}
              person={person}
              onLoad={onLoadPerson}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
