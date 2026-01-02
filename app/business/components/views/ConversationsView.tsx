'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BusinessWithRelations, Person } from '@/lib/types';

interface ConversationsViewProps {
  business: BusinessWithRelations | null;
  allPeople: Person[];
  conversationStrategies: any[];
  setConversationStrategies: (strategies: any[]) => void;
  selectedStrategy: any | null;
  setSelectedStrategy: (strategy: any | null) => void;
  newStrategy: {
    situation: string;
    goal: string;
    contextSources: string[];
    attendeeIds: string[];
  };
  setNewStrategy: (strategy: {
    situation: string;
    goal: string;
    contextSources: string[];
    attendeeIds: string[];
  }) => void;
  conversationSteps: any[];
  setConversationSteps: (steps: any[]) => void;
  isGeneratingStrategy: boolean;
  setIsGeneratingStrategy: (isGenerating: boolean) => void;
  clarifyingQuestions: string[];
  setClarifyingQuestions: (questions: string[]) => void;
  clarifyingAnswers: {[key: number]: string};
  setClarifyingAnswers: (answers: {[key: number]: string}) => void;
  isBuildFormCollapsed: boolean;
  setIsBuildFormCollapsed: (isCollapsed: boolean) => void;
}

export default function ConversationsView(props: ConversationsViewProps) {
  const {
    business,
    allPeople,
    conversationStrategies,
    setConversationStrategies,
    selectedStrategy,
    setSelectedStrategy,
    newStrategy,
    setNewStrategy,
    conversationSteps,
    setConversationSteps,
    isGeneratingStrategy,
    setIsGeneratingStrategy,
    clarifyingQuestions,
    setClarifyingQuestions,
    clarifyingAnswers,
    setClarifyingAnswers,
    isBuildFormCollapsed,
    setIsBuildFormCollapsed
  } = props;

  const contextOptions = [
    { id: 'linkedin', label: 'LinkedIn Profile', icon: '💼' },
    { id: 'conversations', label: 'Previous Conversations', icon: '💬' },
    { id: 'meetings', label: 'Meeting Notes', icon: '📝' },
    { id: 'notes', label: 'Business Notes', icon: '📋' },
    { id: 'memories', label: 'Memories', icon: '🧠' }
  ];

  const toggleContextSource = (sourceId: string) => {
    setNewStrategy({
      ...newStrategy,
      contextSources: newStrategy.contextSources.includes(sourceId)
        ? newStrategy.contextSources.filter(id => id !== sourceId)
        : [...newStrategy.contextSources, sourceId]
    });
  };

  // Check if we have steps to show horizontal layout
  const hasSteps = conversationSteps.length > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Conversation Strategy</h2>
        {(conversationSteps.length > 0 || newStrategy.situation || newStrategy.goal) && (
          <button
            onClick={() => {
              // Clear everything to start fresh
              setNewStrategy({
                situation: '',
                goal: '',
                contextSources: [],
                attendeeIds: []
              });
              setClarifyingQuestions([]);
              setClarifyingAnswers({});
              setConversationSteps([]);
              setSelectedStrategy(null);
            }}
            className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 border border-blue-300 rounded-md hover:bg-blue-50"
          >
            + New Strategy
          </button>
        )}
      </div>
      {!business ? (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-2">No business selected</p>
          <p className="text-sm">Select a business to build conversation strategies</p>
        </div>
      ) : hasSteps ? (
        /* Horizontal Layout with Steps */
        <div className="space-y-4">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {/* Form Card - Collapsible */}
            <div className={`flex-shrink-0 ${isBuildFormCollapsed ? 'w-12' : 'w-64'} space-y-4 transition-all duration-200`}>
              {/* Context Builder Form */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                {/* Collapsible Header */}
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
                
                {/* Collapsible Content */}
                {!isBuildFormCollapsed && (
                  <div className="p-4">
            {/* Context Sources */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Context Sources
              </label>
              <div className="space-y-1">
                {contextOptions.map((option) => (
                  <label key={option.id} className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={newStrategy.contextSources.includes(option.id)}
                      onChange={() => toggleContextSource(option.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-base">{option.icon}</span>
                    <span className="text-xs text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Situation Input */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Your Situation
              </label>
              <textarea
                value={newStrategy.situation}
                onChange={(e) => setNewStrategy({ ...newStrategy, situation: e.target.value })}
                placeholder="Describe the current situation, concerns, or context..."
                className="w-full px-2.5 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                rows={3}
              />
              <p className="text-xs text-gray-400 mt-0.5">
                What's happening? What concerns do they have? What's the background?
              </p>
            </div>

            {/* Goal Input */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Your Goal
              </label>
              <textarea
                value={newStrategy.goal}
                onChange={(e) => setNewStrategy({ ...newStrategy, goal: e.target.value })}
                placeholder="What do you want to achieve in this conversation?"
                className="w-full px-2.5 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                rows={2}
              />
              <p className="text-xs text-gray-400 mt-0.5">
                What's the desired outcome? Where do you want to move the conversation?
              </p>
            </div>

            {/* Clarifying Questions - Show after initial generation */}
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

            {/* Generate Button - Collapsed view uses same logic as vertical */}
            {clarifyingQuestions.length === 0 ? (
              <button
                onClick={async () => {
                  if (!business || isGeneratingStrategy) return;
                  setIsGeneratingStrategy(true);
                  try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) {
                      alert('Please log in to generate strategies');
                      setIsGeneratingStrategy(false);
                      return;
                    }

                    const response = await fetch('/api/conversations/generate-questions', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`
                      },
                      body: JSON.stringify({
                        business_id: business.id,
                        situation: newStrategy.situation,
                        goal: newStrategy.goal,
                        context_sources: newStrategy.contextSources
                      })
                    });

                    const result = await response.json();

                    if (result.success && result.questions) {
                      if (result.questions.length === 0) {
                        const strategyResponse = await fetch('/api/conversations/generate-strategy', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.access_token}`
                          },
                          body: JSON.stringify({
                            business_id: business.id,
                            situation: newStrategy.situation,
                            goal: newStrategy.goal,
                            context_sources: newStrategy.contextSources,
                            clarifying_qa: []
                          })
                        });

                        const strategyResult = await strategyResponse.json();

                        if (strategyResult.success && strategyResult.steps) {
                          setConversationSteps(strategyResult.steps);
                          setConversationStrategies([strategyResult.strategy, ...conversationStrategies]);
                        } else {
                          alert(`Error: ${strategyResult.error || 'Failed to generate strategy'}`);
                        }
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
                    setIsGeneratingStrategy(false);
                  }
                }}
                disabled={!newStrategy.goal && !newStrategy.situation || isGeneratingStrategy}
                className="w-full px-4 py-2.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isGeneratingStrategy ? '⏳ Analyzing...' : '🤖 Generate Strategy'}
              </button>
            ) : (
              <button
                onClick={async () => {
                  if (!business || isGeneratingStrategy) return;
                  setIsGeneratingStrategy(true);
                  try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) {
                      alert('Please log in to generate strategies');
                      setIsGeneratingStrategy(false);
                      return;
                    }

                    const clarifying_qa = clarifyingQuestions.map((q, i) => ({
                      question: q,
                      answer: clarifyingAnswers[i] || ''
                    })).filter(qa => qa.answer);

                    const response = await fetch('/api/conversations/generate-strategy', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`
                      },
                      body: JSON.stringify({
                        business_id: business.id,
                        situation: newStrategy.situation,
                        goal: newStrategy.goal,
                        context_sources: newStrategy.contextSources,
                        clarifying_qa
                      })
                    });

                    const result = await response.json();

                    if (result.success && result.steps) {
                      setConversationSteps(result.steps);
                      setConversationStrategies([result.strategy, ...conversationStrategies]);
                    } else {
                      alert(`Error: ${result.error || 'Failed to generate strategy'}`);
                    }
                  } catch (error) {
                    console.error('Error generating strategy:', error);
                    alert('Failed to generate strategy');
                  } finally {
                    setIsGeneratingStrategy(false);
                  }
                }}
                disabled={isGeneratingStrategy}
                className="w-full px-4 py-2.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isGeneratingStrategy ? '⏳ Creating Strategy...' : '✅ Create Strategy'}
              </button>
            )}
                  </div>
                )}
              </div>
            </div>

            {/* Step Cards - Horizontal */}
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
                placeholder="Describe this step..."
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs mb-3 resize-y whitespace-pre-wrap"
                rows={20}
              />
              <button
                onClick={() => {
                  alert('AI suggestion for this step - Coming soon!');
                }}
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
          
          {/* Saved Strategies - Always visible below steps */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Strategies</h3>
            {conversationStrategies.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No strategies yet</p>
                <p className="text-xs mt-1">Create your first conversation strategy above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {conversationStrategies.map((strategy) => (
                  <div
                    key={strategy.id}
                    onClick={async () => {
                      setSelectedStrategy(strategy);
                      
                      // Load strategy context back into form
                      setNewStrategy({
                        situation: strategy.situation || '',
                        goal: strategy.goal || '',
                        contextSources: strategy.context_sources || [],
                        attendeeIds: strategy.attendee_ids || []
                      });
                      
                      // Load clarifying Q&A if exists
                      if (strategy.clarifying_qa && strategy.clarifying_qa.length > 0) {
                        const questions = strategy.clarifying_qa.map((qa: any) => qa.question);
                        const answers: {[key: number]: string} = {};
                        strategy.clarifying_qa.forEach((qa: any, index: number) => {
                          answers[index] = qa.answer;
                        });
                        setClarifyingQuestions(questions);
                        setClarifyingAnswers(answers);
                      } else {
                        setClarifyingQuestions([]);
                        setClarifyingAnswers({});
                      }
                      
                      // Load steps from database
                      const { data: steps } = await supabase
                        .from('meeting_conversation_steps')
                        .select('*')
                        .eq('strategy_id', strategy.id)
                        .order('step_order', { ascending: true });
                      
                      if (steps) {
                        setConversationSteps(steps);
                      }
                    }}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors"
                  >
                    <h4 className="font-medium text-gray-900 text-sm mb-1">
                      {strategy.title || 'Untitled Strategy'}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {new Date(strategy.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Vertical Layout - No Steps Yet */
        <div className="space-y-6">
          {/* Context Builder Form - Collapsible */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            {/* Collapsible Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Build Strategy</h3>
              <button
                onClick={() => setIsBuildFormCollapsed(!isBuildFormCollapsed)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-xl"
                title={isBuildFormCollapsed ? 'Expand' : 'Collapse'}
              >
                {isBuildFormCollapsed ? '▼' : '▲'}
              </button>
            </div>
            
            {/* Collapsible Content */}
            {!isBuildFormCollapsed && (
              <div className="p-4">
            {/* Context Sources */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Context Sources
              </label>
              <div className="space-y-1">
                {contextOptions.map((option) => (
                  <label key={option.id} className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={newStrategy.contextSources.includes(option.id)}
                      onChange={() => toggleContextSource(option.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-base">{option.icon}</span>
                    <span className="text-xs text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Situation Input */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Your Situation
              </label>
              <textarea
                value={newStrategy.situation}
                onChange={(e) => setNewStrategy({ ...newStrategy, situation: e.target.value })}
                placeholder="Describe the current situation, concerns, or context..."
                className="w-full px-2.5 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                rows={3}
              />
              <p className="text-xs text-gray-400 mt-0.5">
                What's happening? What concerns do they have? What's the background?
              </p>
            </div>

            {/* Goal Input */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Your Goal
              </label>
              <textarea
                value={newStrategy.goal}
                onChange={(e) => setNewStrategy({ ...newStrategy, goal: e.target.value })}
                placeholder="What do you want to achieve in this conversation?"
                className="w-full px-2.5 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                rows={2}
              />
              <p className="text-xs text-gray-400 mt-0.5">
                What's the desired outcome? Where do you want to move the conversation?
              </p>
            </div>

            {/* Clarifying Questions - Show after initial generation */}
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

            {/* Generate Button - Phase 1: Get Questions */}
            {clarifyingQuestions.length === 0 ? (
              <button
                onClick={async () => {
                  if (!business || isGeneratingStrategy) return;

                  setIsGeneratingStrategy(true);
                  try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) {
                      alert('Please log in to generate strategies');
                      setIsGeneratingStrategy(false);
                      return;
                    }

                    const response = await fetch('/api/conversations/generate-questions', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`
                      },
                      body: JSON.stringify({
                        business_id: business.id,
                        situation: newStrategy.situation,
                        goal: newStrategy.goal,
                        context_sources: newStrategy.contextSources
                      })
                    });

                    const result = await response.json();

                    if (result.success && result.questions) {
                      // If no questions needed, skip straight to strategy generation
                      if (result.questions.length === 0) {
                        // AI has enough info - proceed directly to strategy
                        const strategyResponse = await fetch('/api/conversations/generate-strategy', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.access_token}`
                          },
                          body: JSON.stringify({
                            business_id: business.id,
                            situation: newStrategy.situation,
                            goal: newStrategy.goal,
                            context_sources: newStrategy.contextSources,
                            clarifying_qa: []
                          })
                        });

                        const strategyResult = await strategyResponse.json();
                        console.log('Strategy Result:', strategyResult);
                        console.log('Steps from API:', strategyResult.steps);

                        if (strategyResult.success && strategyResult.steps) {
                          console.log('Setting steps:', strategyResult.steps);
                          setConversationSteps(strategyResult.steps);
                          setConversationStrategies([strategyResult.strategy, ...conversationStrategies]);
                          
                          // Keep form populated so user can see what was used and regenerate steps
                          // Don't clear the form anymore
                        } else {
                          alert(`Error: ${strategyResult.error || 'Failed to generate strategy'}`);
                        }
                      } else {
                        // AI needs clarification - show questions
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
                    setIsGeneratingStrategy(false);
                  }
                }}
                disabled={!newStrategy.goal && !newStrategy.situation || isGeneratingStrategy}
                className="w-full px-4 py-2.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isGeneratingStrategy ? '⏳ Analyzing...' : '🤖 Generate Strategy'}
              </button>
            ) : (
              /* Phase 2: Show Questions and Generate Final Strategy */
              <button
                onClick={async () => {
                  if (!business || isGeneratingStrategy) return;

                  setIsGeneratingStrategy(true);
                  try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) {
                      alert('Please log in to generate strategies');
                      setIsGeneratingStrategy(false);
                      return;
                    }

                    // Build Q&A array
                    const clarifying_qa = clarifyingQuestions.map((q, i) => ({
                      question: q,
                      answer: clarifyingAnswers[i] || ''
                    })).filter(qa => qa.answer); // Only include answered questions

                    const response = await fetch('/api/conversations/generate-strategy', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`
                      },
                      body: JSON.stringify({
                        business_id: business.id,
                        situation: newStrategy.situation,
                        goal: newStrategy.goal,
                        context_sources: newStrategy.contextSources,
                        clarifying_qa
                      })
                    });

                    const result = await response.json();
                    console.log('Final Strategy Result:', result);
                    console.log('Final Steps from API:', result.steps);

                    if (result.success && result.steps) {
                      console.log('Setting final steps:', result.steps);
                      setConversationSteps(result.steps);
                      setConversationStrategies([result.strategy, ...conversationStrategies]);
                      
                      // Keep form and questions populated for potential step regeneration
                      // Don't clear anymore - user can see full context
                    } else {
                      alert(`Error: ${result.error || 'Failed to generate strategy'}`);
                    }
                  } catch (error) {
                    console.error('Error generating strategy:', error);
                    alert('Failed to generate strategy');
                  } finally {
                    setIsGeneratingStrategy(false);
                  }
                }}
                disabled={isGeneratingStrategy}
                className="w-full px-4 py-2.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isGeneratingStrategy ? '⏳ Creating Strategy...' : '✅ Create Strategy'}
              </button>
            )}
              </div>
            )}
          </div>

          {/* Saved Strategies */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Strategies</h3>
            {conversationStrategies.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No strategies yet</p>
                <p className="text-xs mt-1">Create your first conversation strategy above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {conversationStrategies.map((strategy) => (
                  <div
                    key={strategy.id}
                    onClick={async () => {
                      setSelectedStrategy(strategy);
                      
                      // Load strategy context back into form
                      setNewStrategy({
                        situation: strategy.situation || '',
                        goal: strategy.goal || '',
                        contextSources: strategy.context_sources || [],
                        attendeeIds: strategy.attendee_ids || []
                      });
                      
                      // Load clarifying Q&A if exists
                      if (strategy.clarifying_qa && strategy.clarifying_qa.length > 0) {
                        const questions = strategy.clarifying_qa.map((qa: any) => qa.question);
                        const answers: {[key: number]: string} = {};
                        strategy.clarifying_qa.forEach((qa: any, index: number) => {
                          answers[index] = qa.answer;
                        });
                        setClarifyingQuestions(questions);
                        setClarifyingAnswers(answers);
                      } else {
                        setClarifyingQuestions([]);
                        setClarifyingAnswers({});
                      }
                      
                      // Load steps from database
                      const { data: steps } = await supabase
                        .from('meeting_conversation_steps')
                        .select('*')
                        .eq('strategy_id', strategy.id)
                        .order('step_order', { ascending: true });
                      
                      if (steps) {
                        setConversationSteps(steps);
                      }
                    }}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors"
                  >
                    <h4 className="font-medium text-gray-900 text-sm mb-1">
                      {strategy.title || 'Untitled Strategy'}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {new Date(strategy.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
