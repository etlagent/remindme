'use client';

import { useState, useRef, useEffect } from 'react';
import { WorkspaceTodo } from '@/lib/types/decide';

interface QuickCaptureProps {
  todos: WorkspaceTodo[];
  onCreateTodo: (text: string) => Promise<void>;
  onCreateBulk: (texts: string[]) => Promise<void>;
  onUpdateTodo: (id: string, updates: any) => Promise<void>;
  onDeleteTodo: (id: string) => Promise<void>;
  onBreakdown?: (todo: WorkspaceTodo) => void;
}

export function QuickCapture({
  todos,
  onCreateTodo,
  onCreateBulk,
  onUpdateTodo,
  onDeleteTodo,
  onBreakdown,
}: QuickCaptureProps) {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleAddTodo = async () => {
    if (!inputText.trim()) return;

    try {
      await onCreateTodo(inputText.trim());
      setInputText('');
      textareaRef.current?.focus();
    } catch (error) {
      console.error('Error adding todo:', error);
      alert('Failed to add TODO. Please try again.');
    }
  };

  const handleParseBullet = async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    try {
      // Split by bullet points (•, -, *, 1., 2., etc.)
      const lines = inputText.split('\n');
      const todos: string[] = [];

      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        // Remove bullet markers
        const cleaned = trimmed
          .replace(/^[•\-*]\s+/, '') // Remove •, -, * bullets
          .replace(/^\d+\.\s+/, '')  // Remove numbered bullets
          .trim();

        if (cleaned) {
          todos.push(cleaned);
        }
      });

      if (todos.length > 0) {
        await onCreateBulk(todos);
        setInputText('');
        textareaRef.current?.focus();
      }
    } catch (error) {
      console.error('Error parsing bullets:', error);
      alert('Failed to create TODOs. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleParseBullet();
    }
  };

  return (
    <div className="space-y-4">
      {/* Input Area */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Quick Capture
        </label>
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type or paste your TODOs here... 
• Use bullet points for multiple items
• One item per line
• Press Cmd+Enter to add all"
          className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white resize-none font-mono text-sm"
        />
        
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleParseBullet}
            disabled={!inputText.trim() || isProcessing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add TODOs
              </>
            )}
          </button>
          
          <button
            onClick={() => setInputText('')}
            disabled={!inputText.trim()}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Clear
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Tip: Each line becomes a separate TODO. Supports bullets (•, -, *) and numbered lists (1., 2., 3.)
        </p>
      </div>

      {/* Preview of TODOs */}
      {todos.length > 0 && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              TODOs Ready ({todos.length})
            </h3>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-gray-100 break-words">
                    {todo.text}
                  </p>
                  {todo.ai_generated && (
                    <span className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 mt-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c-.25.78.062 1.634.769 2.094A3.99 3.99 0 007 15a3.99 3.99 0 002.049-.58c.707-.46 1.019-1.314.769-2.094l-.818-2.552c-.25-.78-.62-1.45-1.051-2.033a1 1 0 00-1.898 0c-.43.582-.8 1.253-1.051 2.033z" />
                      </svg>
                      AI Generated
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onBreakdown && (
                    <button
                      onClick={() => onBreakdown(todo)}
                      className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900 rounded text-blue-600 dark:text-blue-400"
                      title="Break down into steps"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </button>
                  )}
                  
                  <button
                    onClick={() => onDeleteTodo(todo.id)}
                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600 dark:text-red-400"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {todos.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-sm">No TODOs yet. Start typing above to add your first items!</p>
        </div>
      )}
    </div>
  );
}
