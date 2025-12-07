/**
 * FOLLOW-UPS LIST COMPONENT
 * 
 * Displays a sortable list of follow-up action items with drag-and-drop reordering.
 * Wraps SortableFollowUpCard components in a DnD context.
 * 
 * USED BY:
 * - components/library/LibraryPanel.tsx
 * 
 * DEPENDENCIES:
 * - @dnd-kit/core (DnD context and sensors)
 * - @dnd-kit/sortable (sortable context)
 * - components/library/SortableFollowUpCard
 * 
 * PROPS:
 * - followUps: Array of FollowUp objects
 * - onDragEnd: Callback when drag completes (updates display_order)
 * 
 * FEATURES:
 * - Drag-and-drop reordering
 * - Touch-friendly (requires press-and-hold before drag)
 * - Empty state when no follow-ups exist
 * 
 * DATA FLOW:
 * 1. User drags a follow-up card
 * 2. onDragEnd fires with new order
 * 3. Parent updates database with new display_order
 * 4. List re-renders with updated order
 */

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableFollowUpCard } from './SortableFollowUpCard';
import { DRAG_ACTIVATION_CONSTRAINT, EMPTY_STATES } from '@/lib/constants';
import type { FollowUp, DragEndEvent } from '@/lib/types';

interface FollowUpsListProps {
  followUps: FollowUp[];
  onDragEnd: (event: DragEndEvent) => void;
}

export function FollowUpsList({ followUps, onDragEnd }: FollowUpsListProps) {
  // Configure drag sensors (requires long press on touch devices)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: DRAG_ACTIVATION_CONSTRAINT,
    })
  );

  // Empty state
  if (followUps.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>{EMPTY_STATES.NO_FOLLOW_UPS}</p>
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
        items={followUps.map(f => f.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {followUps.map((followUp) => (
            <SortableFollowUpCard
              key={followUp.id}
              followUp={followUp}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
