'use client';

import { useState, useEffect } from 'react';
import { GlobalModeHeader } from '@/components/layout/GlobalModeHeader';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
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

  const handleBusinessSelect = (business: Business) => {
    // Load full business with relations
    if (business.id) {
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
              onReloadBusinesses={loadBusinesses}
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
              onReloadBusiness={loadBusinessWithRelations}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

/**
 * ORG CHART PERSON COMPONENT
 * Displays a person in the org hierarchy with their details
 */
interface OrgChartPersonProps {
  name: string;
  title: string;
  level: number;
  responsibilities?: string;
  challenges?: string;
  needs?: string;
  notes?: string;
  onAddAbove?: () => void;
  onAddBelow?: () => void;
  onAddSide?: () => void;
  onEdit?: () => void;
}

function OrgChartPerson({
  name,
  title,
  level,
  responsibilities,
  challenges,
  needs,
  notes,
  onAddAbove,
  onAddBelow,
  onAddSide,
  onEdit
}: OrgChartPersonProps) {
  const indentClass = level === 0 ? '' : level === 1 ? 'ml-8' : 'ml-16';
  const [showActions, setShowActions] = useState(false);
  
  return (
    <div 
      className={`${indentClass} relative pb-14`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-semibold text-gray-900">{name}</h4>
            <p className="text-sm text-gray-600">{title}</p>
          </div>
          <button 
            onClick={onEdit}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            ✏️ Edit
          </button>
        </div>

      
      {responsibilities && (
        <div className="mt-2 text-sm">
          <span className="font-medium text-gray-700">Manages:</span>
          <p className="text-gray-600 mt-0.5">• {responsibilities}</p>
        </div>
      )}
      
      {challenges && (
        <div className="mt-2 text-sm">
          <span className="font-medium text-gray-700">Challenge:</span>
          <p className="text-gray-600 mt-0.5">• {challenges}</p>
        </div>
      )}
      
      {needs && (
        <div className="mt-2 text-sm">
          <span className="font-medium text-gray-700">Needs:</span>
          <p className="text-gray-600 mt-0.5">• {needs}</p>
        </div>
      )}
      
        {notes && (
          <div className="mt-2 text-sm">
            <span className="font-medium text-blue-700">Strategy:</span>
            <p className="text-blue-600 mt-0.5">→ {notes}</p>
          </div>
        )}
      </div>
      
      {/* Action Buttons - Show on Hover */}
      {showActions && (onAddAbove || onAddBelow || onAddSide) && (
        <div className="absolute bottom-2 left-4 flex gap-2 bg-white border border-gray-300 rounded-md shadow-lg p-2 z-10">
          {onAddAbove && (
            <button
              onClick={onAddAbove}
              className="px-2 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100"
              title="Add person above (manager)"
            >
              ↑ Add Above
            </button>
          )}
          {onAddBelow && (
            <button
              onClick={onAddBelow}
              className="px-2 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100"
              title="Add person below (reports to)"
            >
              ↓ Add Below
            </button>
          )}
          {onAddSide && (
            <button
              onClick={onAddSide}
              className="px-2 py-1 text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded hover:bg-purple-100"
              title="Add peer (same level)"
            >
              ↔ Add Side
            </button>
          )}
        </div>
      )}
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
  onReloadBusinesses: () => Promise<void>;
  isLoading: boolean;
}

function LeftPanel({
  businesses,
  selectedBusiness,
  onBusinessSelect,
  onMeetingSelect,
  onPersonClick,
  onViewChange,
  onReloadBusinesses,
  isLoading
}: LeftPanelProps) {
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [stage, setStage] = useState('');
  const [dealValue, setDealValue] = useState('');
  const [website, setWebsite] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [description, setDescription] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleCancel = () => {
    setBusinessName('');
    setIndustry('');
    setStage('');
    setDealValue('');
    setWebsite('');
    setLinkedinUrl('');
    setDescription('');
  };

  const handleSaveToRolodex = async () => {
    if (!businessName.trim()) {
      alert('Please enter a business name');
      return;
    }

    setIsSaving(true);
    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please sign in to save');
        return;
      }

      const response = await fetch('/api/business/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: businessName,
          industry: industry || null,
          stage: stage || null,
          deal_value: dealValue ? parseFloat(dealValue) : null,
          website: website || null,
          linkedin_url: linkedinUrl || null,
          description: description || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ Business saved to Rolodex!');
        // Reload businesses list
        await onReloadBusinesses();
        // Set the newly created business as selected
        const newBusiness: BusinessWithRelations = {
          ...result.business,
          people: [],
          meetings: [],
          notes: [],
        };
        onBusinessSelect(newBusiness);
        handleCancel(); // Clear form
      } else {
        alert('Failed to save: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving business:', error);
      alert('Failed to save business');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Business List - Matching People list style */}
      {businesses.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-between">
            <span>MY BUSINESSES</span>
            <button 
              onClick={handleCancel}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              + New Business
            </button>
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {businesses.map((biz) => (
              <div
                key={biz.id}
                onClick={() => onBusinessSelect(biz)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedBusiness?.id === biz.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{biz.name}</h4>
                    {biz.industry && (
                      <p className="text-sm text-gray-600 mt-0.5">{biz.industry}</p>
                    )}
                    {biz.stage && (
                      <p className="text-xs text-gray-500 mt-1">Stage: {biz.stage}</p>
                    )}
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 text-sm">⋮</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
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
        {/* Context & Social Media Section */}
        <div>
          <button
            onClick={() => toggleSection('context')}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900">Context & Social Media</span>
            <span className={`text-gray-400 transition-transform ${expandedSections.includes('context') ? 'rotate-90' : ''}`}>▶</span>
          </button>
          
          {expandedSections.includes('context') && (
            <div className="mt-2 p-4 bg-white border border-gray-200 rounded-lg space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website URL
                </label>
                <input
                  type="text"
                  placeholder="https://company.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn Profile URL
                </label>
                <input
                  type="text"
                  placeholder="https://linkedin.com/company/..."
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Links & Resources
                </label>
                <textarea
                  placeholder="Paste links (blogs, media, about page, etc.) separated by commas&#10;&#10;Example:&#10;https://company.com/blog, https://techcrunch.com/article, https://company.com/about"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add multiple links separated by commas
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Organization Section */}
        <button
          onClick={() => {
            toggleSection('organization');
            onViewChange('organization');
          }}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span className="font-medium text-gray-900">Organization</span>
          <span className={`text-gray-400 transition-transform ${expandedSections.includes('organization') ? 'rotate-90' : ''}`}>▶</span>
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
          <span className={`text-gray-400 transition-transform ${expandedSections.includes('people') ? 'rotate-90' : ''}`}>▶</span>
        </button>

        {/* Meetings Section */}
        <button
          onClick={() => toggleSection('meetings')}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span className="font-medium text-gray-900">Meetings</span>
          <span className={`text-gray-400 transition-transform ${expandedSections.includes('meetings') ? 'rotate-90' : ''}`}>▶</span>
        </button>

        {/* Notes Section */}
        <button
          onClick={() => toggleSection('notes')}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span className="font-medium text-gray-900">Notes & Context</span>
          <span className={`text-gray-400 transition-transform ${expandedSections.includes('notes') ? 'rotate-90' : ''}`}>▶</span>
        </button>

        {/* Research Section */}
        <button
          onClick={() => toggleSection('research')}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span className="font-medium text-gray-900">Research</span>
          <span className={`text-gray-400 transition-transform ${expandedSections.includes('research') ? 'rotate-90' : ''}`}>▶</span>
        </button>
      </div>

      {/* Action Buttons - Bottom */}
      <div className="flex gap-3">
        <button 
          onClick={handleCancel}
          disabled={isSaving}
          className="flex-1 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 font-medium disabled:opacity-50"
        >
          Cancel
        </button>
        <button 
          onClick={handleSaveToRolodex}
          disabled={isSaving || !businessName.trim()}
          className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save to Rolodex'}
        </button>
      </div>
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
  onReloadBusiness: (businessId: string) => Promise<void>;
}

function RightPanel({
  workspaceView,
  business,
  meeting,
  person,
  onViewChange,
  onReloadBusiness
}: RightPanelProps) {
  const [allPeople, setAllPeople] = useState<Person[]>([]);
  const [allBusinesses, setAllBusinesses] = useState<Business[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isLoadingPeople, setIsLoadingPeople] = useState(false);
  const [showPersonSelector, setShowPersonSelector] = useState(false);
  const [personSelectorSearch, setPersonSelectorSearch] = useState('');
  const [orgChartPeople, setOrgChartPeople] = useState<any[]>([]);
  const [addContext, setAddContext] = useState<{position: 'above' | 'below' | 'side', personIndex?: number} | null>(null);
  const [peopleViewMode, setPeopleViewMode] = useState<'assigned' | 'library'>('assigned');

  // Load people from database when library view is shown
  useEffect(() => {
    if (workspaceView === 'library' && allPeople.length === 0) {
      loadPeople();
    }
  }, [workspaceView]);

  // Reload business with people when people view is shown
  useEffect(() => {
    if (workspaceView === 'people' && business?.id) {
      onReloadBusiness(business.id);
    }
  }, [workspaceView]);

  const loadPeople = async () => {
    setIsLoadingPeople(true);
    try {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAllPeople(data || []);
    } catch (error) {
      console.error('Error loading people:', error);
    } finally {
      setIsLoadingPeople(false);
    }
  };

  const handleAssignPerson = async (personToAssign: Person) => {
    if (!business?.id) {
      alert('⚠️ Please save the business first before assigning people');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please sign in');
        return;
      }

      const response = await fetch('/api/business/people/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          business_id: business.id,
          person_id: personToAssign.id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ ${personToAssign.name} assigned to ${business.name}!`);
        // Reload the business to get updated people list
        await onReloadBusiness(business.id);
        // Switch to people view to show the assigned person
        onViewChange('people');
      } else {
        alert('Failed to assign: ' + result.error);
      }
    } catch (error) {
      console.error('Error assigning person:', error);
      alert('Failed to assign person');
    }
  };

  // Get assigned people from business.people relation
  const assignedPeople: Person[] = business?.people?.map(bp => bp.person).filter(Boolean) as Person[] || [];
  
  // Debug log
  console.log('Business:', business);
  console.log('Business people:', business?.people);
  console.log('Assigned people:', assignedPeople);

  // Filter and search people
  const filteredPeople = allPeople.filter(person => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.role?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Tag filter (this would come from person tags in real implementation)
    const matchesFilter = selectedFilter === 'all'; // TODO: implement tag filtering
    
    return matchesSearch && matchesFilter;
  });

  // Filter people for person selector
  const filteredSelectorPeople = allPeople.filter(p => 
    p.name.toLowerCase().includes(personSelectorSearch.toLowerCase()) ||
    p.company?.toLowerCase().includes(personSelectorSearch.toLowerCase())
  );

  const handleAddPersonToOrgChart = (person: Person) => {
    const newOrgPerson = {
      id: `org-${person.id}-${Date.now()}`,
      personId: person.id,
      name: person.name,
      title: person.role || person.company || 'Role not specified',
      level: 0,
      responsibilities: '',
      challenges: '',
      needs: '',
      notes: '',
    };
    
    let updatedPeople = [...orgChartPeople];
    
    if (addContext) {
      const { position, personIndex } = addContext;
      
      if (position === 'above' && personIndex !== undefined) {
        // Insert before the reference person
        updatedPeople.splice(personIndex, 0, newOrgPerson);
      } else if (position === 'below' && personIndex !== undefined) {
        // Insert after the reference person
        updatedPeople.splice(personIndex + 1, 0, newOrgPerson);
      } else if (position === 'side' && personIndex !== undefined) {
        // Insert after (same as below for now, but could adjust level)
        updatedPeople.splice(personIndex + 1, 0, { ...newOrgPerson, level: 1 });
      } else {
        // Default: add to end
        updatedPeople.push(newOrgPerson);
      }
    } else {
      // No context: add to end
      updatedPeople.push(newOrgPerson);
    }
    
    setOrgChartPeople(updatedPeople);
    setShowPersonSelector(false);
    setPersonSelectorSearch('');
    setAddContext(null);
  };

  // If viewing organization chart
  if (workspaceView === 'organization') {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Organization</h2>
          <button 
            onClick={() => {
              setAddContext(null); // Clear context - add to end
              loadPeople(); // Load people if not loaded
              setShowPersonSelector(true);
            }}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            + Add Person
          </button>
        </div>
        
        <div className="space-y-4">
          {orgChartPeople.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-2">No org chart yet</p>
              <p className="text-xs text-gray-400">
                Click "+ Add Person" above to add your first stakeholder
              </p>
              <p className="text-xs text-gray-400 mt-3">
                Build your org chart to track stakeholders, challenges, and messaging strategy
              </p>
            </div>
          ) : (
            <>
              {/* Org Chart Entries */}
              <div className="space-y-3">
                {orgChartPeople.map((person, index) => (
                  <div key={person.id}>
                    <OrgChartPerson
                      name={person.name}
                      title={person.title}
                      level={person.level}
                      responsibilities={person.responsibilities}
                      challenges={person.challenges}
                      needs={person.needs}
                      notes={person.notes}
                      onAddAbove={() => {
                        setAddContext({ position: 'above', personIndex: index });
                        loadPeople();
                        setShowPersonSelector(true);
                      }}
                      onAddBelow={() => {
                        setAddContext({ position: 'below', personIndex: index });
                        loadPeople();
                        setShowPersonSelector(true);
                      }}
                      onAddSide={() => {
                        setAddContext({ position: 'side', personIndex: index });
                        loadPeople();
                        setShowPersonSelector(true);
                      }}
                      onEdit={() => {
                        // TODO: Edit person details
                        alert('Edit functionality coming soon');
                      }}
                    />
                    
                    {/* Connection line if there's a next person */}
                    {index < orgChartPeople.length - 1 && (
                      <div className="flex items-center justify-center">
                        <div className="border-l-2 border-gray-300 h-4"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        
        {/* Person Selector Modal */}
        {showPersonSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Select Person</h3>
                  <button 
                    onClick={() => {
                      setShowPersonSelector(false);
                      setPersonSelectorSearch('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Search by name or company..."
                  value={personSelectorSearch}
                  onChange={(e) => setPersonSelectorSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              
              {/* People List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredSelectorPeople.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {allPeople.length === 0 ? (
                      <>
                        <p className="mb-2">No people in your library</p>
                        <p className="text-sm">Add people in Relationship mode first</p>
                      </>
                    ) : (
                      <p>No people match your search</p>
                    )}
                  </div>
                ) : (
                  filteredSelectorPeople.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleAddPersonToOrgChart(p)}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">{p.name}</div>
                      {p.company && (
                        <div className="text-sm text-gray-600 mt-0.5">
                          {p.role && `${p.role} at `}{p.company}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // If viewing people assigned to this business, show them
  if (workspaceView === 'people') {
    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          People
        </h2>
        
        {/* Toggle between Assigned and Library */}
        <div className="flex gap-2 mb-4 border-b border-gray-200">
          <button
            onClick={() => setPeopleViewMode('assigned')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              peopleViewMode === 'assigned'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Assigned ({assignedPeople.length})
          </button>
          <button
            onClick={() => {
              setPeopleViewMode('library');
              loadPeople(); // Load people when switching to library
            }}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              peopleViewMode === 'library'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Library
          </button>
        </div>

        {peopleViewMode === 'assigned' ? (
          // Assigned People View
          <div className="space-y-3">
            {assignedPeople.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-2">No people assigned yet</p>
                <p className="text-sm">Switch to Library tab to assign people</p>
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
        ) : (
          // Library View
          <div>
            {/* Search Bar */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search people by name, company, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Tags - Matching existing UI */}
            <div className="flex flex-wrap gap-2 mb-4">
        <Badge 
          variant={selectedFilter === 'all' ? 'default' : 'outline'}
          className="cursor-pointer hover:bg-blue-100"
          onClick={() => setSelectedFilter('all')}
        >
          All
        </Badge>
        <Badge 
          variant={selectedFilter === 'business' ? 'default' : 'outline'}
          className="cursor-pointer hover:bg-gray-100"
          onClick={() => setSelectedFilter('business')}
        >
          Business
        </Badge>
        <Badge 
          variant={selectedFilter === 'personal' ? 'default' : 'outline'}
          className="cursor-pointer hover:bg-gray-100"
          onClick={() => setSelectedFilter('personal')}
        >
          Personal
        </Badge>
        <Badge 
          variant={selectedFilter === 'projects' ? 'default' : 'outline'}
          className="cursor-pointer hover:bg-gray-100"
          onClick={() => setSelectedFilter('projects')}
        >
          Projects
        </Badge>
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
          {isLoadingPeople ? (
            <div className="text-center py-12 text-gray-500">
              <p>Loading your people...</p>
            </div>
          ) : filteredPeople.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {allPeople.length === 0 ? (
                <>
                  <p className="mb-2">No people in your library yet</p>
                  <p className="text-sm">Switch to Relationship mode to add people</p>
                </>
              ) : (
                <>
                  <p className="mb-2">No people match your search</p>
                  <p className="text-sm">Try a different search term or filter</p>
                </>
              )}
            </div>
          ) : (
            filteredPeople.map((person) => (
              <div
                key={person.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{person.name}</h3>
                    {person.company && (
                      <p className="text-sm text-gray-600 mt-1">
                        {person.role && `${person.role} at `}{person.company}
                      </p>
                    )}
                    {person.created_at && (
                      <p className="text-xs text-gray-400 mt-1">
                        Added: {new Date(person.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button 
                    className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-all"
                    onClick={() => handleAssignPerson(person)}
                  >
                    + Assign
                  </button>
                </div>
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
        )}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Library</h2>
      <p className="text-gray-500">This is the fallback library view</p>
    </div>
  );
}
