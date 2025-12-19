import { useState } from 'react';
import { Habit } from '@/lib/types/decide';
import { HabitCell } from './HabitCell';

interface HabitRowProps {
  habit: Habit;
  dates: string[]; // Array of date strings in 'YYYY-MM-DD' format
  isChecked: (habitId: string, date: string) => boolean;
  onToggleCheck: (habitId: string, date: string) => Promise<void>;
  onEditHabit?: (habit: Habit) => void;
  onDeleteHabit?: (habitId: string) => void;
  onReorder?: (draggedId: string, targetId: string) => void;
}

export function HabitRow({
  habit,
  dates,
  isChecked,
  onToggleCheck,
  onEditHabit,
  onDeleteHabit,
  onReorder,
}: HabitRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(habit.name);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Get today's date in local timezone
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const handleSaveName = () => {
    if (editedName.trim() && editedName !== habit.name && onEditHabit) {
      onEditHabit({ ...habit, name: editedName.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      setEditedName(habit.name);
      setIsEditing(false);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('habitId', habit.id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const draggedId = e.dataTransfer.getData('habitId');
    if (draggedId && draggedId !== habit.id && onReorder) {
      onReorder(draggedId, habit.id);
    }
  };

  return (
    <div 
      draggable={!isEditing}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex items-center gap-2 py-2 transition-colors group ${
        isDragging ? 'opacity-50' : ''
      } ${
        isDragOver ? 'bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-500' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: isEditing ? 'text' : 'grab' }}
    >
      {/* Drag Handle */}
      <div className="flex-shrink-0 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>
      
      {/* Habit Name */}
      <div className="w-56 flex-shrink-0">
        {isEditing ? (
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={handleKeyDown}
            className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            autoFocus
          />
        ) : (
          <div className="flex items-center justify-between">
            <span 
              className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
              onClick={() => setIsEditing(true)}
            >
              {habit.name}
            </span>
            {isHovered && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  title="Edit habit"
                >
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                {onDeleteHabit && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete habit "${habit.name}"?`)) {
                        onDeleteHabit(habit.id);
                      }
                    }}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                    title="Delete habit"
                  >
                    <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Date Cells */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {dates.map((date) => {
          const isToday = date === today;
          const isFuture = new Date(date) > new Date(today);
          const checked = isChecked(habit.id, date);

          return (
            <HabitCell
              key={date}
              date={date}
              checked={checked}
              isToday={isToday}
              isFuture={isFuture}
              onClick={() => !isFuture && onToggleCheck(habit.id, date)}
            />
          );
        })}
      </div>
    </div>
  );
}
