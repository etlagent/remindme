'use client';

import { useState, useEffect, useRef } from 'react';
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
  PeopleViewMode,
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

/**
 * ORG CHART PERSON COMPONENT
 * Displays a person in the org hierarchy with their details
 */
interface OrgChartPersonProps {
  id: string;
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
  onRemove?: () => void;
  onDragStart?: (id: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (id: string) => void;
  isDragging?: boolean;
}

function OrgChartPerson({
  id,
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
  onEdit,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging
}: OrgChartPersonProps) {
  const indentClass = level === 0 ? '' : level === 1 ? 'ml-8' : 'ml-16';
  
  return (
    <div className={`${indentClass} relative`}>
      <div 
        className={`border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg cursor-move ${
          isDragging ? 'opacity-50' : ''
        }`}
        draggable={true}
        onDragStart={() => onDragStart?.(id)}
        onDragOver={(e) => onDragOver?.(e)}
        onDrop={() => onDrop?.(id)}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{name}</h4>
            <p className="text-sm text-gray-600">{title}</p>
          </div>
          {onRemove && (
            <button 
              onClick={onRemove}
              className="text-gray-400 hover:text-red-600 text-sm"
              title="Remove from org chart"
            >
              ✕
            </button>
          )}
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
  onBusinessSelect: (business: Business | null) => void;
  onMeetingSelect: (meeting: Meeting) => void;
  onPersonClick: (person: Person) => void;
  onViewChange: (view: WorkspaceView) => void;
  onReloadBusinesses: () => Promise<void>;
  isLoading: boolean;
  onSaveOrgChart?: () => Promise<void>;
}

function LeftPanel({
  businesses,
  selectedBusiness,
  onBusinessSelect,
  onMeetingSelect,
  onPersonClick,
  onViewChange,
  onReloadBusinesses,
  isLoading,
  onSaveOrgChart
}: LeftPanelProps) {
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [dealValue, setDealValue] = useState('');
  const [website, setWebsite] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [description, setDescription] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showNewBusinessForm, setShowNewBusinessForm] = useState(false);
  const [editingBusinessName, setEditingBusinessName] = useState(false);

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
    setDealValue('');
    setWebsite('');
    setLinkedinUrl('');
    setDescription('');
    setShowNewBusinessForm(false);
    setExpandedSections([]);
  };

  const handleDeleteBusiness = async (businessId: string, businessName: string) => {
    if (!confirm(`Are you sure you want to delete "${businessName}"? This cannot be undone.`)) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please sign in to delete');
        return;
      }

      const response = await fetch(`/api/business/delete?id=${businessId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ Business deleted!');
        await onReloadBusinesses();
      } else {
        alert('Failed to delete: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting business:', error);
      alert('Failed to delete business');
    }
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
          stage: 'discovery', // Default to discovery - can be changed in Pipeline
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

  const [businessSearch, setBusinessSearch] = useState('');
  const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);
  const filteredBusinesses = businesses.filter(b => 
    b.name.toLowerCase().includes(businessSearch.toLowerCase()) ||
    b.industry?.toLowerCase().includes(businessSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Business Selector - Only show when no business selected and not adding new */}
      {!selectedBusiness && !showNewBusinessForm && (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">SELECT BUSINESS</h3>
          <button 
            onClick={() => setShowNewBusinessForm(true)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            + New Business
          </button>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search or select business..."
            value={businessSearch}
            onChange={(e) => {
              setBusinessSearch(e.target.value);
              setShowBusinessDropdown(true);
            }}
            onFocus={() => setShowBusinessDropdown(true)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          {showBusinessDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredBusinesses.map((biz) => (
                <div
                  key={biz.id}
                  onClick={() => {
                    onBusinessSelect(biz);
                    setBusinessSearch('');
                    setShowBusinessDropdown(false);
                  }}
                  className="p-3 cursor-pointer transition-colors hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-sm">{biz.name}</div>
                  {biz.industry && (
                    <div className="text-xs text-gray-600">{biz.industry}</div>
                  )}
                </div>
              ))}
              {filteredBusinesses.length === 0 && (
                <div className="p-4 text-sm text-gray-500 text-center">
                  {businessSearch ? 'No businesses found' : 'No businesses yet'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      )}

      {/* Selected Business Card - Show when business is selected */}
      {selectedBusiness && !showNewBusinessForm && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">SELECTED BUSINESS</h3>
            <button 
              onClick={() => setShowNewBusinessForm(true)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              + New Business
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            {editingBusinessName ? (
              <input
                type="text"
                value={selectedBusiness.name}
                onChange={(e) => {
                  const updatedBusiness = {...selectedBusiness, name: e.target.value};
                  onBusinessSelect(updatedBusiness);
                }}
                onBlur={async () => {
                  setEditingBusinessName(false);
                  // Save to database
                  try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) return;

                    await fetch('/api/business/update', {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`,
                      },
                      body: JSON.stringify({
                        id: selectedBusiness.id,
                        name: selectedBusiness.name,
                      }),
                    });
                  } catch (error) {
                    console.error('Error updating business name:', error);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                className="text-2xl font-semibold bg-transparent border-b-2 border-blue-500 focus:outline-none text-gray-900 flex-1"
                autoFocus
              />
            ) : (
              <h2 
                className="text-2xl font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                onClick={() => setEditingBusinessName(true)}
              >
                {selectedBusiness.name}
              </h2>
            )}
            <button 
              onClick={() => onBusinessSelect(null)}
              className="text-gray-400 hover:text-gray-600"
              title="Deselect business"
            >
              ✕
            </button>
          </div>
          {selectedBusiness.industry && (
            <p className="text-gray-600">{selectedBusiness.industry}</p>
          )}
          {selectedBusiness.stage && (
            <p className="text-sm text-gray-500">Stage: {selectedBusiness.stage}</p>
          )}
          {selectedBusiness.deal_value && (
            <p className="text-sm text-green-600 font-medium">
              Deal Value: ${(selectedBusiness.deal_value / 1000).toFixed(0)}K
            </p>
          )}
        </div>
        </div>
      )}

      {/* Collapsible Sections - Show when business is selected */}
      {selectedBusiness && !showNewBusinessForm && (
        <div className="space-y-2">
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
            onClick={() => {
              toggleSection('meetings');
              onViewChange('meeting');
            }}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900">Meetings</span>
            <span className={`text-gray-400 transition-transform ${expandedSections.includes('meetings') ? 'rotate-90' : ''}`}>▶</span>
          </button>

          {/* Pipeline Section */}
          <button
            onClick={() => {
              onViewChange('pipeline');
            }}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900">Pipeline</span>
            <span className="text-gray-400">▶</span>
          </button>

          {/* Notes Section */}
          <button
            onClick={() => {
              toggleSection('notes');
              onViewChange('conversations');
            }}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900">Notes & Context</span>
            <span className={`text-gray-400 transition-transform ${expandedSections.includes('notes') ? 'rotate-90' : ''}`}>▶</span>
          </button>

          {/* Research Section */}
          <button
            onClick={() => {
              toggleSection('research');
              onViewChange('business');
            }}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900">Research</span>
            <span className={`text-gray-400 transition-transform ${expandedSections.includes('research') ? 'rotate-90' : ''}`}>▶</span>
          </button>

          {/* Follow Ups Section */}
          <button
            onClick={() => {
              toggleSection('followups');
              onViewChange('followups');
            }}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900">Follow Ups</span>
            <span className={`text-gray-400 transition-transform ${expandedSections.includes('followups') ? 'rotate-90' : ''}`}>▶</span>
          </button>

          {/* Conversations Section */}
          <button
            onClick={() => {
              toggleSection('conversations');
              onViewChange('conversations');
            }}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900">Conversations</span>
            <span className={`text-gray-400 transition-transform ${expandedSections.includes('conversations') ? 'rotate-90' : ''}`}>▶</span>
          </button>

          {/* Save Button */}
          <div className="pt-4 flex justify-end gap-2">
            <button
              onClick={() => onBusinessSelect(null)}
              className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (onSaveOrgChart) {
                  await onSaveOrgChart();
                }
              }}
              className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
            >
              Save Business
            </button>
          </div>
        </div>
      )}
      
      {/* Business Info Card - Only show when adding new business */}
      {showNewBusinessForm && (
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
              onClick={handleCancel}
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
          placeholder="Deal Value"
          value={dealValue}
          onChange={(e) => setDealValue(e.target.value)}
          className="w-full px-0 py-1 text-gray-600 bg-transparent border-none outline-none placeholder-gray-400"
        />
        
        <p className="text-xs text-gray-500">
          💡 Set stage by dragging to Pipeline view
        </p>

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

        {/* Pipeline Section */}
        <button
          onClick={() => {
            onViewChange('pipeline');
          }}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span className="font-medium text-gray-900">Pipeline</span>
          <span className="text-gray-400">▶</span>
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
          {isSaving ? 'Saving...' : 'Save Business'}
        </button>
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
  onReloadBusiness: (businessId: string) => Promise<void>;
  allBusinesses: Business[];
  onBusinessSelect: (business: Business) => void;
  saveOrgChartRef?: React.MutableRefObject<(() => Promise<void>) | null>;
}

function RightPanel({
  workspaceView,
  business,
  meeting,
  person,
  onViewChange,
  onReloadBusiness,
  allBusinesses,
  onBusinessSelect,
  saveOrgChartRef
}: RightPanelProps) {
  const [allPeople, setAllPeople] = useState<Person[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isLoadingPeople, setIsLoadingPeople] = useState(false);
  const [showPersonSelector, setShowPersonSelector] = useState(false);
  const [personSelectorSearch, setPersonSelectorSearch] = useState('');
  const [orgChartPeople, setOrgChartPeople] = useState<any[]>([]);
  const [addContext, setAddContext] = useState<{position: 'above' | 'below' | 'side', personIndex?: number} | null>(null);
  const [peopleViewMode, setPeopleViewMode] = useState<PeopleViewMode>('assigned');
  const [selectedPeopleIds, setSelectedPeopleIds] = useState<Set<string>>(new Set());
  const [draggedPersonId, setDraggedPersonId] = useState<string | null>(null);
  const [draggedTeamId, setDraggedTeamId] = useState<string | null>(null);
  const [orgHierarchy, setOrgHierarchy] = useState<Array<{type: 'person' | 'team', id: string}>>([]);
  const [teams, setTeams] = useState<Array<{id: string, name: string, memberIds: string[], order: number}>>([]);
  const [editingPerson, setEditingPerson] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    responsibilities: '',
    challenges: '',
    needs: '',
    notes: ''
  });
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingTeamName, setEditingTeamName] = useState('');
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [isDraggingConnection, setIsDraggingConnection] = useState(false);
  const [dragLineStart, setDragLineStart] = useState<{x: number, y: number} | null>(null);
  const [dragLineEnd, setDragLineEnd] = useState<{x: number, y: number} | null>(null);
  const [draggedBusiness, setDraggedBusiness] = useState<Business | null>(null);
  const [visibleLevels, setVisibleLevels] = useState<Set<number>>(new Set([0])); // Start with Executive level visible
  const [draggedPersonFromList, setDraggedPersonFromList] = useState<Person | null>(null);
  const [selectedPersonForDetails, setSelectedPersonForDetails] = useState<Set<string>>(new Set());
  const [showPlaceholderForm, setShowPlaceholderForm] = useState<number | null>(null);
  const [placeholderName, setPlaceholderName] = useState('');
  const [placeholderTitle, setPlaceholderTitle] = useState('');
  
  // Meetings state
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [showNewMeetingForm, setShowNewMeetingForm] = useState(false);
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [newMeetingDate, setNewMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [meetingNotes, setMeetingNotes] = useState<{[key: string]: string}>({});
  const [expandedMeetings, setExpandedMeetings] = useState<Set<string>>(new Set());
  const [draggedMeetingId, setDraggedMeetingId] = useState<string | null>(null);
  const [meetingAttendees, setMeetingAttendees] = useState<{[key: string]: string[]}>({});
  const [showAttendeeSelector, setShowAttendeeSelector] = useState<string | null>(null);
  const [attendeeSearchQuery, setAttendeeSearchQuery] = useState('');
  const [showGuestForm, setShowGuestForm] = useState<string | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestCompany, setGuestCompany] = useState('');
  const attendeeSelectorRef = useRef<HTMLDivElement>(null);
  const [editingMeetingTitle, setEditingMeetingTitle] = useState<string | null>(null);
  const [ideationNotes, setIdeationNotes] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [businessNotes, setBusinessNotes] = useState<any[]>([]);
  const [businessFollowups, setBusinessFollowups] = useState<any[]>([]);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [expandedFollowups, setExpandedFollowups] = useState<Set<string>>(new Set());

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

  // Load org chart data (including meetings) when business changes
  useEffect(() => {
    const loadOrgChartData = async () => {
      if (!business?.id) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const response = await fetch(`/api/business/org-chart/load?business_id=${business.id}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        const result = await response.json();

        if (result.success) {
          // Load meetings, notes, and attendees
          if (result.meetings && result.meetings.length > 0) {
            setMeetings(result.meetings);
            const notes: {[key: string]: string} = {};
            const attendees: {[key: string]: string[]} = {};
            result.meetings.forEach((meeting: any) => {
              notes[meeting.id] = meeting.notes || '';
              attendees[meeting.id] = meeting.attendees || [];
            });
            setMeetingNotes(notes);
            setMeetingAttendees(attendees);
          }
        }
      } catch (error) {
        console.error('Error loading org chart data:', error);
      }
    };

    loadOrgChartData();
  }, [business]);

  // Close attendee selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (attendeeSelectorRef.current && !attendeeSelectorRef.current.contains(event.target as Node)) {
        setShowAttendeeSelector(null);
        setAttendeeSearchQuery('');
        setShowGuestForm(null);
        setGuestName('');
        setGuestCompany('');
      }
    };

    if (showAttendeeSelector) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAttendeeSelector]);

  // Load ideation notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('ideationNotes');
    if (savedNotes) {
      setIdeationNotes(savedNotes);
    }
  }, []);

  // Load business notes when conversations view is opened
  useEffect(() => {
    if (workspaceView === 'conversations' && business?.id) {
      loadBusinessNotes();
    }
  }, [workspaceView, business?.id]);

  // Load business followups when followups view is opened
  useEffect(() => {
    if (workspaceView === 'followups' && business?.id) {
      loadBusinessFollowups();
    }
  }, [workspaceView, business?.id]);

  // Save ideation notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ideationNotes', ideationNotes);
  }, [ideationNotes]);

  // Mark as having unsaved changes when meetings, notes, or attendees change
  useEffect(() => {
    if (meetings.length > 0 || Object.keys(meetingNotes).length > 0 || Object.keys(meetingAttendees).length > 0) {
      setHasUnsavedChanges(true);
    }
  }, [meetings, meetingNotes, meetingAttendees]);

  // Browser warning when trying to close tab with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Auto-save when changing views or business
  useEffect(() => {
    const autoSave = async () => {
      if (hasUnsavedChanges && business?.id) {
        setIsAutoSaving(true);
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          // Transform data for API
          const peopleToSave = orgChartPeople.map(person => ({
            id: person.id,
            personId: person.personId,
            name: person.name,
            title: person.title,
            level: person.level,
            positionOrder: 0,
            responsibilities: person.responsibilities,
            challenges: person.challenges,
            needs: person.needs,
            notes: person.notes,
            isPlaceholder: person.isPlaceholder || false,
          }));

          const teamsToSave = teams.map(team => ({
            id: team.id,
            name: team.name,
            description: '',
            level: 0,
            positionOrder: team.order || 0,
            memberIds: team.memberIds,
          }));

          const meetingsToSave = meetings.map((meeting, index) => ({
            id: meeting.id.startsWith('temp-') ? undefined : meeting.id,
            title: meeting.title,
            meeting_date: meeting.meeting_date,
            notes: meetingNotes[meeting.id] || '',
            attendees: meetingAttendees[meeting.id] || [],
            order: index,
          }));

          const response = await fetch('/api/business/org-chart/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              business_id: business.id,
              people: peopleToSave,
              teams: teamsToSave,
              meetings: meetingsToSave,
            }),
          });

          const result = await response.json();

          if (result.success) {
            setHasUnsavedChanges(false);
            console.log('✅ Auto-saved:', result);
          }
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setIsAutoSaving(false);
        }
      }
    };

    // Debounce to avoid too many saves
    const timeoutId = setTimeout(autoSave, 2000);
    return () => clearTimeout(timeoutId);
  }, [workspaceView, business?.id, hasUnsavedChanges, orgChartPeople, teams, meetings, meetingNotes, meetingAttendees]);

  // Register save org chart function
  useEffect(() => {
    if (saveOrgChartRef) {
      saveOrgChartRef.current = async () => {
        if (!business?.id) {
          alert('⚠️ Please select a business first');
          return;
        }

        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            alert('Please sign in');
            return;
          }

          // Transform org chart people data for API
          const peopleToSave = orgChartPeople.map(person => ({
            id: person.id,
            personId: person.personId,
            name: person.name,
            title: person.title,
            level: person.level,
            positionOrder: 0,
            responsibilities: person.responsibilities,
            challenges: person.challenges,
            needs: person.needs,
            notes: person.notes,
            isPlaceholder: person.isPlaceholder || false,
          }));

          // Transform teams data for API
          const teamsToSave = teams.map(team => ({
            id: team.id,
            name: team.name,
            description: '',
            level: 0, // You may want to track level per team
            positionOrder: team.order || 0,
            memberIds: team.memberIds,
          }));

          // Transform meetings data for API
          const meetingsToSave = meetings.map((meeting, index) => ({
            id: meeting.id.startsWith('temp-') ? undefined : meeting.id,
            title: meeting.title,
            meeting_date: meeting.meeting_date,
            notes: meetingNotes[meeting.id] || '',
            attendees: meetingAttendees[meeting.id] || [],
            order: index,
          }));

          const response = await fetch('/api/business/org-chart/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              business_id: business.id,
              people: peopleToSave,
              teams: teamsToSave,
              meetings: meetingsToSave,
            }),
          });

          const result = await response.json();

          if (result.success) {
            setHasUnsavedChanges(false);
            alert(`✅ Business profile saved!\n• ${result.savedPeopleCount} people\n• ${result.savedTeamsCount} teams\n• ${result.savedMeetingsCount} meetings`);
          } else {
            alert(`❌ Error: ${result.error}`);
          }
        } catch (error) {
          console.error('Error saving org chart:', error);
          alert('❌ Error saving business profile');
        }
      };
    }
  }, [saveOrgChartRef, business, orgChartPeople, teams, meetings, meetingNotes, meetingAttendees]);

  const loadBusinessNotes = async () => {
    if (!business?.id) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('business_notes')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading notes:', error);
        return;
      }

      setBusinessNotes(data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const loadBusinessFollowups = async () => {
    if (!business?.id) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('business_followups')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading followups:', error);
        return;
      }

      setBusinessFollowups(data || []);
    } catch (error) {
      console.error('Error loading followups:', error);
    }
  };

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

  const togglePersonSelection = (personId: string) => {
    const newSelection = new Set(selectedPeopleIds);
    if (newSelection.has(personId)) {
      newSelection.delete(personId);
    } else {
      newSelection.add(personId);
    }
    setSelectedPeopleIds(newSelection);
  };

  const handleAssignPerson = async (personToAssign: Person) => {
    if (!business?.id) {
      alert('⚠️ Please select a business from the left panel first');
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

  const handleBulkAssign = async () => {
    if (!business?.id) {
      alert('⚠️ Please select a business from the left panel first');
      return;
    }

    if (selectedPeopleIds.size === 0) {
      alert('⚠️ Please select at least one person');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please sign in');
        return;
      }

      // Assign all selected people
      const promises = Array.from(selectedPeopleIds).map(personId =>
        fetch('/api/business/people/assign', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            business_id: business.id,
            person_id: personId,
          }),
        })
      );

      await Promise.all(promises);
      
      alert(`✅ ${selectedPeopleIds.size} people assigned to ${business.name}!`);
      setSelectedPeopleIds(new Set()); // Clear selection
      await onReloadBusiness(business.id);
      setPeopleViewMode('assigned'); // Switch to assigned view
    } catch (error) {
      console.error('Error bulk assigning people:', error);
      alert('Failed to assign people');
    }
  };

  // Get assigned people from business.people relation
  const assignedPeople: Person[] = business?.people?.map(bp => bp.person).filter(Boolean) as Person[] || [];

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

  const handleAddPersonToOrgChart = (person: Person, targetLevel: number = 0) => {
    const newOrgPerson = {
      id: `org-${person.id}-${Date.now()}`,
      personId: person.id,
      name: person.name,
      title: person.role || person.company || 'Role not specified',
      level: targetLevel, // Use specified level or default to Executive
      parentId: null, // No parent by default
      responsibilities: '',
      challenges: '',
      needs: '',
      notes: '',
    };
    
    setOrgChartPeople([...orgChartPeople, newOrgPerson]);
    setOrgHierarchy([...orgHierarchy, { type: 'person', id: newOrgPerson.id }]);
    setShowPersonSelector(false);
    setPersonSelectorSearch('');
    setAddContext(null);
    setDraggedPersonFromList(null);
  };

  const handleAddPlaceholder = (level: number) => {
    if (!placeholderName.trim()) return;
    
    const newOrgPerson = {
      id: `placeholder-${Date.now()}`,
      personId: null, // No actual person linked
      name: placeholderName,
      title: placeholderTitle || 'Title not specified',
      level: level,
      parentId: null,
      responsibilities: '',
      challenges: '',
      needs: '',
      notes: '',
      isPlaceholder: true, // Mark as placeholder
    };
    
    setOrgChartPeople([...orgChartPeople, newOrgPerson]);
    setOrgHierarchy([...orgHierarchy, { type: 'person', id: newOrgPerson.id }]);
    setShowPlaceholderForm(null);
    setPlaceholderName('');
    setPlaceholderTitle('');
  };

  const handleRemovePersonFromOrgChart = (orgPersonId: string) => {
    setOrgChartPeople(orgChartPeople.filter(p => p.id !== orgPersonId));
    setOrgHierarchy(orgHierarchy.filter(item => item.id !== orgPersonId));
  };

  const handleDragStart = (personId: string) => {
    setDraggedPersonId(personId);
  };

  const handleTeamDragStart = (teamId: string) => {
    setDraggedTeamId(teamId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allow drop
  };

  const handleHierarchyDrop = (targetId: string) => {
    const draggedId = draggedPersonId || draggedTeamId;
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = orgHierarchy.findIndex(item => item.id === draggedId);
    const targetIndex = orgHierarchy.findIndex(item => item.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newHierarchy = [...orgHierarchy];
    const [draggedItem] = newHierarchy.splice(draggedIndex, 1);
    newHierarchy.splice(targetIndex, 0, draggedItem);

    setOrgHierarchy(newHierarchy);
    setDraggedPersonId(null);
    setDraggedTeamId(null);
  };

  const handleCreateTeam = (level: number = 0) => {
    const newTeam = {
      id: `team-${Date.now()}`,
      name: 'Untitled',
      memberIds: [],
      order: orgHierarchy.length,
      level: level
    };

    setTeams([...teams, newTeam]);
    setOrgHierarchy([...orgHierarchy, { type: 'team', id: newTeam.id }]);
  };

  const handleDropOnTeam = (teamId: string) => {
    if (!draggedPersonId) return;

    // Add person to team
    const updatedTeams = teams.map(team => 
      team.id === teamId && !team.memberIds.includes(draggedPersonId)
        ? { ...team, memberIds: [...team.memberIds, draggedPersonId] }
        : team
    );

    setTeams(updatedTeams);
    setDraggedPersonId(null);
  };

  const handleRemoveFromTeam = (teamId: string, personId: string) => {
    const updatedTeams = teams.map(team =>
      team.id === teamId
        ? { ...team, memberIds: team.memberIds.filter(id => id !== personId) }
        : team
    );

    setTeams(updatedTeams);
  };

  const handleEditPerson = (person: any) => {
    setEditingPerson(person);
    setEditForm({
      responsibilities: person.responsibilities || '',
      challenges: person.challenges || '',
      needs: person.needs || '',
      notes: person.notes || ''
    });
  };

  const handleSavePersonDetails = () => {
    if (!editingPerson) return;

    const updatedPeople = orgChartPeople.map(p =>
      p.id === editingPerson.id
        ? { ...p, ...editForm }
        : p
    );

    setOrgChartPeople(updatedPeople);
    setEditingPerson(null);
    setEditForm({ responsibilities: '', challenges: '', needs: '', notes: '' });
  };

  const handleStartEditTeamName = (teamId: string, currentName: string) => {
    setEditingTeamId(teamId);
    setEditingTeamName(currentName);
  };

  const handleSaveTeamName = () => {
    if (!editingTeamId) return;

    const updatedTeams = teams.map(t =>
      t.id === editingTeamId
        ? { ...t, name: editingTeamName || 'Untitled' }
        : t
    );

    setTeams(updatedTeams);
    setEditingTeamId(null);
    setEditingTeamName('');
  };

  const handleSetReportsTo = (personId: string, managerId: string | null) => {
    const updatedPeople = orgChartPeople.map(p => {
      if (p.id === personId) {
        // Calculate level based on manager's level
        const manager = managerId ? orgChartPeople.find(m => m.id === managerId) : null;
        const newLevel = manager ? (manager.level || 0) + 1 : 0;
        return { ...p, parentId: managerId, level: newLevel };
      }
      return p;
    });

    setOrgChartPeople(updatedPeople);
    setConnectingFrom(null);
    setIsDraggingConnection(false);
    setDragLineStart(null);
    setDragLineEnd(null);
  };

  const handleStartConnection = (personId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setConnectingFrom(personId);
    setIsDraggingConnection(true);
    setDragLineStart({
      x: rect.left + rect.width / 2,
      y: rect.bottom
    });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isDraggingConnection && dragLineStart) {
      setDragLineEnd({
        x: event.clientX,
        y: event.clientY
      });
    }
  };

  const handleEndConnection = (targetPersonId: string) => {
    if (connectingFrom && connectingFrom !== targetPersonId) {
      handleSetReportsTo(connectingFrom, targetPersonId);
    } else {
      setConnectingFrom(null);
      setIsDraggingConnection(false);
      setDragLineStart(null);
      setDragLineEnd(null);
    }
  };

  // Get level label based on hierarchy
  const getLevelLabel = (level: number): string => {
    const labels: {[key: number]: string} = {
      0: 'Executive Level',
      1: 'VP / Partner Level',
      2: 'Director Level',
      3: 'Manager Level',
      4: 'Analyst / Individual Contributor',
      5: 'Technical Team'
    };
    return labels[level] || `Level ${level}`;
  };

  // Group people and teams by hierarchy level, including empty visible levels
  const getOrgChartByLevels = () => {
    const levels: { [key: number]: any[] } = {};
    
    // Initialize all visible levels with empty arrays
    visibleLevels.forEach(level => {
      levels[level] = [];
    });
    
    // Add people to their levels
    orgChartPeople.forEach(person => {
      // Skip people in teams
      const inTeam = teams.some(t => t.memberIds.includes(person.id));
      if (inTeam) return;

      const level = person.level || 0;
      if (!levels[level]) levels[level] = [];
      levels[level].push({ type: 'person', data: person });
      
      // Make sure this level is visible
      if (!visibleLevels.has(level)) {
        setVisibleLevels(new Set([...visibleLevels, level]));
      }
    });

    // Add teams to their levels
    teams.forEach(team => {
      const level = (team as any).level || 0;
      if (!levels[level]) levels[level] = [];
      levels[level].push({ type: 'team', data: team });
      
      // Make sure this level is visible
      if (!visibleLevels.has(level)) {
        setVisibleLevels(new Set([...visibleLevels, level]));
      }
    });

    return levels;
  };

  // Meetings view
  if (workspaceView === 'meeting') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Meetings List */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900">Meetings</h2>
              {isAutoSaving && (
                <span className="text-xs text-blue-600 animate-pulse">💾 Saving...</span>
              )}
              {!isAutoSaving && hasUnsavedChanges && (
                <span className="text-xs text-orange-600">● Unsaved changes</span>
              )}
              {!isAutoSaving && !hasUnsavedChanges && meetings.length > 0 && (
                <span className="text-xs text-green-600">✓ Saved</span>
              )}
            </div>
            <button
              onClick={() => setShowNewMeetingForm(true)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              + Meeting
            </button>
          </div>

        {!business ? (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-2">No business selected</p>
            <p className="text-sm">Select a business to add meetings</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* New Meeting Form */}
            {showNewMeetingForm && (
              <div className="p-4 border-2 border-blue-300 rounded-lg bg-blue-50">
                <h3 className="text-sm font-semibold text-blue-900 mb-3">New Meeting</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meeting Title
                    </label>
                    <input
                      type="text"
                      value={newMeetingTitle}
                      onChange={(e) => setNewMeetingTitle(e.target.value)}
                      placeholder="e.g., Quarterly Review"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newMeetingDate}
                      onChange={(e) => setNewMeetingDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        setShowNewMeetingForm(false);
                        setNewMeetingTitle('');
                        setNewMeetingDate(new Date().toISOString().split('T')[0]);
                      }}
                      className="px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (!newMeetingTitle.trim()) {
                          alert('Please enter a meeting title');
                          return;
                        }
                        const newMeeting: Meeting = {
                          id: `temp-${Date.now()}`,
                          business_id: business.id,
                          user_id: '',
                          title: newMeetingTitle,
                          meeting_date: newMeetingDate,
                          location: null,
                          goal: null,
                          status: 'scheduled',
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString(),
                        };
                        setMeetings([...meetings, newMeeting]);
                        setMeetingNotes({...meetingNotes, [newMeeting.id]: ''});
                        setMeetingAttendees({...meetingAttendees, [newMeeting.id]: []});
                        setShowNewMeetingForm(false);
                        setNewMeetingTitle('');
                        setNewMeetingDate(new Date().toISOString().split('T')[0]);
                      }}
                      disabled={!newMeetingTitle.trim()}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create Meeting
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Meeting Cards */}
            {meetings.length === 0 && !showNewMeetingForm ? (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-2">No meetings yet</p>
                <p className="text-sm">Click "+ Meeting" to add your first meeting</p>
              </div>
            ) : (
              meetings.map((mtg, index) => {
                const isExpanded = expandedMeetings.has(mtg.id);
                const isDragging = draggedMeetingId === mtg.id;
                
                return (
                  <div 
                    key={mtg.id} 
                    className={`border border-gray-200 rounded-lg overflow-hidden transition-opacity ${isDragging ? 'opacity-50' : ''}`}
                    draggable
                    onDragStart={() => setDraggedMeetingId(mtg.id)}
                    onDragEnd={() => setDraggedMeetingId(null)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (draggedMeetingId && draggedMeetingId !== mtg.id) {
                        const draggedIndex = meetings.findIndex(m => m.id === draggedMeetingId);
                        const targetIndex = index;
                        const newMeetings = [...meetings];
                        const [removed] = newMeetings.splice(draggedIndex, 1);
                        newMeetings.splice(targetIndex, 0, removed);
                        setMeetings(newMeetings);
                      }
                    }}
                  >
                    {/* Meeting Card Header - Clickable to expand/collapse */}
                    <div 
                      className="bg-gray-50 px-4 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        const newExpanded = new Set(expandedMeetings);
                        if (isExpanded) {
                          newExpanded.delete(mtg.id);
                        } else {
                          newExpanded.add(mtg.id);
                        }
                        setExpandedMeetings(newExpanded);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 flex items-center gap-2">
                          <span className="text-gray-400 text-xs">{isExpanded ? '▼' : '▶'}</span>
                          <div className="flex-1">
                            {editingMeetingTitle === mtg.id ? (
                              <input
                                type="text"
                                value={mtg.title}
                                onChange={(e) => {
                                  setMeetings(meetings.map(m => 
                                    m.id === mtg.id ? {...m, title: e.target.value} : m
                                  ));
                                }}
                                onBlur={() => setEditingMeetingTitle(null)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    setEditingMeetingTitle(null);
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="font-semibold text-gray-900 border-b-2 border-blue-500 focus:outline-none bg-transparent"
                                autoFocus
                              />
                            ) : (
                              <h3 
                                className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingMeetingTitle(mtg.id);
                                }}
                              >
                                {mtg.title}
                              </h3>
                            )}
                            {mtg.meeting_date && (
                              <p className="text-sm text-gray-600 mt-1">
                                📅 {new Date(mtg.meeting_date).toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMeetings(meetings.filter(m => m.id !== mtg.id));
                            const newNotes = {...meetingNotes};
                            delete newNotes[mtg.id];
                            setMeetingNotes(newNotes);
                            const newAttendees = {...meetingAttendees};
                            delete newAttendees[mtg.id];
                            setMeetingAttendees(newAttendees);
                            const newExpanded = new Set(expandedMeetings);
                            newExpanded.delete(mtg.id);
                            setExpandedMeetings(newExpanded);
                          }}
                          className="text-gray-400 hover:text-red-600 text-sm ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Meeting Details - Only shown when expanded */}
                    {isExpanded && (
                      <div className="p-4 space-y-4">
                        {/* Attendee Selector */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Attendees
                          </label>
                          
                          {/* Selected Attendees */}
                          <div className="flex flex-wrap gap-2 mb-2">
                            {(meetingAttendees[mtg.id] || []).map((personId) => {
                              const person = allPeople.find(p => p.id === personId);
                              if (!person) return null;
                              return (
                                <div key={personId} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                  <span>{person.name}</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setMeetingAttendees({
                                        ...meetingAttendees,
                                        [mtg.id]: (meetingAttendees[mtg.id] || []).filter(id => id !== personId)
                                      });
                                    }}
                                    className="text-blue-600 hover:text-blue-800 ml-1"
                                  >
                                    ✕
                                  </button>
                                </div>
                              );
                            })}
                          </div>

                          {/* Add Attendee Button & Dropdown */}
                          <div className="relative" ref={attendeeSelectorRef}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (allPeople.length === 0) {
                                  loadPeople(); // Load contacts if not loaded yet
                                }
                                if (showAttendeeSelector === mtg.id) {
                                  // Closing dropdown - clear all forms
                                  setShowAttendeeSelector(null);
                                  setAttendeeSearchQuery('');
                                  setShowGuestForm(null);
                                  setGuestName('');
                                  setGuestCompany('');
                                } else {
                                  // Opening dropdown
                                  setShowAttendeeSelector(mtg.id);
                                }
                              }}
                              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
                            >
                              + Add Attendee
                            </button>

                            {/* Attendee Dropdown */}
                            {showAttendeeSelector === mtg.id && (
                              <div className="absolute z-10 mt-1 w-96 bg-white border border-gray-300 rounded-md shadow-lg overflow-hidden relative">
                                {/* Search Input & Guest Button - Side by Side */}
                                <div className="p-2 border-b border-gray-200 sticky top-0 bg-white flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Search contacts..."
                                    value={attendeeSearchQuery}
                                    onChange={(e) => setAttendeeSearchQuery(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowGuestForm(mtg.id);
                                    }}
                                    className="px-4 py-1.5 text-sm text-green-600 hover:text-green-700 border border-green-300 rounded-md hover:bg-green-50 transition-colors font-medium whitespace-nowrap"
                                  >
                                    + Guest
                                  </button>
                                </div>
                                
                                {/* Contact List */}
                                <div className="max-h-60 overflow-y-auto">
                                  {allPeople.length === 0 ? (
                                    <div className="p-3 text-sm text-gray-500 italic">
                                      {isLoadingPeople ? 'Loading contacts...' : 'No contacts in your rolodex yet'}
                                    </div>
                                  ) : (
                                    (() => {
                                      const filteredContacts = allPeople
                                        .filter(person => {
                                          // Filter out already added
                                          if ((meetingAttendees[mtg.id] || []).includes(person.id)) return false;
                                          // Filter by search query
                                          if (!attendeeSearchQuery) return true;
                                          const query = attendeeSearchQuery.toLowerCase();
                                          return (
                                            person.name.toLowerCase().includes(query) ||
                                            person.company?.toLowerCase().includes(query) ||
                                            person.role?.toLowerCase().includes(query)
                                          );
                                        });
                                      
                                      return filteredContacts.length === 0 ? (
                                        <div className="p-3 text-sm text-gray-500 italic">
                                          {attendeeSearchQuery ? 'No contacts match your search' : 'All contacts already added'}
                                        </div>
                                      ) : (
                                        filteredContacts.map((person) => (
                                          <button
                                            key={person.id}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setMeetingAttendees({
                                                ...meetingAttendees,
                                                [mtg.id]: [...(meetingAttendees[mtg.id] || []), person.id]
                                              });
                                              setShowAttendeeSelector(null);
                                              setAttendeeSearchQuery('');
                                            }}
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                                          >
                                            <div className="font-medium text-gray-900">{person.name}</div>
                                            {person.role && person.company && (
                                              <div className="text-xs text-gray-600">{person.role} at {person.company}</div>
                                            )}
                                          </button>
                                        ))
                                      );
                                    })()
                                  )}
                                </div>
                                
                                {/* Guest Form - Overlays the contact list */}
                                {showGuestForm === mtg.id && (
                                  <div className="absolute top-0 left-0 right-0 bg-green-50 p-4 z-20 border border-green-300 rounded-md shadow-lg">
                                    <p className="text-sm text-green-900 font-semibold mb-3">Add guest attendee</p>
                                    <div className="space-y-3">
                                      <input
                                        type="text"
                                        placeholder="Name (required)"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full px-2 py-1 text-sm border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                        autoFocus
                                      />
                                      <input
                                        type="text"
                                        placeholder="Company (optional)"
                                        value={guestCompany}
                                        onChange={(e) => setGuestCompany(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full px-2 py-1 text-sm border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                      />
                                      <div className="flex gap-2">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setShowGuestForm(null);
                                            setGuestName('');
                                            setGuestCompany('');
                                          }}
                                          className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            if (!guestName.trim()) {
                                              alert('Please enter a name');
                                              return;
                                            }
                                            
                                            try {
                                              const { data: { session } } = await supabase.auth.getSession();
                                              if (!session) {
                                                alert('Please sign in');
                                                return;
                                              }

                                              // Create guest contact
                                              const { data: newPerson, error } = await supabase
                                                .from('people')
                                                .insert({
                                                  name: guestName,
                                                  company: guestCompany || null,
                                                  user_id: session.user.id,
                                                })
                                                .select()
                                                .single();

                                              if (error) throw error;

                                              // Add to attendees
                                              setMeetingAttendees({
                                                ...meetingAttendees,
                                                [mtg.id]: [...(meetingAttendees[mtg.id] || []), newPerson.id]
                                              });
                                              
                                              // Reload people to include new guest
                                              await loadPeople();
                                              
                                              // Close forms
                                              setShowGuestForm(null);
                                              setShowAttendeeSelector(null);
                                              setGuestName('');
                                              setGuestCompany('');
                                              setAttendeeSearchQuery('');
                                            } catch (error) {
                                              console.error('Error adding guest:', error);
                                              alert('Failed to add guest');
                                            }
                                          }}
                                          disabled={!guestName.trim()}
                                          className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          Add Guest
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Meeting Notes */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes (paste summaries & follow-ups from Granola)
                          </label>
                          <textarea
                            value={meetingNotes[mtg.id] || ''}
                            onChange={(e) => {
                              setMeetingNotes({
                                ...meetingNotes,
                                [mtg.id]: e.target.value
                              });
                            }}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="Paste your meeting notes here...&#10;&#10;Formatting (indents, bullets, etc.) will be preserved."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                            style={{ whiteSpace: 'pre-wrap' }}
                            rows={12}
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            💡 Formatting preserved - indents, bullets, and spacing maintained
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
        </div>

        {/* Right: Ideation Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 border-2 border-orange-300 rounded-lg bg-orange-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-orange-900">Ideation Notes</h3>
              <span className="text-xs text-orange-600">💾 Auto-saved</span>
            </div>
            <p className="text-xs text-orange-700 mb-3">
              Capture insights & ideas as you review meetings. Send them to different parts of your workflow.
            </p>
            
            <textarea
              value={ideationNotes}
              onChange={(e) => setIdeationNotes(e.target.value)}
              placeholder="Start typing your thoughts here..."
              className="w-full px-3 py-2 border border-orange-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none bg-white"
              style={{ whiteSpace: 'pre-wrap', minHeight: '480px' }}
            />
            <p className="text-xs text-orange-600 mt-1">
              {ideationNotes.length} characters
            </p>
            
            <div className="mt-4">
              <p className="text-xs font-semibold text-orange-900 mb-2">Send To:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    // TODO: Send to A.I. for processing
                    alert('A.I. processing coming soon!');
                  }}
                  className="px-3 py-2 text-xs bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  🤖 A.I.
                </button>
                <button
                  onClick={async () => {
                    if (!business?.id) {
                      alert('Please select a business first');
                      return;
                    }
                    if (!ideationNotes.trim()) {
                      alert('Please write something in the ideation notes first');
                      return;
                    }

                    try {
                      const { data: { session } } = await supabase.auth.getSession();
                      if (!session) {
                        alert('Please sign in');
                        return;
                      }

                      const response = await fetch('/api/business/followups/create', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${session.access_token}`,
                        },
                        body: JSON.stringify({
                          business_id: business.id,
                          description: ideationNotes,
                          priority: 'medium',
                          status: 'pending',
                        }),
                      });

                      const result = await response.json();

                      if (result.success) {
                        alert('✅ Follow-up created!');
                        setIdeationNotes('');
                        // Reload follow-ups if we're on the followups view
                        loadBusinessFollowups();
                      } else {
                        alert(`❌ Error: ${result.error}`);
                      }
                    } catch (error) {
                      console.error('Error creating follow-up:', error);
                      alert('❌ Error creating follow-up');
                    }
                  }}
                  className="px-3 py-2 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  📋 Follow Ups
                </button>
                <button
                  onClick={() => {
                    // TODO: Add to conversation starters
                    alert('Conversation starters coming soon!');
                  }}
                  className="px-3 py-2 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  💬 Conversation
                </button>
                <button
                  onClick={async () => {
                    if (!business?.id) {
                      alert('Please select a business first');
                      return;
                    }
                    if (!ideationNotes.trim()) {
                      alert('Please write something in the ideation notes first');
                      return;
                    }

                    try {
                      const { data: { session } } = await supabase.auth.getSession();
                      if (!session) {
                        alert('Please sign in');
                        return;
                      }

                      const response = await fetch('/api/business/notes/create', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${session.access_token}`,
                        },
                        body: JSON.stringify({
                          business_id: business.id,
                          content: ideationNotes,
                          source: 'ideation',
                        }),
                      });

                      const result = await response.json();

                      if (result.success) {
                        alert('✅ Note saved to Notes & Context!');
                        setIdeationNotes('');
                        // Reload notes if we're on the conversations view
                        loadBusinessNotes();
                      } else {
                        alert(`❌ Error: ${result.error}`);
                      }
                    } catch (error) {
                      console.error('Error saving note:', error);
                      alert('❌ Error saving note');
                    }
                  }}
                  className="px-3 py-2 text-xs bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                >
                  📝 Notes
                </button>
              </div>
              
              <button
                onClick={() => setIdeationNotes('')}
                className="w-full mt-3 px-3 py-2 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Clear Notes
              </button>
            </div>
          </div>
        </div>
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
        
        {/* Toggle between Assigned, Library, and Organization */}
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
          <button
            onClick={() => setPeopleViewMode('organization')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              peopleViewMode === 'organization'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Organization
          </button>
        </div>

        {peopleViewMode === 'assigned' ? (
          // Assigned People View
          <div className="space-y-3">
            {!business ? (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-2">No business selected</p>
                <p className="text-sm">Select a business from the list on the left to see assigned people</p>
              </div>
            ) : assignedPeople.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-2">No people assigned yet</p>
                <p className="text-sm">Switch to Library tab to assign people to {business.name}</p>
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
                  <button 
                    onClick={async () => {
                      if (!business) return;
                      
                      try {
                        const { data: { session } } = await supabase.auth.getSession();
                        if (!session) return;

                        const response = await fetch(`/api/business/people/remove?business_id=${business.id}&person_id=${person.id}`, {
                          method: 'DELETE',
                          headers: {
                            'Authorization': `Bearer ${session.access_token}`,
                          },
                        });

                        if (response.ok) {
                          await onReloadBusiness(business.id);
                        }
                      } catch (error) {
                        console.error('Error unassigning person:', error);
                      }
                    }}
                    className="text-gray-400 hover:text-red-600 text-sm font-medium transition-colors"
                    title="Remove from business"
                  >
                    Remove
                  </button>
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
        ) : peopleViewMode === 'library' ? (
          // Library View
          <div>
            {/* Bulk Actions Bar */}
            {selectedPeopleIds.size > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  {selectedPeopleIds.size} {selectedPeopleIds.size === 1 ? 'person' : 'people'} selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedPeopleIds(new Set())}
                    className="px-3 py-1 text-sm text-blue-700 hover:text-blue-900"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleBulkAssign}
                    className="px-4 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                  >
                    Assign Selected
                  </button>
                </div>
              </div>
            )}

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
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedPeopleIds.has(person.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
                onClick={() => togglePersonSelection(person.id)}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedPeopleIds.has(person.id)}
                    onChange={() => {}} // Handled by div onClick
                    className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  
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
        ) : (
          // Organization View
          <div>
            {!business ? (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-2">No business selected</p>
                <p className="text-sm">Select a business from the list on the left</p>
              </div>
            ) : assignedPeople.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-2">No people assigned yet</p>
                <p className="text-sm">Assign people from the Library tab to build your org chart</p>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Visualize the hierarchy and relationships at {business.name}
                  </p>
                </div>

                {/* Hierarchical Org Chart by Levels */}
                {Object.keys(getOrgChartByLevels()).length > 0 && (
                  <div className="mb-6 relative" onMouseMove={handleMouseMove}>
                    {/* SVG overlay for drag line */}
                    {isDraggingConnection && dragLineStart && dragLineEnd && (
                      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{zIndex: 1000}}>
                        <line
                          x1={dragLineStart.x}
                          y1={dragLineStart.y}
                          x2={dragLineEnd.x}
                          y2={dragLineEnd.y}
                          stroke="#3B82F6"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                        />
                        <circle cx={dragLineStart.x} cy={dragLineStart.y} r="4" fill="#3B82F6" />
                        <circle cx={dragLineEnd.x} cy={dragLineEnd.y} r="4" fill="#3B82F6" />
                      </svg>
                    )}
                    
                    {Object.entries(getOrgChartByLevels()).sort(([a], [b]) => Number(a) - Number(b)).map(([level, people]) => (
                        <div key={level} className="mb-8">
                          {/* Level Header with Add Level Button */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              {getLevelLabel(Number(level))}
                            </div>
                            <button
                              onClick={() => {
                                const nextLevel = Number(level) + 1;
                                setVisibleLevels(new Set([...visibleLevels, nextLevel]));
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                              title="Add level below"
                            >
                              ▼ Add level below
                            </button>
                            <button
                              onClick={() => setShowPlaceholderForm(Number(level))}
                              className="text-xs text-green-600 hover:text-green-800 font-medium"
                              title="Add person you know but haven't met"
                            >
                              + Add person
                            </button>
                            <button
                              onClick={() => handleCreateTeam(Number(level))}
                              className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                              title="Create team at this level"
                            >
                              + Create Team
                            </button>
                          </div>

                          {/* Placeholder Form */}
                          {showPlaceholderForm === Number(level) && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-xs text-green-900 font-medium mb-2">Add person (placeholder)</p>
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  placeholder="Name (e.g., Michael Benson)"
                                  value={placeholderName}
                                  onChange={(e) => setPlaceholderName(e.target.value)}
                                  className="w-full px-2 py-1 text-sm border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                  autoFocus
                                />
                                <input
                                  type="text"
                                  placeholder="Title (e.g., CMO)"
                                  value={placeholderTitle}
                                  onChange={(e) => setPlaceholderTitle(e.target.value)}
                                  className="w-full px-2 py-1 text-sm border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setShowPlaceholderForm(null);
                                      setPlaceholderName('');
                                      setPlaceholderTitle('');
                                    }}
                                    className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleAddPlaceholder(Number(level))}
                                    disabled={!placeholderName.trim()}
                                    className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Add to Chart
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* People and Teams at this level - horizontal layout, left-aligned */}
                          <div 
                            className="flex gap-2 flex-wrap justify-start"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => {
                              if (draggedPersonFromList) {
                                handleAddPersonToOrgChart(draggedPersonFromList, Number(level));
                              }
                            }}
                          >
                            {people.length === 0 && (
                              <div className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-400 text-sm hover:border-blue-400 hover:bg-blue-50 transition-colors">
                                Empty level - drag people here or connect reporting relationships
                              </div>
                            )}
                            {people.map((item: any) => {
                              if (item.type === 'person') {
                                const person = item.data;
                                const isExpanded = selectedPersonForDetails.has(person.id);
                                
                                return (
                                  <div 
                                    key={person.id}
                                    className={`relative transition-all ${isExpanded ? 'w-96' : 'w-64'}`}
                                    draggable
                                    onDragStart={() => setDraggedPersonId(person.id)}
                                    onDragEnd={() => setDraggedPersonId(null)}
                                  >
                                    <div onClick={() => {
                                      const newSet = new Set(selectedPersonForDetails);
                                      if (isExpanded) {
                                        newSet.delete(person.id);
                                      } else {
                                        newSet.add(person.id);
                                      }
                                      setSelectedPersonForDetails(newSet);
                                    }}>
                                      <div className={person.isPlaceholder ? 'opacity-60' : ''}>
                                        <OrgChartPerson
                                          id={person.id}
                                          name={person.name}
                                          title={person.title}
                                          level={person.level}
                                          responsibilities={person.responsibilities}
                                          challenges={person.challenges}
                                          needs={person.needs}
                                          notes={person.notes}
                                          onEdit={() => handleEditPerson(person)}
                                          onRemove={() => handleRemovePersonFromOrgChart(person.id)}
                                          onDragStart={handleDragStart}
                                          onDragOver={handleDragOver}
                                          onDrop={handleHierarchyDrop}
                                          isDragging={draggedPersonId === person.id}
                                        />
                                        {person.isPlaceholder && (
                                          <div className="mt-1 text-center">
                                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                                              Not yet contacted
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Expanded Details View */}
                                    {isExpanded && (
                                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                                        <h4 className="text-sm font-semibold text-blue-900">Call Preparation Notes</h4>
                                        
                                        {person.responsibilities && (
                                          <div>
                                            <p className="text-xs font-medium text-gray-700">Responsibilities:</p>
                                            <p className="text-xs text-gray-600">{person.responsibilities}</p>
                                          </div>
                                        )}
                                        
                                        {person.needs && (
                                          <div>
                                            <p className="text-xs font-medium text-gray-700">Needs & Goals:</p>
                                            <p className="text-xs text-gray-600">{person.needs}</p>
                                          </div>
                                        )}
                                        
                                        {person.challenges && (
                                          <div>
                                            <p className="text-xs font-medium text-gray-700">Issues & Challenges:</p>
                                            <p className="text-xs text-gray-600">{person.challenges}</p>
                                          </div>
                                        )}
                                        
                                        {person.notes && (
                                          <div>
                                            <p className="text-xs font-medium text-gray-700">Notes:</p>
                                            <p className="text-xs text-gray-600">{person.notes}</p>
                                          </div>
                                        )}
                                        
                                        {!person.responsibilities && !person.needs && !person.challenges && !person.notes && (
                                          <p className="text-xs text-gray-500 italic">
                                            Click the edit button to add details about this person's goals, needs, and challenges.
                                          </p>
                                        )}
                                      </div>
                                    )}

                                    {/* Show who this person reports to */}
                                    {person.parentId && (
                                      <div className="mt-2 text-xs text-gray-500 text-center">
                                        → Reports to: <span className="font-medium">{orgChartPeople.find(p => p.id === person.parentId)?.name}</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              
                              // Render teams
                              if (item.type === 'team') {
                                const team = item.data;
                                const teamMembers = orgChartPeople.filter(p => team.memberIds.includes(p.id));
                                
                                return (
                                  <div 
                                    key={team.id} 
                                    className="w-64 min-h-24 p-4 bg-purple-50 border-2 border-purple-300 rounded-lg hover:border-purple-500 transition-colors"
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => handleDropOnTeam(team.id)}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <input
                                        type="text"
                                        value={team.name}
                                        onChange={(e) => {
                                          setTeams(teams.map(t => t.id === team.id ? {...t, name: e.target.value} : t));
                                        }}
                                        className="font-semibold text-purple-900 bg-transparent border-b border-purple-300 focus:border-purple-500 outline-none flex-1"
                                        placeholder="Team name..."
                                      />
                                      <button
                                        onClick={() => {
                                          setTeams(teams.filter(t => t.id !== team.id));
                                          setOrgHierarchy(orgHierarchy.filter(item => item.id !== team.id));
                                        }}
                                        className="text-purple-400 hover:text-purple-700 text-xs ml-2"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                    <p className="text-xs text-purple-600 mb-2">
                                      {team.memberIds.length} {team.memberIds.length === 1 ? 'member' : 'members'}
                                    </p>
                                    
                                    {/* Team Members */}
                                    {teamMembers.length > 0 ? (
                                      <div className="mt-2 space-y-2">
                                        {teamMembers.map(member => {
                                          const isExpanded = selectedPersonForDetails.has(member.id);
                                          return (
                                            <div key={member.id} className="bg-white rounded p-2">
                                              <div className="flex items-start justify-between mb-1">
                                                <div className="flex-1">
                                                  <div 
                                                    className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer flex items-center gap-1"
                                                    onClick={() => {
                                                      const newSet = new Set(selectedPersonForDetails);
                                                      if (isExpanded) {
                                                        newSet.delete(member.id);
                                                      } else {
                                                        newSet.add(member.id);
                                                      }
                                                      setSelectedPersonForDetails(newSet);
                                                    }}
                                                  >
                                                    <span className="text-xs">{isExpanded ? '▼' : '▶'}</span>
                                                    <span className="text-sm">{member.name}</span>
                                                  </div>
                                                  <p className="text-xs text-blue-700 mt-1">{member.title}</p>
                                                </div>
                                                <button
                                                  onClick={() => {
                                                    setTeams(teams.map(t => 
                                                      t.id === team.id 
                                                        ? {...t, memberIds: t.memberIds.filter(id => id !== member.id)} 
                                                        : t
                                                    ));
                                                  }}
                                                  className="text-gray-400 hover:text-red-600 text-xs"
                                                >
                                                  ✕
                                                </button>
                                              </div>
                                              
                                              {/* Expanded Editable Details */}
                                              {isExpanded && (
                                                <div className="mt-2 pt-2 border-t border-blue-200 space-y-2">
                                                  <div>
                                                    <label className="text-xs font-medium text-gray-700 block mb-1">Goals:</label>
                                                    <textarea
                                                      value={member.needs || ''}
                                                      onChange={(e) => {
                                                        setOrgChartPeople(orgChartPeople.map(p => 
                                                          p.id === member.id ? {...p, needs: e.target.value} : p
                                                        ));
                                                      }}
                                                      placeholder="What are they trying to accomplish?"
                                                      className="w-full text-xs p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
                                                      rows={3}
                                                      style={{ minHeight: '60px' }}
                                                      onInput={(e) => {
                                                        const target = e.target as HTMLTextAreaElement;
                                                        target.style.height = 'auto';
                                                        target.style.height = target.scrollHeight + 'px';
                                                      }}
                                                    />
                                                  </div>
                                                  
                                                  <div>
                                                    <label className="text-xs font-medium text-gray-700 block mb-1">Challenges:</label>
                                                    <textarea
                                                      value={member.challenges || ''}
                                                      onChange={(e) => {
                                                        setOrgChartPeople(orgChartPeople.map(p => 
                                                          p.id === member.id ? {...p, challenges: e.target.value} : p
                                                        ));
                                                      }}
                                                      placeholder="What problems are they facing?"
                                                      className="w-full text-xs p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
                                                      rows={3}
                                                      style={{ minHeight: '60px' }}
                                                      onInput={(e) => {
                                                        const target = e.target as HTMLTextAreaElement;
                                                        target.style.height = 'auto';
                                                        target.style.height = target.scrollHeight + 'px';
                                                      }}
                                                    />
                                                  </div>
                                                  
                                                  <div>
                                                    <label className="text-xs font-medium text-gray-700 block mb-1">Needs:</label>
                                                    <textarea
                                                      value={member.responsibilities || ''}
                                                      onChange={(e) => {
                                                        setOrgChartPeople(orgChartPeople.map(p => 
                                                          p.id === member.id ? {...p, responsibilities: e.target.value} : p
                                                        ));
                                                      }}
                                                      placeholder="What do they need from you?"
                                                      className="w-full text-xs p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
                                                      rows={3}
                                                      style={{ minHeight: '60px' }}
                                                      onInput={(e) => {
                                                        const target = e.target as HTMLTextAreaElement;
                                                        target.style.height = 'auto';
                                                        target.style.height = target.scrollHeight + 'px';
                                                      }}
                                                    />
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <div className="mt-2 p-2 border-2 border-dashed border-purple-200 rounded text-center text-xs text-purple-400">
                                        Drag people here
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              
                              return null;
                            })}
                          </div>
                        </div>
                    ))}
                  </div>
                )}

                {/* Separator */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-sm text-gray-500 font-medium">
                      {orgChartPeople.length === 0 ? 'Drag people here to build org chart' : 'Assigned People'}
                    </span>
                  </div>
                </div>

                {/* Assigned People (not in org chart) */}
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 mb-3">
                    Drag people to any level or click to add at Executive level. Use drag connections to set reporting structure.
                  </p>
                  {assignedPeople
                    .filter(person => !orgChartPeople.some(op => op.personId === person.id))
                    .map((person) => (
                      <div
                        key={person.id}
                        draggable
                        onDragStart={() => setDraggedPersonFromList(person)}
                        onDragEnd={() => setDraggedPersonFromList(null)}
                        onClick={() => handleAddPersonToOrgChart(person)}
                        className="p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 cursor-move transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{person.name}</h3>
                            {person.company && (
                              <p className="text-sm text-gray-600 mt-1">
                                {person.role && `${person.role} at `}{person.company}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-blue-600 font-medium">+ Add to chart</span>
                        </div>
                      </div>
                    ))}
                  
                  {assignedPeople.filter(p => !orgChartPeople.some(op => op.personId === p.id)).length === 0 && orgChartPeople.length > 0 && (
                    <p className="text-center text-sm text-gray-500 py-4">
                      All assigned people are in the org chart
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Person Modal */}
        {editingPerson && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Edit: {editingPerson.name}
                  </h3>
                  <button
                    onClick={() => setEditingPerson(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">{editingPerson.title}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Goals / What they manage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Goals / What They Manage
                  </label>
                  <textarea
                    value={editForm.responsibilities}
                    onChange={(e) => setEditForm({ ...editForm, responsibilities: e.target.value })}
                    placeholder="What are their goals? What do they manage or oversee?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    rows={3}
                  />
                </div>

                {/* Issues / Challenges */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issues / Challenges
                  </label>
                  <textarea
                    value={editForm.challenges}
                    onChange={(e) => setEditForm({ ...editForm, challenges: e.target.value })}
                    placeholder="What challenges are they facing? What problems need solving?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    rows={3}
                  />
                </div>

                {/* What They Need */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What They Need
                  </label>
                  <textarea
                    value={editForm.needs}
                    onChange={(e) => setEditForm({ ...editForm, needs: e.target.value })}
                    placeholder="What do they need? Resources, support, information?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    rows={3}
                  />
                </div>

                {/* Communication Strategy */}
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">
                    Communication Strategy
                  </label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    placeholder="What should you communicate to them? Key messages, talking points?"
                    className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y bg-blue-50"
                    rows={3}
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  onClick={() => setEditingPerson(null)}
                  className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePersonDetails}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Pipeline / Kanban View
  if (workspaceView === 'pipeline') {
    const stages: Array<{key: Business['stage'], label: string, color: string}> = [
      { key: 'discovery', label: 'Discovery', color: 'bg-gray-100 border-gray-300' },
      { key: 'qualification', label: 'Qualification', color: 'bg-blue-100 border-blue-300' },
      { key: 'proposal', label: 'Proposal', color: 'bg-purple-100 border-purple-300' },
      { key: 'negotiation', label: 'Negotiation', color: 'bg-yellow-100 border-yellow-300' },
      { key: 'closed_won', label: 'Closed Won', color: 'bg-green-100 border-green-300' },
      { key: 'closed_lost', label: 'Closed Lost', color: 'bg-red-100 border-red-300' },
    ];

    const handleDragStartBusiness = (business: Business) => {
      setDraggedBusiness(business);
    };

    const handleDropOnStage = async (stage: Business['stage']) => {
      if (!draggedBusiness || draggedBusiness.stage === stage) {
        setDraggedBusiness(null);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const response = await fetch(`/api/business/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            id: draggedBusiness.id,
            stage: stage,
          }),
        });

        if (response.ok) {
          // Reload businesses by reloading current business
          if (business?.id) {
            await onReloadBusiness(business.id);
          }
        }
      } catch (error) {
        console.error('Error updating business stage:', error);
      } finally {
        setDraggedBusiness(null);
      }
    };

    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Pipeline</h2>
        <p className="text-sm text-gray-600 mb-6">Drag businesses between stages to update their status</p>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map(stage => {
            const businessesInStage = allBusinesses.filter(b => b.stage === stage.key);
            
            return (
              <div
                key={stage.key}
                className="flex-shrink-0 w-72"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDropOnStage(stage.key)}
              >
                <div className={`rounded-lg border-2 ${stage.color} p-3 mb-3`}>
                  <h3 className="font-semibold text-gray-900">{stage.label}</h3>
                  <p className="text-xs text-gray-600 mt-1">{businessesInStage.length} {businessesInStage.length === 1 ? 'business' : 'businesses'}</p>
                </div>

                <div className="space-y-2">
                  {businessesInStage.map(biz => (
                    <div
                      key={biz.id}
                      draggable
                      onDragStart={() => handleDragStartBusiness(biz)}
                      className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm cursor-move hover:shadow-md transition-shadow"
                      onClick={() => onBusinessSelect && onBusinessSelect(biz)}
                    >
                      <h4 className="font-semibold text-gray-900 text-sm">{biz.name}</h4>
                      {biz.industry && (
                        <p className="text-xs text-gray-600 mt-1">{biz.industry}</p>
                      )}
                      {biz.deal_value && (
                        <p className="text-xs text-green-600 font-medium mt-1">
                          ${(biz.deal_value / 1000).toFixed(0)}K
                        </p>
                      )}
                    </div>
                  ))}

                  {businessesInStage.length === 0 && (
                    <div className="p-4 text-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Follow Ups view
  if (workspaceView === 'followups') {
    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Follow Ups</h2>
        {!business ? (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-2">No business selected</p>
            <p className="text-sm">Select a business to see follow-ups</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                Track action items and next steps for {business.name}
              </p>
              <button
                onClick={() => loadBusinessFollowups()}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                🔄 Refresh
              </button>
            </div>

            {businessFollowups.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>No follow-ups yet</p>
                <p className="text-sm mt-2">Use the Ideation panel to create follow-ups</p>
              </div>
            ) : (
              <div className="space-y-3">
                {businessFollowups.map((followup) => {
                  const isExpanded = expandedFollowups.has(followup.id);
                  const firstLine = followup.description.split('\n')[0].substring(0, 60);
                  const preview = followup.description.length > 60 || followup.description.includes('\n')
                    ? `${firstLine}${followup.description.length > 60 ? '...' : ''}`
                    : followup.description;

                  return (
                    <div
                      key={followup.id}
                      className="border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors"
                    >
                      {/* Header - Always Visible */}
                      <div
                        onClick={() => {
                          const newExpanded = new Set(expandedFollowups);
                          if (isExpanded) {
                            newExpanded.delete(followup.id);
                          } else {
                            newExpanded.add(followup.id);
                          }
                          setExpandedFollowups(newExpanded);
                        }}
                        className="p-4 cursor-pointer flex items-start justify-between"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs text-gray-500">
                              {new Date(followup.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                            <Badge
                              className={
                                followup.priority === 'high'
                                  ? 'bg-red-100 text-red-700 border-red-200'
                                  : followup.priority === 'medium'
                                  ? 'bg-amber-100 text-amber-700 border-amber-200'
                                  : 'bg-gray-100 text-gray-700 border-gray-200'
                              }
                            >
                              {followup.priority}
                            </Badge>
                            <Badge
                              className={
                                followup.status === 'completed'
                                  ? 'bg-green-100 text-green-700 border-green-200'
                                  : followup.status === 'cancelled'
                                  ? 'bg-gray-100 text-gray-500 border-gray-200'
                                  : 'bg-blue-100 text-blue-700 border-blue-200'
                              }
                            >
                              {followup.status}
                            </Badge>
                          </div>
                          {!isExpanded && (
                            <p className="text-sm text-gray-600 truncate">{preview}</p>
                          )}
                        </div>
                        <span className={`ml-3 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                          ▶
                        </span>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="px-4 pb-4">
                          <div className="pt-2 border-t border-gray-100">
                            <p className="text-sm text-gray-800 whitespace-pre-wrap">{followup.description}</p>
                            {followup.due_date && (
                              <p className="text-xs text-gray-500 mt-3">
                                📅 Due: {new Date(followup.due_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Conversations view (Notes & Context)
  if (workspaceView === 'conversations') {
    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes & Context</h2>
        {!business ? (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-2">No business selected</p>
            <p className="text-sm">Select a business to see notes</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                Notes and context about {business.name}
              </p>
              <button
                onClick={() => loadBusinessNotes()}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                🔄 Refresh
              </button>
            </div>

            {businessNotes.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>No notes yet</p>
                <p className="text-sm mt-2">Use the Ideation panel to create notes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {businessNotes.map((note) => {
                  const isExpanded = expandedNotes.has(note.id);
                  const firstLine = note.content.split('\n')[0].substring(0, 80);
                  const preview = note.content.length > 80 || note.content.includes('\n') 
                    ? `${firstLine}${note.content.length > 80 ? '...' : ''}`
                    : note.content;

                  return (
                    <div
                      key={note.id}
                      className="border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors"
                    >
                      {/* Header - Always Visible */}
                      <div
                        onClick={() => {
                          const newExpanded = new Set(expandedNotes);
                          if (isExpanded) {
                            newExpanded.delete(note.id);
                          } else {
                            newExpanded.add(note.id);
                          }
                          setExpandedNotes(newExpanded);
                        }}
                        className="p-4 cursor-pointer flex items-start justify-between"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-500">
                              {new Date(note.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </span>
                            {note.source && note.source !== 'manual' && (
                              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                {note.source}
                              </span>
                            )}
                          </div>
                          {!isExpanded && (
                            <p className="text-sm text-gray-600 truncate">{preview}</p>
                          )}
                        </div>
                        <span className={`ml-3 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                          ▶
                        </span>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="px-4 pb-4">
                          <div className="pt-2 border-t border-gray-100">
                            <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.content}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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
