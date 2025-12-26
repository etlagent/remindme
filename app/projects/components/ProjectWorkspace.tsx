'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Project } from '@/lib/types/decide';
import { ResourcesTab } from './ResourcesTab';
import { TasksTab } from './TasksTab';
import OverviewTab from '@/components/product-brief/OverviewTab';
import MVPScopeTab from '@/components/product-brief/MVPScopeTab';
import TechnicalSpecsTab from '@/components/product-brief/TechnicalSpecsTab';
import RoadmapTab from '@/components/product-brief/RoadmapTab';
import ResourcesCostsTab from '@/components/product-brief/ResourcesCostsTab';
import KnownsUnknownsTab from '@/components/product-brief/KnownsUnknownsTab';
import BusinessCaseTab from '@/components/product-brief/BusinessCaseTab';
import TeamTimelineTab from '@/components/product-brief/TeamTimelineTab';

interface ProjectWorkspaceProps {
  project: Project;
  onUpdateProject: () => void;
}

type TabType = 'tasks' | 'resources' | 'overview' | 'mvp-scope' | 'technical' | 'roadmap' | 'resources-costs' | 'knowns-unknowns' | 'business' | 'team';

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
        <div className="flex flex-wrap gap-0 px-6">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'resources'
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Resources
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('knowns-unknowns')}
            className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'knowns-unknowns'
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Knowns & Unknowns
          </button>
          <button
            onClick={() => setActiveTab('mvp-scope')}
            className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'mvp-scope'
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            MVP Scope
          </button>
          <button
            onClick={() => setActiveTab('technical')}
            className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'technical'
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Technical Specs
          </button>
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'roadmap'
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Roadmap
          </button>
          <button
            onClick={() => setActiveTab('resources-costs')}
            className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'resources-costs'
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Resources & Costs
          </button>
          <button
            onClick={() => setActiveTab('business')}
            className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'business'
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Business Case
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'team'
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Team & Timeline
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'tasks' && <TasksTab projectId={project.id} />}
        {activeTab === 'resources' && <ResourcesTab projectId={project.id} />}
        {activeTab === 'overview' && <OverviewTab projectId={project.id} />}
        {activeTab === 'mvp-scope' && <MVPScopeTab />}
        {activeTab === 'technical' && <TechnicalSpecsTab />}
        {activeTab === 'roadmap' && <RoadmapTab />}
        {activeTab === 'resources-costs' && <ResourcesCostsTab />}
        {activeTab === 'knowns-unknowns' && <KnownsUnknownsTab />}
        {activeTab === 'business' && <BusinessCaseTab />}
        {activeTab === 'team' && <TeamTimelineTab />}
      </div>
    </div>
  );
}
