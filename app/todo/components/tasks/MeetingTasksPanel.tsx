'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Meeting {
  id: string;
  title: string;
  meeting_date: string;
  task_count: number;
}

interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
  is_header: boolean;
  indent_level: number;
  meeting_id: string;
}

export function MeetingTasksPanel() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all meetings that have action items
      const { data: tasksData } = await supabase
        .from('meeting_action_items')
        .select('meeting_id')
        .not('meeting_id', 'is', null);

      if (!tasksData || tasksData.length === 0) {
        setMeetings([]);
        setLoading(false);
        return;
      }

      // Get unique meeting IDs
      const meetingIds = [...new Set(tasksData.map(t => t.meeting_id).filter(Boolean))];

      // Fetch meeting details
      const { data: meetingsData } = await supabase
        .from('meetings')
        .select('id, title, meeting_date')
        .in('id', meetingIds)
        .order('meeting_date', { ascending: false });

      if (meetingsData) {
        // Count action items per meeting
        const meetingsWithCounts = meetingsData.map(meeting => ({
          ...meeting,
          task_count: tasksData.filter(t => t.meeting_id === meeting.id).length
        }));
        setMeetings(meetingsWithCounts);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (meetingId: string) => {
    setLoadingTasks(true);
    try {
      const { data } = await supabase
        .from('meeting_action_items')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('order_index');

      setActionItems(data || []);
    } catch (error) {
      console.error('Error fetching action items:', error);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleMeetingClick = (meetingId: string) => {
    if (selectedMeetingId === meetingId) {
      // Collapse if clicking same meeting
      setSelectedMeetingId(null);
      setActionItems([]);
    } else {
      setSelectedMeetingId(meetingId);
      fetchTasks(meetingId);
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
        <p className="text-lg font-medium mb-2">No Meeting Tasks</p>
        <p className="text-sm">
          Add action items from meetings to see them here
        </p>
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Meetings with Action Items ({meetings.length})
      </h4>
      <div className="space-y-3">
        {meetings.map((meeting) => (
          <div key={meeting.id}>
            {/* Meeting Card */}
            <button
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
                  {meeting.task_count} items
                </span>
              </div>
            </button>

            {/* Expanded Action Items */}
            {selectedMeetingId === meeting.id && (
              <div className="mt-2 ml-4 space-y-2">
                {loadingTasks ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : actionItems.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-4">No action items</p>
                ) : (
                  actionItems.filter(item => !item.is_header).map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm cursor-move ${
                        item.completed ? 'opacity-50' : ''
                      }`}
                      style={{ marginLeft: `${item.indent_level * 16}px` }}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('meetingActionItemId', item.id);
                        e.dataTransfer.setData('meetingActionItemText', item.text);
                        e.dataTransfer.setData('meetingId', item.meeting_id);
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <span className={item.completed ? 'line-through text-gray-500' : 'text-gray-700 dark:text-gray-300'}>
                          {item.text}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
