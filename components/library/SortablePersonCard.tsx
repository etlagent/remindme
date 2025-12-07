/**
 * SORTABLE PERSON CARD COMPONENT
 * 
 * Displays a draggable card for a person in the library.
 * Supports drag-and-drop reordering using @dnd-kit.
 * 
 * USED BY:
 * - components/library/PeopleList.tsx
 * 
 * DEPENDENCIES:
 * - @dnd-kit/sortable (drag-and-drop functionality)
 * - @dnd-kit/utilities (CSS transform utilities)
 * - components/ui/card (shadcn Card component)
 * - components/ui/badge (shadcn Badge component)
 * 
 * PROPS:
 * - person: Person object from database
 * - onLoad: Callback when card is clicked (loads person into form)
 * 
 * FEATURES:
 * - Drag-and-drop to reorder
 * - Click to load person details into capture form
 * - Displays: name, company, role, inspiration level, interests
 * - Shows creation date
 * 
 * EXTRACTED FROM:
 * - app/page.tsx (lines 98-160)
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Person } from "@/lib/types";

interface SortablePersonCardProps {
  person: Person;
  onLoad: (id: string) => void;
}

export function SortablePersonCard({ person, onLoad }: SortablePersonCardProps) {
  // Setup drag-and-drop functionality
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: person.id });

  // Apply drag transform styles
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card 
        className="bg-white border-gray-200 p-4 hover:bg-gray-50 transition-all cursor-move"
        onClick={(e) => {
          // Only load on click if not currently dragging
          if (!isDragging) {
            onLoad(person.id);
          }
        }}
      >
        {/* Header: Name and Inspiration Badge */}
        <div className="flex justify-between items-start mb-2">
          <div>
            {/* Person Name */}
            <h3 className="font-semibold text-gray-800">{person.name}</h3>
            
            {/* Company and Role */}
            <p className="text-sm text-gray-600">
              {person.role && person.company 
                ? `${person.role} at ${person.company}` 
                : person.role || person.company || 'No details'}
            </p>
          </div>
          
          {/* Inspiration Level Badge */}
          {person.inspiration_level && (
            <Badge
              className={
                person.inspiration_level === "high"
                  ? "bg-green-100 text-green-700 border-green-200"
                  : person.inspiration_level === "medium"
                  ? "bg-amber-100 text-amber-700 border-amber-200"
                  : "bg-gray-100 text-gray-700 border-gray-200"
              }
            >
              {person.inspiration_level === "high" ? "⭐ Inspiring" : "Worth nurturing"}
            </Badge>
          )}
        </div>
        
        {/* Interests (show first 3) */}
        {person.interests && person.interests.length > 0 && (
          <div className="flex gap-2 mb-2">
            {person.interests.slice(0, 3).map((interest: string, idx: number) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="text-xs border-gray-300 text-gray-600"
              >
                {interest}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Creation Date */}
        <p className="text-xs text-gray-500">
          Added: {new Date(person.created_at).toLocaleDateString()}
        </p>
      </Card>
    </div>
  );
}
