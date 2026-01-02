'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Project {
  id: string;
  name: string;
  created_at: string;
  task_count: number;
}

interface ProjectTask {
  id: string;
  text: string;
  completed: boolean;
  project_id: string;
  parent_id?: string | null;
  subtasks?: ProjectTask[];
}

export function ProjectTasksPanel() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('ProjectTasksPanel: No user found');
        return;
      }
      console.log('ProjectTasksPanel: Fetching projects for user:', user.id);

      // Get all projects with their tasks count
      const { data: projects, error: projectsError } = await supabase
        .from('projects_main')
        .select('id, name, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('ProjectTasksPanel: Projects query result:', { projects, projectsError });

      if (!projects) {
        console.log('ProjectTasksPanel: No projects found');
        setProjects([]);
        setLoading(false);
        return;
      }

      // Get task counts for each project
      const projectsWithCounts = await Promise.all(
        projects.map(async (project) => {
          const { count, error: countError } = await supabase
            .from('projects_tasks')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id)
            .eq('completed', false)
            .eq('pushed_to_workspace', false);

          console.log(`ProjectTasksPanel: Project "${project.name}" incomplete task count:`, count, countError);

          return {
            ...project,
            task_count: count || 0
          };
        })
      );

      // Filter to only show projects with incomplete tasks
      const projectsWithTasks = projectsWithCounts.filter(p => p.task_count > 0);
      console.log('ProjectTasksPanel: Projects with incomplete tasks:', projectsWithTasks);
      setProjects(projectsWithTasks);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildTaskHierarchy = (flatTasks: ProjectTask[]): ProjectTask[] => {
    const taskMap = new Map<string, ProjectTask>();
    const rootTasks: ProjectTask[] = [];

    // First pass: create map of all tasks with empty subtasks arrays
    flatTasks.forEach(task => {
      taskMap.set(task.id, { ...task, subtasks: [] });
    });

    // Second pass: build hierarchy
    flatTasks.forEach(task => {
      const taskWithSubtasks = taskMap.get(task.id)!;
      if (task.parent_id) {
        const parent = taskMap.get(task.parent_id);
        if (parent) {
          parent.subtasks = parent.subtasks || [];
          parent.subtasks.push(taskWithSubtasks);
        }
      } else {
        rootTasks.push(taskWithSubtasks);
      }
    });

    return rootTasks;
  };

  const fetchTasks = async (projectId: string) => {
    setLoadingTasks(true);
    try {
      const { data, error } = await supabase
        .from('projects_tasks')
        .select('*')
        .eq('project_id', projectId)
        .eq('completed', false)
        .eq('pushed_to_workspace', false)
        .order('created_at', { ascending: true });

      console.log('ProjectTasksPanel: Tasks for project:', { projectId, data, error });
      
      // Build hierarchy from flat list
      const hierarchicalTasks = buildTaskHierarchy(data || []);
      setTasks(hierarchicalTasks);
    } catch (error) {
      console.error('Error fetching project tasks:', error);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleProjectClick = (projectId: string) => {
    if (selectedProjectId === projectId) {
      // Collapse if clicking same project
      setSelectedProjectId(null);
      setTasks([]);
    } else {
      // Expand new project
      setSelectedProjectId(projectId);
      fetchTasks(projectId);
    }
  };

  const renderTaskHierarchy = (taskList: ProjectTask[], depth: number = 0): React.ReactNode => {
    return taskList.map((task) => (
      <div key={task.id} style={{ marginLeft: `${depth * 16}px` }}>
        <div
          className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm cursor-move mb-2"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('projectTaskId', task.id);
            e.dataTransfer.setData('projectTaskText', task.text);
            e.dataTransfer.setData('projectId', task.project_id);
          }}
        >
          <div className="flex items-start gap-2">
            <span className="text-gray-700 dark:text-gray-300">
              {task.text}
            </span>
          </div>
        </div>
        {task.subtasks && task.subtasks.length > 0 && renderTaskHierarchy(task.subtasks, depth + 1)}
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <div className="text-6xl mb-4">📁</div>
        <p className="text-lg font-medium mb-2">No Project Tasks</p>
        <p className="text-sm">
          Create tasks in your projects to see them here
        </p>
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Projects with Tasks ({projects.length})
      </h4>
      <div className="space-y-3">
        {projects.map((project) => (
          <div key={project.id}>
            {/* Project Card */}
            <button
              onClick={() => handleProjectClick(project.id)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                selectedProjectId === project.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="font-medium text-sm text-gray-900 dark:text-white mb-1">
                {project.name}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{new Date(project.created_at).toLocaleDateString()}</span>
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                  {project.task_count} tasks
                </span>
              </div>
            </button>

            {/* Expanded Tasks */}
            {selectedProjectId === project.id && (
              <div className="mt-2 ml-4 space-y-2">
                {loadingTasks ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : tasks.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-4">No incomplete tasks</p>
                ) : (
                  <>{renderTaskHierarchy(tasks)}</>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
