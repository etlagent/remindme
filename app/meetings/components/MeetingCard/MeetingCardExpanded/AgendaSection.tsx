'use client';

import { useState, useEffect } from 'react';
import { useAgendaItems } from '../../../hooks/useAgendaItems';

interface AgendaSectionProps {
  meetingId: string;
}

export default function AgendaSection({ meetingId }: AgendaSectionProps) {
  const {
    agendaItems,
    fetchAgendaItems,
    addAgendaItem,
    updateAgendaItem,
    deleteAgendaItem,
    reorderAgendaItems
  } = useAgendaItems(meetingId);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDuration, setNewItemDuration] = useState(15);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  useEffect(() => {
    fetchAgendaItems();
  }, [fetchAgendaItems]);

  const handleAddItem = async () => {
    if (!newItemTitle.trim()) return;

    await addAgendaItem({
      title: newItemTitle,
      duration_minutes: newItemDuration,
      order_index: agendaItems.length
    });

    setNewItemTitle('');
    setNewItemDuration(15);
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

    reorderAgendaItems(reordered);
  };

  const totalMinutes = agendaItems.reduce((sum, item) => sum + item.duration_minutes, 0);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">📋 Agenda</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          + Add Item
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded border border-gray-300">
          <div className="space-y-3">
            <input
              type="text"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              placeholder="Agenda item title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={newItemDuration}
                onChange={(e) => setNewItemDuration(parseInt(e.target.value))}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">minutes</span>
              <div className="flex-1"></div>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewItemTitle('');
                  setNewItemDuration(15);
                }}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                className="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {agendaItems.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No agenda items yet</p>
        ) : (
          agendaItems.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item.id)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(item.id)}
              className={`flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded border border-gray-300 ${
                draggedItemId === item.id ? 'opacity-50' : ''
              }`}
            >
              <div className="cursor-move text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{index + 1}.</span>
              <span className="flex-1 text-sm text-gray-900 dark:text-white">{item.title}</span>
              <span className="text-sm text-gray-600">{item.duration_minutes} min</span>
              <button
                onClick={() => deleteAgendaItem(item.id)}
                className="text-red-600 hover:text-red-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {agendaItems.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-300">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Total: {totalMinutes} minutes
          </span>
        </div>
      )}
    </div>
  );
}
