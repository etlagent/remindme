'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { WorkspaceTodo } from '@/lib/types/decide';

interface TodoBreakdownProps {
  todo: WorkspaceTodo;
  onClose: () => void;
  onApplyBreakdown: (subtasks: string[]) => Promise<void>;
}

interface Subtask {
  step: string;
  estimatedMinutes?: number;
  details?: string;
}

export function TodoBreakdown({ todo, onClose, onApplyBreakdown }: TodoBreakdownProps) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [totalMinutes, setTotalMinutes] = useState<number | null>(null);
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleBreakdown = async () => {
    setIsBreakingDown(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/decide/workspace/breakdown', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ task: todo.text }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to break down task');
      }

      setSubtasks(result.data.subtasks || []);
      setTotalMinutes(result.data.totalMinutes);
      setSuggestion(result.data.suggestion);
      setHasGenerated(true);
    } catch (error) {
      console.error('Error breaking down task:', error);
      alert('Failed to break down task. Please try again.');
    } finally {
      setIsBreakingDown(false);
    }
  };

  const handleApply = async () => {
    if (subtasks.length === 0) return;

    setIsApplying(true);
    try {
      const steps = subtasks.map(st => st.step);
      await onApplyBreakdown(steps);
      onClose();
    } catch (error) {
      console.error('Error applying breakdown:', error);
      alert('Failed to apply breakdown. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  const editSubtask = (index: number, newText: string) => {
    setSubtasks(prev => prev.map((st, idx) => 
      idx === index ? { ...st, step: newText } : st
    ));
  };

  const removeSubtask = (index: number) => {
    setSubtasks(prev => prev.filter((_, idx) => idx !== index));
  };

  const formatTime = (minutes: number | undefined) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Break Down Task
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 break-words">
                {todo.text}
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!hasGenerated ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                AI will analyze this task and break it down into smaller, manageable steps
              </p>
              <button
                onClick={handleBreakdown}
                disabled={isBreakingDown}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 mx-auto"
              >
                {isBreakingDown ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c-.25.78.062 1.634.769 2.094A3.99 3.99 0 007 15a3.99 3.99 0 002.049-.58c.707-.46 1.019-1.314.769-2.094l-.818-2.552c-.25-.78-.62-1.45-1.051-2.033a1 1 0 00-1.898 0c-.43.582-.8 1.253-1.051 2.033z" />
                    </svg>
                    Generate Breakdown
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Suggestion */}
              {suggestion && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                        AI Suggestion
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {suggestion}
                      </p>
                      {totalMinutes && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                          Estimated total time: {formatTime(totalMinutes)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Subtasks */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Steps ({subtasks.length})
                </h3>
                <div className="space-y-3">
                  {subtasks.map((subtask, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-semibold">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={subtask.step}
                            onChange={(e) => editSubtask(idx, e.target.value)}
                            className="w-full bg-transparent border-none focus:outline-none text-sm text-gray-900 dark:text-gray-100 p-0"
                          />
                          {(subtask.estimatedMinutes || subtask.details) && (
                            <div className="mt-2 space-y-1">
                              {subtask.estimatedMinutes && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  ⏱️ {formatTime(subtask.estimatedMinutes)}
                                </p>
                              )}
                              {subtask.details && (
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {subtask.details}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeSubtask(idx)}
                          className="flex-shrink-0 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regenerate */}
              <button
                onClick={handleBreakdown}
                disabled={isBreakingDown}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isBreakingDown ? 'Regenerating...' : 'Regenerate Breakdown'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {hasGenerated && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={subtasks.length === 0 || isApplying}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isApplying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Apply Breakdown
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
