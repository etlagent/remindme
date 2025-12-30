'use client';

import { useState, useEffect, useRef } from 'react';

interface ContextBuilderProps {
  meetingId: string;
  onContextChange?: (meetingType: string, contextFields: ContextField[]) => void;
}

interface ContextField {
  id: string;
  label: string;
  value: string;
  placeholder: string;
}

// Define context fields for each meeting type
const MEETING_TYPE_FIELDS: Record<string, Omit<ContextField, 'value'>[]> = {
  qualification: [
    { id: 'current_situation', label: 'Current Situation', placeholder: 'What led to this meeting? What\'s the background?' },
    { id: 'what_we_know', label: 'What We Know', placeholder: 'Company info, their role, past interactions...' },
    { id: 'need_to_learn', label: 'Need to Learn', placeholder: 'What questions need answers? What are you trying to discover?' },
    { id: 'desired_outcome', label: 'Desired Outcome', placeholder: 'What does success look like?' },
    { id: 'pain_points', label: 'Their Pain Points', placeholder: 'What problems are they facing?' },
    { id: 'decision_criteria', label: 'Decision Criteria', placeholder: 'What factors influence their decision?' }
  ],
  sales: [
    { id: 'current_situation', label: 'Current Situation', placeholder: 'Where are they in the buying process?' },
    { id: 'what_we_know', label: 'What We Know', placeholder: 'Budget, timeline, decision makers...' },
    { id: 'value_proposition', label: 'Value Proposition', placeholder: 'What unique value do you bring?' },
    { id: 'objections', label: 'Potential Objections', placeholder: 'What concerns might they have?' },
    { id: 'competition', label: 'Competition', placeholder: 'Who else are they considering?' },
    { id: 'desired_outcome', label: 'Desired Outcome', placeholder: 'What\'s the next step? Close? Follow-up?' }
  ],
  partnership: [
    { id: 'current_situation', label: 'Current Situation', placeholder: 'Why explore this partnership now?' },
    { id: 'mutual_goals', label: 'Mutual Goals', placeholder: 'What do both parties want to achieve?' },
    { id: 'their_strengths', label: 'Their Strengths', placeholder: 'What do they bring to the table?' },
    { id: 'our_strengths', label: 'Our Strengths', placeholder: 'What do we bring to the table?' },
    { id: 'potential_challenges', label: 'Potential Challenges', placeholder: 'What obstacles might arise?' },
    { id: 'desired_outcome', label: 'Desired Outcome', placeholder: 'What does a successful partnership look like?' }
  ],
  'problem-solving': [
    { id: 'problem_definition', label: 'Problem Definition', placeholder: 'What problem are we solving?' },
    { id: 'current_situation', label: 'Current Impact', placeholder: 'How is this affecting the business?' },
    { id: 'constraints', label: 'Constraints', placeholder: 'Budget, time, resources, political...' },
    { id: 'attempted_solutions', label: 'Attempted Solutions', placeholder: 'What have they tried? What worked/didn\'t work?' },
    { id: 'success_metrics', label: 'Success Metrics', placeholder: 'How will we measure success?' },
    { id: 'desired_outcome', label: 'Desired Outcome', placeholder: 'What does the solution look like?' }
  ],
  'check-in': [
    { id: 'current_situation', label: 'Current Status', placeholder: 'Where are things at right now?' },
    { id: 'recent_progress', label: 'Recent Progress', placeholder: 'What\'s been accomplished?' },
    { id: 'blockers', label: 'Blockers', placeholder: 'What\'s getting in the way?' },
    { id: 'upcoming_milestones', label: 'Upcoming Milestones', placeholder: 'What\'s coming up next?' },
    { id: 'desired_outcome', label: 'Desired Outcome', placeholder: 'What do we need to align on?' }
  ],
  other: [
    { id: 'field_1', label: 'Context Field 1', placeholder: 'Describe first aspect...' },
    { id: 'field_2', label: 'Context Field 2', placeholder: 'Describe second aspect...' },
    { id: 'field_3', label: 'Context Field 3', placeholder: 'Describe third aspect...' },
    { id: 'field_4', label: 'Context Field 4', placeholder: 'Describe fourth aspect...' }
  ]
};

const MEETING_TYPES = [
  { value: 'qualification', label: 'Qualification / Discovery' },
  { value: 'sales', label: 'Sales / Pitch' },
  { value: 'partnership', label: 'Partnership / Collaboration' },
  { value: 'problem-solving', label: 'Problem Solving / Strategy' },
  { value: 'check-in', label: 'Check-in / Status Update' },
  { value: 'other', label: 'Other' }
];

export default function ContextBuilder({ meetingId, onContextChange }: ContextBuilderProps) {
  const [meetingType, setMeetingType] = useState('qualification');
  const [contextFields, setContextFields] = useState<ContextField[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Initialize fields when meeting type changes
  useEffect(() => {
    const fieldTemplates = MEETING_TYPE_FIELDS[meetingType] || MEETING_TYPE_FIELDS.other;
    const initialFields = fieldTemplates.map(template => ({
      ...template,
      value: ''
    }));
    setContextFields(initialFields);
  }, [meetingType]);

  // Notify parent of changes
  useEffect(() => {
    if (onContextChange) {
      onContextChange(meetingType, contextFields);
    }
  }, [meetingType, contextFields, onContextChange]);


  const handleFieldChange = (fieldId: string, value: string) => {
    setContextFields(prev => prev.map(field => 
      field.id === fieldId ? { ...field, value } : field
    ));
  };

  const handleAddField = () => {
    const newField: ContextField = {
      id: `custom_${Date.now()}`,
      label: `Custom Field ${contextFields.length + 1}`,
      value: '',
      placeholder: 'Enter your context...'
    };
    setContextFields(prev => [...prev, newField]);
  };

  const handleRemoveField = (fieldId: string) => {
    setContextFields(prev => prev.filter(field => field.id !== fieldId));
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">🎯 Context</h3>
          <span className="text-xs text-gray-500">({contextFields.length} fields)</span>
        </div>

        {/* Meeting Type Selector */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Meeting Type
          </label>
          <select
            value={meetingType}
            onChange={(e) => setMeetingType(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {MEETING_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Horizontal Context Cards */}
      <div className="overflow-x-auto px-4 pb-4" style={{ maxWidth: '100%' }}>
        <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
        {contextFields.map((field) => (
          <div
            key={field.id}
            className="flex-shrink-0 w-64 bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-900">
                {field.label}
              </label>
              <button
                onClick={() => handleRemoveField(field.id)}
                className="text-gray-400 hover:text-red-600 text-xs"
                title="Remove this field"
              >
                ✕
              </button>
            </div>
            <textarea
              value={field.value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-2.5 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[120px]"
              rows={5}
            />
          </div>
        ))}

        {/* Add Field Button */}
        <div className="flex-shrink-0 w-64">
          <button
            onClick={handleAddField}
            className="w-full h-full min-h-[180px] border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center text-gray-400 hover:text-blue-600"
          >
            <div className="text-center">
              <span className="text-3xl block mb-2">+</span>
              <span className="text-sm">Add Card</span>
            </div>
          </button>
        </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="text-xs text-gray-500 mt-2">
          💡 Tip: Scroll right to see more fields. This context will be used by AI to generate your conversation strategy
        </div>
      </div>
    </div>
  );
}
