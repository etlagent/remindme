import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { MeetingAgendaItem } from '@/lib/types/decide';

export function useAgendaItems(meetingId: string) {
  const [agendaItems, setAgendaItems] = useState<MeetingAgendaItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAgendaItems = useCallback(async () => {
    if (!meetingId) return;

    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch(`/api/meetings/${meetingId}/agenda`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        setAgendaItems(result.data);
      }
    } catch (err) {
      console.error('Error fetching agenda items:', err);
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  const addAgendaItem = useCallback(async (itemData: Partial<MeetingAgendaItem>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const response = await fetch(`/api/meetings/${meetingId}/agenda`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(itemData),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setAgendaItems(prev => [...prev, result.data]);
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to add agenda item');
      }
    } catch (err) {
      console.error('Error adding agenda item:', err);
      throw err;
    }
  }, [meetingId]);

  const updateAgendaItem = useCallback(async (itemId: string, updates: Partial<MeetingAgendaItem>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const response = await fetch(`/api/meetings/${meetingId}/agenda`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ agenda_item_id: itemId, ...updates }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setAgendaItems(prev => prev.map(item => item.id === itemId ? result.data : item));
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to update agenda item');
      }
    } catch (err) {
      console.error('Error updating agenda item:', err);
      throw err;
    }
  }, [meetingId]);

  const deleteAgendaItem = useCallback(async (itemId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const response = await fetch(`/api/meetings/${meetingId}/agenda?agenda_item_id=${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setAgendaItems(prev => prev.filter(item => item.id !== itemId));
      } else {
        throw new Error(result.error || 'Failed to delete agenda item');
      }
    } catch (err) {
      console.error('Error deleting agenda item:', err);
      throw err;
    }
  }, [meetingId]);

  const reorderAgendaItems = useCallback(async (reorderedItems: MeetingAgendaItem[]) => {
    const previousItems = agendaItems;
    setAgendaItems(reorderedItems);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      await Promise.all(
        reorderedItems.map((item, index) =>
          fetch(`/api/meetings/${meetingId}/agenda`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ agenda_item_id: item.id, order_index: index }),
          })
        )
      );
    } catch (err) {
      console.error('Error reordering agenda items:', err);
      setAgendaItems(previousItems);
      throw err;
    }
  }, [meetingId, agendaItems]);

  return {
    agendaItems,
    loading,
    fetchAgendaItems,
    addAgendaItem,
    updateAgendaItem,
    deleteAgendaItem,
    reorderAgendaItems,
    setAgendaItems,
  };
}
