'use client';

import { useState, useEffect } from 'react';
import { GlobalModeHeader } from '@/components/layout/GlobalModeHeader';
import { 
  Business, 
  Meeting, 
  Person,
  WorkspaceView,
  BusinessWithRelations,
  MeetingWithRelations
} from '@/lib/types';

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

  // Load businesses on mount
  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    // TODO: Implement API call
    setIsLoading(false);
  };

  const handleBusinessSelect = (business: Business) => {
    // TODO: Load full business with relations
    setSelectedBusiness(business as BusinessWithRelations);
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

      {/* Main Two-Panel Layout */}
      <div className="flex h-[calc(100vh-57px)]">
        {/* LEFT PANEL - Business Context */}
        <div className="flex-1 overflow-y-auto p-6">
          <LeftPanel
            businesses={businesses}
            selectedBusiness={selectedBusiness}
            onBusinessSelect={handleBusinessSelect}
            onMeetingSelect={handleMeetingSelect}
            onPersonClick={handlePersonClick}
            isLoading={isLoading}
          />
        </div>

        {/* RIGHT PANEL - Dynamic Workspace */}
        <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto p-6">
          <RightPanel
            workspaceView={workspaceView}
            business={selectedBusiness}
            meeting={selectedMeeting}
            person={selectedPerson}
            onViewChange={setWorkspaceView}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * LEFT PANEL - Business & Meetings
 * Placeholder component - will be replaced in Phase 7
 */
interface LeftPanelProps {
  businesses: Business[];
  selectedBusiness: BusinessWithRelations | null;
  onBusinessSelect: (business: Business) => void;
  onMeetingSelect: (meeting: Meeting) => void;
  onPersonClick: (person: Person) => void;
  isLoading: boolean;
}

function LeftPanel({
  businesses,
  selectedBusiness,
  onBusinessSelect,
  onMeetingSelect,
  onPersonClick,
  isLoading
}: LeftPanelProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading businesses...</div>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Businesses Yet
        </h3>
        <p className="text-gray-600 mb-4">
          Create your first business to start managing meetings and relationships.
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          + Create Business
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Business Selector */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">BUSINESSES</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700">
            + New
          </button>
        </div>
        
        <select
          value={selectedBusiness?.id || ''}
          onChange={(e) => {
            const business = businesses.find(b => b.id === e.target.value);
            if (business) onBusinessSelect(business);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="">Select a business...</option>
          {businesses.map((business) => (
            <option key={business.id} value={business.id}>
              {business.name}
            </option>
          ))}
        </select>
      </div>

      {/* Selected Business Details */}
      {selectedBusiness && (
        <div className="space-y-4">
          {/* Business Header Placeholder */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900">{selectedBusiness.name}</h3>
            {selectedBusiness.industry && (
              <p className="text-sm text-gray-600 mt-1">{selectedBusiness.industry}</p>
            )}
          </div>

          {/* People Section Placeholder */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              People ({selectedBusiness.people?.length || 0})
            </h4>
            <p className="text-sm text-gray-500">
              People section coming in Phase 7...
            </p>
          </div>

          {/* Meetings Section Placeholder */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Meetings ({selectedBusiness.meetings?.length || 0})
            </h4>
            <p className="text-sm text-gray-500">
              Meetings section coming in Phase 7...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * RIGHT PANEL - Dynamic Workspace
 * Placeholder component - will be replaced in Phase 8
 */
interface RightPanelProps {
  workspaceView: WorkspaceView;
  business: BusinessWithRelations | null;
  meeting: MeetingWithRelations | null;
  person: Person | null;
  onViewChange: (view: WorkspaceView) => void;
}

function RightPanel({
  workspaceView,
  business,
  meeting,
  person,
  onViewChange
}: RightPanelProps) {
  return (
    <div className="space-y-4">
      {/* View Selector */}
      <div className="flex gap-2 text-xs pb-3 border-b border-gray-200">
        <button
          onClick={() => onViewChange('business')}
          className={`px-2 py-1 rounded ${
            workspaceView === 'business'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Business
        </button>
        <button
          onClick={() => onViewChange('library')}
          className={`px-2 py-1 rounded ${
            workspaceView === 'library'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Library
        </button>
      </div>

      {/* Workspace Content */}
      {workspaceView === 'business' && business && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">
            {business.name}
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes & Context
              </label>
              <textarea
                placeholder="Add notes about this business..."
                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md text-sm resize-y"
              />
              <p className="text-xs text-gray-500 mt-1">
                Full notes editor coming in Phase 8...
              </p>
            </div>
          </div>
        </div>
      )}

      {workspaceView === 'meeting' && meeting && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">
            {meeting.title}
          </h3>
          <p className="text-sm text-gray-600">
            Meeting workspace coming in Phase 10...
          </p>
        </div>
      )}

      {workspaceView === 'person' && person && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">
            {person.name}
          </h3>
          <p className="text-sm text-gray-600">
            Person workspace coming in Phase 8...
          </p>
        </div>
      )}

      {workspaceView === 'library' && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">
            Library
          </h3>
          <p className="text-sm text-gray-600">
            Library view coming in Phase 8...
          </p>
        </div>
      )}

      {!business && workspaceView === 'business' && (
        <div className="text-center py-12 text-gray-500">
          <p>Select a business to get started</p>
        </div>
      )}
    </div>
  );
}
