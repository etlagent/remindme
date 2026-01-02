'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Person } from '@/lib/types';
import { RefreshCw, Trash2, ExternalLink } from 'lucide-react';

interface AttendeeInterestsSectionProps {
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

interface AttendeeWithPerson {
  id: string;
  person_id: string;
  people: Person;
  research?: ResearchResult[];
}

export default function AttendeeInterestsSection({ meetingId }: AttendeeInterestsSectionProps) {
  const [attendees, setAttendees] = useState<AttendeeWithPerson[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'interests' | 'company' | 'tech'>('interests');
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  useEffect(() => {
    loadAttendeeInterests();
  }, [meetingId]);

  const loadAttendeeInterests = async () => {
    setLoading(true);
    try {
      // First get attendees with person details
      const { data: attendeesData, error: attendeesError } = await supabase
        .from('meeting_attendees')
        .select(`
          id,
          person_id,
          people (
            id,
            name,
            company,
            role
          )
        `)
        .eq('meeting_id', meetingId);

      if (attendeesError || !attendeesData) {
        console.error('Error loading attendees:', attendeesError);
        return;
      }

      // Get ALL research results for each person (all types)
      const personIds = attendeesData.map((a: any) => a.person_id);
      const { data: researchData, error: researchError } = await supabase
        .from('research_results')
        .select('*')
        .in('person_id', personIds)
        .order('last_updated', { ascending: false });

      if (researchError) {
        console.error('Error loading research:', researchError);
      }

      // Map research to attendees
      const attendeesWithResearch = attendeesData.map((attendee: any) => ({
        ...attendee,
        research: researchData?.filter((r: any) => r.person_id === attendee.person_id) || []
      }));

      setAttendees(attendeesWithResearch as any);
    } catch (err) {
      console.error('Error loading attendee interests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (attendeeId: string, researchId: string) => {
    setRefreshingId(researchId);
    // Refresh logic would go here - for now just reload
    await loadAttendeeInterests();
    setRefreshingId(null);
  };

  const handleDelete = async (attendeeId: string, researchId: string) => {
    if (!confirm('Delete this research item?')) return;
    
    try {
      await supabase
        .from('research_results')
        .delete()
        .eq('id', researchId);
      
      await loadAttendeeInterests();
    } catch (error) {
      console.error('Error deleting research:', error);
      alert('Failed to delete research');
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">💡 Attendee Research</h3>
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
        <>
        {loading ? (
          <p className="text-sm text-gray-500 italic">Loading...</p>
        ) : attendees.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Add attendees to see their research here</p>
        ) : (
        <div className="space-y-6">
          {attendees.map((attendee) => {
            const person = attendee.people;
            const allResearch = attendee.research || [];
            
            const interestResearch = allResearch.filter(r => r.type === 'interest');
            const companyResearch = allResearch.filter(r => r.type === 'company');
            const techResearch = allResearch.filter(r => r.type === 'tech_stack');
            
            const currentResearch = activeTab === 'interests' ? interestResearch : 
                                   activeTab === 'company' ? companyResearch : techResearch;

            return (
              <div key={attendee.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200">
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{person.name}</h4>
                  {person.role && person.company && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {person.role} at {person.company}
                    </p>
                  )}
                </div>

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
                              onClick={() => handleRefresh(attendee.id, item.id)}
                              className="text-xs text-gray-600 hover:text-blue-600 flex items-center gap-1"
                              disabled={refreshingId === item.id}
                            >
                              <RefreshCw className={`h-3 w-3 ${refreshingId === item.id ? 'animate-spin' : ''}`} />
                              Refresh
                            </button>
                            <button
                              onClick={() => handleDelete(attendee.id, item.id)}
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
            );
          })}
        </div>
        )}
        </>
      )}
    </div>
  );
}
