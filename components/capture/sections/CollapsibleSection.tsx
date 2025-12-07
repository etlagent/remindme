/**
 * COLLAPSIBLE SECTION WRAPPER
 * 
 * Reusable component for expandable/collapsible sections.
 * Handles expand/collapse state and provides consistent UI.
 * Supports drag-and-drop reordering.
 */

import React from "react";

interface CollapsibleSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: React.ReactNode;
  dragHandleProps?: any;
  isDragging?: boolean;
}

export function CollapsibleSection({
  title,
  isExpanded,
  onToggle,
  children,
  badge,
  dragHandleProps,
  isDragging,
}: CollapsibleSectionProps) {
  return (
    <div 
      className={`pb-4 border-b border-gray-200 transition-opacity ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      {...(dragHandleProps || {})}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between font-semibold text-gray-700 mb-2 hover:text-gray-900"
      >
        <div className="flex items-center gap-2">
          <span>{title}</span>
          {badge}
        </div>
        <span>{isExpanded ? "▼" : "▶"}</span>
      </button>
      {isExpanded && <div className="mt-2">{children}</div>}
    </div>
  );
}
