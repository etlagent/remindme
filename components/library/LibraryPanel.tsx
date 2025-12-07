/**
 * LIBRARY PANEL COMPONENT
 * 
 * Main library panel that displays people, events, and follow-ups in tabs.
 * This is the right-side panel of the split-screen layout.
 * 
 * USED BY:
 * - app/page.tsx (right side of split view)
 * 
 * DEPENDENCIES:
 * - components/ui/tabs (shadcn Tabs component)
 * - components/library/PeopleList
 * - components/library/EventsList
 * - components/library/FollowUpsList
 * 
 * PROPS:
 * - people: Array of Person objects
 * - events: Array of Event objects
 * - followUps: Array of FollowUp objects
 * - onPeopleDragEnd: Callback for reordering people
 * - onEventsDragEnd: Callback for reordering events
 * - onFollowUpsDragEnd: Callback for reordering follow-ups
 * - onLoadPerson: Callback when person is clicked
 * 
 * FEATURES:
 * - Three tabs: Contacts, Events, To-Do
 * - Shows count in each tab
 * - Responsive design
 * - Drag-and-drop in each tab
 * 
 * TAB STRUCTURE:
 * - Contacts: All saved people with their info
 * - Events: Conferences, meetups, gatherings
 * - To-Do: Follow-up action items
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Calendar, CheckSquare } from "lucide-react";
import { PeopleList } from "./PeopleList";
import { EventsList } from "./EventsList";
import { FollowUpsList } from "./FollowUpsList";
import type { Person, Event, FollowUp, DragEndEvent } from "@/lib/types";

interface LibraryPanelProps {
  people: Person[];
  events: Event[];
  followUps: FollowUp[];
  onPeopleDragEnd: (event: DragEndEvent) => void;
  onEventsDragEnd: (event: DragEndEvent) => void;
  onFollowUpsDragEnd: (event: DragEndEvent) => void;
  onLoadPerson: (personId: string) => void;
}

export function LibraryPanel({
  people,
  events,
  followUps,
  onPeopleDragEnd,
  onEventsDragEnd,
  onFollowUpsDragEnd,
  onLoadPerson,
}: LibraryPanelProps) {
  return (
    <div className="h-full">
      {/* Library Header */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Library</h2>
        <p className="text-sm text-gray-600">
          Your saved contacts, events, and action items
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="contacts" className="h-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          {/* Contacts Tab */}
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Contacts</span>
            {people.length > 0 && (
              <span className="ml-1 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                {people.length}
              </span>
            )}
          </TabsTrigger>

          {/* Events Tab */}
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Events</span>
            {events.length > 0 && (
              <span className="ml-1 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                {events.length}
              </span>
            )}
          </TabsTrigger>

          {/* To-Do Tab */}
          <TabsTrigger value="todos" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            <span>To-Do</span>
            {followUps.length > 0 && (
              <span className="ml-1 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                {followUps.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Contacts Tab Content */}
        <TabsContent value="contacts" className="overflow-y-auto max-h-[calc(100vh-250px)]">
          <PeopleList
            people={people}
            onDragEnd={onPeopleDragEnd}
            onLoadPerson={onLoadPerson}
          />
        </TabsContent>

        {/* Events Tab Content */}
        <TabsContent value="events" className="overflow-y-auto max-h-[calc(100vh-250px)]">
          <EventsList
            events={events}
            onDragEnd={onEventsDragEnd}
          />
        </TabsContent>

        {/* To-Do Tab Content */}
        <TabsContent value="todos" className="overflow-y-auto max-h-[calc(100vh-250px)]">
          <FollowUpsList
            followUps={followUps}
            onDragEnd={onFollowUpsDragEnd}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
