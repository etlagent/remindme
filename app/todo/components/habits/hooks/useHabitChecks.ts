import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { HabitCheck } from '@/lib/types/decide';

interface UseHabitChecksOptions {
  startDate: string; // 'YYYY-MM-DD'
  endDate: string;   // 'YYYY-MM-DD'
}

export function useHabitChecks({ startDate, endDate }: UseHabitChecksOptions) {
  const [checks, setChecks] = useState<Map<string, HabitCheck>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChecks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `/api/decide/habits/check?start_date=${startDate}&end_date=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch habit checks');
      }

      // Convert array to Map for quick lookups
      const checksMap = new Map<string, HabitCheck>();
      (result.data || []).forEach((check: HabitCheck) => {
        const key = `${check.habit_id}_${check.date}`;
        checksMap.set(key, check);
      });

      setChecks(checksMap);
    } catch (err) {
      console.error('Error fetching habit checks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch habit checks');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  const toggleCheck = useCallback(async (habitId: string, date: string) => {
    const key = `${habitId}_${date}`;
    const currentCheck = checks.get(key);
    const newCheckedState = !currentCheck?.checked;

    // Optimistic update
    const optimisticCheck: HabitCheck = currentCheck
      ? { ...currentCheck, checked: newCheckedState }
      : {
          id: `temp_${Date.now()}`,
          habit_id: habitId,
          user_id: '', // Will be set by API
          date,
          checked: newCheckedState,
          checked_at: newCheckedState ? new Date().toISOString() : undefined,
        };

    setChecks(prev => new Map(prev).set(key, optimisticCheck));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/decide/habits/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          habit_id: habitId,
          date,
          checked: newCheckedState,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to toggle habit check');
      }

      // Update with real data from API
      setChecks(prev => new Map(prev).set(key, result.data));
      return result.data;
    } catch (err) {
      console.error('Error toggling habit check:', err);
      // Revert optimistic update on error
      if (currentCheck) {
        setChecks(prev => new Map(prev).set(key, currentCheck));
      } else {
        setChecks(prev => {
          const newMap = new Map(prev);
          newMap.delete(key);
          return newMap;
        });
      }
      throw err;
    }
  }, [checks]);

  const isChecked = useCallback((habitId: string, date: string): boolean => {
    const key = `${habitId}_${date}`;
    return checks.get(key)?.checked || false;
  }, [checks]);

  const getCheckForDate = useCallback((habitId: string, date: string): HabitCheck | undefined => {
    const key = `${habitId}_${date}`;
    return checks.get(key);
  }, [checks]);

  const getStreakForHabit = useCallback((habitId: string): number => {
    let streak = 0;
    const today = new Date();
    
    // Count backwards from today
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (isChecked(habitId, dateStr)) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }, [isChecked]);

  const getCompletionRate = useCallback((habitId: string): number => {
    const habitChecks = Array.from(checks.values()).filter(
      check => check.habit_id === habitId && check.checked
    );
    
    const totalDays = checks.size > 0 
      ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
      : 1;
    
    return (habitChecks.length / totalDays) * 100;
  }, [checks, startDate, endDate]);

  useEffect(() => {
    if (startDate && endDate) {
      fetchChecks();
    }
  }, [fetchChecks, startDate, endDate]);

  return {
    checks,
    loading,
    error,
    fetchChecks,
    toggleCheck,
    isChecked,
    getCheckForDate,
    getStreakForHabit,
    getCompletionRate,
  };
}
