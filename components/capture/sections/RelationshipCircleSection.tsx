/**
 * RELATIONSHIP CIRCLE SECTION COMPONENT
 * 
 * Collapsible section for setting relationship circle and logging interaction details.
 * Used in the main capture form.
 */

import { RelationshipCircleSelector } from "../RelationshipCircleSelector";
import { InteractionDetailsLog } from "../InteractionDetailsLog";
import { InteractionDetail } from "@/lib/types";

interface RelationshipCircleSectionProps {
  relationshipCircle: string | null;
  setRelationshipCircle: (value: string | null) => void;
  interactionDetails: InteractionDetail[];
  setInteractionDetails: (details: InteractionDetail[]) => void;
}

export function RelationshipCircleSection({
  relationshipCircle,
  setRelationshipCircle,
  interactionDetails,
  setInteractionDetails,
}: RelationshipCircleSectionProps) {
  return (
    <div className="space-y-4">
      <RelationshipCircleSelector
        value={relationshipCircle}
        onChange={setRelationshipCircle}
      />
      <InteractionDetailsLog
        details={interactionDetails}
        onChange={setInteractionDetails}
      />
    </div>
  );
}
