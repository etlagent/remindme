import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { MeetingAttendee } from '@/lib/types/decide';
import { Person } from '@/lib/types';

export function useAttendees(meetingId: string) {
  const [attendees, setAttendees] = useState<(MeetingAttendee & { people?: Person })[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAttendees = useCallback(async () => {
    if (!meetingId) return;

    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch(`/api/meetings/${meetingId}/attendees`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        setAttendees(result.data);
      }
    } catch (err) {
      console.error('Error fetching attendees:', err);
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  const addAttendee = useCallback(async (personId: string, isRequired: boolean = true) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const response = await fetch(`/api/meetings/${meetingId}/attendees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ person_id: personId, is_required: isRequired }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        await fetchAttendees();
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to add attendee');
      }
    } catch (err) {
      console.error('Error adding attendee:', err);
      throw err;
    }
  }, [meetingId, fetchAttendees]);

  const removeAttendee = useCallback(async (attendeeId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const response = await fetch(`/api/meetings/${meetingId}/attendees?attendee_id=${attendeeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setAttendees(prev => prev.filter(att => att.id !== attendeeId));
      } else {
        throw new Error(result.error || 'Failed to remove attendee');
      }
    } catch (err) {
      console.error('Error removing attendee:', err);
      throw err;
    }
  }, [meetingId]);

  return {
    attendees,
    loading,
    fetchAttendees,
    addAttendee,
    removeAttendee,
  };
}
