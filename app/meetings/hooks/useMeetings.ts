import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Meeting } from '@/lib/types/decide';

export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch('/api/meetings', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        setMeetings(result.data);
      } else {
        setError(result.error || 'Failed to fetch meetings');
      }
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError('Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  }, []);

  const createMeeting = useCallback(async (meetingData: Partial<Meeting>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(meetingData),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setMeetings(prev => [result.data, ...prev]);
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to create meeting');
      }
    } catch (err) {
      console.error('Error creating meeting:', err);
      throw err;
    }
  }, []);

  const updateMeeting = useCallback(async (id: string, updates: Partial<Meeting>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/meetings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(updates),
      });

      const result = await response.json();

      if (result.success && result.data) {
        console.log('API returned updated meeting:', result.data);
        setMeetings(prev => {
          const updated = prev.map(m => m.id === id ? result.data : m);
          console.log('State updated, new meetings array:', updated.length, 'meetings');
          return updated;
        });
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to update meeting');
      }
    } catch (err) {
      console.error('Error updating meeting:', err);
      throw err;
    }
  }, []);

  const deleteMeeting = useCallback(async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/meetings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setMeetings(prev => prev.filter(m => m.id !== id));
      } else {
        throw new Error(result.error || 'Failed to delete meeting');
      }
    } catch (err) {
      console.error('Error deleting meeting:', err);
      throw err;
    }
  }, []);

  const reorderMeetings = useCallback(async (reorderedMeetings: Meeting[]) => {
    const previousMeetings = meetings;
    setMeetings(reorderedMeetings);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      await Promise.all(
        reorderedMeetings.map((meeting, index) =>
          fetch(`/api/meetings/${meeting.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ order_index: index }),
          })
        )
      );
    } catch (err) {
      console.error('Error reordering meetings:', err);
      setMeetings(previousMeetings);
      throw err;
    }
  }, [meetings]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  return {
    meetings,
    loading,
    error,
    fetchMeetings,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    reorderMeetings,
  };
}
