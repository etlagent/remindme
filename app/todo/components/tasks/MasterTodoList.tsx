'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { WorkspaceTodo } from '@/lib/types/decide';

interface MasterTodoListProps {
  excludeIds?: Set<string>;
}

export function MasterTodoList({ excludeIds = new Set() }: MasterTodoListProps) {
  const [todos, setTodos] = useState<WorkspaceTodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState('');
  const [creating, setCreating] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch('/api/decide/workspace', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();
      if (result.success && result.data) {
        // Filter out tasks that are already scheduled (have a scheduled_for date)
        const unscheduledTasks = result.data.filter((todo: WorkspaceTodo) => !todo.scheduled_for);
        setTodos(unscheduledTasks);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTodo = async () => {
    if (!newTodo.trim() || creating) return;

    const text = newTodo.trim();
    const tempId = `temp-${Date.now()}`;
    
    // Optimistic update
    const optimisticTodo: WorkspaceTodo = {
      id: tempId,
      text,
      status: 'draft',
      created_at: new Date().toISOString(),
      user_id: '',
      ai_generated: false,
      order_index: 0,
      is_breakdown: false,
    };

    setTodos(prev => [...prev, optimisticTodo]);
    setNewTodo('');

    try {
      setCreating(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch('/api/decide/workspace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          text,
          status: 'draft',
        }),
      });

      const result = await response.json();

      if (response.ok && result.data) {
        // Replace temp with real data
        setTodos(prev => prev.map(t => 
          t.id === tempId ? result.data : t
        ));
      } else {
        // Remove optimistic update on error
        setTodos(prev => prev.filter(t => t.id !== tempId));
        alert('Failed to create TODO. Please try again.');
      }
    } catch (error) {
      console.error('Error creating todo:', error);
      setTodos(prev => prev.filter(t => t.id !== tempId));
      alert('Failed to create TODO. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleSelect = (todoId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(todoId)) {
        newSet.delete(todoId);
      } else {
        newSet.add(todoId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === todos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(todos.map(t => t.id)));
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    console.log('Deleting todo:', todoId);
    
    // Optimistically remove from UI
    setTodos(prev => prev.filter(t => t.id !== todoId));
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(todoId);
      return newSet;
    });

    // If it's a temporary ID, don't try to delete from server
    if (todoId.startsWith('temp-')) {
      console.log('Skipping server delete for temp ID:', todoId);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error('No session token available');
        return;
      }

      console.log('Deleting from server:', todoId);
      const response = await fetch(`/api/decide/workspace/${todoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        console.error('Error deleting todo from server, status:', response.status);
        const result = await response.json();
        console.error('Server error:', result);
        // Refetch to restore accurate state
        await fetchTodos();
      } else {
        console.log('Successfully deleted from server');
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
      // Refetch to restore accurate state
      await fetchTodos();
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    if (!window.confirm(`Delete ${selectedIds.size} selected task${selectedIds.size > 1 ? 's' : ''}?`)) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      await Promise.all(
        Array.from(selectedIds).map(id =>
          fetch(`/api/decide/workspace/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          })
        )
      );

      setTodos(prev => prev.filter(t => !selectedIds.has(t.id)));
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Error deleting todos:', error);
      alert('Failed to delete some tasks. Please try again.');
    }
  };

  const handleDragStart = (e: React.DragEvent, todo: WorkspaceTodo) => {
    // If dragging a selected item, drag all selected items
    if (selectedIds.has(todo.id) && selectedIds.size > 1) {
      const selectedTodos = todos.filter(t => selectedIds.has(t.id));
      e.dataTransfer.setData('todos', JSON.stringify(selectedTodos));
      e.dataTransfer.setData('count', selectedIds.size.toString());
    } else {
      e.dataTransfer.setData('todo', JSON.stringify(todo));
    }
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 min-h-[600px]">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          All TODOs
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Drag any task to the calendar to schedule it
        </p>
      </div>

      {/* Quick Add TODO */}
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateTodo();
            }}
            placeholder="Quick add TODO..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            disabled={creating}
          />
          <button
            onClick={handleCreateTodo}
            disabled={!newTodo.trim() || creating}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {creating ? '...' : 'Add'}
          </button>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Press Enter to add quickly
        </p>
      </div>

      {/* Instructions */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Drag tasks from here to the calendar to schedule them for specific days
          </p>
        </div>
      </div>

      {/* TODO List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : todos.filter(t => !excludeIds.has(t.id)).length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <p className="text-sm font-medium mb-1">No TODOs to schedule</p>
          <p className="text-xs">Add TODOs from the workspace above</p>
        </div>
      ) : (
        <div className="space-y-2">
          {todos.filter(t => !excludeIds.has(t.id)).map((todo) => (
            <div
              key={todo.id}
              draggable
              onDragStart={(e) => handleDragStart(e, todo)}
              className="group relative p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all"
              style={{ cursor: 'grab' }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-gray-100 break-words">
                    {todo.text}
                  </p>
                  {todo.project_id && (
                    <span className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 mt-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                      </svg>
                      Project
                    </span>
                  )}
                  {todo.ai_generated && (
                    <span className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 mt-1 ml-2">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c-.25.78.062 1.634.769 2.094A3.99 3.99 0 007 15a3.99 3.99 0 002.049-.58c.707-.46 1.019-1.314.769-2.094l-.818-2.552c-.25-.78-.62-1.45-1.051-2.033a1 1 0 00-1.898 0c-.43.582-.8 1.253-1.051 2.033z" />
                      </svg>
                      AI
                    </span>
                  )}
                </div>
                <button
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleDeleteTodo(todo.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600"
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
      )}

      {/* Count */}
      {todos.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {todos.length} {todos.length === 1 ? 'task' : 'tasks'} ready to schedule
          </p>
        </div>
      )}
    </div>
  );
}
