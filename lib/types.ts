/**
 * TYPE DEFINITIONS FOR REMINDME APP
 * 
 * This file contains all TypeScript interfaces and types used throughout the application.
 * 
 * USED BY:
 * - All components in /components
 * - All hooks in /hooks
 * - All API routes in /app/api
 * - Main pages in /app
 * 
 * DEPENDENCIES:
 * - None (pure type definitions)
 */

// ============================================================================
// DATABASE MODELS
// These match the Supabase database schema
// ============================================================================

/**
 * Person - Represents a contact in the user's network
 * DATABASE TABLE: people
 * RELATED TABLES: people_business_profiles, memory_people, follow_ups
 */
export interface Person {
  id: string;
  user_id: string;
  name: string;
  company: string | null;
  role: string | null;
  location: string | null;
  linkedin_url: string | null;
  company_linkedin_url: string | null;
  business_needs: string | null;
  opportunities: string | null;
  technologies: string[];
  interests: string[];
  skills: string[];
  inspiration_level: 'low' | 'medium' | 'high' | null;
  relationship_potential: 'no' | 'maybe' | 'yes' | null;
  relationship_notes: string | null;
  relationship_circle: 'inner_circle' | 'professional' | 'genuine_interest' | 'acquaintance' | 'brief_encounter' | 'not_met' | null;
  interaction_details: InteractionDetail[];
  created_at: string;
  updated_at?: string;
  display_order: number | null;
}

/**
 * InteractionDetail - Single interaction log entry for a person
 * STORED AS: JSON array in people.interaction_details
 */
export interface InteractionDetail {
  date: string;
  details: string;
  location?: string;
}

/**
 * Event - Represents a conference, meeting, or gathering
 * DATABASE TABLE: events
 * RELATED TABLES: memories
 */
export interface Event {
  id: string;
  user_id: string;
  name: string;
  date: string | null;
  location: string | null;
  created_at: string;
  updated_at?: string;
  display_order: number | null;
}

/**
 * FollowUp - Represents an action item or task related to a person
 * DATABASE TABLE: follow_ups
 * RELATED TABLES: people, memories
 */
export interface FollowUp {
  id: string;
  user_id: string;
  person_id: string | null;
  memory_id: string | null;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  due_date?: string | null;
  created_at: string;
  completed_at?: string | null;
  display_order: number | null;
}

/**
 * Memory - Represents a note or conversation with context
 * DATABASE TABLE: memories
 * RELATED TABLES: memory_people, follow_ups, events
 */
export interface Memory {
  id: string;
  user_id: string;
  raw_text: string;
  source_type: 'typed' | 'voice' | 'imported';
  ai_type: 'person' | 'event' | 'todo' | 'other';
  event_id?: string | null;
  who?: string | null;
  what?: string | null;
  energy_summary?: string | null;
  summary: string | null;
  keywords: string[];
  companies: string[];
  industries: string[];
  sections: string[];
  created_at: string;
  updated_at?: string;
}

/**
 * BusinessProfile - Extended LinkedIn data for a person
 * DATABASE TABLE: people_business_profiles
 * RELATED TABLES: people
 */
export interface BusinessProfile {
  id?: string;
  person_id: string;
  user_id: string;
  linkedin_url: string | null;
  company_linkedin_url: string | null;
  follower_count: number | null;
  about: string | null;
  experience: WorkExperience[] | null;
  education: Education[] | null;
  current_company: string | null;
  role_title: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * WorkExperience - Work history item from LinkedIn
 * STORED AS: JSON array in people_business_profiles.experience
 */
export interface WorkExperience {
  company: string;
  role: string;
  dates: string;
  description?: string;
  order?: number;
}

/**
 * Education - Educational background from LinkedIn
 * STORED AS: JSON array in people_business_profiles.education
 */
export interface Education {
  school: string;
  degree?: string;
  field?: string;
  dates: string;
  order?: number;
}

/**
 * Business - Represents a business/client being pursued
 * DATABASE TABLE: businesses
 * RELATED TABLES: business_people, business_notes, meetings
 */
export interface Business {
  id: string;
  user_id: string;
  name: string;
  industry: string | null;
  stage: 'discovery' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost' | null;
  deal_value: number | null;
  website: string | null;
  linkedin_url: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * BusinessPerson - Links a person to a business with role context
 * DATABASE TABLE: business_people
 * RELATED TABLES: businesses, people
 */
export interface BusinessPerson {
  id: string;
  business_id: string;
  person_id: string;
  role: 'champion' | 'decision_maker' | 'influencer' | 'blocker' | 'end_user' | 'coach' | null;
  influence_level: 'high' | 'medium' | 'low' | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * BusinessNote - Notes and context about a business
 * DATABASE TABLE: business_notes
 * RELATED TABLES: businesses
 */
export interface BusinessNote {
  id: string;
  business_id: string;
  user_id: string;
  content: string;
  source: 'manual' | 'slack' | 'zoom' | 'email' | 'linkedin' | string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Meeting - Represents a meeting with a business
 * DATABASE TABLE: meetings
 * RELATED TABLES: businesses, meeting_attendees, meeting_agenda, meeting_questions, meeting_notes, meeting_followups
 */
export interface Meeting {
  id: string;
  business_id: string;
  user_id: string;
  title: string;
  meeting_date: string | null;
  location: string | null;
  goal: string | null;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

/**
 * MeetingAttendee - Links a person to a meeting
 * DATABASE TABLE: meeting_attendees
 * RELATED TABLES: meetings, people
 */
export interface MeetingAttendee {
  id: string;
  meeting_id: string;
  person_id: string;
  created_at: string;
}

/**
 * MeetingAgendaItem - Agenda item for a meeting
 * DATABASE TABLE: meeting_agenda
 * RELATED TABLES: meetings
 */
export interface MeetingAgendaItem {
  id: string;
  meeting_id: string;
  item_order: number;
  duration_minutes: number | null;
  description: string;
  created_at: string;
}

/**
 * MeetingQuestion - Question to ask in a meeting
 * DATABASE TABLE: meeting_questions
 * RELATED TABLES: meetings
 */
export interface MeetingQuestion {
  id: string;
  meeting_id: string;
  question: string;
  priority: 'high' | 'medium' | 'low';
  context: string | null;
  status: 'to_ask' | 'asked' | 'answered';
  answer: string | null;
  asked_date: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * MeetingNote - Notes from a meeting
 * DATABASE TABLE: meeting_notes
 * RELATED TABLES: meetings
 */
export interface MeetingNote {
  id: string;
  meeting_id: string;
  user_id: string;
  content: string;
  note_type: 'pre' | 'during' | 'post';
  source: 'manual' | 'zoom_transcript' | 'slack' | string | null;
  created_at: string;
  updated_at: string;
}

/**
 * MeetingFollowUp - Follow-up action from a meeting
 * DATABASE TABLE: meeting_followups
 * RELATED TABLES: meetings
 */
export interface MeetingFollowUp {
  id: string;
  meeting_id: string;
  user_id: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  due_date: string | null;
  status: 'pending' | 'completed' | 'cancelled';
  completed_date: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * BusinessFollowUp - Follow-up action for a business
 * DATABASE TABLE: business_followups
 * RELATED TABLES: businesses
 */
export interface BusinessFollowUp {
  id: string;
  business_id: string;
  user_id: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  due_date: string | null;
  status: 'pending' | 'completed' | 'cancelled';
  completed_date: string | null;
  created_at: string;
  updated_at: string;
  display_order: number | null;
}

/**
 * PersonBusinessNote - Notes about a person in the context of a business
 * DATABASE TABLE: person_business_notes
 * RELATED TABLES: people, businesses
 */
export interface PersonBusinessNote {
  id: string;
  person_id: string;
  business_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

/**
 * ConversationStrategy - AI-powered conversation roadmap
 * DATABASE TABLE: conversation_strategies
 * RELATED TABLES: businesses, conversation_steps
 */
export interface ConversationStrategy {
  id: string;
  business_id: string;
  user_id: string;
  title: string | null;
  situation: string | null;
  goal: string | null;
  context_sources: string[]; // ["linkedin", "conversations", "meetings", "notes", "memories"]
  attendee_ids: string[]; // Array of person IDs
  clarifying_qa: Array<{question: string; answer: string}>; // Q&A from clarifying questions
  created_at: string;
  updated_at: string;
}

/**
 * ConversationStep - Individual step in conversation roadmap
 * DATABASE TABLE: conversation_steps
 * RELATED TABLES: conversation_strategies
 */
export interface ConversationStep {
  id: string;
  strategy_id: string;
  step_order: number;
  title: string | null;
  description: string | null;
  ai_suggestion: string | null;
  user_refinement: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// UI STATE TYPES
// These represent application state, not database models
// ============================================================================

/**
 * Section - Library filter categories
 * USED BY: Library panel tabs and filtering
 */
export type Section = "all" | "personal" | "business" | "projects" | "relationships" | "todos" | "events" | "trips";

/**
 * ContextType - Type of interaction/meeting
 * USED BY: Capture form context selector
 */
export type ContextType = "event" | "business" | "colleague" | "friends" | "family";

// ============================================================================
// AI RESPONSE TYPES
// These match the structure returned by OpenAI API endpoints
// ============================================================================

/**
 * AIOrganizedData - Structure returned from /api/organize
 * USED BY: Preview components after AI organization
 * SOURCE: app/api/organize/route.ts
 */
export interface AIOrganizedData {
  people?: PersonData[];
  event?: {
    name: string;
    date?: string;
    location?: string;
  };
  summary?: string;
  keywords?: string[];
  companies?: string[];
  industries?: string[];
  follow_ups?: FollowUpData[];
  sections?: string[];
  additional_notes?: AdditionalNote[];
}

/**
 * PersonData - Person data from AI extraction (before saving to DB)
 * USED BY: AI organization and preview editing
 */
export interface PersonData {
  name: string;
  company?: string | null;
  role?: string | null;
  location?: string | null;
  linkedin_url?: string | null;
  company_linkedin_url?: string | null;
  follower_count?: number | null;
  about?: string | null;
  experience?: WorkExperience[];
  education?: Education[];
  business_needs?: string | null;
  technologies?: string[];
  interests?: string[];
  skills?: string[];
  inspiration_level?: 'low' | 'medium' | 'high';
  relationship_potential?: 'no' | 'maybe' | 'yes';
}

/**
 * FollowUpData - Follow-up data from AI extraction (before saving to DB)
 * USED BY: Preview follow-ups section
 */
export interface FollowUpData {
  description: string;
  priority: 'low' | 'medium' | 'high';
  status?: 'pending' | 'completed';
}

/**
 * AdditionalNote - User-added note with timestamp
 * USED BY: Notes section in preview
 */
export interface AdditionalNote {
  date: string;
  text: string;
}

/**
 * ParsedLinkedInProfile - Data extracted from pasted LinkedIn profile
 * USED BY: LinkedIn paste input and AI organization
 * SOURCE: app/api/parse-linkedin/route.ts
 */
export interface ParsedLinkedInProfile {
  name?: string;
  company?: string;
  role?: string;
  about?: string;
  experience?: WorkExperience[];
  education?: Education[];
  skills?: string[];
  follower_count?: number;
  linkedin_url?: string;
  company_linkedin_url?: string;
}

// ============================================================================
// COMPONENT PROPS TYPES
// Common prop interfaces for components
// ============================================================================

/**
 * PersonFormData - Form data for person info input
 * USED BY: PersonInfoForm component and usePersonForm hook
 */
export interface PersonFormData {
  personName: string;
  personCompany: string;
  personRole: string;
  personLocation: string;
}

/**
 * DragEndEvent - Type for drag-and-drop events
 * RE-EXPORTED from @dnd-kit/core for convenience
 */
export type { DragEndEvent } from '@dnd-kit/core';

/**
 * WorkspaceView - Type of view to show in the right panel workspace
 * USED BY: Business page right panel
 */
export type WorkspaceView = 'business' | 'person' | 'people' | 'meeting' | 'library' | 'organization' | 'pipeline' | 'followups' | 'notes' | 'conversations';

/**
 * PeopleViewMode - Type of view within the People section
 * USED BY: People section tab switching
 */
export type PeopleViewMode = 'assigned' | 'library' | 'organization';

/**
 * BusinessWithRelations - Business with related data loaded
 * USED BY: Business detail views
 */
export interface BusinessWithRelations extends Business {
  people?: (BusinessPerson & { person?: Person })[];
  meetings?: Meeting[];
  notes?: BusinessNote[];
}

/**
 * MeetingWithRelations - Meeting with related data loaded
 * USED BY: Meeting detail views
 */
export interface MeetingWithRelations extends Meeting {
  business?: Business;
  attendees?: (MeetingAttendee & { person?: Person })[];
  agenda?: MeetingAgendaItem[];
  questions?: MeetingQuestion[];
  notes?: MeetingNote[];
  followups?: MeetingFollowUp[];
}
