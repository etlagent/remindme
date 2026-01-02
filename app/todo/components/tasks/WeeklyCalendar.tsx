'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { WorkspaceTodo } from '@/lib/types/decide';

interface WeeklyCalendarProps {
  startDate: Date;
  daysToShow: number;
  onTasksScheduled?: (taskIds: string[]) => void;
  onTasksUnscheduled?: (taskIds: string[]) => void;
}

interface ScheduledTask extends WorkspaceTodo {
  scheduled_for: string;
  completed?: boolean;
}

export function WeeklyCalendar({ startDate, daysToShow, onTasksScheduled, onTasksUnscheduled }: WeeklyCalendarProps) {
  const [scheduledTasks, setScheduledTasks] = useState<Map<string, ScheduledTask[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const [pendingSaves, setPendingSaves] = useState<Map<string, string>>(new Map()); // tempId -> scheduled_for
  const [dragOverTask, setDragOverTask] = useState<{ dateStr: string; taskId: string } | null>(null);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [showColorPicker, setShowColorPicker] = useState(false);

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

      // Fetch all scheduled tasks from database (including completed ones)
      const response = await fetch('/api/decide/workspace', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();
      if (result.success && result.data) {
        console.log('Fetched workspace data:', result.data.length, 'items');
        
        const tasksMap = new Map<string, ScheduledTask[]>();
        
        result.data.forEach((todo: WorkspaceTodo) => {
          if (todo.scheduled_for) {
            const dateStr = todo.scheduled_for;
            const existing = tasksMap.get(dateStr) || [];
            tasksMap.set(dateStr, [...existing, { ...todo, scheduled_for: dateStr }]);
            
            if (todo.completed) {
              console.log('Loaded completed task:', { id: todo.id, text: todo.text, completed: todo.completed });
            }
          }
        });

        // Sort tasks by order_index within each day
        tasksMap.forEach((tasks, dateStr) => {
          tasksMap.set(dateStr, tasks.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)));
        });

        console.log('Scheduled tasks map:', tasksMap.size, 'days with tasks');
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
      // Check for project task
      const projectTaskId = e.dataTransfer.getData('projectTaskId');
      if (projectTaskId) {
        const projectTaskText = e.dataTransfer.getData('projectTaskText');
        const projectId = e.dataTransfer.getData('projectId');
        
        console.log('Project task dropped:', { projectTaskId, projectTaskText, projectId, dateStr });
        
        // Create a new todo_workspace entry with status='ready'
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          console.error('No session for project task drop');
          return;
        }

        const payload = {
          text: projectTaskText,
          status: 'ready',
          source_type: 'project',
          source_id: projectId,
          scheduled_for: dateStr,
        };
        console.log('Creating todo_workspace entry:', payload);

        const response = await fetch('/api/decide/workspace', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        console.log('API response for project task:', result);
        
        if (result.success && result.data) {
          console.log('Task created successfully:', result.data);
          // Add to UI
          const scheduledTask: ScheduledTask = {
            ...result.data,
            scheduled_for: dateStr,
          };

          setScheduledTasks(prev => {
            const newMap = new Map(prev);
            const dayTasks = newMap.get(dateStr) || [];
            newMap.set(dateStr, [...dayTasks, scheduledTask]);
            return newMap;
          });
        } else {
          console.error('Failed to create project task:', result);
        }
        return;
      }

      // Check for meeting action item
      const meetingActionItemId = e.dataTransfer.getData('meetingActionItemId');
      if (meetingActionItemId) {
        const meetingActionItemText = e.dataTransfer.getData('meetingActionItemText');
        const meetingId = e.dataTransfer.getData('meetingId');
        
        // Create a new todo_workspace entry with status='ready'
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const response = await fetch('/api/decide/workspace', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            text: meetingActionItemText,
            status: 'ready',
            source_type: 'meeting',
            source_id: meetingId,
            scheduled_for: dateStr,
          }),
        });

        const result = await response.json();
        if (result.success && result.data) {
          // Add to UI
          const scheduledTask: ScheduledTask = {
            ...result.data,
            scheduled_for: dateStr,
          };

          setScheduledTasks(prev => {
            const newMap = new Map(prev);
            const dayTasks = newMap.get(dateStr) || [];
            newMap.set(dateStr, [...dayTasks, scheduledTask]);
            return newMap;
          });
        }
        return;
      }

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
    
    console.log('Toggle complete:', { taskId, currentCompleted: task?.completed, newCompleted });
    
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
      if (!session?.access_token) {
        console.error('No session token for saving completed status');
        return;
      }

      const response = await fetch(`/api/decide/workspace/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ completed: newCompleted }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to save completed status:', error);
      } else {
        console.log('Successfully saved completed status to database');
      }
    } catch (error) {
      console.error('Error updating completed status:', error);
    }
  };

  const handleRemoveTask = async (dateStr: string, taskId: string) => {
    // Optimistically remove from UI
    setScheduledTasks(prev => {
      const newMap = new Map(prev);
      const dayTasks = newMap.get(dateStr) || [];
      newMap.set(dateStr, dayTasks.filter(t => t.id !== taskId));
      return newMap;
    });

    // Notify parent that task was unscheduled (returns to Master TODO List)
    onTasksUnscheduled?.([taskId]);

    // Update database to clear scheduled_for
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      await fetch(`/api/decide/workspace/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ scheduled_for: null }),
      });
    } catch (error) {
      console.error('Error removing task from calendar:', error);
    }
  };

  const handleTaskDragStart = (e: React.DragEvent, task: ScheduledTask, fromDateStr: string) => {
    // Check if task has a group color
    const groupColor = (task as any).group_color;
    
    if (groupColor) {
      // Find all tasks with the same group color
      const groupedTasks: ScheduledTask[] = [];
      scheduledTasks.forEach((dayTasks, dateStr) => {
        dayTasks.forEach(t => {
          if ((t as any).group_color === groupColor) {
            groupedTasks.push({ ...t, scheduled_for: dateStr });
          }
        });
      });
      
      e.dataTransfer.setData('groupedTasks', JSON.stringify({ tasks: groupedTasks, groupColor }));
    } else {
      e.dataTransfer.setData('scheduledTask', JSON.stringify({ task, fromDateStr }));
    }
    
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTaskDrop = async (e: React.DragEvent, toDateStr: string, targetTaskId?: string) => {
    e.preventDefault();
    setDragOverTask(null);
    
    // Check for grouped tasks first
    const groupedTasksData = e.dataTransfer.getData('groupedTasks');
    if (groupedTasksData) {
      const { tasks, groupColor } = JSON.parse(groupedTasksData);
      
      // Remove all grouped tasks from their current positions
      setScheduledTasks(prev => {
        const newMap = new Map(prev);
        
        // Remove grouped tasks from all days
        newMap.forEach((dayTasks, dateStr) => {
          newMap.set(dateStr, dayTasks.filter(t => (t as any).group_color !== groupColor));
        });
        
        // Add grouped tasks to target day
        const toDayTasks = newMap.get(toDateStr) || [];
        if (targetTaskId) {
          const targetIndex = toDayTasks.findIndex(t => t.id === targetTaskId);
          const newTasks = [...toDayTasks];
          tasks.forEach((task: ScheduledTask) => {
            newTasks.splice(targetIndex, 0, { ...task, scheduled_for: toDateStr });
          });
          newMap.set(toDateStr, newTasks);
        } else {
          newMap.set(toDateStr, [...toDayTasks, ...tasks.map((t: ScheduledTask) => ({ ...t, scheduled_for: toDateStr }))]);
        }
        
        return newMap;
      });
      
      // Update database for all grouped tasks
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          await Promise.all(
            tasks.map((task: ScheduledTask) =>
              fetch(`/api/decide/workspace/${task.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ scheduled_for: toDateStr }),
              })
            )
          );
        }
      } catch (error) {
        console.error('Error updating grouped tasks:', error);
      }
      
      return;
    }
    
    const scheduledTaskData = e.dataTransfer.getData('scheduledTask');
    if (scheduledTaskData) {
      const { task, fromDateStr } = JSON.parse(scheduledTaskData);
      
      // Optimistically update UI
      setScheduledTasks(prev => {
        const newMap = new Map(prev);
        
        if (fromDateStr === toDateStr && targetTaskId) {
          // Reordering within the same day
          const dayTasks = newMap.get(toDateStr) || [];
          const draggedIndex = dayTasks.findIndex(t => t.id === task.id);
          const targetIndex = dayTasks.findIndex(t => t.id === targetTaskId);
          
          if (draggedIndex !== -1 && targetIndex !== -1) {
            const newTasks = [...dayTasks];
            const [removed] = newTasks.splice(draggedIndex, 1);
            newTasks.splice(targetIndex, 0, removed);
            newMap.set(toDateStr, newTasks);
            
            // Auto-save the new order in the background
            supabase.auth.getSession().then(({ data }) => {
              if (data.session?.access_token) {
                // Update order_index for all tasks in this day
                newTasks.forEach((t, index) => {
                  fetch(`/api/decide/workspace/${t.id}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${data.session!.access_token}`,
                    },
                    body: JSON.stringify({ order_index: index }),
                  }).catch(err => console.error('Error saving task order:', err));
                });
              }
            });
          }
        } else {
          // Moving task between calendar days
          // Remove from old day
          const fromDayTasks = newMap.get(fromDateStr) || [];
          newMap.set(fromDateStr, fromDayTasks.filter(t => t.id !== task.id));
          
          // Add to new day
          const toDayTasks = newMap.get(toDateStr) || [];
          if (targetTaskId) {
            // Insert at specific position
            const targetIndex = toDayTasks.findIndex(t => t.id === targetTaskId);
            const newTasks = [...toDayTasks];
            newTasks.splice(targetIndex, 0, { ...task, scheduled_for: toDateStr });
            newMap.set(toDateStr, newTasks);
          } else {
            // Add to end
            newMap.set(toDateStr, [...toDayTasks, { ...task, scheduled_for: toDateStr }]);
          }
        }
        
        return newMap;
      });

      // Save to database only if moving between days
      if (fromDateStr !== toDateStr) {
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

  const groupColors = [
    { name: 'Blue', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800' },
    { name: 'Purple', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800' },
    { name: 'Pink', bg: 'bg-pink-50 dark:bg-pink-900/20', border: 'border-pink-200 dark:border-pink-800' },
    { name: 'Orange', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800' },
    { name: 'Yellow', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800' },
    { name: 'Teal', bg: 'bg-teal-50 dark:bg-teal-900/20', border: 'border-teal-200 dark:border-teal-800' },
  ];

  const handleToggleSelect = (taskId: string) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleApplyGroupColor = async (colorName: string) => {
    const color = groupColors.find(c => c.name === colorName);
    if (!color) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      // Update all selected tasks with the group color
      const updates = Array.from(selectedTasks).map(taskId => 
        fetch(`/api/decide/workspace/${taskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ group_color: colorName }),
        })
      );

      await Promise.all(updates);

      // Update UI
      setScheduledTasks(prev => {
        const newMap = new Map(prev);
        newMap.forEach((tasks, dateStr) => {
          newMap.set(dateStr, tasks.map(task => 
            selectedTasks.has(task.id) ? { ...task, group_color: colorName } : task
          ));
        });
        return newMap;
      });

      setShowColorPicker(false);
      setSelectedTasks(new Set());
      setMultiSelectMode(false);
    } catch (error) {
      console.error('Error applying group color:', error);
    }
  };

  const handleBulkMove = (e: React.DragEvent, toDateStr: string) => {
    if (selectedTasks.size === 0) return;

    setScheduledTasks(prev => {
      const newMap = new Map(prev);
      const tasksToMove: ScheduledTask[] = [];

      // Find and remove selected tasks from their current days
      newMap.forEach((tasks, dateStr) => {
        const remaining: ScheduledTask[] = [];
        tasks.forEach(task => {
          if (selectedTasks.has(task.id)) {
            tasksToMove.push({ ...task, scheduled_for: toDateStr });
          } else {
            remaining.push(task);
          }
        });
        newMap.set(dateStr, remaining);
      });

      // Add to target day
      const toDayTasks = newMap.get(toDateStr) || [];
      newMap.set(toDateStr, [...toDayTasks, ...tasksToMove]);

      return newMap;
    });

    // Update database
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.access_token) {
        Array.from(selectedTasks).forEach(taskId => {
          fetch(`/api/decide/workspace/${taskId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.session!.access_token}`,
            },
            body: JSON.stringify({ scheduled_for: toDateStr }),
          }).catch(err => console.error('Error moving task:', err));
        });
      }
    });

    setSelectedTasks(new Set());
    setMultiSelectMode(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 min-h-[600px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {formatDate(startDate)} - {daysToShow} {daysToShow === 1 ? 'day' : 'days'}
        </h3>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setMultiSelectMode(!multiSelectMode);
              if (multiSelectMode) {
                setSelectedTasks(new Set());
              }
            }}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              multiSelectMode
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Multi-Select
          </button>
          
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            disabled={selectedTasks.size === 0}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedTasks.size === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            Group
          </button>
        </div>
      </div>

      {/* Color Picker Popup */}
      {showColorPicker && selectedTasks.size > 0 && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Choose a color for {selectedTasks.size} selected task{selectedTasks.size > 1 ? 's' : ''}:
          </p>
          <div className="flex gap-2 flex-wrap">
            {groupColors.map((color) => (
              <button
                key={color.name}
                onClick={() => handleApplyGroupColor(color.name)}
                className={`px-4 py-2 text-sm rounded-md border-2 transition-all ${color.bg} ${color.border} hover:scale-105`}
              >
                {color.name}
              </button>
            ))}
            <button
              onClick={() => handleApplyGroupColor('')}
              className="px-4 py-2 text-sm rounded-md border-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:scale-105"
            >
              Clear
            </button>
          </div>
        </div>
      )}

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
                
                // Check for bulk move
                if (multiSelectMode && selectedTasks.size > 0) {
                  handleBulkMove(e, dateStr);
                  return;
                }
                
                // Check if it's grouped tasks or individual task being moved
                const groupedTasksData = e.dataTransfer.getData('groupedTasks');
                const scheduledTaskData = e.dataTransfer.getData('scheduledTask');
                if (groupedTasksData || scheduledTaskData) {
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
                {dayTasks.map((task) => {
                  const groupColor = groupColors.find(c => c.name === (task as any).group_color);
                  const isSelected = selectedTasks.has(task.id);
                  
                  return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleTaskDragStart(e, task, dateStr)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOverTask({ dateStr, taskId: task.id });
                    }}
                    onDragLeave={(e) => {
                      e.stopPropagation();
                      setDragOverTask(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleTaskDrop(e, dateStr, task.id);
                    }}
                    className={`group relative p-2 rounded border shadow-sm transition-all ${
                      multiSelectMode ? 'cursor-pointer' : 'cursor-move'
                    } ${
                      isSelected
                        ? 'ring-2 ring-orange-500 ring-offset-1'
                        : ''
                    } ${
                      dragOverTask?.dateStr === dateStr && dragOverTask?.taskId === task.id
                        ? 'border-blue-500 border-t-2 bg-blue-50 dark:bg-blue-900/20'
                        : ''
                    } ${
                      task.completed 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' 
                        : groupColor
                        ? `${groupColor.bg} ${groupColor.border}`
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                    }`}
                    onClick={(e) => {
                      if (multiSelectMode) {
                        e.stopPropagation();
                        handleToggleSelect(task.id);
                      }
                    }}
                  >
                    <div className="flex items-start gap-2">
                      {multiSelectMode ? (
                        <div className="flex-shrink-0 mt-0.5">
                          <div className={`w-4 h-4 rounded border-2 transition-colors ${
                            isSelected
                              ? 'bg-orange-500 border-orange-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleComplete(dateStr, task.id);
                          }}
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
                      )}
                      <p className={`flex-1 text-xs break-words pr-6 ${
                        task.completed 
                          ? 'line-through text-gray-600 dark:text-gray-400' 
                          : 'text-gray-900 dark:text-gray-100'
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
                  );
                })}

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
