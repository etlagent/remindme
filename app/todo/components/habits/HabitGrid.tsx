import { useMemo } from 'react';
import { Habit } from '@/lib/types/decide';
import { HabitRow } from './HabitRow';

interface HabitGridProps {
  habits: Habit[];
  currentMonth: Date;
  isChecked: (habitId: string, date: string) => boolean;
  onToggleCheck: (habitId: string, date: string) => Promise<void>;
  onEditHabit?: (habit: Habit) => void;
  onDeleteHabit?: (habitId: string) => void;
  onReorderHabit?: (draggedId: string, targetId: string) => void;
}

export function HabitGrid({
  habits,
  currentMonth,
  isChecked,
  onToggleCheck,
  onEditHabit,
  onDeleteHabit,
  onReorderHabit,
}: HabitGridProps) {
  // Generate array of dates for the current month
  const dates = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const dateArray: string[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      // Use local date formatting to avoid timezone shifts
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      dateArray.push(`${yyyy}-${mm}-${dd}`);
    }
    
    return dateArray;
  }, [currentMonth]);

  // Generate day headers (1, 2, 3, ..., 31)
  const dayHeaders = useMemo(() => {
    return dates.map(date => {
      // Parse date string directly to avoid timezone shifts
      const [year, month, dayStr] = date.split('-').map(Number);
      const day = dayStr;
      // Create date object in local timezone for day of week calculation
      const localDate = new Date(year, month - 1, dayStr);
      const dayOfWeek = localDate.getDay();
      return { day, date, dayOfWeek };
    });
  }, [dates]);

  // Get today's date in local timezone
  const today = useMemo(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    console.log('HabitGrid today:', todayStr, 'Current date object:', now);
    return todayStr;
  }, []);

  return (
    <div className="overflow-x-auto">
      {/* Header with day numbers */}
      <div className="flex items-center gap-2 pb-2 border-b border-gray-300 dark:border-gray-600 mb-2">
        <div className="w-56 flex-shrink-0 px-4">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Habit
          </span>
        </div>
        <div className="flex gap-1">
          {dayHeaders.map(({ day, date, dayOfWeek }) => {
            const isToday = date === today;
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            
            if (day === 14 || day === 15) {
              console.log(`Day ${day}: date="${date}", today="${today}", isToday=${isToday}`);
            }
            
            return (
              <div
                key={date}
                className={`
                  w-8 h-8 flex flex-col items-center justify-center
                  text-xs font-medium
                  ${isToday 
                    ? 'bg-blue-100 text-blue-900 rounded dark:bg-blue-900 dark:text-blue-100' 
                    : isWeekend
                    ? 'text-gray-400 dark:text-gray-500'
                    : 'text-gray-600 dark:text-gray-400'
                  }
                `}
              >
                <span>{day}</span>
                {day === 1 && (
                  <span className="text-[8px] text-gray-400">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'][dayOfWeek]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Habit Rows */}
      <div className="space-y-1">
        {habits.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-sm">No habits yet. Add your first habit to start tracking!</p>
          </div>
        ) : (
          habits.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              dates={dates}
              isChecked={isChecked}
              onToggleCheck={onToggleCheck}
              onEditHabit={onEditHabit}
              onDeleteHabit={onDeleteHabit}
              onReorder={onReorderHabit}
            />
          ))
        )}
      </div>

      {/* Empty rows for adding new habits */}
      <div className="mt-2 space-y-1 opacity-50">
        {Array.from({ length: Math.max(0, 10 - habits.length) }).map((_, idx) => (
          <div 
            key={`empty-${idx}`}
            className="flex items-center gap-2 py-2"
          >
            <div className="w-56 flex-shrink-0 px-4">
              <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded border border-dashed border-gray-300 dark:border-gray-600" />
            </div>
            <div className="flex gap-1">
              {dates.map((date, dateIdx) => (
                <div
                  key={`empty-${idx}-${dateIdx}`}
                  className="w-8 h-8 border border-dashed border-gray-200 dark:border-gray-700 rounded"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
