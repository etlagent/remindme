import { useMemo } from 'react';
import { Habit } from '@/lib/types/decide';

interface HabitStatsProps {
  habits: Habit[];
  isChecked: (habitId: string, date: string) => boolean;
  getStreakForHabit: (habitId: string) => number;
}

export function HabitStats({ habits, isChecked, getStreakForHabit }: HabitStatsProps) {
  const today = new Date().toISOString().split('T')[0];
  
  const stats = useMemo(() => {
    // Today's completion
    const todayChecks = habits.filter(h => isChecked(h.id, today)).length;
    const todayRate = habits.length > 0 ? (todayChecks / habits.length) * 100 : 0;

    // This week's completion
    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      weekDates.push(date.toISOString().split('T')[0]);
    }
    
    let weekChecks = 0;
    let weekTotal = 0;
    habits.forEach(habit => {
      weekDates.forEach(date => {
        weekTotal++;
        if (isChecked(habit.id, date)) weekChecks++;
      });
    });
    const weekRate = weekTotal > 0 ? (weekChecks / weekTotal) * 100 : 0;

    // Top streaks
    const streaks = habits.map(habit => ({
      habit,
      streak: getStreakForHabit(habit.id)
    })).sort((a, b) => b.streak - a.streak).slice(0, 3);

    return {
      todayChecks,
      todayRate,
      weekChecks,
      weekRate,
      topStreaks: streaks
    };
  }, [habits, isChecked, getStreakForHabit, today]);

  return (
    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Progress Summary
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Today */}
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Today
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.todayChecks}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              / {habits.length}
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${stats.todayRate}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {Math.round(stats.todayRate)}% completed
          </div>
        </div>

        {/* This Week */}
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            This Week
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.weekChecks}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              / {habits.length * 7}
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${stats.weekRate}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {Math.round(stats.weekRate)}% completed
          </div>
        </div>
      </div>

      {/* Top Streaks */}
      {stats.topStreaks.length > 0 && stats.topStreaks.some(s => s.streak > 0) && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Top Streaks 🔥
          </div>
          <div className="space-y-1">
            {stats.topStreaks.filter(s => s.streak > 0).map(({ habit, streak }) => (
              <div key={habit.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {habit.name}
                </span>
                <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                  {streak} {streak === 1 ? 'day' : 'days'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
