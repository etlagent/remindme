/**
 * DIRECT SAVE BUTTON COMPONENT
 * 
 * "Save to Relationship Builder" button that appears when no AI preview exists
 * but person name is filled in. Allows saving without AI organization.
 * 
 * EXTRACTED FROM: app/page.tsx lines 1925-1936
 * ALL STATE remains in page.tsx - this is ONLY the visual component
 */

import { Button } from "@/components/ui/button";

interface DirectSaveButtonProps {
  aiPreview: any;
  personName: string;
  onSave: () => void;
  isProcessing: boolean;
}

export function DirectSaveButton({ aiPreview, personName, onSave, isProcessing }: DirectSaveButtonProps) {
  // Only show if no AI preview and person name is filled
  if (aiPreview || !personName.trim()) {
    return null;
  }

  return (
    <div className="flex justify-end">
      <Button 
        onClick={onSave}
        disabled={isProcessing}
        className="bg-green-600 hover:bg-green-700 text-white font-semibold"
      >
        {isProcessing ? "Saving..." : "Save to Relationship Builder"}
      </Button>
    </div>
  );
}
