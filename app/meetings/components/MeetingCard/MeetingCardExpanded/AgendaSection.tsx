'use client';

import { useState, useEffect } from 'react';
import { Meeting } from '@/lib/types/decide';

interface AgendaItem {
  id: string;
  title: string;
  order: number;
}

interface AgendaSectionProps {
  meeting: Meeting;
  onUpdate: (updates: Partial<Meeting>) => Promise<Meeting>;
}

export default function AgendaSection({ meeting, onUpdate }: AgendaSectionProps) {
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>(meeting.agenda_items || []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    setAgendaItems(meeting.agenda_items || []);
  }, [meeting.agenda_items]);

  const saveAgendaItems = async (updatedItems: AgendaItem[]) => {
    setAgendaItems(updatedItems);
    await onUpdate({ agenda_items: updatedItems });
  };

  const handleAddItem = async () => {
    if (!newItemTitle.trim()) return;

    const newItem: AgendaItem = {
      id: crypto.randomUUID(),
      title: newItemTitle,
      order: agendaItems.length
    };

    await saveAgendaItems([...agendaItems, newItem]);
    setNewItemTitle('');
    setShowAddForm(false);
  };

  const handleDragStart = (itemId: string) => {
    setDraggedItemId(itemId);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
  };

  const handleDrop = (targetItemId: string) => {
    if (!draggedItemId || draggedItemId === targetItemId) return;

    const draggedIndex = agendaItems.findIndex(item => item.id === draggedItemId);
    const targetIndex = agendaItems.findIndex(item => item.id === targetItemId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const reordered = [...agendaItems];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    const withNewOrder = reordered.map((item, index) => ({ ...item, order: index }));
    saveAgendaItems(withNewOrder);
  };

  const handleDeleteItem = async (itemId: string) => {
    const filtered = agendaItems.filter(item => item.id !== itemId);
    const reordered = filtered.map((item, index) => ({ ...item, order: index }));
    await saveAgendaItems(reordered);
  };

  const startEditing = (item: AgendaItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
  };

  const saveEdit = async (itemId: string) => {
    if (!editTitle.trim()) return;
    const updated = agendaItems.map(item =>
      item.id === itemId ? { ...item, title: editTitle } : item
    );
    await saveAgendaItems(updated);
    setEditingId(null);
    setEditTitle('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">📋 Agenda</h3>
        <div className="flex items-center gap-3">
          {!isCollapsed && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Add Item
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

      {!isCollapsed && showAddForm && (
        <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded border border-gray-300">
          <div className="space-y-3">
            <input
              type="text"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddItem();
                }
              }}
              placeholder="Agenda item title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewItemTitle('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {!isCollapsed && agendaItems.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No agenda items yet</p>
        </div>
      )}

      {!isCollapsed && agendaItems.length > 0 && (
        <div className="space-y-2">
          {agendaItems
            .sort((a, b) => a.order - b.order)
            .map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item.id)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(item.id)}
                className={`flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded border ${
                  draggedItemId === item.id ? 'opacity-50' : ''
                } hover:border-blue-300 transition-colors`}
              >
                <div className="cursor-grab active:cursor-grabbing text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-500">{index + 1}.</span>
                
                {editingId === item.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onMouseDown={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          saveEdit(item.id);
                        }
                      }}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEdit(item.id)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <span 
                      className="flex-1 text-sm text-gray-900 dark:text-white cursor-text" 
                      onDoubleClick={() => startEditing(item)}
                    >
                      {item.title}
                    </span>
                    <button
                      onClick={() => startEditing(item)}
                      className="text-blue-600 hover:text-blue-700"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
