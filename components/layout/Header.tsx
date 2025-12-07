/**
 * HEADER COMPONENT
 * 
 * Top navigation bar with app title and auth button.
 * Displayed on all pages.
 * 
 * USED BY:
 * - app/page.tsx (main page)
 * - app/person/[id]/page.tsx (could be used in future)
 * 
 * DEPENDENCIES:
 * - components/AuthButton (Supabase auth integration)
 * 
 * FEATURES:
 * - App title/branding
 * - Auth button (sign in/out)
 * - Sticky header with backdrop blur
 * - Responsive design
 * 
 * DESIGN:
 * - White background with subtle transparency
 * - Border bottom for separation
 * - Centered container with max width
 * 
 * EXTRACTED FROM:
 * - app/page.tsx (lines 954-962)
 */

import { AuthButton } from "@/components/AuthButton";

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* App Title */}
        <h1 className="text-2xl font-semibold text-gray-800">
          Relationship Builder
        </h1>

        {/* Auth Button */}
        <AuthButton />
      </div>
    </header>
  );
}
