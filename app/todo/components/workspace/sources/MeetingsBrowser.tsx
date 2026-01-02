'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ActionItem {
  id: string;
  meeting_id: string;
  text: string;
  indent_level: number;
  is_header: boolean;
  completed: boolean;
  order_index: number;
}

interface Meeting {
  id: string;
  title: string;
  meeting_date: string;
  action_items_count?: number;
}

interface MeetingsBrowserProps {
  onAddTodos: (todos: string[], sourceType?: string, sourceId?: string) => Promise<void>;
}

export function MeetingsBrowser({ onAddTodos }: MeetingsBrowserProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch meetings with action items
      const { data: meetingsData, error: meetingsError } = await supabase
        .from('meetings')
        .select('id, title, meeting_date')
        .eq('user_id', user.id)
        .order('meeting_date', { ascending: false });

      if (meetingsError) throw meetingsError;

      // Fetch action items count for each meeting
      const meetingsWithCounts = await Promise.all(
        (meetingsData || []).map(async (meeting) => {
          const { count } = await supabase
            .from('meeting_action_items')
            .select('*', { count: 'exact', head: true })
            .eq('meeting_id', meeting.id)
            .eq('is_header', false);

          return {
            ...meeting,
            action_items_count: count || 0
          };
        })
      );

      // Only show meetings with action items
      setMeetings(meetingsWithCounts.filter(m => m.action_items_count && m.action_items_count > 0));
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActionItems = async (meetingId: string) => {
    setLoadingItems(true);
    setSelectedItemIds(new Set());
    try {
      const { data, error } = await supabase
        .from('meeting_action_items')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('order_index');

      if (error) throw error;
      setActionItems(data || []);
    } catch (error) {
      console.error('Error fetching action items:', error);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleMeetingClick = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    fetchActionItems(meetingId);
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelection = new Set(selectedItemIds);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItemIds(newSelection);
  };

  const handleAddSelectedToTodos = async () => {
    const selectedItems = actionItems
      .filter(item => !item.is_header && selectedItemIds.has(item.id))
      .map(item => item.text);

    if (selectedItems.length > 0 && selectedMeetingId) {
      await onAddTodos(selectedItems, 'meeting', selectedMeetingId);
      setSelectedItemIds(new Set());
      
      // Store that user is working with meetings source
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('todo_last_source', 'meetings');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <div className="text-6xl mb-4">📅</div>
        <p className="text-lg font-medium mb-2">No Meetings with Action Items</p>
        <p className="text-sm">
          Create action items in your meetings to see them here
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      {/* Meetings List */}
      <div className="border-r border-gray-200 dark:border-gray-700 pr-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Meetings with Action Items ({meetings.length})
        </h4>
        <div className="space-y-2">
          {meetings.map((meeting) => (
            <button
              key={meeting.id}
              onClick={() => handleMeetingClick(meeting.id)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                selectedMeetingId === meeting.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="font-medium text-sm text-gray-900 dark:text-white mb-1">
                {meeting.title}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{new Date(meeting.meeting_date).toLocaleDateString()}</span>
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                  {meeting.action_items_count} items
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Action Items List */}
      <div className="pl-4">
        {!selectedMeetingId ? (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
            <div className="text-center">
              <div className="text-4xl mb-2">👈</div>
              <p className="text-sm">Select a meeting to view action items</p>
            </div>
          </div>
        ) : loadingItems ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Action Items
              </h4>
              {selectedItemIds.size > 0 && (
                <button
                  onClick={handleAddSelectedToTodos}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add {selectedItemIds.size} to TODO
                </button>
              )}
            </div>

            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {actionItems.map((item) => (
                item.is_header ? (
                  <h4 key={item.id} className="text-sm font-bold text-gray-900 dark:text-white mt-4 mb-2">
                    {item.text}
                  </h4>
                ) : (
                  <div
                    key={item.id}
                    className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    style={{ marginLeft: `${item.indent_level * 24}px` }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedItemIds.has(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                      className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                    />
                    <span className={`flex-1 text-sm ${item.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {item.text}
                    </span>
                    {item.completed && (
                      <span className="text-xs text-green-600 dark:text-green-400 flex-shrink-0">✓</span>
                    )}
                  </div>
                )
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
