/**
 * VOICE RECORDER BUTTON COMPONENT
 * 
 * Button for voice recording with visual feedback.
 * Shows recording state with animation.
 * 
 * EXTRACTED FROM: app/page.tsx lines ~1513-1531
 * ALL STATE remains in page.tsx - this is ONLY the visual component
 */

import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceRecorderButtonProps {
  isRecording: boolean;
  onToggle: () => void;
}

export function VoiceRecorderButton({ isRecording, onToggle }: VoiceRecorderButtonProps) {
  return (
    <div className="mb-3">
      <Button
        onClick={onToggle}
        className={`w-full h-16 text-base font-medium transition-all ${
          isRecording
            ? "bg-red-100 hover:bg-red-200 text-red-700 animate-pulse"
            : "bg-blue-50 hover:bg-blue-100 text-blue-700"
        }`}
      >
        <Mic className={`mr-2 h-5 w-5 ${isRecording ? "animate-pulse" : ""}`} />
        {isRecording ? "Recording..." : "Tap to Record"}
      </Button>
      {isRecording && (
        <p className="text-center text-xs text-gray-600 mt-1">
          Speak naturally...
        </p>
      )}
    </div>
  );
}
