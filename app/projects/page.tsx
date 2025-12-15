'use client';

import { ProjectsContainer } from './components/ProjectsContainer';
import { GlobalModeHeader } from '@/components/layout/GlobalModeHeader';

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <GlobalModeHeader />
      <ProjectsContainer />
    </div>
  );
}
