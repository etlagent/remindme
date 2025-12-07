/**
 * SORTABLE FOLLOW-UP CARD COMPONENT
 * 
 * Displays a draggable card for a follow-up action item in the library.
 * Supports drag-and-drop reordering using @dnd-kit.
 * 
 * USED BY:
 * - components/library/FollowUpsList.tsx
 * 
 * DEPENDENCIES:
 * - @dnd-kit/sortable (drag-and-drop functionality)
 * - @dnd-kit/utilities (CSS transform utilities)
 * - components/ui/card (shadcn Card component)
 * - components/ui/badge (shadcn Badge component)
 * 
 * PROPS:
 * - followUp: FollowUp object from database
 * 
 * FEATURES:
 * - Drag-and-drop to reorder
 * - Displays: description, priority badge, status
 * - Color-coded priority (high=red, medium=amber, low=gray)
 * 
 * EXTRACTED FROM:
 * - app/page.tsx (lines 54-95)
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FollowUp } from "@/lib/types";

interface SortableFollowUpCardProps {
  followUp: FollowUp;
}

export function SortableFollowUpCard({ followUp }: SortableFollowUpCardProps) {
  // Setup drag-and-drop functionality
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: followUp.id });

  // Apply drag transform styles
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="bg-white border-gray-200 p-4 hover:bg-gray-50 transition-all cursor-move">
        {/* Follow-up Header */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            {/* Follow-up Description */}
            <p className="text-sm text-gray-800">{followUp.description}</p>
          </div>
          
          {/* Priority Badge */}
          <Badge
            className={
              followUp.priority === "high"
                ? "bg-red-100 text-red-700 border-red-200"
                : followUp.priority === "medium"
                ? "bg-amber-100 text-amber-700 border-amber-200"
                : "bg-gray-100 text-gray-700 border-gray-200"
            }
          >
            {followUp.priority || 'medium'}
          </Badge>
        </div>
        
        {/* Follow-up Status */}
        <p className="text-xs text-gray-500">
          Status: {followUp.status || 'pending'}
        </p>
      </Card>
    </div>
  );
}
