'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

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
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [savedContexts, setSavedContexts] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAutoSavedId, setLastAutoSavedId] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const storageKey = `context_${meetingId}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const { fields, type, cardId } = JSON.parse(saved);
        setContextFields(fields);
        setMeetingType(type);
        if (cardId) setLastAutoSavedId(cardId);
        return; // Don't initialize default fields
      } catch (e) {
        console.error('Error loading saved context:', e);
      }
    }
    
    // Initialize fields when meeting type changes (only if no saved data)
    const fieldTemplates = MEETING_TYPE_FIELDS[meetingType] || MEETING_TYPE_FIELDS.other;
    const initialFields = fieldTemplates.map(template => ({
      ...template,
      value: ''
    }));
    setContextFields(initialFields);
  }, [meetingId]);

  // Save to localStorage when fields or type change
  useEffect(() => {
    if (contextFields.length > 0) {
      const storageKey = `context_${meetingId}`;
      localStorage.setItem(storageKey, JSON.stringify({
        fields: contextFields,
        type: meetingType,
        cardId: lastAutoSavedId
      }));
    }
  }, [contextFields, meetingType, lastAutoSavedId, meetingId]);

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

  const handleLabelChange = (fieldId: string, label: string) => {
    setContextFields(prev => prev.map(field => 
      field.id === fieldId ? { ...field, label } : field
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

  const handleAutoSave = async () => {
    // Auto-save in background with "Untitled" naming
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const contextData: any = {
        name: `Untitled ${Date.now()}`,
        meeting_type: meetingType,
      };

      // Map fields to the 10-column structure
      contextFields.forEach((field, index) => {
        if (index < 10) {
          const fieldNum = String(index + 1).padStart(2, '0');
          contextData[`field_label${fieldNum}`] = field.label;
          contextData[`field_response${fieldNum}`] = field.value;
        }
      });

      // If there's already an auto-saved entry, update it instead of creating new
      const endpoint = lastAutoSavedId 
        ? `/api/context-cards/${lastAutoSavedId}`
        : '/api/context-cards/save';
      const method = lastAutoSavedId ? 'PATCH' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(contextData),
      });

      const result = await response.json();
      if (result.success && result.contextCard) {
        setLastAutoSavedId(result.contextCard.id);
      } else {
        console.error('Auto-save failed:', result.error);
      }
    } catch (error) {
      console.error('Error auto-saving context:', error);
    }
  };

  // Auto-save context as user types (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (contextFields.some(field => field.value.trim())) {
        // Only auto-save if there's content
        handleAutoSave();
      }
    }, 2000); // Wait 2 seconds after user stops typing

    return () => clearTimeout(timer);
  }, [contextFields, meetingType]);

  const handleSaveContext = async (name?: string) => {
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please log in to save context');
        return;
      }

      const contextData: any = {
        name: name || `Untitled ${Date.now()}`,
        meeting_type: meetingType,
      };

      // Map fields to the 10-column structure
      contextFields.forEach((field, index) => {
        if (index < 10) {
          const fieldNum = String(index + 1).padStart(2, '0');
          contextData[`field_label${fieldNum}`] = field.label;
          contextData[`field_response${fieldNum}`] = field.value;
        }
      });

      // If there's an auto-saved entry, update it instead of creating new one
      const endpoint = lastAutoSavedId 
        ? `/api/context-cards/${lastAutoSavedId}`
        : '/api/context-cards/save';
      const method = lastAutoSavedId ? 'PATCH' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(contextData),
      });

      const result = await response.json();
      
      if (result.success) {
        setShowSaveDialog(false);
        setSaveName('');
        // Clear the auto-saved ID since it's now manually saved
        setLastAutoSavedId(null);
        alert('Context saved successfully!');
      } else {
        // If PATCH failed because entry doesn't exist, try POST instead
        if (response.status === 404 && lastAutoSavedId) {
          setLastAutoSavedId(null); // Clear stale ID
          const retryResponse = await fetch('/api/context-cards/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify(contextData),
          });
          
          const retryResult = await retryResponse.json();
          if (retryResult.success) {
            setShowSaveDialog(false);
            setSaveName('');
            alert('Context saved successfully!');
          } else {
            alert(`Failed to save: ${retryResult.error}`);
          }
        } else {
          alert(`Failed to save: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('Error saving context:', error);
      alert('Failed to save context');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadContext = async (contextId: string) => {
    setIsLoading(true);
    try {
      console.log('Loading context card with ID:', contextId);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please log in to load context');
        return;
      }

      const response = await fetch(`/api/context-cards/${contextId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();
      console.log('Load context result:', result);
      
      if (result.success && result.contextCard) {
        const loadedData = result.contextCard;
        
        // Convert loaded data back to contextFields
        const fields: ContextField[] = [];
        for (let i = 1; i <= 10; i++) {
          const fieldNum = String(i).padStart(2, '0');
          const label = loadedData[`field_label${fieldNum}`];
          const value = loadedData[`field_response${fieldNum}`];
          if (label) {
            fields.push({ 
              id: `field_${i}`, 
              label, 
              value: value || '', 
              placeholder: '' 
            });
          }
        }
        
        setContextFields(fields);
        if (loadedData.meeting_type) {
          setMeetingType(loadedData.meeting_type);
        }
        
        // Set this as the current card ID so saves update instead of creating duplicates
        setLastAutoSavedId(loadedData.id);
        
        setShowLoadDialog(false);
      } else {
        alert(`Failed to load: ${result.error}`);
      }
    } catch (error) {
      console.error('Error loading context:', error);
      alert('Failed to load context');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSavedContexts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/context-cards/list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();
      console.log('Fetched saved contexts:', result);
      
      if (result.success) {
        setSavedContexts(result.contextCards || []);
      }
    } catch (error) {
      console.error('Error fetching saved contexts:', error);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">🎯 Context</h3>
          <div className="flex items-center gap-2">
            {!isCollapsed && (
              <>
                <span className="text-xs text-gray-500">({contextFields.length} fields)</span>
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 border border-blue-300 rounded-md hover:bg-blue-50"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    fetchSavedContexts();
                    setShowLoadDialog(true);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-green-600 hover:text-green-700 border border-green-300 rounded-md hover:bg-green-50"
                >
                  Load
                </button>
              </>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-gray-500 hover:text-gray-700 transition-transform"
              style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <>
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
          </>
        )}
      </div>

      {!isCollapsed && (
        <>
          {/* Horizontal Context Cards */}
          <div className="overflow-x-auto px-4 pb-4" style={{ maxWidth: '100%' }}>
            <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
            {contextFields.map((field) => (
              <div
                key={field.id}
                className="flex-shrink-0 w-64 bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  {field.id.startsWith('custom_') ? (
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => handleLabelChange(field.id, e.target.value)}
                      className="text-xs font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0 flex-1"
                      placeholder="Field name..."
                    />
                  ) : (
                    <label className="text-xs font-semibold text-gray-900">
                      {field.label}
                    </label>
                  )}
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
        </>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Save Context</h3>
            <p className="text-sm text-gray-600 mb-4">Give this context a name to easily find it later.</p>
            
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="e.g., Enterprise Discovery, Partnership Qualification"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setSaveName('');
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveContext(saveName)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
                disabled={isSaving || !saveName.trim()}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Load Context</h3>
            <p className="text-sm text-gray-600 mb-4">Select a saved context to load.</p>
            
            <div className="max-h-96 overflow-y-auto mb-4">
              {savedContexts.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No saved contexts yet.</p>
              ) : (
                <div className="space-y-2">
                  {savedContexts.map((context) => (
                    <button
                      key={context.id}
                      onClick={() => handleLoadContext(context.id)}
                      className="w-full text-left px-4 py-3 border border-gray-200 rounded-md hover:bg-gray-50 hover:border-blue-300"
                      disabled={isLoading}
                    >
                      <div className="font-medium text-sm">{context.name}</div>
                      {context.meeting_type && (
                        <div className="text-xs text-gray-500 mt-1">{context.meeting_type}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowLoadDialog(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
