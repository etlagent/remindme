/**
 * USE EVENTS DATA HOOK
 * 
 * Manages fetching and state for events from the database.
 * 
 * USED BY:
 * - app/page.tsx (main page)
 * 
 * DEPENDENCIES:
 * - lib/supabase (Supabase client)
 * - lib/types (Event type)
 * 
 * PROVIDES:
 * - events: Array of all events
 * - setEvents: Update events state (for DnD reordering)
 * - fetchEvents: Reload events from database
 * 
 * DATABASE QUERIES:
 * - Fetches from: events table
 * - Orders by: display_order (ASC) then created_at (DESC)
 * 
 * DATA FLOW:
 * 1. Component calls fetchEvents() on mount
 * 2. Hook queries Supabase
 * 3. Updates events state
 * 4. Component renders events in library
 */

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Event } from '@/lib/types';

export function useEventsData() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Fetch all events from database
   * Orders by display_order (for custom sorting) then created_at
   */
  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
        return;
      }
      
      console.log("📅 Loaded events:", data?.length);
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    events,
    setEvents,
    fetchEvents,
    isLoading,
  };
}
