/**
 * CONTEXT SELECTOR COMPONENT
 * 
 * Allows user to select the type of interaction/context for their notes.
 * Displays as clickable buttons with icons.
 * 
 * USED BY:
 * - app/page.tsx (capture section)
 * 
 * DEPENDENCIES:
 * - lib/constants (CONTEXT_TYPES)
 * - lib/types (ContextType)
 * 
 * PROPS:
 * - value: Currently selected context type
 * - onChange: Callback when context type changes
 * 
 * FEATURES:
 * - Icon + label buttons
 * - Active state highlighting
 * - Tooltips with descriptions
 * 
 * CONTEXT TYPES:
 * - Event/Conference: Tech conferences, meetups
 * - Business Meeting: Client meetings, sales calls
 * - Colleague: Coworkers, team members
 * - Friends: Personal friends
 * - Family: Family members
 * 
 * PURPOSE:
 * - Helps AI organize notes appropriately
 * - Tags memories with correct sections
 * - Provides context for relationship building
 */

import { CONTEXT_TYPES } from "@/lib/constants";
import type { ContextType } from "@/lib/types";

interface ContextSelectorProps {
  value: ContextType;
  onChange: (value: ContextType) => void;
}

export function ContextSelector({ value, onChange }: ContextSelectorProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Context Type
      </label>
      
      <div className="flex flex-wrap gap-2">
        {CONTEXT_TYPES.map((context) => {
          const Icon = context.icon;
          const isSelected = value === context.value;
          
          return (
            <button
              key={context.value}
              onClick={() => onChange(context.value)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' 
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
              title={context.description}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm">{context.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Helper Text */}
      <p className="text-xs text-gray-500 mt-2">
        Select the type of interaction to help organize your notes
      </p>
    </div>
  );
}
