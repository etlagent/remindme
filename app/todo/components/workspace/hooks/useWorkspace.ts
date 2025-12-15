import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { WorkspaceTodo } from '@/lib/types/decide';

export function useWorkspace() {
  const [todos, setTodos] = useState<WorkspaceTodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = useCallback(async (status?: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const url = status 
        ? `/api/decide/workspace?status=${status}`
        : '/api/decide/workspace';

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch workspace todos');
      }

      // Build hierarchy (parent-child relationships)
      const todosMap = new Map<string, WorkspaceTodo>();
      (result.data || []).forEach((todo: WorkspaceTodo) => {
        todosMap.set(todo.id, { ...todo, subtasks: [] });
      });

      // Link children to parents
      const rootTodos: WorkspaceTodo[] = [];
      todosMap.forEach((todo) => {
        if (todo.parent_id) {
          const parent = todosMap.get(todo.parent_id);
          if (parent) {
            parent.subtasks = parent.subtasks || [];
            parent.subtasks.push(todo);
          }
        } else {
          rootTodos.push(todo);
        }
      });

      setTodos(rootTodos);
    } catch (err) {
      console.error('Error fetching workspace todos:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTodo = useCallback(async (
    text: string,
    options?: {
      parent_id?: string;
      is_breakdown?: boolean;
      ai_generated?: boolean;
      estimated_minutes?: number;
      source_type?: string;
      source_id?: string;
    }
  ) => {
    const tempId = `temp-${Date.now()}`;
    
    // Optimistic update
    const optimisticTodo: WorkspaceTodo = {
      id: tempId,
      text,
      status: 'draft',
      created_at: new Date().toISOString(),
      user_id: '',
      ai_generated: options?.ai_generated || false,
      order_index: 0,
      is_breakdown: options?.is_breakdown || false,
      parent_id: options?.parent_id,
      estimated_minutes: options?.estimated_minutes,
    };

    setTodos(prev => [...prev, optimisticTodo]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/decide/workspace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ text, ...options }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Remove optimistic update on error
        setTodos(prev => prev.filter(t => t.id !== tempId));
        throw new Error(result.error || 'Failed to create todo');
      }

      // Replace temp with real data
      setTodos(prev => prev.map(t => 
        t.id === tempId ? result.data : t
      ));
      
      return result.data;
    } catch (err) {
      console.error('Error creating todo:', err);
      setTodos(prev => prev.filter(t => t.id !== tempId));
      throw err;
    }
  }, []);

  const createBulkTodos = useCallback(async (texts: string[], options?: {
    ai_generated?: boolean;
    source_type?: string;
    source_id?: string;
  }) => {
    // Optimistic updates for all items
    const optimisticTodos: WorkspaceTodo[] = texts.map(text => ({
      id: `temp-${Date.now()}-${Math.random()}`,
      text,
      status: 'draft',
      created_at: new Date().toISOString(),
      user_id: '',
      ai_generated: options?.ai_generated || false,
      order_index: 0,
      is_breakdown: false,
    }));

    setTodos(prev => [...prev, ...optimisticTodos]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const promises = texts.map(text => 
        fetch('/api/decide/workspace', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ text, ...options }),
        })
      );

      const responses = await Promise.all(promises);
      const results = await Promise.all(responses.map(r => r.json()));

      // Replace temp IDs with real data
      const tempIds = optimisticTodos.map(t => t.id);
      setTodos(prev => {
        const filtered = prev.filter(t => !tempIds.includes(t.id));
        const realTodos = results.filter(r => r.success).map(r => r.data);
        return [...filtered, ...realTodos];
      });
    } catch (err) {
      console.error('Error creating bulk todos:', err);
      // Remove optimistic updates on error
      const tempIds = optimisticTodos.map(t => t.id);
      setTodos(prev => prev.filter(t => !tempIds.includes(t.id)));
      throw err;
    }
  }, []);

  const updateTodo = useCallback(async (
    id: string,
    updates: {
      text?: string;
      order_index?: number;
      status?: 'draft' | 'ready' | 'converted';
      estimated_minutes?: number;
    }
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/decide/workspace/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(updates),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update todo');
      }

      // Update local state
      setTodos(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
      return result.data;
    } catch (err) {
      console.error('Error updating todo:', err);
      throw err;
    }
  }, []);

  const deleteTodo = useCallback(async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/decide/workspace/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete todo');
      }

      setTodos(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting todo:', err);
      throw err;
    }
  }, []);

  const clearWorkspace = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/decide/workspace', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to clear workspace');
      }

      setTodos([]);
    } catch (err) {
      console.error('Error clearing workspace:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  return {
    todos,
    loading,
    error,
    fetchTodos,
    createTodo,
    createBulkTodos,
    updateTodo,
    deleteTodo,
    clearWorkspace,
  };
}
