'use client';

import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Business, Meeting, Person, WorkspaceView, PeopleViewMode, BusinessWithRelations, MeetingWithRelations } from '@/lib/types';
import OrgChartPerson from './OrgChartPerson';
import MeetingsView from './views/MeetingsView';
import PeopleView from './views/PeopleView';
import BusinessFollowupsView from './views/BusinessFollowupsView';
import BusinessNotesView from './views/BusinessNotesView';
import ConversationsView from './views/ConversationsView';
import LibraryView from './views/LibraryView';

/**
 * RIGHT PANEL - Dynamic Workspace
 * Manages all workspace views and their state
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

export default function RightPanel({
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
  const [conversationStrategies, setConversationStrategies] = useState<any[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<any | null>(null);
  const [newStrategy, setNewStrategy] = useState({
    situation: '',
    goal: '',
    contextSources: [] as string[],
    attendeeIds: [] as string[]
  });
  const [conversationSteps, setConversationSteps] = useState<any[]>([]);
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const [clarifyingQuestions, setClarifyingQuestions] = useState<string[]>([]);
  const [clarifyingAnswers, setClarifyingAnswers] = useState<{[key: number]: string}>({});
  const [isBuildFormCollapsed, setIsBuildFormCollapsed] = useState(false);

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

  // Load business notes when notes view is opened
  useEffect(() => {
    if (workspaceView === 'notes' && business?.id) {
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
    
    // Relationship circle filter
    if (selectedFilter === 'inner_circle' || selectedFilter === 'professional' || 
        selectedFilter === 'genuine_interest' || selectedFilter === 'acquaintance' || 
        selectedFilter === 'brief_encounter' || selectedFilter === 'not_met') {
      return matchesSearch && person.relationship_circle === selectedFilter;
    }
    
    // Tag filter (business, personal, projects)
    const matchesFilter = selectedFilter === 'all'; // TODO: implement tag filtering for business/personal/projects
    
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

  // VIEW ROUTING
  if (workspaceView === 'meeting') {
    return (
      <MeetingsView
        business={business}
        meetings={meetings}
        setMeetings={setMeetings}
        showNewMeetingForm={showNewMeetingForm}
        setShowNewMeetingForm={setShowNewMeetingForm}
        newMeetingTitle={newMeetingTitle}
        setNewMeetingTitle={setNewMeetingTitle}
        newMeetingDate={newMeetingDate}
        setNewMeetingDate={setNewMeetingDate}
        meetingNotes={meetingNotes}
        setMeetingNotes={setMeetingNotes}
        expandedMeetings={expandedMeetings}
        setExpandedMeetings={setExpandedMeetings}
        draggedMeetingId={draggedMeetingId}
        setDraggedMeetingId={setDraggedMeetingId}
        meetingAttendees={meetingAttendees}
        setMeetingAttendees={setMeetingAttendees}
        showAttendeeSelector={showAttendeeSelector}
        setShowAttendeeSelector={setShowAttendeeSelector}
        attendeeSearchQuery={attendeeSearchQuery}
        setAttendeeSearchQuery={setAttendeeSearchQuery}
        showGuestForm={showGuestForm}
        setShowGuestForm={setShowGuestForm}
        guestName={guestName}
        setGuestName={setGuestName}
        guestCompany={guestCompany}
        setGuestCompany={setGuestCompany}
        attendeeSelectorRef={attendeeSelectorRef}
        editingMeetingTitle={editingMeetingTitle}
        setEditingMeetingTitle={setEditingMeetingTitle}
        ideationNotes={ideationNotes}
        setIdeationNotes={setIdeationNotes}
        hasUnsavedChanges={hasUnsavedChanges}
        isAutoSaving={isAutoSaving}
        allPeople={allPeople}
        isLoadingPeople={isLoadingPeople}
        loadPeople={loadPeople}
        loadBusinessFollowups={loadBusinessFollowups}
        loadBusinessNotes={loadBusinessNotes}
      />
    );
  }

  if (workspaceView === 'people') {
    return (
      <PeopleView
        business={business}
        allPeople={allPeople}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        isLoadingPeople={isLoadingPeople}
        peopleViewMode={peopleViewMode}
        setPeopleViewMode={setPeopleViewMode}
        selectedPeopleIds={selectedPeopleIds}
        setSelectedPeopleIds={setSelectedPeopleIds}
        assignedPeople={assignedPeople}
        orgChartPeople={orgChartPeople}
        setOrgChartPeople={setOrgChartPeople}
        teams={teams}
        setTeams={setTeams}
        visibleLevels={visibleLevels}
        setVisibleLevels={setVisibleLevels}
        draggedPersonId={draggedPersonId}
        setDraggedPersonId={setDraggedPersonId}
        draggedPersonFromList={draggedPersonFromList}
        setDraggedPersonFromList={setDraggedPersonFromList}
        selectedPersonForDetails={selectedPersonForDetails}
        setSelectedPersonForDetails={setSelectedPersonForDetails}
        showPlaceholderForm={showPlaceholderForm}
        setShowPlaceholderForm={setShowPlaceholderForm}
        placeholderName={placeholderName}
        setPlaceholderName={setPlaceholderName}
        placeholderTitle={placeholderTitle}
        setPlaceholderTitle={setPlaceholderTitle}
        editingPerson={editingPerson}
        setEditingPerson={setEditingPerson}
        editForm={editForm}
        setEditForm={setEditForm}
        draggedTeamId={draggedTeamId}
        setDraggedTeamId={setDraggedTeamId}
        orgHierarchy={orgHierarchy}
        setOrgHierarchy={setOrgHierarchy}
        connectingFrom={connectingFrom}
        isDraggingConnection={isDraggingConnection}
        dragLineStart={dragLineStart}
        dragLineEnd={dragLineEnd}
        loadPeople={loadPeople}
        togglePersonSelection={togglePersonSelection}
        handleAssignPerson={handleAssignPerson}
        handleBulkAssign={handleBulkAssign}
        handleAddPersonToOrgChart={handleAddPersonToOrgChart}
        handleRemovePersonFromOrgChart={handleRemovePersonFromOrgChart}
        handleDragStart={handleDragStart}
        handleTeamDragStart={handleTeamDragStart}
        handleDragOver={handleDragOver}
        handleHierarchyDrop={handleHierarchyDrop}
        handleCreateTeam={handleCreateTeam}
        handleDropOnTeam={handleDropOnTeam}
        handleEditPerson={handleEditPerson}
        handleSavePersonDetails={handleSavePersonDetails}
        getLevelLabel={getLevelLabel}
        getOrgChartByLevels={getOrgChartByLevels}
        handleMouseMove={handleMouseMove}
        handleAddPlaceholder={handleAddPlaceholder}
        onReloadBusiness={onReloadBusiness}
        allBusinesses={allBusinesses}
        filteredPeople={filteredPeople}
      />
    );
  }

  if (workspaceView === 'followups') {
    return (
      <BusinessFollowupsView
        business={business}
        businessFollowups={businessFollowups}
        expandedFollowups={expandedFollowups}
        setExpandedFollowups={setExpandedFollowups}
        loadBusinessFollowups={loadBusinessFollowups}
      />
    );
  }

  if (workspaceView === 'notes') {
    return (
      <BusinessNotesView
        business={business}
        businessNotes={businessNotes}
        expandedNotes={expandedNotes}
        setExpandedNotes={setExpandedNotes}
        loadBusinessNotes={loadBusinessNotes}
      />
    );
  }

  if (workspaceView === 'conversations') {
    return (
      <ConversationsView
        business={business}
        allPeople={allPeople}
        conversationStrategies={conversationStrategies}
        setConversationStrategies={setConversationStrategies}
        selectedStrategy={selectedStrategy}
        setSelectedStrategy={setSelectedStrategy}
        newStrategy={newStrategy}
        setNewStrategy={setNewStrategy}
        conversationSteps={conversationSteps}
        setConversationSteps={setConversationSteps}
        isGeneratingStrategy={isGeneratingStrategy}
        setIsGeneratingStrategy={setIsGeneratingStrategy}
        clarifyingQuestions={clarifyingQuestions}
        setClarifyingQuestions={setClarifyingQuestions}
        clarifyingAnswers={clarifyingAnswers}
        setClarifyingAnswers={setClarifyingAnswers}
        isBuildFormCollapsed={isBuildFormCollapsed}
        setIsBuildFormCollapsed={setIsBuildFormCollapsed}
      />
    );
  }

  // Default fallback
  return <LibraryView />;
}
