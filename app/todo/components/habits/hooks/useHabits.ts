import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Habit } from '@/lib/types/decide';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/decide/habits', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch habits');
      }

      setHabits(result.data || []);
    } catch (err) {
      console.error('Error fetching habits:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch habits');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const createHabit = useCallback(async (name: string, orderIndex?: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/decide/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ name, order_index: orderIndex }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create habit');
      }

      setHabits(prev => [...prev, result.data]);
      return result.data;
    } catch (err) {
      console.error('Error creating habit:', err);
      throw err;
    }
  }, [supabase]);

  const updateHabit = useCallback(async (
    id: string, 
    updates: { name?: string; order_index?: number; is_active?: boolean }
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/decide/habits/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(updates),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update habit');
      }

      setHabits(prev => prev.map(h => h.id === id ? result.data : h));
      return result.data;
    } catch (err) {
      console.error('Error updating habit:', err);
      throw err;
    }
  }, [supabase]);

  const deleteHabit = useCallback(async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/decide/habits/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete habit');
      }

      setHabits(prev => prev.filter(h => h.id !== id));
    } catch (err) {
      console.error('Error deleting habit:', err);
      throw err;
    }
  }, [supabase]);

  const reorderHabits = useCallback(async (reorderedHabits: Habit[]) => {
    const previousHabits = [...habits];
    
    // Optimistic update
    setHabits(reorderedHabits);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      // Update order_index for all affected habits
      const updates = reorderedHabits.map((habit, index) => 
        updateHabit(habit.id, { order_index: index })
      );

      await Promise.all(updates);
    } catch (err) {
      console.error('Error reordering habits:', err);
      // Revert on error
      setHabits(previousHabits);
      throw err;
    }
  }, [habits, supabase, updateHabit]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  return {
    habits,
    loading,
    error,
    fetchHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    reorderHabits,
  };
}
