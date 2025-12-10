'use client';

import { useState, useEffect } from 'react';
import { GlobalModeHeader } from '@/components/layout/GlobalModeHeader';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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

      {/* Main Split Screen - Matching Relationship Builder Layout */}
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[calc(100vh-120px)]">
          {/* Left: Business Section */}
          <Card className="bg-white border-gray-200 shadow-sm p-6">
            <LeftPanel
              businesses={businesses}
              selectedBusiness={selectedBusiness}
              onBusinessSelect={handleBusinessSelect}
              onMeetingSelect={handleMeetingSelect}
              onPersonClick={handlePersonClick}
              onViewChange={setWorkspaceView}
              isLoading={isLoading}
            />
          </Card>

          {/* Right: Library Section */}
          <Card className="bg-white border-gray-200 shadow-sm p-6">
            <RightPanel
              workspaceView={workspaceView}
              business={selectedBusiness}
              meeting={selectedMeeting}
              person={selectedPerson}
              onViewChange={setWorkspaceView}
            />
          </Card>
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
  onViewChange: (view: WorkspaceView) => void;
  isLoading: boolean;
}

function LeftPanel({
  businesses,
  selectedBusiness,
  onBusinessSelect,
  onMeetingSelect,
  onPersonClick,
  onViewChange,
  isLoading
}: LeftPanelProps) {
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [stage, setStage] = useState('');
  const [dealValue, setDealValue] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  return (
    <div className="space-y-6">
      {/* Business Info Card - Matching PersonInfoCard style */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <input
            type="text"
            placeholder="Business Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="text-2xl font-semibold bg-transparent border-none outline-none placeholder-gray-400 text-gray-900 w-full"
          />
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setBusinessName('');
                setIndustry('');
                setStage('');
                setDealValue('');
              }}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md bg-white"
            >
              Clear
            </button>
          </div>
        </div>

        <input
          type="text"
          placeholder="Industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="w-full px-0 py-1 text-gray-600 bg-transparent border-none outline-none placeholder-gray-400"
        />

        <input
          type="text"
          placeholder="Stage (e.g., Discovery, Proposal, Closed Won)"
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          className="w-full px-0 py-1 text-gray-600 bg-transparent border-none outline-none placeholder-gray-400"
        />

        <input
          type="text"
          placeholder="Deal Value"
          value={dealValue}
          onChange={(e) => setDealValue(e.target.value)}
          className="w-full px-0 py-1 text-gray-600 bg-transparent border-none outline-none placeholder-gray-400"
        />
      </div>

      {/* Collapsible Sections */}
      <div className="space-y-2">
        {/* Organization Section */}
        <button
          onClick={() => toggleSection('organization')}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span className="font-medium text-gray-900">Organization</span>
          <span className="text-gray-400">▶</span>
        </button>

        {/* People Section */}
        <button
          onClick={() => {
            toggleSection('people');
            onViewChange('people');
          }}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span className="font-medium text-gray-900">People</span>
          <span className="text-gray-400">▶</span>
        </button>

        {/* Meetings Section */}
        <button
          onClick={() => toggleSection('meetings')}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span className="font-medium text-gray-900">Meetings</span>
          <span className="text-gray-400">▶</span>
        </button>

        {/* Notes Section */}
        <button
          onClick={() => toggleSection('notes')}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span className="font-medium text-gray-900">Notes & Context</span>
          <span className="text-gray-400">▶</span>
        </button>

        {/* Research Section */}
        <button
          onClick={() => toggleSection('research')}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span className="font-medium text-gray-900">Research</span>
          <span className="text-gray-400">▶</span>
        </button>
      </div>

      {/* Save Button - Bottom */}
      <button className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
        💾 Save Business
      </button>
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
  const [allPeople, setAllPeople] = useState<Person[]>([]);
  const [allBusinesses, setAllBusinesses] = useState<Business[]>([]);

  // Mock assigned people for demo - will be replaced with real data from business.people
  const assignedPeople: Person[] = business?.people?.map(bp => bp.person).filter(Boolean) as Person[] || [];

  // If viewing people assigned to this business, show them
  if (workspaceView === 'people') {
    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          People Assigned to {business?.name || 'this Business'}
        </h2>
        
        <div className="space-y-3">
          {assignedPeople.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-2">No people assigned yet</p>
              <p className="text-sm">Assign people from your library to this business</p>
              <button
                onClick={() => onViewChange('library')}
                className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Browse Library
              </button>
            </div>
          ) : (
            assignedPeople.map((person) => (
              <div
                key={person.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{person.name}</h3>
                    {person.company && (
                      <p className="text-sm text-gray-600 mt-1">{person.role || 'Role'} at {person.company}</p>
                    )}
                    {person.created_at && (
                      <p className="text-xs text-gray-400 mt-2">
                        Added: {new Date(person.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 text-xl">⋮</button>
                </div>
                
                {/* Inspiration/Priority Badge */}
                {person.inspiration_level && person.inspiration_level !== 'low' && (
                  <div className="mt-3">
                    <Badge 
                      variant={person.inspiration_level === 'high' ? 'default' : 'secondary'}
                      className={
                        person.inspiration_level === 'high' 
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                          : person.inspiration_level === 'medium'
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {person.inspiration_level === 'high' ? '⭐ Worth nurturing' : '✨ Inspiring'}
                    </Badge>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Library</h2>
      
      {/* Filter Tags - Matching existing UI */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="secondary" className="cursor-pointer hover:bg-blue-100">All</Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Business</Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Personal</Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Projects</Badge>
      </div>

      {/* Tabs - Matching existing UI */}
      <Tabs defaultValue="people" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="people">👥 People</TabsTrigger>
          <TabsTrigger value="businesses">🏢 Businesses</TabsTrigger>
          <TabsTrigger value="meetings">📅 Meetings</TabsTrigger>
        </TabsList>

        {/* People Tab */}
        <TabsContent value="people" className="space-y-3">
          {allPeople.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-2">No people yet</p>
              <p className="text-sm">Switch to Relationship mode to add people</p>
            </div>
          ) : (
            allPeople.map((person) => (
              <div
                key={person.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors"
              >
                <h3 className="font-semibold text-gray-900">{person.name}</h3>
                {person.company && (
                  <p className="text-sm text-gray-600 mt-1">{person.company}</p>
                )}
                {person.role && (
                  <p className="text-sm text-gray-500">{person.role}</p>
                )}
              </div>
            ))
          )}
        </TabsContent>

        {/* Businesses Tab */}
        <TabsContent value="businesses" className="space-y-3">
          {allBusinesses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-2">No businesses yet</p>
              <p className="text-sm">Add your first business to get started</p>
            </div>
          ) : (
            allBusinesses.map((biz) => (
              <div
                key={biz.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors"
              >
                <h3 className="font-semibold text-gray-900">{biz.name}</h3>
                {biz.industry && (
                  <p className="text-sm text-gray-600 mt-1">{biz.industry}</p>
                )}
                {biz.stage && (
                  <Badge variant="secondary" className="mt-2">{biz.stage}</Badge>
                )}
              </div>
            ))
          )}
        </TabsContent>

        {/* Meetings Tab */}
        <TabsContent value="meetings" className="space-y-3">
          <div className="text-center py-12 text-gray-500">
            <p className="mb-2">No meetings yet</p>
            <p className="text-sm">Add a business first, then create meetings</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
