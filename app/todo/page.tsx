'use client';

import { DecideContainer } from './components/DecideContainer';
import { GlobalModeHeader } from '@/components/layout/GlobalModeHeader';

export default function DecidePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <GlobalModeHeader />
      <DecideContainer />
    </div>
  );
}
