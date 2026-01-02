'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Meeting } from '@/lib/types/decide';

interface PreviousMeetingSectionProps {
  meetingId: string;
  currentMeetingBusinessId?: string;
  onUpdate: (updates: Partial<Meeting>) => Promise<Meeting>;
  onPreviewMeeting: (meeting: Meeting) => void;
}

interface MeetingOption {
  id: string;
  title: string;
  meeting_date: string;
  meeting_summary?: string;
  business_id?: string;
}

type ViewMode = 'linked' | 'all-business' | 'by-attendee' | 'all-meetings';

interface Attendee {
  id: string;
  person_id: string;
  people: {
    id: string;
    name: string;
  };
}

export default function PreviousMeetingSection({
  meetingId,
  currentMeetingBusinessId,
  onUpdate,
  onPreviewMeeting
}: PreviousMeetingSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [linkedMeetings, setLinkedMeetings] = useState<MeetingOption[]>([]);
  const [businessMeetings, setBusinessMeetings] = useState<MeetingOption[]>([]);
  const [availableMeetings, setAvailableMeetings] = useState<MeetingOption[]>([]);
  const [showSelector, setShowSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('linked');
  const [expandedMeetingId, setExpandedMeetingId] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [selectedAttendeeId, setSelectedAttendeeId] = useState<string | null>(null);
  const [attendeeMeetings, setAttendeeMeetings] = useState<MeetingOption[]>([]);
  const [allMeetings, setAllMeetings] = useState<MeetingOption[]>([]);

  useEffect(() => {
    loadLinkedMeetings();
    loadAttendees();
    if (currentMeetingBusinessId) {
      loadBusinessMeetings();
    }
    loadAllMeetings();
  }, [meetingId, currentMeetingBusinessId]);

  useEffect(() => {
    if (selectedAttendeeId) {
      loadMeetingsByAttendee(selectedAttendeeId);
    }
  }, [selectedAttendeeId]);

  const loadLinkedMeetings = async () => {
    try {
      const { data: relationships, error } = await supabase
        .from('meeting_relationships')
        .select('related_meeting_id')
        .eq('meeting_id', meetingId);

      if (relationships && !error && relationships.length > 0) {
        const meetingIds = relationships.map(r => r.related_meeting_id);
        
        const { data: meetings, error: meetingsError } = await supabase
          .from('meetings')
          .select('id, title, meeting_date, meeting_summary, business_id')
          .in('id', meetingIds)
          .order('meeting_date', { ascending: false });

        if (meetings && !meetingsError) {
          setLinkedMeetings(meetings);
        }
      } else {
        setLinkedMeetings([]);
      }
    } catch (err) {
      console.error('Error loading linked meetings:', err);
    }
  };

  const loadBusinessMeetings = async () => {
    if (!currentMeetingBusinessId) return;

    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('id, title, meeting_date, meeting_summary, business_id')
        .eq('business_id', currentMeetingBusinessId)
        .neq('id', meetingId)
        .order('meeting_date', { ascending: false });

      if (data && !error) {
        setBusinessMeetings(data);
      }
    } catch (err) {
      console.error('Error loading business meetings:', err);
    }
  };

  const loadAllMeetings = async () => {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('id, title, meeting_date, meeting_summary, business_id')
        .neq('id', meetingId)
        .order('meeting_date', { ascending: false });

      if (data && !error) {
        setAllMeetings(data);
      }
    } catch (err) {
      console.error('Error loading all meetings:', err);
    }
  };

  const loadAttendees = async () => {
    try {
      const { data, error } = await supabase
        .from('meeting_attendees')
        .select(`
          id,
          person_id,
          people (
            id,
            name
          )
        `)
        .eq('meeting_id', meetingId);

      if (data && !error) {
        setAttendees(data as any);
      }
    } catch (err) {
      console.error('Error loading attendees:', err);
    }
  };

  const loadMeetingsByAttendee = async (personId: string) => {
    try {
      // Get all meetings where this person is an attendee
      const { data: attendeeRecords, error: attendeeError } = await supabase
        .from('meeting_attendees')
        .select('meeting_id')
        .eq('person_id', personId);

      if (attendeeRecords && !attendeeError && attendeeRecords.length > 0) {
        const meetingIds = attendeeRecords.map(r => r.meeting_id).filter(id => id !== meetingId);
        
        if (meetingIds.length > 0) {
          const { data: meetings, error: meetingsError } = await supabase
            .from('meetings')
            .select('id, title, meeting_date, meeting_summary, business_id')
            .in('id', meetingIds)
            .order('meeting_date', { ascending: false });

          if (meetings && !meetingsError) {
            setAttendeeMeetings(meetings);
          } else {
            setAttendeeMeetings([]);
          }
        } else {
          setAttendeeMeetings([]);
        }
      } else {
        setAttendeeMeetings([]);
      }
    } catch (err) {
      console.error('Error loading meetings by attendee:', err);
    }
  };

  const handleMeetingClick = async (meetingId: string) => {
    try {
      // Fetch meeting with all related data
      const { data: meetingData, error: meetingError } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', meetingId)
        .single();

      if (meetingError) throw meetingError;

      // Fetch conversation strategy if exists
      let strategyText = null;
      if (meetingData.conversation_strategy_id) {
        const { data: strategyData } = await supabase
          .from('conversation_strategies')
          .select('strategy_text')
          .eq('id', meetingData.conversation_strategy_id)
          .single();
        
        if (strategyData) {
          strategyText = strategyData.strategy_text;
        }
      }

      // Add strategy to meeting data
      const enrichedMeeting = {
        ...meetingData,
        strategy_text: strategyText
      };

      onPreviewMeeting(enrichedMeeting as Meeting);
    } catch (err) {
      console.error('Error loading meeting for preview:', err);
    }
  };

  const loadAvailableMeetings = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('meetings')
        .select('id, title, meeting_date, meeting_summary')
        .neq('id', meetingId)
        .order('meeting_date', { ascending: false });

      if (currentMeetingBusinessId) {
        query = query.eq('business_id', currentMeetingBusinessId);
      }

      const { data, error } = await query;

      if (data && !error) {
        setAvailableMeetings(data);
      }
    } catch (err) {
      console.error('Error loading available meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMeeting = async (selectedMeetingId: string) => {
    try {
      const { error } = await supabase
        .from('meeting_relationships')
        .insert({
          meeting_id: meetingId,
          related_meeting_id: selectedMeetingId,
          relationship_type: 'previous'
        });

      if (error) throw error;
      
      await loadLinkedMeetings();
      setShowSelector(false);
    } catch (err: any) {
      console.error('Error linking meeting:', err);
      if (err.code === '23505') {
        alert('This meeting is already linked');
      } else {
        alert('Failed to link meeting');
      }
    }
  };

  const handleRemoveLinkedMeeting = async (linkedMeetingId: string) => {
    try {
      const { error } = await supabase
        .from('meeting_relationships')
        .delete()
        .eq('meeting_id', meetingId)
        .eq('related_meeting_id', linkedMeetingId);

      if (error) throw error;
      
      await loadLinkedMeetings();
    } catch (err) {
      console.error('Error removing linked meeting:', err);
      alert('Failed to remove linked meeting');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">🔗 Previous Meeting</h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-500 hover:text-gray-700 transition-transform"
          style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {!isCollapsed && (
        <div className="space-y-3">
          {/* View Mode Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setViewMode('linked')}
              className={`pb-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                viewMode === 'linked'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Linked ({linkedMeetings.length})
            </button>
            {currentMeetingBusinessId && (
              <button
                onClick={() => setViewMode('all-business')}
                className={`pb-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                  viewMode === 'all-business'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                All Business ({businessMeetings.length})
              </button>
            )}
            <button
              onClick={() => setViewMode('by-attendee')}
              className={`pb-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                viewMode === 'by-attendee'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              By Attendee
            </button>
            <button
              onClick={() => setViewMode('all-meetings')}
              className={`pb-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                viewMode === 'all-meetings'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              All Meetings ({allMeetings.length})
            </button>
          </div>

          {/* Linked Meetings View */}
          {viewMode === 'linked' && (
            <>
              <button
                onClick={() => {
                  setShowSelector(!showSelector);
                  if (!showSelector) loadAvailableMeetings();
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Link Previous Meeting
              </button>

              {linkedMeetings.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No linked meetings yet</p>
              ) : (
                <div className="space-y-2">
                  {linkedMeetings.map((meeting) => (
                    <div 
                      key={meeting.id} 
                      onClick={() => handleMeetingClick(meeting.id)}
                      className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-400 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            {meeting.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(meeting.meeting_date)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveLinkedMeeting(meeting.id)}
                          className="text-red-600 hover:text-red-700 text-xs ml-2"
                        >
                          Remove
                        </button>
                      </div>

                      {meeting.meeting_summary && (
                        <button
                          onClick={() => setExpandedMeetingId(expandedMeetingId === meeting.id ? null : meeting.id)}
                          className="text-xs text-blue-600 hover:text-blue-700 mt-2"
                        >
                          {expandedMeetingId === meeting.id ? 'Hide' : 'View'} Summary
                        </button>
                      )}

                      {expandedMeetingId === meeting.id && meeting.meeting_summary && (
                        <div className="mt-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200">
                          <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                            {meeting.meeting_summary}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* By Attendee View */}
          {viewMode === 'by-attendee' && (
            <div className="space-y-3">
              {/* Attendee Selector */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Attendee
                </label>
                <select
                  value={selectedAttendeeId || ''}
                  onChange={(e) => setSelectedAttendeeId(e.target.value || null)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose an attendee...</option>
                  {attendees.map((attendee) => (
                    <option key={attendee.id} value={attendee.person_id}>
                      {attendee.people?.name || 'Unknown'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Meetings List */}
              {selectedAttendeeId ? (
                attendeeMeetings.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No other meetings with this attendee</p>
                ) : (
                  <div className="space-y-2">
                    {attendeeMeetings.map((meeting) => (
                      <div 
                        key={meeting.id}
                        onClick={() => handleMeetingClick(meeting.id)}
                        className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-400 transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                              {meeting.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(meeting.meeting_date)}
                            </p>
                          </div>
                        </div>

                        {meeting.meeting_summary && (
                          <button
                            onClick={() => setExpandedMeetingId(expandedMeetingId === meeting.id ? null : meeting.id)}
                            className="text-xs text-blue-600 hover:text-blue-700 mt-2"
                          >
                            {expandedMeetingId === meeting.id ? 'Hide' : 'View'} Summary
                          </button>
                        )}

                        {expandedMeetingId === meeting.id && meeting.meeting_summary && (
                          <div className="mt-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200">
                            <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                              {meeting.meeting_summary}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <p className="text-sm text-gray-500 italic">Select an attendee to see their meetings</p>
              )}
            </div>
          )}

          {/* All Meetings View */}
          {viewMode === 'all-meetings' && (
            <div className="space-y-2">
              {allMeetings.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No meetings found</p>
              ) : (
                allMeetings.map((meeting) => (
                  <div 
                    key={meeting.id}
                    onClick={() => handleMeetingClick(meeting.id)}
                    className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-400 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {meeting.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(meeting.meeting_date)}
                        </p>
                      </div>
                    </div>

                    {meeting.meeting_summary && (
                      <button
                        onClick={() => setExpandedMeetingId(expandedMeetingId === meeting.id ? null : meeting.id)}
                        className="text-xs text-blue-600 hover:text-blue-700 mt-2"
                      >
                        {expandedMeetingId === meeting.id ? 'Hide' : 'View'} Summary
                      </button>
                    )}

                    {expandedMeetingId === meeting.id && meeting.meeting_summary && (
                      <div className="mt-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                          {meeting.meeting_summary}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* All Business Meetings View */}
          {viewMode === 'all-business' && (
            <div className="space-y-2">
              {businessMeetings.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No other meetings for this business</p>
              ) : (
                businessMeetings.map((meeting) => (
                  <div 
                    key={meeting.id}
                    onClick={() => handleMeetingClick(meeting.id)}
                    className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-400 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {meeting.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(meeting.meeting_date)}
                        </p>
                      </div>
                    </div>

                    {meeting.meeting_summary && (
                      <button
                        onClick={() => setExpandedMeetingId(expandedMeetingId === meeting.id ? null : meeting.id)}
                        className="text-xs text-blue-600 hover:text-blue-700 mt-2"
                      >
                        {expandedMeetingId === meeting.id ? 'Hide' : 'View'} Summary
                      </button>
                    )}

                    {expandedMeetingId === meeting.id && meeting.meeting_summary && (
                      <div className="mt-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                          {meeting.meeting_summary}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {showSelector && (
            <div className="bg-white dark:bg-gray-800 rounded border border-gray-300 p-3">
              <div className="max-h-60 overflow-y-auto space-y-2">
                {loading ? (
                  <p className="text-sm text-gray-500 italic">Loading meetings...</p>
                ) : availableMeetings.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    No previous meetings available
                  </p>
                ) : (
                  availableMeetings.map((meeting) => (
                    <button
                      key={meeting.id}
                      onClick={() => handleSelectMeeting(meeting.id)}
                      className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="font-medium text-sm text-gray-900 dark:text-white">
                        {meeting.title}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {formatDate(meeting.meeting_date)}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
