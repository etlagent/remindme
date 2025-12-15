'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { WorkspaceTodo } from '@/lib/types/decide';

interface WeeklyCalendarProps {
  startDate: Date;
  daysToShow: number;
  onTasksScheduled?: (taskIds: string[]) => void;
}

interface ScheduledTask extends WorkspaceTodo {
  scheduled_for: string;
  completed?: boolean;
}

export function WeeklyCalendar({ startDate, daysToShow, onTasksScheduled }: WeeklyCalendarProps) {
  const [scheduledTasks, setScheduledTasks] = useState<Map<string, ScheduledTask[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const [pendingSaves, setPendingSaves] = useState<Map<string, string>>(new Map()); // tempId -> scheduled_for

  const calendarDays = Array.from({ length: daysToShow }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return date;
  });

  useEffect(() => {
    fetchScheduledTasks();
  }, []);

  const fetchScheduledTasks = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      // Fetch all scheduled tasks from database
      const response = await fetch('/api/decide/workspace', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();
      if (result.success && result.data) {
        const tasksMap = new Map<string, ScheduledTask[]>();
        
        result.data.forEach((todo: WorkspaceTodo) => {
          if (todo.scheduled_for) {
            const dateStr = todo.scheduled_for;
            const existing = tasksMap.get(dateStr) || [];
            tasksMap.set(dateStr, [...existing, { ...todo, scheduled_for: dateStr }]);
          }
        });

        setScheduledTasks(tasksMap);
      }
    } catch (error) {
      console.error('Error fetching scheduled tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    
    const dateStr = date.toISOString().split('T')[0];
    
    try {
      // Check for multiple todos first
      const todosData = e.dataTransfer.getData('todos');
      if (todosData) {
        const todos: WorkspaceTodo[] = JSON.parse(todosData);
        
        // Immediately update UI
        const scheduledTasks: ScheduledTask[] = todos.map(todo => ({
          ...todo,
          scheduled_for: dateStr,
        }));

        setScheduledTasks(prev => {
          const newMap = new Map(prev);
          const dayTasks = newMap.get(dateStr) || [];
          newMap.set(dateStr, [...dayTasks, ...scheduledTasks]);
          return newMap;
        });

        onTasksScheduled?.(todos.map(t => t.id));

        // Update database in background (don't await)
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          const realTodos = todos.filter(t => !t.id.startsWith('temp-'));
          if (realTodos.length > 0) {
            Promise.all(
              realTodos.map(todo => 
                fetch(`/api/decide/workspace/${todo.id}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                  },
                  body: JSON.stringify({ scheduled_for: dateStr }),
                }).then(res => {
                  if (!res.ok) {
                    console.error('Failed to save task', todo.id, 'to database');
                  }
                })
              )
            ).catch(err => console.error('Error saving to database:', err));
          }
        }
        return;
      }

      // Handle single task
      const todoData = e.dataTransfer.getData('todo');
      if (!todoData) return;

      const todo: WorkspaceTodo = JSON.parse(todoData);
      
      // Immediately update UI
      const scheduledTask: ScheduledTask = {
        ...todo,
        scheduled_for: dateStr,
      };

      setScheduledTasks(prev => {
        const newMap = new Map(prev);
        const dayTasks = newMap.get(dateStr) || [];
        newMap.set(dateStr, [...dayTasks, scheduledTask]);
        return newMap;
      });

      onTasksScheduled?.([todo.id]);

      // Update database in background
      const saveToDatabase = async (taskId: string, retryCount = 0) => {
        if (taskId.startsWith('temp-')) {
          // For temp IDs, wait and retry up to 3 times
          if (retryCount < 3) {
            setTimeout(() => {
              // Check if the task now has a real ID by looking in our state
              let realId = taskId;
              scheduledTasks.forEach(dayTasks => {
                const found = dayTasks.find(t => 
                  t.id === taskId || (t.text === todo.text && !t.id.startsWith('temp-'))
                );
                if (found && !found.id.startsWith('temp-')) {
                  realId = found.id;
                }
              });
              
              if (realId !== taskId) {
                saveToDatabase(realId, 0);
              } else {
                saveToDatabase(taskId, retryCount + 1);
              }
            }, 1000 * (retryCount + 1)); // Wait 1s, 2s, 3s
          }
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          fetch(`/api/decide/workspace/${taskId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ scheduled_for: dateStr }),
          }).catch(err => console.error('Error saving to database:', err));
        }
      };

      saveToDatabase(todo.id);
    } catch (error) {
      console.error('Error scheduling task:', error);
    }
  };

  const handleToggleComplete = async (dateStr: string, taskId: string) => {
    // Optimistically update UI
    const task = scheduledTasks.get(dateStr)?.find(t => t.id === taskId);
    const newCompleted = !task?.completed;
    
    setScheduledTasks(prev => {
      const newMap = new Map(prev);
      const dayTasks = newMap.get(dateStr) || [];
      newMap.set(dateStr, dayTasks.map(t => 
        t.id === taskId ? { ...t, completed: newCompleted } : t
      ));
      return newMap;
    });

    // Save to database
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      await fetch(`/api/decide/workspace/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ completed: newCompleted }),
      });
    } catch (error) {
      console.error('Error updating completed status:', error);
    }
  };

  const handleRemoveTask = (dateStr: string, taskId: string) => {
    setScheduledTasks(prev => {
      const newMap = new Map(prev);
      const dayTasks = newMap.get(dateStr) || [];
      newMap.set(dateStr, dayTasks.filter(t => t.id !== taskId));
      return newMap;
    });
  };

  const handleTaskDragStart = (e: React.DragEvent, task: ScheduledTask, fromDateStr: string) => {
    e.dataTransfer.setData('scheduledTask', JSON.stringify({ task, fromDateStr }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTaskDrop = async (e: React.DragEvent, toDateStr: string) => {
    e.preventDefault();
    
    const scheduledTaskData = e.dataTransfer.getData('scheduledTask');
    if (scheduledTaskData) {
      // Moving task between calendar days
      const { task, fromDateStr } = JSON.parse(scheduledTaskData);
      
      // Optimistically update UI
      setScheduledTasks(prev => {
        const newMap = new Map(prev);
        
        // Remove from old day
        const fromDayTasks = newMap.get(fromDateStr) || [];
        newMap.set(fromDateStr, fromDayTasks.filter(t => t.id !== task.id));
        
        // Add to new day
        const toDayTasks = newMap.get(toDateStr) || [];
        newMap.set(toDateStr, [...toDayTasks, { ...task, scheduled_for: toDateStr }]);
        
        return newMap;
      });

      // Save to database
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        await fetch(`/api/decide/workspace/${task.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ scheduled_for: toDateStr }),
        });
      } catch (error) {
        console.error('Error updating scheduled date:', error);
      }
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 min-h-[600px]">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {formatDate(startDate)} - {daysToShow} {daysToShow === 1 ? 'day' : 'days'}
      </h3>

      <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${Math.min(daysToShow, 7)}, minmax(0, 1fr))` }}>
        {calendarDays.map((day) => {
          const dateStr = day.toISOString().split('T')[0];
          const dayTasks = scheduledTasks.get(dateStr) || [];
          const today = isToday(day);

          return (
            <div
              key={dateStr}
              onDragOver={handleDragOver}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Check if it's a task being moved between days
                const scheduledTaskData = e.dataTransfer.getData('scheduledTask');
                if (scheduledTaskData) {
                  handleTaskDrop(e, dateStr);
                } else {
                  handleDrop(e, day);
                }
              }}
              className={`min-h-[600px] rounded-lg border-2 border-dashed p-3 transition-all ${
                today
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-600'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
              }`}
            >
              {/* Day Header */}
              <div className="mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
                <div className={`text-xs font-medium ${today ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {getDayName(day)}
                </div>
                <div className={`text-lg font-bold ${today ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'}`}>
                  {day.getDate()}
                </div>
              </div>

              {/* Tasks for this day */}
              <div className="space-y-2">
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleTaskDragStart(e, task, dateStr)}
                    className={`group relative p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 shadow-sm cursor-move transition-opacity ${
                      task.completed ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => handleToggleComplete(dateStr, task.id)}
                        className="flex-shrink-0 mt-0.5"
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                          task.completed 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                        }`}>
                          {task.completed && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </button>
                      <p className={`flex-1 text-xs text-gray-900 dark:text-gray-100 break-words pr-6 ${
                        task.completed ? 'line-through' : ''
                      }`}>
                        {task.text}
                      </p>
                    </div>
                    <button
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleRemoveTask(dateStr, task.id);
                      }}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600"
                      title="Remove"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}

                {/* Empty State */}
                {dayTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                    <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <p className="text-xs">Drop tasks here</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Daily Review Button */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Drag and drop tasks from the left to schedule them
        </p>
        <button
          onClick={() => alert('Daily review coming soon!')}
          className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Daily Review
        </button>
      </div>
    </div>
  );
}
