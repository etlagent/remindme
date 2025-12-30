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
  const [clarifyingQuestions, setClarifyingQuestions] = useState<string[]>([]);
  const [clarifyingAnswers, setClarifyingAnswers] = useState<{[key: number]: string}>({});

  useEffect(() => {
    fetchAttendees();
    loadExistingStrategy();
  }, [meetingId]);

  const loadExistingStrategy = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: strategies } = await supabase
        .from('conversation_strategies')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (strategies && strategies.length > 0) {
        const strategy = strategies[0];
        setCurrentStrategyId(strategy.id);
        
        const { data: steps } = await supabase
          .from('conversation_steps')
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
        {hasSteps && (
          <button
            onClick={() => {
              setClarifyingQuestions([]);
              setClarifyingAnswers({});
              setConversationSteps([]);
            }}
            className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 border border-blue-300 rounded-md hover:bg-blue-50"
          >
            + New Strategy
          </button>
        )}
      </div>

      {hasSteps ? (
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
                        .from('conversation_steps')
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
                        .from('conversation_steps')
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
      )}
    </div>
  );
}
