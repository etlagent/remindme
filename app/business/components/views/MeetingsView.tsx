import { useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { BusinessWithRelations, Meeting, Person } from '@/lib/types';

/**
 * Meetings View
 * Manages meetings with notes, attendees, and ideation panel
 */
interface MeetingsViewProps {
  business: BusinessWithRelations | null;
  meetings: Meeting[];
  setMeetings: (meetings: Meeting[]) => void;
  showNewMeetingForm: boolean;
  setShowNewMeetingForm: (show: boolean) => void;
  newMeetingTitle: string;
  setNewMeetingTitle: (title: string) => void;
  newMeetingDate: string;
  setNewMeetingDate: (date: string) => void;
  meetingNotes: {[key: string]: string};
  setMeetingNotes: (notes: {[key: string]: string}) => void;
  expandedMeetings: Set<string>;
  setExpandedMeetings: (meetings: Set<string>) => void;
  draggedMeetingId: string | null;
  setDraggedMeetingId: (id: string | null) => void;
  meetingAttendees: {[key: string]: string[]};
  setMeetingAttendees: (attendees: {[key: string]: string[]}) => void;
  showAttendeeSelector: string | null;
  setShowAttendeeSelector: (id: string | null) => void;
  attendeeSearchQuery: string;
  setAttendeeSearchQuery: (query: string) => void;
  showGuestForm: string | null;
  setShowGuestForm: (id: string | null) => void;
  guestName: string;
  setGuestName: (name: string) => void;
  guestCompany: string;
  setGuestCompany: (company: string) => void;
  attendeeSelectorRef: React.RefObject<HTMLDivElement | null>;
  editingMeetingTitle: string | null;
  setEditingMeetingTitle: (id: string | null) => void;
  ideationNotes: string;
  setIdeationNotes: (notes: string) => void;
  hasUnsavedChanges: boolean;
  isAutoSaving: boolean;
  allPeople: Person[];
  isLoadingPeople: boolean;
  loadPeople: () => Promise<void>;
  loadBusinessFollowups: () => Promise<void>;
  loadBusinessNotes: () => Promise<void>;
}

export default function MeetingsView({
  business,
  meetings,
  setMeetings,
  showNewMeetingForm,
  setShowNewMeetingForm,
  newMeetingTitle,
  setNewMeetingTitle,
  newMeetingDate,
  setNewMeetingDate,
  meetingNotes,
  setMeetingNotes,
  expandedMeetings,
  setExpandedMeetings,
  draggedMeetingId,
  setDraggedMeetingId,
  meetingAttendees,
  setMeetingAttendees,
  showAttendeeSelector,
  setShowAttendeeSelector,
  attendeeSearchQuery,
  setAttendeeSearchQuery,
  showGuestForm,
  setShowGuestForm,
  guestName,
  setGuestName,
  guestCompany,
  setGuestCompany,
  attendeeSelectorRef,
  editingMeetingTitle,
  setEditingMeetingTitle,
  ideationNotes,
  setIdeationNotes,
  hasUnsavedChanges,
  isAutoSaving,
  allPeople,
  isLoadingPeople,
  loadPeople,
  loadBusinessFollowups,
  loadBusinessNotes
}: MeetingsViewProps) {
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
                  draggable={!isExpanded}
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
