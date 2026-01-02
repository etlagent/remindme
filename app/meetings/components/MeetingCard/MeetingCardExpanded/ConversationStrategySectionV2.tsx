'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAttendees } from '@/app/meetings/hooks/useAttendees';

interface ConversationStrategySectionProps {
  meetingId: string;
  meetingType: string;
  contextFields: Array<{ id: string; label: string; value: string; placeholder: string }>;
}

interface ConversationStep {
  id: string;
  step_order: number;
  description: string;
  ai_suggestion?: string | null;
}

export default function ConversationStrategySectionV2({ 
  meetingId, 
  meetingType,
  contextFields 
}: ConversationStrategySectionProps) {
  const { attendees, fetchAttendees } = useAttendees(meetingId);
  
  const [conversationSteps, setConversationSteps] = useState<ConversationStep[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStrategyId, setCurrentStrategyId] = useState<string | null>(null);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
  const [clarifyingQuestions, setClarifyingQuestions] = useState<string[]>([]);
  const [clarifyingAnswers, setClarifyingAnswers] = useState<{[key: number]: string}>({});
  const [storedClarifyingQA, setStoredClarifyingQA] = useState<Array<{question: string; answer: string}>>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [savedStrategies, setSavedStrategies] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    fetchAttendees();
    loadExistingStrategy();
  }, [meetingId]);

  const loadExistingStrategy = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: strategies } = await supabase
        .from('meeting_conversation_strategies_active')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (strategies && strategies.length > 0) {
        const strategy = strategies[0];
        setCurrentStrategyId(strategy.id);
        
        // Store clarifying Q&A for reuse on refresh
        if (strategy.clarifying_qa && Array.isArray(strategy.clarifying_qa)) {
          setStoredClarifyingQA(strategy.clarifying_qa);
        }
        
        const { data: steps } = await supabase
          .from('meeting_conversation_steps')
          .select('*')
          .eq('strategy_id', strategy.id)
          .order('step_order', { ascending: true });
        
        if (steps) {
          setConversationSteps(steps);
        }
      }
    } catch (error) {
      console.error('Error loading strategy:', error);
    }
  };

  const buildContextString = () => {
    return contextFields
      .filter(field => field.value.trim())
      .map(field => `${field.label}: ${field.value}`)
      .join('\n\n');
  };

  const handleSaveStrategy = async (name?: string) => {
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please log in to save strategy');
        return;
      }

      const templateName = name || `Untitled ${Date.now()}`;
      const stepsData = conversationSteps.map(step => ({
        step_order: step.step_order,
        description: step.description,
        ai_suggestion: step.ai_suggestion
      }));

      // 1. Save or update template (meeting_conversation_strategies)
      if (currentTemplateId) {
        // Update existing template
        const { error: updateError } = await supabase
          .from('meeting_conversation_strategies')
          .update({
            name: templateName,
            description: saveDescription || null,
            meeting_type: meetingType,
            steps: stepsData,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentTemplateId);

        if (updateError) {
          alert(`Failed to update template: ${updateError.message}`);
          return;
        }
      } else {
        // Create new template
        const templateData = {
          name: templateName,
          description: saveDescription || undefined,
          meeting_type: meetingType,
          steps: stepsData
        };

        const templateResponse = await fetch('/api/conversation-strategies/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(templateData),
        });

        const templateResult = await templateResponse.json();
        
        if (!templateResult.success) {
          alert(`Failed to save template: ${templateResult.error}`);
          return;
        }

        // Store the template ID for future updates
        setCurrentTemplateId(templateResult.strategy.id);
      }

      // 2. Update per-meeting strategy (meeting_conversation_strategies_active + meeting_conversation_steps)
      if (currentStrategyId) {
        // Update existing strategy steps
        const { error: deleteError } = await supabase
          .from('meeting_conversation_steps')
          .delete()
          .eq('strategy_id', currentStrategyId);

        if (deleteError) throw deleteError;

        const { error: insertError } = await supabase
          .from('meeting_conversation_steps')
          .insert(
            conversationSteps.map((step, index) => ({
              strategy_id: currentStrategyId,
              step_order: index + 1,
              description: step.description,
              ai_suggestion: step.ai_suggestion
            }))
          );

        if (insertError) throw insertError;
      }
      
      setShowSaveDialog(false);
      setSaveName('');
      setSaveDescription('');
      alert('Strategy saved successfully!');
    } catch (error) {
      console.error('Error saving strategy:', error);
      alert('Failed to save strategy');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadStrategy = async (strategyId: string) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please log in to load strategy');
        return;
      }

      const response = await fetch(`/api/conversation-strategies/${strategyId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();
      
      if (result.success && result.strategy) {
        const loadedData = result.strategy;
        
        // Convert loaded steps back to conversationSteps format
        const steps: ConversationStep[] = loadedData.steps.map((step: any, index: number) => ({
          id: `step_${index}_${Date.now()}`,
          step_order: step.step_order || index + 1,
          description: step.description || '',
          ai_suggestion: step.ai_suggestion || null
        }));
        
        setConversationSteps(steps);
        setShowLoadDialog(false);
      } else {
        alert(`Failed to load: ${result.error}`);
      }
    } catch (error) {
      console.error('Error loading strategy:', error);
      alert('Failed to load strategy');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSavedStrategies = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/conversation-strategies/list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setSavedStrategies(result.strategies || []);
      }
    } catch (error) {
      console.error('Error fetching saved strategies:', error);
    }
  };

  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please log in to generate strategies');
        return;
      }

      const contextString = buildContextString();
      
      const response = await fetch('/api/conversations/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          meeting_id: meetingId,
          meeting_type: meetingType,
          situation: contextString,
          goal: '',
          context_sources: ['attendees'],
          attendee_ids: attendees.map(a => a.person_id)
        })
      });

      const result = await response.json();

      if (result.success && result.questions) {
        if (result.questions.length === 0) {
          await handleGenerateStrategy([]);
        } else {
          setClarifyingQuestions(result.questions);
          setClarifyingAnswers({});
        }
      } else {
        alert(`Error: ${result.error || 'Failed to generate questions'}`);
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Failed to generate questions');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateStrategy = async (clarifying_qa: Array<{question: string; answer: string}>) => {
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please log in to generate strategies');
        return;
      }

      const contextString = buildContextString();

      const response = await fetch('/api/conversations/generate-strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          meeting_id: meetingId,
          meeting_type: meetingType,
          situation: contextString,
          goal: '',
          context_sources: ['attendees'],
          attendee_ids: attendees.map(a => a.person_id),
          clarifying_qa,
          context_fields: contextFields
        })
      });

      const result = await response.json();

      if (result.success && result.steps) {
        setConversationSteps(result.steps);
        setCurrentStrategyId(result.strategy.id);
        setClarifyingQuestions([]);
        setClarifyingAnswers({});
      } else {
        alert(`Error: ${result.error || 'Failed to generate strategy'}`);
      }
    } catch (error) {
      console.error('Error generating strategy:', error);
      alert('Failed to generate strategy');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateStrategy = async () => {
    const clarifying_qa = clarifyingQuestions.map((q, i) => ({
      question: q,
      answer: clarifyingAnswers[i] || ''
    })).filter(qa => qa.answer);

    await handleGenerateStrategy(clarifying_qa);
  };

  const hasSteps = conversationSteps.length > 0;
  const hasContext = contextFields.some(field => field.value.trim());

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">💬 Conversation Strategy</h3>
        <div className="flex items-center gap-2">
          {!isCollapsed && hasSteps && (
            <>
              <button
                onClick={() => handleGenerateStrategy(storedClarifyingQA)}
                disabled={isGenerating}
                className="px-3 py-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 border border-purple-300 rounded-md hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                title="Regenerate strategy with current context"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isGenerating ? 'Generating...' : 'Refresh'}
              </button>
              <button
                onClick={() => setShowSaveDialog(true)}
                className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 border border-blue-300 rounded-md hover:bg-blue-50"
              >
                Save
              </button>
              <button
                onClick={() => {
                  fetchSavedStrategies();
                  setShowLoadDialog(true);
                }}
                className="px-3 py-1.5 text-xs font-medium text-green-600 hover:text-green-700 border border-green-300 rounded-md hover:bg-green-50"
              >
                Load
              </button>
              <button
                onClick={() => {
                  setClarifyingQuestions([]);
                  setClarifyingAnswers({});
                  setConversationSteps([]);
                  setCurrentTemplateId(null);
                }}
                className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 border border-blue-300 rounded-md hover:bg-blue-50"
              >
                + New Strategy
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

      {!isCollapsed && (hasSteps ? (
        /* Show Strategy Steps */
        <div className="overflow-x-auto pb-4" style={{ maxWidth: '100%' }}>
          <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
          {conversationSteps.map((step, index) => (
            <div
              key={step.id}
              className="flex-shrink-0 w-80 bg-white border-2 border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">
                  Step {index + 1}
                </h4>
                <button
                  onClick={async () => {
                    setConversationSteps(conversationSteps.filter(s => s.id !== step.id));
                    if (!step.id.startsWith('step-')) {
                      await supabase
                        .from('meeting_conversation_steps')
                        .delete()
                        .eq('id', step.id);
                    }
                  }}
                  className="text-gray-400 hover:text-red-600 text-xs"
                >
                  ✕
                </button>
              </div>
              <textarea
                value={step.description || ''}
                onChange={(e) => {
                  const updated = conversationSteps.map(s =>
                    s.id === step.id ? { ...s, description: e.target.value } : s
                  );
                  setConversationSteps(updated);
                }}
                onBlur={async (e) => {
                  if (!step.id.startsWith('step-')) {
                    try {
                      await supabase
                        .from('meeting_conversation_steps')
                        .update({ description: e.target.value })
                        .eq('id', step.id);
                    } catch (error) {
                      console.error('Error saving step:', error);
                    }
                  }
                }}
                placeholder="Describe this step..."
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs mb-3 resize-y whitespace-pre-wrap"
                rows={20}
              />
              <button
                className="w-full px-3 py-2 bg-purple-600 text-white text-xs font-medium rounded hover:bg-purple-700"
              >
                🤖 Get AI Suggestion
              </button>
            </div>
          ))}

          {/* Add Step Button */}
          <div className="flex-shrink-0 w-64">
            <button
              onClick={() => {
                const newStep = {
                  id: `step-${Date.now()}`,
                  step_order: conversationSteps.length + 1,
                  description: '',
                  ai_suggestion: null
                };
                setConversationSteps([...conversationSteps, newStep]);
              }}
              className="w-full h-full min-h-[300px] border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center text-gray-400 hover:text-blue-600"
            >
              <div className="text-center">
                <span className="text-3xl block mb-2">+</span>
                <span className="text-sm">Add Step</span>
              </div>
            </button>
          </div>
          </div>
        </div>
      ) : (
        /* Generate Strategy Section */
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          {!hasContext ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">📝 Add context above to generate your conversation strategy</p>
            </div>
          ) : clarifyingQuestions.length > 0 ? (
            /* Clarifying Questions */
            <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-md">
              <h4 className="text-xs font-semibold text-purple-900 mb-2">
                🤔 A few questions to refine your strategy:
              </h4>
              <div className="space-y-3">
                {clarifyingQuestions.map((question, index) => (
                  <div key={index}>
                    <label className="block text-xs text-purple-800 mb-1">
                      {index + 1}. {question}
                    </label>
                    <textarea
                      value={clarifyingAnswers[index] || ''}
                      onChange={(e) => {
                        setClarifyingAnswers({
                          ...clarifyingAnswers,
                          [index]: e.target.value
                        });
                      }}
                      placeholder="Your answer..."
                      className="w-full px-2 py-1.5 border border-purple-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    setClarifyingQuestions([]);
                    setClarifyingAnswers({});
                  }}
                  className="text-xs text-purple-600 hover:text-purple-800"
                >
                  ← Start Over
                </button>
                <button
                  onClick={handleCreateStrategy}
                  disabled={isGenerating}
                  className="flex-1 px-4 py-2 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isGenerating ? '⏳ Creating Strategy...' : '✅ Create Strategy'}
                </button>
              </div>
            </div>
          ) : (
            /* Generate Button */
            <button
              onClick={handleGenerateQuestions}
              disabled={isGenerating}
              className="w-full px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isGenerating ? '⏳ Analyzing Context...' : '🤖 Generate Strategy'}
            </button>
          )}
        </div>
      ))}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Save Strategy</h3>
            <p className="text-sm text-gray-600 mb-4">Give this strategy a name to easily find it later.</p>
            
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="e.g., Enterprise Discovery Flow, Partnership Pitch"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              autoFocus
            />
            
            <textarea
              value={saveDescription}
              onChange={(e) => setSaveDescription(e.target.value)}
              placeholder="Optional: Describe when to use this strategy (e.g., 'Use for enterprise discovery calls with CTOs')"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 resize-none"
            />
            
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setSaveName('');
                  setSaveDescription('');
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveStrategy(saveName)}
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
            <h3 className="text-lg font-semibold mb-4">Load Strategy</h3>
            <p className="text-sm text-gray-600 mb-4">Select a saved strategy to load.</p>
            
            <div className="max-h-96 overflow-y-auto mb-4">
              {savedStrategies.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No saved strategies yet.</p>
              ) : (
                <div className="space-y-2">
                  {savedStrategies.map((strategy) => (
                    <button
                      key={strategy.id}
                      onClick={() => handleLoadStrategy(strategy.id)}
                      className="w-full text-left px-4 py-3 border border-gray-200 rounded-md hover:bg-gray-50 hover:border-blue-300"
                      disabled={isLoading}
                    >
                      <div className="font-medium text-sm">{strategy.name}</div>
                      {strategy.meeting_type && (
                        <div className="text-xs text-gray-500 mt-1">{strategy.meeting_type}</div>
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
