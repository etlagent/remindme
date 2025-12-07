/**
 * USE AI ORGANIZATION HOOK
 * 
 * Manages AI-powered organization of notes using OpenAI.
 * Sends raw notes to API and receives structured data.
 * 
 * USED BY:
 * - app/page.tsx (main page)
 * 
 * DEPENDENCIES:
 * - /api/organize (OpenAI API route)
 * - lib/types (AIOrganizedData type)
 * 
 * PROVIDES:
 * - isProcessing: Boolean indicating if AI is processing
 * - aiPreview: Structured data returned from AI
 * - organizeWithAI: Function to send notes to AI
 * - clearPreview: Clear the AI preview
 * - setAiPreview: Manually set preview data
 * 
 * API ENDPOINT:
 * - POST /api/organize
 * - Uses OpenAI GPT-4o-mini
 * - Extracts: people, keywords, companies, industries, follow-ups, summary
 * 
 * DATA FLOW:
 * 1. User types notes and clicks "Organize with AI"
 * 2. organizeWithAI() sends data to /api/organize
 * 3. OpenAI extracts structured information
 * 4. aiPreview is updated with structured data
 * 5. Preview section renders editable preview
 */

import { useState } from "react";
import type { AIOrganizedData } from "@/lib/types";

export function useAIOrganization() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiPreview, setAiPreview] = useState<AIOrganizedData | null>(null);

  /**
   * Send notes to AI for organization
   * 
   * @param captureText - Raw text notes from user
   * @param contextType - Type of interaction (event, business, etc.)
   * @param persistentEvent - Event name if applicable
   * @param sectionName - Session/section name if applicable
   * @param panelParticipants - Panel participants if applicable
   * @param linkedInUrls - LinkedIn profile URLs
   * @param companyLinkedInUrls - Company LinkedIn URLs
   * @param parsedProfileData - Parsed LinkedIn profile data (single)
   * @param parsedProfilesArray - Parsed LinkedIn profiles (multiple)
   * @returns Structured data or null if failed
   */
  const organizeWithAI = async (
    captureText: string,
    contextType: string,
    persistentEvent: string,
    sectionName: string,
    panelParticipants: string,
    linkedInUrls: string,
    companyLinkedInUrls: string,
    parsedProfileData: any,
    parsedProfilesArray: any[]
  ): Promise<AIOrganizedData | null> => {
    if (!captureText.trim() && !parsedProfileData && parsedProfilesArray.length === 0) {
      alert("Please add some notes or parse LinkedIn profile(s)!");
      return null;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/organize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: captureText,
          contextType: contextType,
          persistentEvent: persistentEvent || null,
          sectionName: sectionName || null,
          panelParticipants: panelParticipants || null,
          linkedInUrls: linkedInUrls || null,
          companyLinkedInUrls: companyLinkedInUrls || null,
          parsedProfileData: parsedProfileData,
          parsedProfilesArray: parsedProfilesArray.length > 0 ? parsedProfilesArray : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to organize notes");
      }

      const data = await response.json();
      setAiPreview(data);
      return data;
    } catch (error) {
      console.error("Error organizing notes:", error);
      alert("Failed to organize notes. Please try again.");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Clear the AI preview
   */
  const clearPreview = () => {
    setAiPreview(null);
  };

  return {
    isProcessing,
    aiPreview,
    organizeWithAI,
    clearPreview,
    setAiPreview,
  };
}
