'use client';

import { useState } from 'react';
import { useWorkspace } from './hooks/useWorkspace';
import { SourceBrowser } from './SourceBrowser';
import { TodoListPanel } from './TodoListPanel';
import { TodoBreakdown } from './TodoBreakdown';
import { WorkspaceTodo } from '@/lib/types/decide';

type SourceType = 'projects' | 'paste' | 'brainstorm' | 'meetings' | 'notes' | 'conversations';

export function TodoWorkspace() {
  const [breakdownTodo, setBreakdownTodo] = useState<WorkspaceTodo | null>(null);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [activeSource, setActiveSource] = useState<SourceType>('paste');

  const {
    todos,
    loading,
    error,
    createTodo,
    createBulkTodos,
    updateTodo,
    deleteTodo,
    clearWorkspace,
  } = useWorkspace();

  const handleAddTodos = async (texts: string[]) => {
    await createBulkTodos(texts, { ai_generated: false });
  };

  const handleApplyBreakdown = async (subtasks: string[]) => {
    if (!breakdownTodo) return;
    
    for (const subtask of subtasks) {
      await createTodo(subtask, {
        parent_id: breakdownTodo.id,
        is_breakdown: true,
        ai_generated: true,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Two-Column Layout */}
      <div className={`grid gap-6 transition-all ${isLeftCollapsed ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {/* Left Panel - Source Browser */}
        {!isLeftCollapsed && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 min-h-[600px]">
            <div className="relative h-full">
              <button
                onClick={() => setIsLeftCollapsed(true)}
                className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                title="Collapse sources panel"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
              <SourceBrowser 
                onAddTodos={handleAddTodos}
                activeSource={activeSource}
                onChangeSource={setActiveSource}
              />
            </div>
          </div>
        )}

        {/* Collapsed Left Panel Button */}
        {isLeftCollapsed && (
          <button
            onClick={() => setIsLeftCollapsed(false)}
            className="fixed left-4 top-1/2 -translate-y-1/2 z-10 bg-blue-600 text-white p-3 rounded-r-lg shadow-lg hover:bg-blue-700 transition-colors"
            title="Show sources panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Right Panel - TODO List */}
        <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 min-h-[600px] ${isLeftCollapsed ? 'col-span-1 mx-auto max-w-2xl w-full' : ''}`}>
          <TodoListPanel
            todos={todos}
            onCreateTodo={createTodo}
            onUpdateTodo={updateTodo}
            onDeleteTodo={deleteTodo}
            onBreakdown={setBreakdownTodo}
            onClearAll={clearWorkspace}
          />
        </div>
      </div>

      {/* Breakdown Modal */}
      {breakdownTodo && (
        <TodoBreakdown
          todo={breakdownTodo}
          onClose={() => setBreakdownTodo(null)}
          onApplyBreakdown={handleApplyBreakdown}
        />
      )}
    </div>
  );
}
