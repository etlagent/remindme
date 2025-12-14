import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * SORTABLE SECTION BUTTON
 * Draggable button for business sections
 */
interface SortableSectionButtonProps {
  id: string;
  label: string;
  hasExpand: boolean;
  isExpanded: boolean;
  onClick: () => void;
}

export default function SortableSectionButton({ id, label, hasExpand, isExpanded, onClick }: SortableSectionButtonProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors cursor-move border-b border-gray-100 last:border-b-0 first:rounded-t-lg last:rounded-b-lg"
      >
        <span className="text-base text-gray-900">{label}</span>
        <span className={`text-gray-400 transition-transform ${
          hasExpand && isExpanded ? 'rotate-90' : ''
        }`}>
          ▶
        </span>
      </button>
    </div>
  );
}
