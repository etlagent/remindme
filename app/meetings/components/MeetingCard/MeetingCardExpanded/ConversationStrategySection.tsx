'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAttendees } from '@/app/meetings/hooks/useAttendees';

interface ConversationStrategySectionProps {
  meetingId: string;
}

interface ConversationStep {
  id: string;
  step_order: number;
  description: string;
  ai_suggestion?: string | null;
}

export default function ConversationStrategySection({ meetingId }: ConversationStrategySectionProps) {
  const { attendees, fetchAttendees } = useAttendees(meetingId);
  
  const [contextSources, setContextSources] = useState<string[]>(['attendees']);
  const [meetingType, setMeetingType] = useState('');
  const [currentSituation, setCurrentSituation] = useState('');
  const [whatWeKnow, setWhatWeKnow] = useState('');
  const [whatWeNeedToLearn, setWhatWeNeedToLearn] = useState('');
  const [desiredOutcome, setDesiredOutcome] = useState('');
  const [clarifyingQuestions, setClarifyingQuestions] = useState<string[]>([]);
  const [clarifyingAnswers, setClarifyingAnswers] = useState<{[key: number]: string}>({});
  const [conversationSteps, setConversationSteps] = useState<ConversationStep[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBuildFormCollapsed, setIsBuildFormCollapsed] = useState(false);
  const [currentStrategyId, setCurrentStrategyId] = useState<string | null>(null);
  const [savedStrategies, setSavedStrategies] = useState<any[]>([]);

  // Load attendees on mount
  useEffect(() => {
    fetchAttendees();
  }, [meetingId, fetchAttendees]);

  // Load existing strategies on mount
  useEffect(() => {
    loadStrategies();
  }, [meetingId]);

  const loadStrategies = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: strategies } = await supabase
        .from('meeting_conversation_strategies_active')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: false });

      if (strategies && strategies.length > 0) {
        setSavedStrategies(strategies);
        // Auto-load most recent strategy
        await loadStrategy(strategies[0]);
      }
    } catch (error) {
      console.error('Error loading strategies:', error);
    }
  };

  const loadStrategy = async (strategy: any) => {
    setCurrentStrategyId(strategy.id);
    setContextSources(strategy.context_sources || ['attendees']);
    setMeetingType(strategy.meeting_type || '');
    
    // Parse situation and goal fields
    const situationParts = (strategy.situation || '').split('\n\nWhat we know: ');
    setCurrentSituation(situationParts[0] || '');
    setWhatWeKnow(situationParts[1] || '');
    
    const goalParts = (strategy.goal || '').split('\n\nDesired outcome: ');
    setWhatWeNeedToLearn(goalParts[0] || '');
    setDesiredOutcome(goalParts[1] || '');
    
    setClarifyingQuestions([]);
    setClarifyingAnswers({});
    
    // Load steps
    const { data: steps } = await supabase
      .from('meeting_conversation_steps')
      .select('*')
      .eq('strategy_id', strategy.id)
      .order('step_order', { ascending: true });
    
    if (steps) {
      setConversationSteps(steps);
    }
  };

  const contextOptions = [
    { id: 'attendees', label: 'Attendee LinkedIn Profiles', icon: '👥' },
    { id: 'linkedin', label: 'Company LinkedIn', icon: '💼' },
    { id: 'conversations', label: 'Previous Conversations', icon: '💬' },
    { id: 'meetings', label: 'Past Meeting Notes', icon: '📝' },
    { id: 'notes', label: 'Business Notes', icon: '📋' },
    { id: 'memories', label: 'Memories', icon: '🧠' }
  ];

  const meetingTypes = [
    { value: 'qualification', label: 'Qualification / Discovery' },
    { value: 'sales', label: 'Sales / Pitch' },
    { value: 'partnership', label: 'Partnership / Collaboration' },
    { value: 'problem-solving', label: 'Problem Solving / Strategy' },
    { value: 'check-in', label: 'Check-in / Status Update' },
    { value: 'other', label: 'Other' }
  ];

  const toggleContextSource = (sourceId: string) => {
    setContextSources(prev =>
      prev.includes(sourceId)
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please log in to generate strategies');
        return;
      }

      const response = await fetch('/api/conversations/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          meeting_id: meetingId,
          meeting_type: meetingType,
          situation: `${currentSituation}\n\nWhat we know: ${whatWeKnow}`,
          goal: `${whatWeNeedToLearn}\n\nDesired outcome: ${desiredOutcome}`,
          context_sources: contextSources,
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

      const response = await fetch('/api/conversations/generate-strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          meeting_id: meetingId,
          meeting_type: meetingType,
          situation: `${currentSituation}\n\nWhat we know: ${whatWeKnow}`,
          goal: `${whatWeNeedToLearn}\n\nDesired outcome: ${desiredOutcome}`,
          context_sources: contextSources,
          attendee_ids: attendees.map(a => a.person_id),
          clarifying_qa
        })
      });

      const result = await response.json();

      if (result.success && result.steps) {
        setConversationSteps(result.steps);
        setCurrentStrategyId(result.strategy.id);
        // Reload strategies list
        await loadStrategies();
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

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">💬 Conversation Strategy</h3>
        {(hasSteps || currentSituation || desiredOutcome) && (
          <button
            onClick={() => {
              setCurrentSituation('');
              setWhatWeKnow('');
              setWhatWeNeedToLearn('');
              setDesiredOutcome('');
              setMeetingType('');
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
        /* Horizontal Layout with Steps */
        <div className="space-y-4">
          <div className="flex gap-4 overflow-x-auto pb-4 max-w-full">
            {/* Form Card - Collapsible */}
            <div className={`flex-shrink-0 ${isBuildFormCollapsed ? 'w-12' : 'w-64'} transition-all duration-200`}>
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-full">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900">
                    {!isBuildFormCollapsed && 'Build Strategy'}
                  </h3>
                  <button
                    onClick={() => setIsBuildFormCollapsed(!isBuildFormCollapsed)}
                    className="text-gray-400 hover:text-gray-600 transition-colors text-xl"
                    title={isBuildFormCollapsed ? 'Expand' : 'Collapse'}
                  >
                    {isBuildFormCollapsed ? '▶' : '◀'}
                  </button>
                </div>
                
                {!isBuildFormCollapsed && (
                  <div className="p-4 space-y-3 overflow-y-auto max-h-[600px]">
                    <div className="text-xs font-medium text-gray-700 mb-3">
                      Edit context & regenerate:
                    </div>
                    
                    {/* Meeting Type */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Meeting Type
                      </label>
                      <select
                        value={meetingType}
                        onChange={(e) => setMeetingType(e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                      >
                        <option value="">Select...</option>
                        {meetingTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Current Situation */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Current Situation
                      </label>
                      <textarea
                        value={currentSituation}
                        onChange={(e) => setCurrentSituation(e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs resize-y"
                        rows={2}
                      />
                    </div>

                    {/* What We Know */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        What You Know
                      </label>
                      <textarea
                        value={whatWeKnow}
                        onChange={(e) => setWhatWeKnow(e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs resize-y"
                        rows={2}
                      />
                    </div>

                    {/* What We Need to Learn */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        What You Need to Learn
                      </label>
                      <textarea
                        value={whatWeNeedToLearn}
                        onChange={(e) => setWhatWeNeedToLearn(e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs resize-y"
                        rows={2}
                      />
                    </div>

                    {/* Desired Outcome */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Desired Outcome
                      </label>
                      <textarea
                        value={desiredOutcome}
                        onChange={(e) => setDesiredOutcome(e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs resize-y"
                        rows={2}
                      />
                    </div>

                    {/* Regenerate Button */}
                    <button
                      onClick={handleGenerateQuestions}
                      disabled={(!currentSituation && !desiredOutcome) || isGenerating}
                      className="w-full px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? '⏳ Regenerating...' : '🔄 Regenerate Strategy'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Step Cards */}
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
                    onClick={() => {
                      setConversationSteps(conversationSteps.filter(s => s.id !== step.id));
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
                    // Auto-save on blur
                    if (step.id.startsWith('step-')) {
                      // New step, not saved yet
                      return;
                    }
                    try {
                      await supabase
                        .from('meeting_conversation_steps')
                        .update({ description: e.target.value })
                        .eq('id', step.id);
                    } catch (error) {
                      console.error('Error saving step:', error);
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
        /* Vertical Layout - Build Form */
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-4">
            {/* Context Sources */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Context Sources
              </label>
              <div className="grid grid-cols-2 gap-2">
                {contextOptions.map((option) => (
                  <label key={option.id} className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={contextSources.includes(option.id)}
                      onChange={() => toggleContextSource(option.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-base">{option.icon}</span>
                    <span className="text-xs text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Meeting Type */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Meeting Type (optional)
              </label>
              <select
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value)}
                className="w-full px-2.5 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select type...</option>
                {meetingTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Current Situation */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Current Situation
              </label>
              <textarea
                value={currentSituation}
                onChange={(e) => setCurrentSituation(e.target.value)}
                placeholder="What's the context? What led to this meeting?"
                className="w-full px-2.5 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                rows={3}
              />
              <p className="text-xs text-gray-400 mt-0.5">
                What's happening? What concerns do they have? What's the background?
              </p>
            </div>

            {/* What We Know */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                What You Know About Them
              </label>
              <textarea
                value={whatWeKnow}
                onChange={(e) => setWhatWeKnow(e.target.value)}
                placeholder="Company info, their role, past interactions, pain points, etc."
                className="w-full px-2.5 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                rows={3}
              />
            </div>

            {/* What We Need to Learn */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                What You Need to Learn
              </label>
              <textarea
                value={whatWeNeedToLearn}
                onChange={(e) => setWhatWeNeedToLearn(e.target.value)}
                placeholder="What questions need answers? What are you trying to discover?"
                className="w-full px-2.5 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                rows={3}
              />
            </div>

            {/* Desired Outcome */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Desired Outcome
              </label>
              <textarea
                value={desiredOutcome}
                onChange={(e) => setDesiredOutcome(e.target.value)}
                placeholder="What happens if this meeting is successful? Next steps?"
                className="w-full px-2.5 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                rows={2}
              />
              <p className="text-xs text-gray-400 mt-0.5">
                What's the desired outcome? Where do you want to move the conversation?
              </p>
            </div>

            {/* Clarifying Questions */}
            {clarifyingQuestions.length > 0 && (
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
                <button
                  onClick={() => {
                    setClarifyingQuestions([]);
                    setClarifyingAnswers({});
                  }}
                  className="mt-2 text-xs text-purple-600 hover:text-purple-800"
                >
                  ← Start Over
                </button>
              </div>
            )}

            {/* Generate Button */}
            {clarifyingQuestions.length === 0 ? (
              <button
                onClick={handleGenerateQuestions}
                disabled={(!currentSituation && !desiredOutcome) || isGenerating}
                className="w-full px-4 py-2.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isGenerating ? '⏳ Analyzing...' : '🤖 Generate Strategy'}
              </button>
            ) : (
              <button
                onClick={handleCreateStrategy}
                disabled={isGenerating}
                className="w-full px-4 py-2.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isGenerating ? '⏳ Creating Strategy...' : '✅ Create Strategy'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
