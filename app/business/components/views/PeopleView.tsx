'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BusinessWithRelations, Person, PeopleViewMode, Business } from '@/lib/types';
import OrgChartPerson from '../OrgChartPerson';

interface PeopleViewProps {
  business: BusinessWithRelations | null;
  allPeople: Person[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  isLoadingPeople: boolean;
  peopleViewMode: PeopleViewMode;
  setPeopleViewMode: (mode: PeopleViewMode) => void;
  selectedPeopleIds: Set<string>;
  setSelectedPeopleIds: (ids: Set<string>) => void;
  assignedPeople: Person[];
  orgChartPeople: any[];
  setOrgChartPeople: (people: any[]) => void;
  teams: Array<{id: string, name: string, memberIds: string[], order: number}>;
  setTeams: (teams: Array<{id: string, name: string, memberIds: string[], order: number}>) => void;
  visibleLevels: Set<number>;
  setVisibleLevels: (levels: Set<number>) => void;
  draggedPersonId: string | null;
  setDraggedPersonId: (id: string | null) => void;
  draggedPersonFromList: Person | null;
  setDraggedPersonFromList: (person: Person | null) => void;
  selectedPersonForDetails: Set<string>;
  setSelectedPersonForDetails: (ids: Set<string>) => void;
  showPlaceholderForm: number | null;
  setShowPlaceholderForm: (level: number | null) => void;
  placeholderName: string;
  setPlaceholderName: (name: string) => void;
  placeholderTitle: string;
  setPlaceholderTitle: (title: string) => void;
  editingPerson: any | null;
  setEditingPerson: (person: any | null) => void;
  editForm: {
    responsibilities: string;
    challenges: string;
    needs: string;
    notes: string;
  };
  setEditForm: (form: {
    responsibilities: string;
    challenges: string;
    needs: string;
    notes: string;
  }) => void;
  draggedTeamId: string | null;
  setDraggedTeamId: (id: string | null) => void;
  orgHierarchy: Array<{type: 'person' | 'team', id: string}>;
  setOrgHierarchy: (hierarchy: Array<{type: 'person' | 'team', id: string}>) => void;
  connectingFrom: string | null;
  isDraggingConnection: boolean;
  dragLineStart: {x: number, y: number} | null;
  dragLineEnd: {x: number, y: number} | null;
  loadPeople: () => Promise<void>;
  togglePersonSelection: (personId: string) => void;
  handleAssignPerson: (person: Person) => Promise<void>;
  handleBulkAssign: () => Promise<void>;
  handleAddPersonToOrgChart: (person: Person, level?: number) => void;
  handleRemovePersonFromOrgChart: (personId: string) => void;
  handleDragStart: (personId: string) => void;
  handleTeamDragStart: (teamId: string) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleHierarchyDrop: (targetPersonId: string) => void;
  handleCreateTeam: (level: number) => void;
  handleDropOnTeam: (teamId: string) => void;
  handleEditPerson: (person: any) => void;
  handleSavePersonDetails: () => void;
  getLevelLabel: (level: number) => string;
  getOrgChartByLevels: () => {[key: number]: any[]};
  handleMouseMove: (e: React.MouseEvent) => void;
  handleAddPlaceholder: (level: number) => void;
  onReloadBusiness: (businessId: string) => Promise<void>;
  allBusinesses: Business[];
  filteredPeople: Person[];
}

export default function PeopleView(props: PeopleViewProps) {
  const [sortBy, setSortBy] = useState<'name' | 'date-added' | 'company'>('date-added');
  
  const {
    business,
    allPeople,
    searchQuery,
    setSearchQuery,
    selectedFilter,
    setSelectedFilter,
    isLoadingPeople,
    peopleViewMode,
    setPeopleViewMode,
    selectedPeopleIds,
    setSelectedPeopleIds,
    assignedPeople,
    orgChartPeople,
    setOrgChartPeople,
    teams,
    setTeams,
    visibleLevels,
    setVisibleLevels,
    draggedPersonId,
    setDraggedPersonId,
    draggedPersonFromList,
    setDraggedPersonFromList,
    selectedPersonForDetails,
    setSelectedPersonForDetails,
    showPlaceholderForm,
    setShowPlaceholderForm,
    placeholderName,
    setPlaceholderName,
    placeholderTitle,
    setPlaceholderTitle,
    editingPerson,
    setEditingPerson,
    editForm,
    setEditForm,
    draggedTeamId,
    setDraggedTeamId,
    orgHierarchy,
    setOrgHierarchy,
    connectingFrom,
    isDraggingConnection,
    dragLineStart,
    dragLineEnd,
    loadPeople,
    togglePersonSelection,
    handleAssignPerson,
    handleBulkAssign,
    handleAddPersonToOrgChart,
    handleRemovePersonFromOrgChart,
    handleDragStart,
    handleTeamDragStart,
    handleDragOver,
    handleHierarchyDrop,
    handleCreateTeam,
    handleDropOnTeam,
    handleEditPerson,
    handleSavePersonDetails,
    getLevelLabel,
    getOrgChartByLevels,
    handleMouseMove,
    handleAddPlaceholder,
    onReloadBusiness,
    allBusinesses,
    filteredPeople
  } = props;

  // Sort filtered people based on selected sort option
  const sortedPeople = [...filteredPeople].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'company':
        return (a.company || '').localeCompare(b.company || '');
      case 'date-added':
      default:
        // Most recent first
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
  });

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

            {/* Search and Sort Bar */}
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                placeholder="Search people by name, company, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'date-added' | 'company')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="date-added">Sort: Recently Added</option>
                <option value="name">Sort: Name (A-Z)</option>
                <option value="company">Sort: Company</option>
              </select>
            </div>

            {/* Filter Tags - Matching existing UI */}
            <div className="space-y-3 mb-4">
              <div className="flex flex-wrap gap-2">
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
              
              {/* Relationship Circle Filters */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-500 self-center mr-2">Relationship:</span>
                <Badge 
                  variant={selectedFilter === 'inner_circle' ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-pink-100 border-pink-300"
                  onClick={() => setSelectedFilter('inner_circle')}
                >
                  ❤️ Inner Circle
                </Badge>
                <Badge 
                  variant={selectedFilter === 'professional' ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-blue-100 border-blue-300"
                  onClick={() => setSelectedFilter('professional')}
                >
                  💼 Professional
                </Badge>
                <Badge 
                  variant={selectedFilter === 'genuine_interest' ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-purple-100 border-purple-300"
                  onClick={() => setSelectedFilter('genuine_interest')}
                >
                  👥 Genuine Interest
                </Badge>
                <Badge 
                  variant={selectedFilter === 'acquaintance' ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-green-100 border-green-300"
                  onClick={() => setSelectedFilter('acquaintance')}
                >
                  🙋 Acquaintance
                </Badge>
                <Badge 
                  variant={selectedFilter === 'brief_encounter' ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-yellow-100 border-yellow-300"
                  onClick={() => setSelectedFilter('brief_encounter')}
                >
                  ☕ Brief Encounter
                </Badge>
                <Badge 
                  variant={selectedFilter === 'not_met' ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-gray-100 border-gray-300"
                  onClick={() => setSelectedFilter('not_met')}
                >
                  👁️ Not Met Yet
                </Badge>
              </div>
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
          ) : sortedPeople.length === 0 ? (
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
            sortedPeople.map((person) => (
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
