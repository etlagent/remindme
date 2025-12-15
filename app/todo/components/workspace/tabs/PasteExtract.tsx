'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ExtractedTodo {
  text: string;
  priority: 'high' | 'medium' | 'low';
  estimatedMinutes?: number;
  selected: boolean;
}

interface PasteExtractProps {
  onCreateBulk: (todos: string[]) => Promise<void>;
}

export function PasteExtract({ onCreateBulk }: PasteExtractProps) {
  const [inputText, setInputText] = useState('');
  const [extractedTodos, setExtractedTodos] = useState<ExtractedTodo[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleExtract = async () => {
    if (!inputText.trim()) return;

    setIsExtracting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/decide/workspace/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ text: inputText }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to extract action items');
      }

      const todos = result.data.todos.map((text: string, idx: number) => ({
        text,
        priority: result.data.priorities[idx] || 'medium',
        estimatedMinutes: result.data.estimatedMinutes[idx] || null,
        selected: true,
      }));

      setExtractedTodos(todos);
    } catch (error) {
      console.error('Error extracting todos:', error);
      alert('Failed to extract action items. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAddSelected = async () => {
    const selected = extractedTodos.filter(t => t.selected);
    if (selected.length === 0) return;

    setIsAdding(true);
    try {
      await onCreateBulk(selected.map(t => t.text));
      setInputText('');
      setExtractedTodos([]);
    } catch (error) {
      console.error('Error adding todos:', error);
      alert('Failed to add TODOs. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const toggleTodo = (index: number) => {
    setExtractedTodos(prev => 
      prev.map((todo, idx) => 
        idx === index ? { ...todo, selected: !todo.selected } : todo
      )
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const selectedCount = extractedTodos.filter(t => t.selected).length;

  return (
    <div className="space-y-4">
      {/* Paste Area */}
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Paste Meeting Notes, Emails, or Any Text
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste your meeting notes, Granola summaries, emails, or any text here...

Example:
- Meeting with Sarah about Q4 roadmap
- Need to finalize the dashboard by Friday
- Follow up on the contract with legal team
- Schedule demo for next week"
          className="w-full h-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white resize-none text-sm"
        />
        
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleExtract}
            disabled={!inputText.trim() || isExtracting}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isExtracting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c-.25.78.062 1.634.769 2.094A3.99 3.99 0 007 15a3.99 3.99 0 002.049-.58c.707-.46 1.019-1.314.769-2.094l-.818-2.552c-.25-.78-.62-1.45-1.051-2.033a1 1 0 00-1.898 0c-.43.582-.8 1.253-1.051 2.033z" />
                </svg>
                Extract Action Items
              </>
            )}
          </button>
          
          <button
            onClick={() => {
              setInputText('');
              setExtractedTodos([]);
            }}
            disabled={!inputText.trim() && extractedTodos.length === 0}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Clear
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          AI will analyze the text and extract actionable tasks with priorities
        </p>
      </div>

      {/* Extracted TODOs */}
      {extractedTodos.length > 0 && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              AI Detected {extractedTodos.length} Action Items
            </h3>
            <button
              onClick={handleAddSelected}
              disabled={selectedCount === 0 || isAdding}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-2"
            >
              {isAdding ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  Add Selected ({selectedCount})
                </>
              )}
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {extractedTodos.map((todo, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  todo.selected 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' 
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
                onClick={() => toggleTodo(idx)}
              >
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    todo.selected 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {todo.selected && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-gray-100 break-words">
                    {todo.text}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(todo.priority)}`}>
                      {todo.priority.toUpperCase()}
                    </span>
                    {todo.estimatedMinutes && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ~{todo.estimatedMinutes} min
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Click items to select/deselect</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const allSelected = extractedTodos.every(t => t.selected);
                  setExtractedTodos(prev => prev.map(t => ({ ...t, selected: !allSelected })));
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {extractedTodos.every(t => t.selected) ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {extractedTodos.length === 0 && !isExtracting && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm">Paste your notes above and click "Extract Action Items"</p>
          <p className="text-xs mt-1">AI will identify and extract actionable tasks</p>
        </div>
      )}
    </div>
  );
}
