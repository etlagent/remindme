'use client';

import { useState, useEffect, useRef } from 'react';
import { Meeting } from '@/lib/types/decide';
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

interface ActionItemsSectionProps {
  meeting: Meeting;
  onUpdate: (updates: Partial<Meeting>) => Promise<Meeting>;
}

export default function ActionItemsSection({
  meeting,
  onUpdate
}: ActionItemsSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [text, setText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    fetchActionItems();
  }, [meeting.id]);

  const fetchActionItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('meeting_action_items')
        .select('*')
        .eq('meeting_id', meeting.id)
        .order('order_index');

      if (error) throw error;
      setActionItems(data || []);
    } catch (error) {
      console.error('Error fetching action items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [text]);

  const handleSave = async () => {
    if (!text.trim()) return;
    
    setIsSaving(true);
    try {
      // Delete existing items
      await supabase
        .from('meeting_action_items')
        .delete()
        .eq('meeting_id', meeting.id);

      // Parse text into structured items
      const items = parseTextToItems(text);
      
      // Insert new items
      const itemsToInsert = items.map((item, index) => ({
        meeting_id: meeting.id,
        text: item.text,
        indent_level: item.indent,
        is_header: item.isHeader,
        completed: false,
        order_index: index
      }));

      const { error } = await supabase
        .from('meeting_action_items')
        .insert(itemsToInsert);

      if (error) throw error;

      // Refresh the list
      await fetchActionItems();
      setText('');
      setCharCount(0);
    } catch (error) {
      console.error('Error saving action items:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const parseTextToItems = (input: string) => {
    if (!input) return [];
    const lines = input.split('\n');
    const items: Array<{id: string; text: string; indent: number; isHeader: boolean; completed: boolean}> = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === '' || line.trim() === '---') continue;

      // Check if header
      if (line.match(/^\*\*.*\*\*$/)) {
        const text = line.replace(/^\*\*/, '').replace(/\*\*$/, '');
        items.push({
          id: `item-${i}`,
          text,
          indent: 0,
          isHeader: true,
          completed: false
        });
        continue;
      }

      // Regular item
      const leadingWhitespace = line.match(/^[\s]*/)?.[0] || '';
      const indentLevel = Math.floor(leadingWhitespace.length / 4);
      const cleanLine = line.trim().replace(/^[-•*]\s*/, '');

      if (cleanLine) {
        items.push({
          id: `item-${i}`,
          text: cleanLine,
          indent: indentLevel,
          isHeader: false,
          completed: false
        });
      }
    }

    return items;
  };

  const toggleItemCompletion = async (itemId: string) => {
    const item = actionItems.find(i => i.id === itemId);
    if (!item) return;

    try {
      const { error } = await supabase
        .from('meeting_action_items')
        .update({ completed: !item.completed })
        .eq('id', itemId);

      if (error) throw error;

      // Update local state
      setActionItems(items =>
        items.map(i => i.id === itemId ? { ...i, completed: !i.completed } : i)
      );
    } catch (error) {
      console.error('Error updating action item completion:', error);
    }
  };

  const handleChange = (value: string) => {
    setText(value);
    setCharCount(value.length);
  };

  const hasUnsavedChanges = text.trim().length > 0;

  const deleteActionItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('meeting_action_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setActionItems(items => items.filter(i => i.id !== itemId));
    } catch (error) {
      console.error('Error deleting action item:', error);
    }
  };

  const handleDoubleClick = (item: ActionItem) => {
    if (item.is_header) return; // Don't allow editing headers inline
    setEditingItemId(item.id);
    setEditingText(item.text);
  };

  const saveInlineEdit = async (itemId: string) => {
    if (!editingText.trim()) return;

    try {
      const { error } = await supabase
        .from('meeting_action_items')
        .update({ text: editingText })
        .eq('id', itemId);

      if (error) throw error;

      setActionItems(items =>
        items.map(i => i.id === itemId ? { ...i, text: editingText } : i)
      );
      setEditingItemId(null);
      setEditingText('');
    } catch (error) {
      console.error('Error updating action item:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, itemId: string) => {
    if (e.key === 'Enter') {
      saveInlineEdit(itemId);
    } else if (e.key === 'Escape') {
      setEditingItemId(null);
      setEditingText('');
    }
  };


  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          ✅ Action Items
        </h3>
        <button className="text-gray-500 hover:text-gray-700 transition-colors">
          <svg
            className={`w-5 h-5 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {!isCollapsed && (
        <div className="mt-4">
          {actionItems.length === 0 || hasUnsavedChanges ? (
            /* Edit Mode */
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Paste action items from Granolz or other sources
                </label>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-gray-500">
                    {charCount > 0 && <span>{charCount} characters</span>}
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={!hasUnsavedChanges || isSaving}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      hasUnsavedChanges && !isSaving
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Action Items' : 'Saved'}
                  </button>
                </div>
              </div>
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Paste your action items here. Supports:
• Bold headers (**text**)
• Bullet points (-, •, *)
• Indented sub-items (indent with spaces)"
                className="w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm overflow-hidden"
              />
            </div>
          ) : (
            /* Formatted View */
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Action Items
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 space-y-1">
                {loading ? (
                  <p className="text-sm text-gray-500">Loading...</p>
                ) : actionItems.length === 0 ? (
                  <p className="text-sm text-gray-500">No action items yet</p>
                ) : (
                  actionItems.map((item) => (
                  item.is_header ? (
                    <h4 key={item.id} className="text-sm font-bold text-gray-900 dark:text-white mt-4 mb-2">
                      {item.text}
                    </h4>
                  ) : (
                    <div
                      key={item.id}
                      className="flex items-start gap-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded transition-colors group"
                      style={{ marginLeft: `${item.indent_level * 24}px` }}
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleItemCompletion(item.id)}
                        className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                      />
                      {editingItemId === item.id ? (
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onBlur={() => saveInlineEdit(item.id)}
                          onKeyDown={(e) => handleKeyDown(e, item.id)}
                          autoFocus
                          className="flex-1 px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      ) : (
                        <span
                          onDoubleClick={() => handleDoubleClick(item)}
                          className={`flex-1 cursor-pointer ${item.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}
                        >
                          {item.text}
                        </span>
                      )}
                      <button
                        onClick={() => deleteActionItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 transition-opacity flex-shrink-0"
                        title="Delete item"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )
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
