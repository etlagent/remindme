/**
 * USE FOLLOW-UPS DATA HOOK
 * 
 * Manages fetching and state for follow-up action items from the database.
 * 
 * USED BY:
 * - app/page.tsx (main page)
 * 
 * DEPENDENCIES:
 * - lib/supabase (Supabase client)
 * - lib/types (FollowUp type)
 * 
 * PROVIDES:
 * - followUps: Array of all follow-ups
 * - setFollowUps: Update follow-ups state (for DnD reordering)
 * - fetchFollowUps: Reload follow-ups from database
 * 
 * DATABASE QUERIES:
 * - Fetches from: follow_ups table
 * - Orders by: display_order (ASC) then created_at (DESC)
 * 
 * DATA FLOW:
 * 1. Component calls fetchFollowUps() on mount
 * 2. Hook queries Supabase
 * 3. Updates followUps state
 * 4. Component renders follow-ups in library
 */

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { FollowUp } from '@/lib/types';

export function useFollowUpsData() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Fetch all follow-ups from database
   * Orders by display_order (for custom sorting) then created_at
   */
  const fetchFollowUps = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .select('*')
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching follow-ups:", error);
        setFollowUps([]);
        return;
      }
      
      console.log("✅ Loaded follow-ups:", data?.length);
      setFollowUps(data || []);
    } catch (error) {
      console.error("Error fetching follow-ups:", error);
      setFollowUps([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    followUps,
    setFollowUps,
    fetchFollowUps,
    isLoading,
  };
}
