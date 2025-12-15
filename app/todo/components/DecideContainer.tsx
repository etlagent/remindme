'use client';

import { useState } from 'react';
import { HabitTracker } from './habits/HabitTracker';
import { TodoWorkspace } from './workspace/TodoWorkspace';
import { TasksPlanning } from './tasks/TasksPlanning';

type SectionState = 'expanded' | 'collapsed';

export function DecideContainer() {
  const [habitTrackerState, setHabitTrackerState] = useState<SectionState>('collapsed');
  const [workspaceState, setWorkspaceState] = useState<SectionState>('collapsed');
  const [tasksState, setTasksState] = useState<SectionState>('expanded');

  return (
    <div className="max-w-[1800px] mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Decide To Do
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track habits, plan tasks, and organize your day
        </p>
      </div>

      {/* Habit Tracker Section */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setHabitTrackerState(prev => prev === 'expanded' ? 'collapsed' : 'expanded')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-t-lg"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Habit Tracker
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {habitTrackerState === 'expanded' ? 'Collapse' : 'Expand'}
            </span>
            <svg 
              className={`w-5 h-5 text-gray-500 transition-transform ${habitTrackerState === 'expanded' ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        
        {habitTrackerState === 'expanded' && (
          <div className="px-6 pb-6">
            <HabitTracker />
          </div>
        )}
      </section>

      {/* TODO Workspace Section */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setWorkspaceState(prev => prev === 'expanded' ? 'collapsed' : 'expanded')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-t-lg"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📝</span>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              TODO Workspace
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {workspaceState === 'expanded' ? 'Collapse' : 'Expand'}
            </span>
            <svg 
              className={`w-5 h-5 text-gray-500 transition-transform ${workspaceState === 'expanded' ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        
        {workspaceState === 'expanded' && (
          <div className="px-6 pb-6">
            <TodoWorkspace />
          </div>
        )}
      </section>

      {/* Tasks & Planning Section */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setTasksState(prev => prev === 'expanded' ? 'collapsed' : 'expanded')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-t-lg"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Tasks & Planning
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {tasksState === 'expanded' ? 'Collapse' : 'Expand'}
            </span>
            <svg 
              className={`w-5 h-5 text-gray-500 transition-transform ${tasksState === 'expanded' ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        
        {tasksState === 'expanded' && (
          <div className="px-6 pb-6">
            <TasksPlanning />
          </div>
        )}
      </section>
    </div>
  );
}
