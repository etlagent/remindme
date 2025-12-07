/**
 * CONSTANTS FOR REMINDME APP
 * 
 * This file contains all constant values used throughout the application.
 * Centralizing constants here makes them easy to update and maintain.
 * 
 * USED BY:
 * - ContextSelector component
 * - Library panel tabs
 * - Form components
 * 
 * DEPENDENCIES:
 * - lucide-react (for icons)
 */

import { Calendar, CheckSquare, Users } from "lucide-react";
import type { ContextType, Section } from "./types";

// ============================================================================
// CONTEXT TYPES
// Used by capture form to categorize the type of interaction
// ============================================================================

/**
 * CONTEXT_TYPES - Available context types for memories
 * 
 * USED BY:
 * - components/capture/ContextSelector.tsx
 * - app/page.tsx (default context type)
 * 
 * MAPS TO:
 * - API: /api/organize (contextType parameter)
 * - Database: memories.sections array
 */
export const CONTEXT_TYPES = [
  { 
    value: "event" as ContextType, 
    label: "Event/Conference", 
    icon: Calendar,
    description: "Tech conferences, meetups, networking events"
  },
  { 
    value: "business" as ContextType, 
    label: "Business Meeting", 
    icon: CheckSquare,
    description: "Client meetings, sales calls, partnerships"
  },
  { 
    value: "colleague" as ContextType, 
    label: "Colleague", 
    icon: Users,
    description: "Coworkers, team members, work contacts"
  },
  { 
    value: "friends" as ContextType, 
    label: "Friends", 
    icon: Users,
    description: "Personal friends, social connections"
  },
  { 
    value: "family" as ContextType, 
    label: "Family", 
    icon: Users,
    description: "Family members, relatives"
  },
] as const;

// ============================================================================
// LIBRARY SECTIONS
// Used by library panel tabs to filter and categorize content
// ============================================================================

/**
 * SECTIONS - Available sections for organizing memories
 * 
 * USED BY:
 * - components/library/LibraryPanel.tsx
 * - Database: memories.sections array
 * 
 * PURPOSE:
 * - Filter and organize saved memories by category
 * - Enable multi-category tagging (one memory can be in multiple sections)
 */
export const SECTIONS = [
  { value: "all" as Section, label: "All", description: "View all memories" },
  { value: "personal" as Section, label: "Personal", description: "Personal relationships" },
  { value: "business" as Section, label: "Business", description: "Business contacts" },
  { value: "projects" as Section, label: "Projects", description: "Project collaborators" },
  { value: "relationships" as Section, label: "Relationships", description: "Relationship building" },
  { value: "todos" as Section, label: "ToDos", description: "Action items" },
  { value: "events" as Section, label: "Events", description: "Events and conferences" },
  { value: "trips" as Section, label: "Trips", description: "Travel and trips" },
] as const;

// ============================================================================
// PRIORITY LEVELS
// Used by follow-ups to indicate urgency
// ============================================================================

/**
 * PRIORITY_LEVELS - Follow-up priority options
 * 
 * USED BY:
 * - components/preview/FollowUpsSection.tsx
 * - Database: follow_ups.priority
 */
export const PRIORITY_LEVELS = [
  { value: "low", label: "Low", color: "gray" },
  { value: "medium", label: "Medium", color: "amber" },
  { value: "high", label: "High", color: "red" },
] as const;

// ============================================================================
// INSPIRATION LEVELS
// Used to rate how inspiring/valuable a connection is
// ============================================================================

/**
 * INSPIRATION_LEVELS - Person inspiration ratings
 * 
 * USED BY:
 * - Database: people.inspiration_level
 * - Library cards to display person value
 */
export const INSPIRATION_LEVELS = [
  { value: "low", label: "Low", emoji: "😐" },
  { value: "medium", label: "Medium", emoji: "🙂" },
  { value: "high", label: "High", emoji: "⭐" },
] as const;

// ============================================================================
// RELATIONSHIP POTENTIAL
// Used to rate potential for future relationship/collaboration
// ============================================================================

/**
 * RELATIONSHIP_POTENTIAL - Future relationship value
 * 
 * USED BY:
 * - Database: people.relationship_potential
 * - AI organization to assess connection value
 */
export const RELATIONSHIP_POTENTIAL = [
  { value: "no", label: "No", description: "Not a good fit" },
  { value: "maybe", label: "Maybe", description: "Worth nurturing" },
  { value: "yes", label: "Yes", description: "High potential" },
] as const;

// ============================================================================
// UI CONSTANTS
// ============================================================================

/**
 * Date format for display
 * USED BY: All date formatting throughout the app
 */
export const DATE_FORMAT = {
  SHORT: { month: 'numeric', day: 'numeric', year: '2-digit' } as const,
  LONG: { month: 'short', day: 'numeric', year: 'numeric' } as const,
};

/**
 * Drag-and-drop activation constraints
 * USED BY: All sortable lists (people, events, follow-ups)
 * 
 * PREVENTS: Accidental drags on mobile/touch devices
 * REQUIRES: 250ms press + 5px tolerance before drag starts
 */
export const DRAG_ACTIVATION_CONSTRAINT = {
  delay: 250,
  tolerance: 5,
};

/**
 * Default empty states
 * USED BY: Components when no data exists
 */
export const EMPTY_STATES = {
  NO_PEOPLE: "No contacts yet. Add your first connection!",
  NO_EVENTS: "No events yet. Track conferences and meetups!",
  NO_FOLLOW_UPS: "No follow-ups yet. Add action items!",
  NO_MEMORIES: "No memories yet. Start capturing conversations!",
  NO_NOTES: "No notes yet. Add your thoughts!",
} as const;
