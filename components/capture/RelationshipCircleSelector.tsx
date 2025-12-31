/**
 * RELATIONSHIP CIRCLE SELECTOR COMPONENT
 * 
 * Allows users to categorize the closeness/type of relationship.
 * Options represent different tiers of social connection.
 */

import { Users, Briefcase, Heart, UserCheck, Coffee, Eye } from "lucide-react";

interface RelationshipCircleSelectorProps {
  value: string | null;
  onChange: (value: string) => void;
}

const CIRCLE_OPTIONS = [
  {
    value: 'inner_circle',
    label: 'Inner Circle',
    description: 'Close friends/family',
    icon: Heart,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 hover:bg-pink-100',
    selectedBg: 'bg-pink-100 border-pink-500'
  },
  {
    value: 'professional',
    label: 'Professional',
    description: 'Business contacts, networking',
    icon: Briefcase,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    selectedBg: 'bg-blue-100 border-blue-500'
  },
  {
    value: 'genuine_interest',
    label: 'Genuine Interest',
    description: 'Intrigued by them, want to follow',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100',
    selectedBg: 'bg-purple-100 border-purple-500'
  },
  {
    value: 'acquaintance',
    label: 'Acquaintance',
    description: 'Part of my world, want to remember',
    icon: UserCheck,
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100',
    selectedBg: 'bg-green-100 border-green-500'
  },
  {
    value: 'brief_encounter',
    label: 'Brief Encounter',
    description: 'One-off meeting, good to know',
    icon: Coffee,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 hover:bg-amber-100',
    selectedBg: 'bg-amber-100 border-amber-500'
  },
  {
    value: 'not_met',
    label: 'Not Met Yet',
    description: 'Researching, not connected yet',
    icon: Eye,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 hover:bg-gray-100',
    selectedBg: 'bg-gray-100 border-gray-500'
  }
];

export function RelationshipCircleSelector({ value, onChange }: RelationshipCircleSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Relationship Circle</label>
      <div className="grid grid-cols-2 gap-2">
        {CIRCLE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;
          
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`
                p-3 rounded-lg border-2 transition-all text-left
                ${isSelected 
                  ? `${option.selectedBg} border-current` 
                  : `${option.bgColor} border-transparent`
                }
              `}
            >
              <div className="flex items-start gap-2">
                <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${option.color}`} />
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${option.color}`}>
                    {option.label}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    {option.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
