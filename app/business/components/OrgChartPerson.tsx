import React from 'react';

/**
 * ORG CHART PERSON COMPONENT
 * Displays a person in the org hierarchy with their details
 */
interface OrgChartPersonProps {
  id: string;
  name: string;
  title: string;
  level: number;
  responsibilities?: string;
  challenges?: string;
  needs?: string;
  notes?: string;
  onAddAbove?: () => void;
  onAddBelow?: () => void;
  onAddSide?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
  onDragStart?: (id: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (id: string) => void;
  isDragging?: boolean;
}

export default function OrgChartPerson({
  id,
  name,
  title,
  level,
  responsibilities,
  challenges,
  needs,
  notes,
  onAddAbove,
  onAddBelow,
  onAddSide,
  onEdit,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging
}: OrgChartPersonProps) {
  const indentClass = level === 0 ? '' : level === 1 ? 'ml-8' : 'ml-16';
  
  return (
    <div className={`${indentClass} relative`}>
      <div 
        className={`border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg cursor-move ${
          isDragging ? 'opacity-50' : ''
        }`}
        draggable={true}
        onDragStart={() => onDragStart?.(id)}
        onDragOver={(e) => onDragOver?.(e)}
        onDrop={() => onDrop?.(id)}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{name}</h4>
            <p className="text-sm text-gray-600">{title}</p>
          </div>
          {onRemove && (
            <button 
              onClick={onRemove}
              className="text-gray-400 hover:text-red-600 text-sm"
              title="Remove from org chart"
            >
              ✕
            </button>
          )}
        </div>

        {responsibilities && (
        <div className="mt-2 text-sm">
          <span className="font-medium text-gray-700">Manages:</span>
          <p className="text-gray-600 mt-0.5">• {responsibilities}</p>
        </div>
      )}
      
      {challenges && (
        <div className="mt-2 text-sm">
          <span className="font-medium text-gray-700">Challenge:</span>
          <p className="text-gray-600 mt-0.5">• {challenges}</p>
        </div>
      )}
      
      {needs && (
        <div className="mt-2 text-sm">
          <span className="font-medium text-gray-700">Needs:</span>
          <p className="text-gray-600 mt-0.5">• {needs}</p>
        </div>
      )}
      
        {notes && (
          <div className="mt-2 text-sm">
            <span className="font-medium text-blue-700">Strategy:</span>
            <p className="text-blue-600 mt-0.5">→ {notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
