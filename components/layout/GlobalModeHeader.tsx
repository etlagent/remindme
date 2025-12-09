'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * GlobalModeHeader - Top navigation bar for switching between app modes
 * 
 * MODES:
 * - Relationship Builder (/) - Existing people/event management
 * - Business View (/business) - Business and meeting management
 * 
 * USED BY:
 * - app/page.tsx
 * - app/business/page.tsx
 */
export function GlobalModeHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    loadUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const isRelationshipMode = pathname === '/';
  const isBusinessMode = pathname.startsWith('/business');

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      {/* Mode Switcher */}
      <div className="flex gap-6">
        <button
          onClick={() => router.push('/')}
          className={`text-lg transition-colors ${
            isRelationshipMode
              ? 'text-gray-900 font-semibold'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Relationship
        </button>
        <button
          onClick={() => router.push('/business')}
          className={`text-lg transition-colors ${
            isBusinessMode
              ? 'text-red-600 font-semibold'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Business
        </button>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-4">
        {userEmail && (
          <span className="text-sm text-gray-600">{userEmail}</span>
        )}
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
