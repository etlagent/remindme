/**
 * SPLIT VIEW COMPONENT
 * 
 * Two-column layout for capture (left) and library (right).
 * Responsive design that stacks on mobile.
 * 
 * USED BY:
 * - app/page.tsx (main page layout)
 * 
 * DEPENDENCIES:
 * - components/ui/card (shadcn Card component)
 * 
 * PROPS:
 * - left: React node for left panel (capture section)
 * - right: React node for right panel (library section)
 * 
 * FEATURES:
 * - 50/50 split on desktop (lg screens)
 * - Stacked layout on mobile
 * - Scrollable content areas
 * - Consistent padding and spacing
 * 
 * LAYOUT:
 * - Desktop: Two equal columns side-by-side
 * - Mobile: Full-width stacked columns
 * - Container: Centered with max-width
 * 
 * EXTRACTED FROM:
 * - app/page.tsx (lines 964-966 and structure)
 */

import { Card } from "@/components/ui/card";

interface SplitViewProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

export function SplitView({ left, right }: SplitViewProps) {
  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[calc(100vh-120px)]">
        {/* Left Panel: Capture Section */}
        <Card className="bg-white border-gray-200 shadow-sm p-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          {left}
        </Card>

        {/* Right Panel: Library Section */}
        <Card className="bg-white border-gray-200 shadow-sm p-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          {right}
        </Card>
      </div>
    </div>
  );
}
