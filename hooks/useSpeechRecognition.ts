/**
 * USE SPEECH RECOGNITION HOOK
 * 
 * Manages Web Speech API for voice-to-text recording.
 * Provides voice recording functionality for capturing notes.
 * 
 * USED BY:
 * - app/page.tsx (main page)
 * - components/capture/VoiceRecorder.tsx
 * 
 * DEPENDENCIES:
 * - Browser Web Speech API (window.SpeechRecognition)
 * 
 * PROVIDES:
 * - isRecording: Boolean indicating if currently recording
 * - isListening: Boolean indicating if speech recognition is active
 * - transcript: Latest transcribed text
 * - startListening: Start voice recording
 * - stopListening: Stop voice recording
 * - toggleListening: Toggle recording on/off
 * - clearTranscript: Clear the transcript
 * 
 * BROWSER SUPPORT:
 * - Chrome, Safari, Edge (supported)
 * - Firefox (not supported)
 * 
 * HOW IT WORKS:
 * 1. User clicks mic button
 * 2. toggleListening() starts Web Speech API
 * 3. Speech is converted to text continuously
 * 4. transcript updates with each spoken phrase
 * 5. Parent component appends transcript to notes
 */

import { useState, useEffect, useRef } from "react";

// Extend Window interface for browser speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function useSpeechRecognition() {
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep listening
    recognition.interimResults = false; // Only final results
    recognition.lang = "en-US";

    // Handle speech results
    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1][0].transcript;
      setTranscript(result);
    };

    // Handle errors
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "aborted" && event.error !== "no-speech") {
        alert(`Speech recognition error: ${event.error}`);
      }
      setIsListening(false);
      setIsRecording(false);
    };

    // Handle end of recognition
    recognition.onend = () => {
      setIsListening(false);
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  /**
   * Start voice recording
   */
  const startListening = () => {
    if (!recognitionRef.current) {
      alert(
        "Speech recognition is not supported in this browser. Please use Chrome, Safari, or Edge."
      );
      return;
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting speech recognition:", error);
    }
  };

  /**
   * Stop voice recording
   */
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setIsRecording(false);
    }
  };

  /**
   * Toggle voice recording on/off
   */
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  /**
   * Clear the current transcript
   */
  const clearTranscript = () => {
    setTranscript("");
  };

  return {
    isRecording,
    isListening,
    transcript,
    startListening,
    stopListening,
    toggleListening,
    clearTranscript,
  };
}
