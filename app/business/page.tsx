'use client';

import { useState, useEffect, useRef } from 'react';
import { GlobalModeHeader } from '@/components/layout/GlobalModeHeader';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Business, 
  Meeting, 
  Person,
  WorkspaceView,
  PeopleViewMode,
  BusinessWithRelations,
  MeetingWithRelations
} from '@/lib/types';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';

/**
 * Business Management Page
 * 
 * LAYOUT:
 * - Left Panel: Business selector, people, meetings list
 * - Right Panel: Dynamic workspace (business notes, person details, meeting prep)
 * 
 * STATE:
 * - selectedBusiness: Currently selected business
 * - selectedMeeting: Currently selected meeting
 * - workspaceView: What to show in right panel
 * - selectedPerson: Person to show in workspace
 */
export default function BusinessPage() {
  // Core state
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessWithRelations | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingWithRelations | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>('business');

  // Data state
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  
  // Org chart save handler (will be set by RightPanel)
  const saveOrgChartRef = useRef<(() => Promise<void>) | null>(null);

  // Load businesses on mount
  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/business/list', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (result.success && result.businesses) {
        setBusinesses(result.businesses);
      }
    } catch (error) {
      console.error('Error loading businesses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBusinessWithRelations = async (businessId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/business/get?id=${businessId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (result.success && result.business) {
        setSelectedBusiness(result.business);
      }
    } catch (error) {
      console.error('Error loading business:', error);
    }
  };

  const handleBusinessSelect = (business: Business | null) => {
    if (!business) {
      // Deselect business
      setSelectedBusiness(null);
      return;
    }
    
    if (business.id) {
      // Existing business - load full details
      setSelectedBusiness(business as BusinessWithRelations);
      loadBusinessWithRelations(business.id);
    } else {
      // New unsaved business
      setSelectedBusiness(business as BusinessWithRelations);
    }
    setWorkspaceView('business');
  };

  const handleMeetingSelect = (meeting: Meeting) => {
    // TODO: Load full meeting with relations
    setSelectedMeeting(meeting as MeetingWithRelations);
    setWorkspaceView('meeting');
  };

  const handlePersonClick = (person: Person) => {
    setSelectedPerson(person);
    setWorkspaceView('person');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global Mode Header */}
      <GlobalModeHeader />

      {/* Main Split Screen - Matching Relationship Builder Layout */}
      <div className="container mx-auto p-4">
        <div className={`grid grid-cols-1 ${isLeftPanelCollapsed ? 'lg:grid-cols-1' : 'lg:grid-cols-2'} gap-6 min-h-[calc(100vh-120px)] relative`}>
          {/* Collapsed Left Panel - Thin Bar */}
          {isLeftPanelCollapsed && (
            <button
              onClick={() => setIsLeftPanelCollapsed(false)}
              className="fixed left-0 top-32 z-50 bg-blue-600 text-white p-2 rounded-r-lg shadow-lg hover:bg-blue-700 transition-colors"
              title="Show business panel"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path d="M7 4L13 10L7 16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

          {/* Left: Business Section */}
          {!isLeftPanelCollapsed && (
            <Card className="bg-white border-gray-200 shadow-sm p-6 relative">
              <button
                onClick={() => setIsLeftPanelCollapsed(true)}
                className="absolute top-2 right-2 z-10 text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                title="Hide business panel"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                  <path d="M13 4L7 10L13 16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <LeftPanel
                businesses={businesses}
                selectedBusiness={selectedBusiness}
                onBusinessSelect={handleBusinessSelect}
                onMeetingSelect={handleMeetingSelect}
                onPersonClick={handlePersonClick}
                onViewChange={setWorkspaceView}
                onReloadBusinesses={loadBusinesses}
                isLoading={isLoading}
                onSaveOrgChart={async () => {
                  if (saveOrgChartRef.current) {
                    await saveOrgChartRef.current();
                  }
                }}
              />
            </Card>
          )}

          {/* Right: Library Section */}
          <Card className="bg-white border-gray-200 shadow-sm p-6">
            <RightPanel
              workspaceView={workspaceView}
              business={selectedBusiness}
              meeting={selectedMeeting}
              person={selectedPerson}
              onViewChange={setWorkspaceView}
              onReloadBusiness={loadBusinessWithRelations}
              allBusinesses={businesses}
              onBusinessSelect={setSelectedBusiness}
              saveOrgChartRef={saveOrgChartRef}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
