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
  created_at: string;
  updated_at?: string;
  display_order: number | null;
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
