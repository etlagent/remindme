'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ProjectResource } from '@/lib/types/decide';

interface ResourcesTabProps {
  projectId: string;
}

const RESOURCE_ICONS = {
  chatgpt: '💬',
  granola: '🎙️',
  perplexity: '🔍',
  video: '🎥',
  notes: '📝',
  library: '📚',
  team: '👥',
  general: '📄',
};

export function ResourcesTab({ projectId }: ResourcesTabProps) {
  const [resources, setResources] = useState<ProjectResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const [newResource, setNewResource] = useState({
    title: '',
    content: '',
    resource_type: 'general' as ProjectResource['resource_type'],
    url: '',
  });

  useEffect(() => {
    fetchResources();
  }, [projectId]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch(`/api/decide/projects/${projectId}/resources`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });

      const result = await response.json();
      if (result.success) {
        setResources(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddResource = async () => {
    if (!newResource.title.trim() || !newResource.content.trim()) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch(`/api/decide/projects/${projectId}/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(newResource),
      });

      if (response.ok) {
        setNewResource({ title: '', content: '', resource_type: 'general', url: '' });
        setIsAdding(false);
        await fetchResources();
      }
    } catch (error) {
      console.error('Error adding resource:', error);
      alert('Failed to add resource. Please try again.');
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!window.confirm('Delete this resource?')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch(`/api/decide/projects/${projectId}/resources/${resourceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });

      if (response.ok) {
        await fetchResources();
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Store ChatGPT outputs, research, meeting notes, and references
        </p>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          + Add Resource
        </button>
      </div>

      {isAdding && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={newResource.title}
                onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                placeholder="e.g., ChatGPT: Architecture Plan"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content
              </label>
              <textarea
                value={newResource.content}
                onChange={(e) => setNewResource({ ...newResource, content: e.target.value })}
                placeholder="Paste ChatGPT conversations, research, notes, links..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white resize-none text-sm"
                rows={8}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddResource}
                disabled={!newResource.title.trim() || !newResource.content.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                Save Resource
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewResource({ title: '', content: '', resource_type: 'general', url: '' });
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {resources.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <div className="text-6xl mb-3">📋</div>
          <p className="text-sm font-medium">No resources yet</p>
          <p className="text-xs mt-1">Add your first resource to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {resources.map((resource) => {
            const isExpanded = expandedId === resource.id;
            const icon = RESOURCE_ICONS[resource.resource_type];
            
            return (
              <div
                key={resource.id}
                className="group bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : resource.id)}
                  className="w-full px-4 py-3 flex items-start gap-3 text-left"
                >
                  <span className="text-2xl flex-shrink-0">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {resource.title}
                    </p>
                    {!isExpanded && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                        {resource.content.split('\n')[0]}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {isExpanded ? 'Collapse' : 'Expand'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteResource(resource.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4">
                    <div className="bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 p-3">
                      <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
                        {resource.content}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
