'use client';

import { useState } from 'react';
import { MasterTodoList } from './MasterTodoList';
import { WeeklyCalendar } from './WeeklyCalendar';

export function TasksPlanning() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dayView, setDayView] = useState<number>(3);
  const [scheduledTaskIds, setScheduledTaskIds] = useState<Set<string>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePrevious = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleTasksScheduled = (taskIds: string[]) => {
    setScheduledTaskIds(prev => {
      const newSet = new Set(prev);
      taskIds.forEach(id => newSet.add(id));
      return newSet;
    });
  };

  const handleTasksUnscheduled = (taskIds: string[]) => {
    setScheduledTaskIds(prev => {
      const newSet = new Set(prev);
      taskIds.forEach(id => newSet.delete(id));
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Plan Your Days
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Drag tasks from the list to schedule them on your calendar
          </p>
        </div>
        
        {/* Navigation and View Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors"
          >
            Today
          </button>

          {/* Window Size Adjuster */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg px-2 py-1.5">
            <button
              onClick={() => setDayView(Math.max(1, dayView - 1))}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              title="Decrease window size"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 px-2 min-w-[32px] text-center">
              {dayView}d
            </span>
            
            <button
              onClick={() => setDayView(Math.min(14, dayView + 1))}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              title="Increase window size"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          
          {/* Window Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevious}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Previous day"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={handleNext}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Next day"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Master TODO List */}
        <div className="lg:col-span-1">
          <MasterTodoList 
            excludeIds={scheduledTaskIds} 
            refreshKey={refreshKey}
          />
        </div>

        {/* Right: Calendar */}
        <div className="lg:col-span-2">
          <WeeklyCalendar 
            startDate={selectedDate} 
            daysToShow={dayView}
            onTasksScheduled={handleTasksScheduled}
            onTasksUnscheduled={handleTasksUnscheduled}
            onProjectTaskScheduled={() => setRefreshKey(prev => prev + 1)}
          />
        </div>
      </div>
    </div>
  );
}
