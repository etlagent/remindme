'use client';

import { useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useHabits } from './hooks/useHabits';
import { useHabitChecks } from './hooks/useHabitChecks';
import { HabitGrid } from './HabitGrid';
import { HabitMonthPicker } from './HabitMonthPicker';
import { HabitStats } from './HabitStats';
import { Habit } from '@/lib/types/decide';

export function HabitTracker() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');

  // Get start and end dates for current month
  const dateRange = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Use local date formatting to avoid timezone shifts
    const start = new Date(year, month, 1);
    const startDate = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
    
    const end = new Date(year, month + 1, 0);
    const endDate = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
    
    return { startDate, endDate };
  }, [currentMonth]);

  const { habits, loading: habitsLoading, createHabit, updateHabit, deleteHabit, reorderHabits } = useHabits();
  const { 
    checks, 
    loading: checksLoading, 
    toggleCheck, 
    isChecked,
    getStreakForHabit 
  } = useHabitChecks(dateRange);

  const handleAddHabit = async () => {
    if (!newHabitName.trim()) return;
    
    try {
      await createHabit(newHabitName.trim());
      setNewHabitName('');
      setIsAddingHabit(false);
    } catch (error) {
      console.error('Error adding habit:', error);
      alert('Failed to add habit. Please try again.');
    }
  };

  const handleEditHabit = async (habit: Habit) => {
    try {
      await updateHabit(habit.id, { name: habit.name });
    } catch (error) {
      console.error('Error updating habit:', error);
      alert('Failed to update habit. Please try again.');
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await deleteHabit(habitId);
    } catch (error) {
      console.error('Error deleting habit:', error);
      alert('Failed to delete habit. Please try again.');
    }
  };

  const handleReorderHabit = async (draggedId: string, targetId: string) => {
    try {
      const draggedIndex = habits.findIndex(h => h.id === draggedId);
      const targetIndex = habits.findIndex(h => h.id === targetId);
      
      if (draggedIndex === -1 || targetIndex === -1) return;

      // Reorder the habits array
      const newHabits = [...habits];
      const [removed] = newHabits.splice(draggedIndex, 1);
      newHabits.splice(targetIndex, 0, removed);

      // Use the reorderHabits function from useHabits hook
      await reorderHabits(newHabits);
    } catch (error) {
      console.error('Error reordering habits:', error);
      alert('Failed to reorder habit. Please try again.');
    }
  };

  const handleToggleCheck = async (habitId: string, date: string) => {
    try {
      await toggleCheck(habitId, date);
    } catch (error) {
      console.error('Error toggling check:', error);
      alert('Failed to update habit. Please try again.');
    }
  };

  const loading = habitsLoading || checksLoading;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <HabitMonthPicker 
          currentMonth={currentMonth} 
          onMonthChange={setCurrentMonth}
        />
        
        <button
          onClick={() => setIsAddingHabit(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Habit
        </button>
      </div>

      {/* Add Habit Input */}
      {isAddingHabit && (
        <div className="flex gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddHabit();
              if (e.key === 'Escape') {
                setIsAddingHabit(false);
                setNewHabitName('');
              }
            }}
            placeholder="Enter habit name..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            autoFocus
          />
          <button
            onClick={handleAddHabit}
            disabled={!newHabitName.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
          <button
            onClick={() => {
              setIsAddingHabit(false);
              setNewHabitName('');
            }}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Habit Grid */}
      {!loading && (
        <>
          <HabitGrid
            habits={habits}
            currentMonth={currentMonth}
            isChecked={isChecked}
            onToggleCheck={handleToggleCheck}
            onEditHabit={handleEditHabit}
            onDeleteHabit={handleDeleteHabit}
            onReorderHabit={handleReorderHabit}
          />

          {/* Stats */}
          {habits.length > 0 && (
            <HabitStats
              habits={habits}
              isChecked={isChecked}
              getStreakForHabit={getStreakForHabit}
            />
          )}
        </>
      )}
    </div>
  );
}
