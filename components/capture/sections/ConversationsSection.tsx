/**
 * CONVERSATIONS SECTION COMPONENT
 * 
 * Manages conversation notes with dates.
 * Features:
 * - Add new conversation notes
 * - Auto-date stamping
 * - Delete existing conversations (with DB sync)
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ConversationsSectionProps {
  editedPreview: any;
  setEditedPreview: (preview: any) => void;
}

export function ConversationsSection({
  editedPreview,
  setEditedPreview,
}: ConversationsSectionProps) {
  return (
    <>
      <textarea
        placeholder="Add note (Enter to save, Shift+Enter for new line)"
        className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2 resize-none overflow-hidden"
        rows={1}
        onInput={(e) => {
          e.currentTarget.style.height = 'auto';
          e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && e.currentTarget.value.trim()) {
            e.preventDefault();
            const notes = editedPreview?.additional_notes || [];
            const today = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
            const newNote = {
              date: today,
              text: e.currentTarget.value.trim()
            };
            const newNotes = [newNote, ...notes];
            setEditedPreview(editedPreview ? {...editedPreview, additional_notes: newNotes} : {additional_notes: newNotes});
            e.currentTarget.value = '';
            e.currentTarget.style.height = 'auto';
          }
        }}
      />
      {editedPreview?.additional_notes && editedPreview.additional_notes.length > 0 ? (
        <div className="space-y-2">
          {editedPreview.additional_notes.map((note: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
              <span className="text-sm text-gray-600 flex-shrink-0">
                {note.date || new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}
              </span>
              <span className="text-sm text-gray-700 flex-1">{typeof note === 'string' ? note : (note.text || '')}</span>
              <button
                onClick={async () => {
                  // If this conversation exists in DB (has an id), delete it
                  if (note.id && note.isExisting) {
                    if (!confirm('Delete this conversation from the database?')) return;
                    
                    try {
                      const { data: { session } } = await supabase.auth.getSession();
                      const response = await fetch(`/api/delete-conversation/${note.id}`, {
                        method: 'DELETE',
                        headers: {
                          'Authorization': `Bearer ${session?.access_token}`
                        }
                      });
                      
                      if (!response.ok) {
                        throw new Error('Failed to delete conversation');
                      }
                      console.log('✅ Conversation deleted from DB');
                    } catch (error) {
                      console.error('Error deleting conversation:', error);
                      alert('Failed to delete conversation');
                      return;
                    }
                  }
                  
                  // Remove from UI
                  const newNotes = (editedPreview?.additional_notes || []).filter((_: any, i: number) => i !== idx);
                  setEditedPreview(editedPreview ? {...editedPreview, additional_notes: newNotes} : {additional_notes: newNotes});
                }}
                className="text-red-600 hover:text-red-700 text-xs font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">No notes yet</p>
      )}
    </>
  );
}
