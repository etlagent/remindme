/**
 * USE MEMORY SAVE HOOK
 * 
 * Manages saving memories to the database via API.
 * Handles authentication and error states.
 * 
 * USED BY:
 * - app/page.tsx (main page)
 * 
 * DEPENDENCIES:
 * - /api/save-memory (Save API route)
 * - lib/supabase (authentication token)
 * 
 * PROVIDES:
 * - isSaving: Boolean indicating if save is in progress
 * - saveMemory: Function to save memory to database
 * 
 * API ENDPOINT:
 * - POST /api/save-memory
 * - Requires: Authentication token in header
 * - Saves: people, memories, follow-ups, events, embeddings
 * 
 * DATA FLOW:
 * 1. User clicks "Add Memory" button
 * 2. saveMemory() gets auth token from Supabase
 * 3. Sends data to /api/save-memory with token
 * 4. API creates database records
 * 5. Returns success/failure
 * 6. Parent component refreshes library data
 */

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export function useMemorySave() {
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Save memory to database
   * 
   * @param rawText - Original raw notes from user
   * @param structuredData - AI-organized data structure
   * @returns True if successful, false if failed
   */
  const saveMemory = async (rawText: string, structuredData: any): Promise<boolean> => {
    setIsSaving(true);

    try {
      // Get auth token for RLS
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (!session) {
        alert("Please sign in to save contacts. You may need to refresh the page after signing in.");
        setIsSaving(false);
        return false;
      }

      // Send save request with auth token
      const response = await fetch("/api/save-memory", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          rawText,
          structuredData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Save failed:", errorData);
        throw new Error(errorData.error || "Failed to save memory");
      }

      console.log(" Memory saved successfully");
      return true;
    } catch (error) {
      console.error("Error saving memory:", error);
      alert("Failed to save memory. Please try again.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    saveMemory,
  };
}
