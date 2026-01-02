'use client';

import { useState, useEffect } from 'react';
import { Meeting } from '@/lib/types/decide';

interface KeyIdea {
  id: string;
  text: string;
  order: number;
}

interface KeyIdeasSectionProps {
  meeting: Meeting;
  onUpdate: (updates: Partial<Meeting>) => Promise<Meeting>;
}

export default function KeyIdeasSection({
  meeting,
  onUpdate
}: KeyIdeasSectionProps) {
  const [keyIdeas, setKeyIdeas] = useState<KeyIdea[]>(meeting.key_ideas || []);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIdeaText, setNewIdeaText] = useState('');
  const [draggedIdeaId, setDraggedIdeaId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    setKeyIdeas(meeting.key_ideas || []);
  }, [meeting.key_ideas]);

  const saveKeyIdeas = async (updatedIdeas: KeyIdea[]) => {
    setKeyIdeas(updatedIdeas);
    await onUpdate({ key_ideas: updatedIdeas });
  };

  const handleAddIdea = async () => {
    if (!newIdeaText.trim()) return;

    const newIdea: KeyIdea = {
      id: crypto.randomUUID(),
      text: newIdeaText,
      order: keyIdeas.length
    };

    await saveKeyIdeas([...keyIdeas, newIdea]);
    setNewIdeaText('');
    setShowAddForm(false);
  };

  const handleDeleteIdea = async (ideaId: string) => {
    const filtered = keyIdeas.filter(idea => idea.id !== ideaId);
    const reordered = filtered.map((idea, index) => ({ ...idea, order: index }));
    await saveKeyIdeas(reordered);
  };

  const startEditing = (idea: KeyIdea) => {
    setEditingId(idea.id);
    setEditText(idea.text);
  };

  const saveEdit = async (ideaId: string) => {
    if (!editText.trim()) return;
    const updated = keyIdeas.map(idea =>
      idea.id === ideaId ? { ...idea, text: editText } : idea
    );
    await saveKeyIdeas(updated);
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleDragStart = (ideaId: string) => {
    setDraggedIdeaId(ideaId);
  };

  const handleDragEnd = () => {
    setDraggedIdeaId(null);
  };

  const handleDrop = (targetIdeaId: string) => {
    if (!draggedIdeaId || draggedIdeaId === targetIdeaId) return;

    const draggedIndex = keyIdeas.findIndex(idea => idea.id === draggedIdeaId);
    const targetIndex = keyIdeas.findIndex(idea => idea.id === targetIdeaId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const reordered = [...keyIdeas];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    const withNewOrder = reordered.map((idea, index) => ({ ...idea, order: index }));
    saveKeyIdeas(withNewOrder);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          💡 Key Ideas {keyIdeas.length > 0 && `(${keyIdeas.length})`}
        </h3>
        <div className="flex items-center gap-3">
          {!isCollapsed && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Add Idea
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
              value={newIdeaText}
              onChange={(e) => setNewIdeaText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddIdea();
                }
              }}
              placeholder="What key point or message do you want to communicate?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewIdeaText('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddIdea}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {!isCollapsed && keyIdeas.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">No key ideas yet</p>
          <p className="text-xs">
            💡 Add key points or messages you want to communicate during this meeting.
            <br />
            AI will use these when generating your conversation strategy.
          </p>
        </div>
      )}

      {!isCollapsed && keyIdeas.length > 0 && (
        <div className="space-y-2">
          {keyIdeas
            .sort((a, b) => a.order - b.order)
            .map((idea) => (
              <div
                key={idea.id}
                draggable
                onDragStart={() => handleDragStart(idea.id)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(idea.id)}
                className={`p-3 bg-white dark:bg-gray-800 rounded border ${
                  draggedIdeaId === idea.id ? 'opacity-50' : ''
                } hover:border-blue-300 transition-colors cursor-move`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1 cursor-grab active:cursor-grabbing">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                  </div>
                  
                  <div className="flex-1">
                    {editingId === idea.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onMouseDown={(e) => e.stopPropagation()}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(idea.id)}
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
                      </div>
                    ) : (
                      <p 
                        className="text-gray-900 dark:text-white cursor-text" 
                        onDoubleClick={() => startEditing(idea)}
                      >
                        {idea.text}
                      </p>
                    )}
                  </div>

                  {editingId !== idea.id && (
                    <div className="flex-shrink-0 flex gap-2">
                      <button
                        onClick={() => startEditing(idea)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteIdea(idea.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
