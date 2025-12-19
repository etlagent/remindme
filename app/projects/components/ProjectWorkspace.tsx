'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Project } from '@/lib/types/decide';
import { ResourcesTab } from './ResourcesTab';
import { TasksTab } from './TasksTab';

interface ProjectWorkspaceProps {
  project: Project;
  onUpdateProject: () => void;
}

type TabType = 'resources' | 'tasks';

export function ProjectWorkspace({ project, onUpdateProject }: ProjectWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(project.name);
  const [editedDescription, setEditedDescription] = useState(project.description || '');
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  const handleUpdateProject = async (updates: { name?: string; description?: string | null }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch(`/api/decide/projects/${project.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        onUpdateProject();
      }
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project. Please try again.');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Project Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3">
          <div className="text-4xl">{project.icon || '📁'}</div>
          <div className="flex-1">
            {isEditingName ? (
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={async () => {
                  if (editedName.trim() && editedName !== project.name) {
                    await handleUpdateProject({ name: editedName.trim() });
                  }
                  setIsEditingName(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  } else if (e.key === 'Escape') {
                    setEditedName(project.name);
                    setIsEditingName(false);
                  }
                }}
                className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 bg-transparent border-b-2 border-purple-500 focus:outline-none w-full"
                autoFocus
              />
            ) : (
              <h2 
                className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                onClick={() => setIsEditingName(true)}
                title="Click to edit"
              >
                {project.name}
              </h2>
            )}
            {isEditingDescription ? (
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                onBlur={async () => {
                  if (editedDescription !== project.description) {
                    await handleUpdateProject({ description: editedDescription.trim() || null });
                  }
                  setIsEditingDescription(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setEditedDescription(project.description || '');
                    setIsEditingDescription(false);
                  }
                }}
                className="text-gray-600 dark:text-gray-400 bg-transparent border border-purple-500 rounded px-2 py-1 focus:outline-none w-full resize-none"
                rows={2}
                autoFocus
              />
            ) : (
              <p 
                className="text-gray-600 dark:text-gray-400 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                onClick={() => setIsEditingDescription(true)}
                title="Click to edit description"
              >
                {project.description || 'Add description...'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-4 px-6">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'tasks'
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'resources'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Resources
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'tasks' && <TasksTab projectId={project.id} />}
        {activeTab === 'resources' && <ResourcesTab projectId={project.id} />}
      </div>
    </div>
  );
}
