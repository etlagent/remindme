/**
 * USE DRAG AND DROP HOOK
 * 
 * Manages drag-and-drop reordering for people, events, and follow-ups.
 * Updates database with new display_order when items are reordered.
 * 
 * USED BY:
 * - app/page.tsx (main page)
 * 
 * DEPENDENCIES:
 * - @dnd-kit/sortable (arrayMove utility)
 * - lib/supabase (database updates)
 * - lib/types (Person, Event, FollowUp types)
 * 
 * PROVIDES:
 * - handlePeopleDragEnd: Handler for people list reordering
 * - handleEventsDragEnd: Handler for events list reordering
 * - handleFollowUpsDragEnd: Handler for follow-ups list reordering
 * 
 * HOW IT WORKS:
 * 1. User drags an item to new position
 * 2. Handler calculates new order using arrayMove
 * 3. Updates local state immediately (optimistic update)
 * 4. Updates database with new display_order values
 * 5. If database update fails, could revert (not implemented yet)
 * 
 * DATABASE UPDATES:
 * - Updates display_order column for each item
 * - Saves position (0-based index) for each item
 */

import { arrayMove } from '@dnd-kit/sortable';
import { supabase } from '@/lib/supabase';
import type { Person, Event, FollowUp, DragEndEvent } from '@/lib/types';

export function useDragAndDrop() {
  /**
   * Handle drag-and-drop for people list
   * 
   * @param event - DragEndEvent from @dnd-kit
   * @param people - Current people array
   * @param setPeople - State setter for people
   */
  const handlePeopleDragEnd = async (
    event: DragEndEvent,
    people: Person[],
    setPeople: (people: Person[]) => void
  ) => {
    const { active, over } = event;

    // Only update if dropped on different position
    if (over && active.id !== over.id) {
      const oldIndex = people.findIndex((p) => p.id === active.id);
      const newIndex = people.findIndex((p) => p.id === over.id);

      // Reorder array
      const newPeople = arrayMove(people, oldIndex, newIndex);
      setPeople(newPeople);

      // Update database with new display_order
      try {
        const updates = newPeople.map((person, index) => ({
          id: person.id,
          display_order: index
        }));

        for (const update of updates) {
          await supabase
            .from('people')
            .update({ display_order: update.display_order })
            .eq('id', update.id);
        }
        
        console.log('✅ Updated people order in database');
      } catch (error) {
        console.error("Error updating people order:", error);
        // TODO: Consider reverting local state on error
      }
    }
  };

  /**
   * Handle drag-and-drop for events list
   * 
   * @param event - DragEndEvent from @dnd-kit
   * @param events - Current events array
   * @param setEvents - State setter for events
   */
  const handleEventsDragEnd = async (
    event: DragEndEvent,
    events: Event[],
    setEvents: (events: Event[]) => void
  ) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = events.findIndex((e) => e.id === active.id);
      const newIndex = events.findIndex((e) => e.id === over.id);

      const newEvents = arrayMove(events, oldIndex, newIndex);
      setEvents(newEvents);

      try {
        const updates = newEvents.map((event, index) => ({
          id: event.id,
          display_order: index
        }));

        for (const update of updates) {
          await supabase
            .from('events')
            .update({ display_order: update.display_order })
            .eq('id', update.id);
        }
        
        console.log('✅ Updated events order in database');
      } catch (error) {
        console.error("Error updating events order:", error);
      }
    }
  };

  /**
   * Handle drag-and-drop for follow-ups list
   * 
   * @param event - DragEndEvent from @dnd-kit
   * @param followUps - Current follow-ups array
   * @param setFollowUps - State setter for follow-ups
   */
  const handleFollowUpsDragEnd = async (
    event: DragEndEvent,
    followUps: FollowUp[],
    setFollowUps: (followUps: FollowUp[]) => void
  ) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = followUps.findIndex((f) => f.id === active.id);
      const newIndex = followUps.findIndex((f) => f.id === over.id);

      const newFollowUps = arrayMove(followUps, oldIndex, newIndex);
      setFollowUps(newFollowUps);

      try {
        const updates = newFollowUps.map((followUp, index) => ({
          id: followUp.id,
          display_order: index
        }));

        for (const update of updates) {
          await supabase
            .from('follow_ups')
            .update({ display_order: update.display_order })
            .eq('id', update.id);
        }
        
        console.log('✅ Updated follow-ups order in database');
      } catch (error) {
        console.error("Error updating follow-ups order:", error);
      }
    }
  };

  return {
    handlePeopleDragEnd,
    handleEventsDragEnd,
    handleFollowUpsDragEnd,
  };
}
