'use client';

import { useState, useEffect } from 'react';
import { useAttendees } from '../../../hooks/useAttendees';
import { supabase } from '@/lib/supabase';
import { Person } from '@/lib/types';

interface AttendeesSectionProps {
  meetingId: string;
}

export default function AttendeesSection({ meetingId }: AttendeesSectionProps) {
  const { attendees, fetchAttendees, addAttendee, removeAttendee } = useAttendees(meetingId);
  const [showSelector, setShowSelector] = useState(false);
  const [allPeople, setAllPeople] = useState<Person[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

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
        <button
          onClick={() => {
            setShowSelector(!showSelector);
            if (!showSelector) loadPeople();
          }}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          + Add Attendee
        </button>
      </div>

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
          attendees.map(attendee => (
            <div
              key={attendee.id}
              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border border-gray-300"
            >
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
          ))
        )}
      </div>
    </div>
  );
}
