/**
 * USE PEOPLE DATA HOOK
 * 
 * Manages fetching and state for people (contacts) from the database.
 * 
 * USED BY:
 * - app/page.tsx (main page)
 * 
 * DEPENDENCIES:
 * - lib/supabase (Supabase client)
 * - lib/types (Person type)
 * 
 * PROVIDES:
 * - people: Array of all people
 * - setPeople: Update people state (for DnD reordering)
 * - fetchPeople: Reload people from database
 * - loadPersonIntoForm: Load a specific person's data
 * 
 * DATABASE QUERIES:
 * - Fetches from: people table
 * - Orders by: display_order (ASC) then created_at (DESC)
 * - Joins with: memories (via memory_people), follow_ups
 * 
 * DATA FLOW:
 * 1. Component calls fetchPeople() on mount
 * 2. Hook queries Supabase
 * 3. Updates people state
 * 4. Component renders people in library
 */

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Person, AIOrganizedData } from '@/lib/types';

export function usePeopleData() {
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Fetch all people from database
   * Orders by display_order (for custom sorting) then created_at
   */
  const fetchPeople = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log("📚 Loaded people:", data?.length);
      setPeople(data || []);
    } catch (error) {
      console.error("Error fetching people:", error);
      setPeople([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load a person's data into the capture form
   * Fetches person details, memories, and follow-ups
   * 
   * USED BY: Library person card onClick
   * 
   * @param personId - ID of person to load
   * @returns AIOrganizedData structure for preview section
   */
  const loadPersonIntoForm = async (personId: string): Promise<{
    person: Person | null;
    previewData: AIOrganizedData | null;
  }> => {
    try {
      // Fetch person
      const { data: person, error: personError } = await supabase
        .from('people')
        .select('*')
        .eq('id', personId)
        .single();

      if (personError) throw personError;

      // Fetch memories linked to this person
      const { data: memories, error: memoriesError } = await supabase
        .from('memory_people')
        .select('memory_id, memories(*)')
        .eq('person_id', personId);

      // Fetch follow-ups for this person
      const { data: followUps, error: followUpsError } = await supabase
        .from('follow_ups')
        .select('*')
        .eq('person_id', personId);

      // Build preview data structure
      const previewData: AIOrganizedData = {
        people: [person],
        additional_notes: memories?.map((m: any) => {
          const memory = m.memories;
          return {
            text: memory?.raw_text || '',
            date: memory?.created_at 
              ? new Date(memory.created_at).toLocaleDateString('en-US', { 
                  month: 'numeric', 
                  day: 'numeric', 
                  year: '2-digit' 
                }) 
              : ''
          };
        }).filter((note: any) => note.text) || [],
        follow_ups: followUps?.map((f: any) => ({
          description: f.description || '',
          priority: f.priority || 'medium',
          status: f.status || 'pending'
        })).filter((fu: any) => fu.description) || []
      };

      console.log('✅ Loaded person into form:', person.name);
      return { person, previewData };
    } catch (error) {
      console.error('Error loading person:', error);
      return { person: null, previewData: null };
    }
  };

  return {
    people,
    setPeople,
    fetchPeople,
    loadPersonIntoForm,
    isLoading,
  };
}
