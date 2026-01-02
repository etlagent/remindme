'use client';

import { useState, useEffect } from 'react';
import { useAttendees } from '../../../hooks/useAttendees';
import { supabase } from '@/lib/supabase';
import { Person } from '@/lib/types';
import { RefreshCw, Trash2, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';

interface AttendeesSectionProps {
  meetingId: string;
}

interface ResearchResult {
  id: string;
  type: 'interest' | 'company' | 'tech_stack';
  topic: string;
  summary: string;
  links: Array<{
    source: string;
    url: string;
    label: string;
  }>;
  last_updated?: string;
}

export default function AttendeesSection({ meetingId }: AttendeesSectionProps) {
  const { attendees, fetchAttendees, addAttendee, removeAttendee } = useAttendees(meetingId);
  const [showSelector, setShowSelector] = useState(false);
  const [allPeople, setAllPeople] = useState<Person[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [expandedAttendeeId, setExpandedAttendeeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'interests' | 'company' | 'tech'>('interests');
  const [attendeeResearch, setAttendeeResearch] = useState<Record<string, ResearchResult[]>>({});
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAttendees();
  }, [fetchAttendees]);

  const loadPeople = async () => {
    if (allPeople.length > 0) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .order('name');

      if (data && !error) {
        setAllPeople(data);
      }
    } catch (err) {
      console.error('Error loading people:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAttendee = async (personId: string) => {
    await addAttendee(personId, true);
    setShowSelector(false);
    setSearchQuery('');
  };

  const loadResearchForAttendee = async (personId: string) => {
    try {
      const { data, error } = await supabase
        .from('research_results')
        .select('*')
        .eq('person_id', personId)
        .order('last_updated', { ascending: false });

      if (data && !error) {
        setAttendeeResearch(prev => ({ ...prev, [personId]: data }));
      }
    } catch (err) {
      console.error('Error loading research:', err);
    }
  };

  const handleAttendeeClick = async (attendeeId: string, personId: string) => {
    if (expandedAttendeeId === attendeeId) {
      setExpandedAttendeeId(null);
    } else {
      setExpandedAttendeeId(attendeeId);
      if (!attendeeResearch[personId]) {
        await loadResearchForAttendee(personId);
      }
    }
  };

  const handleRefresh = async (personId: string, researchId: string) => {
    setRefreshingId(researchId);
    await loadResearchForAttendee(personId);
    setRefreshingId(null);
  };

  const handleDelete = async (personId: string, researchId: string) => {
    if (!confirm('Delete this research item?')) return;
    
    try {
      await supabase
        .from('research_results')
        .delete()
        .eq('id', researchId);
      
      await loadResearchForAttendee(personId);
    } catch (error) {
      console.error('Error deleting research:', error);
      alert('Failed to delete research');
    }
  };

  const filteredPeople = allPeople.filter(person => {
    const alreadyAdded = attendees.some(att => att.person_id === person.id);
    if (alreadyAdded) return false;

    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      person.name.toLowerCase().includes(query) ||
      person.company?.toLowerCase().includes(query) ||
      person.role?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          👥 Attendees ({attendees.length})
        </h3>
        <div className="flex items-center gap-2">
          {!isCollapsed && (
            <button
              onClick={() => {
                setShowSelector(!showSelector);
                if (!showSelector) loadPeople();
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Add Attendee
            </button>
          )}
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
      </div>

      {!isCollapsed && (
        <>
      {/* Attendee Selector */}
      {showSelector && (
        <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded border border-gray-300">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts..."
            className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />

          <div className="max-h-60 overflow-y-auto space-y-2">
            {loading ? (
              <p className="text-sm text-gray-500 italic">Loading contacts...</p>
            ) : filteredPeople.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                {searchQuery ? 'No contacts match your search' : 'No contacts available'}
              </p>
            ) : (
              filteredPeople.map(person => (
                <button
                  key={person.id}
                  onClick={() => handleAddAttendee(person.id)}
                  className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="font-medium text-sm text-gray-900 dark:text-white">
                    {person.name}
                  </div>
                  {(person.role || person.company) && (
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {person.role && person.company ? `${person.role} at ${person.company}` : person.role || person.company}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Selected Attendees */}
      <div className="space-y-2">
        {attendees.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No attendees added yet</p>
        ) : (
          attendees.map(attendee => {
            const isExpanded = expandedAttendeeId === attendee.id;
            const research = attendee.person_id ? attendeeResearch[attendee.person_id] || [] : [];
            const interestResearch = research.filter(r => r.type === 'interest');
            const companyResearch = research.filter(r => r.type === 'company');
            const techResearch = research.filter(r => r.type === 'tech_stack');
            const currentResearch = activeTab === 'interests' ? interestResearch : 
                                   activeTab === 'company' ? companyResearch : techResearch;

            return (
              <div key={attendee.id} className="bg-white dark:bg-gray-800 rounded border border-gray-300">
                {/* Attendee Header */}
                <div className="flex items-center justify-between p-3">
                  <button
                    onClick={() => handleAttendeeClick(attendee.id, attendee.person_id)}
                    className="flex items-center gap-2 flex-1 text-left"
                  >
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900 dark:text-white">
                        {attendee.people?.name || 'Unknown'}
                      </div>
                      {(attendee.people?.role || attendee.people?.company) && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {attendee.people?.role && attendee.people?.company
                            ? `${attendee.people.role} at ${attendee.people.company}`
                            : attendee.people?.role || attendee.people?.company}
                        </div>
                      )}
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      attendee.is_required
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {attendee.is_required ? 'Required' : 'Optional'}
                    </span>
                    <button
                      onClick={() => removeAttendee(attendee.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Expanded Research Section */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    {/* Tabs */}
                    <div className="border-b border-gray-200 mb-4">
                      <div className="flex gap-6">
                        <button
                          onClick={() => setActiveTab('interests')}
                          className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'interests'
                              ? 'border-blue-600 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Personal Interests
                        </button>
                        <button
                          onClick={() => setActiveTab('company')}
                          className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'company'
                              ? 'border-blue-600 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Company
                        </button>
                        <button
                          onClick={() => setActiveTab('tech')}
                          className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'tech'
                              ? 'border-blue-600 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Tech Stack
                        </button>
                      </div>
                    </div>

                    {/* Research Cards */}
                    {currentResearch.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">
                        No {activeTab === 'interests' ? 'personal interests' : activeTab === 'company' ? 'company research' : 'tech stack'} yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {currentResearch.map((item) => (
                          <div key={item.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="text-sm font-semibold text-gray-800">{item.topic}</h5>
                                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded uppercase">
                                    {item.type}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">{item.summary}</p>
                              </div>
                            </div>

                            {item.links && item.links.length > 0 && (
                              <div className="mb-3">
                                <div className="flex flex-wrap gap-2">
                                  {item.links.map((link, idx) => (
                                    <a
                                      key={idx}
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                      {link.label}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                              <span className="text-xs text-gray-500">
                                Updated: {new Date(item.last_updated || Date.now()).toLocaleDateString()}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleRefresh(attendee.person_id, item.id)}
                                  className="text-xs text-gray-600 hover:text-blue-600 flex items-center gap-1"
                                  disabled={refreshingId === item.id}
                                >
                                  <RefreshCw className={`h-3 w-3 ${refreshingId === item.id ? 'animate-spin' : ''}`} />
                                  Refresh
                                </button>
                                <button
                                  onClick={() => handleDelete(attendee.person_id, item.id)}
                                  className="text-xs text-gray-600 hover:text-red-600 flex items-center gap-1"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      </>
      )}
    </div>
  );
}
