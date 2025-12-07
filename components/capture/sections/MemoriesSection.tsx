/**
 * MEMORIES SECTION COMPONENT
 * 
 * Manages memory items with dates.
 * Features:
 * - Add new memories
 * - Auto-date stamping
 * - Delete existing memories (with DB sync)
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface MemoriesSectionProps {
  editedPreview: any;
  setEditedPreview: (preview: any) => void;
}

export function MemoriesSection({
  editedPreview,
  setEditedPreview,
}: MemoriesSectionProps) {
  return (
    <>
      <textarea
        placeholder="Add a memory or something to remember"
        className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2 resize-none overflow-hidden"
        rows={1}
        onInput={(e) => {
          e.currentTarget.style.height = 'auto';
          e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && e.currentTarget.value.trim()) {
            e.preventDefault();
            const memories = editedPreview?.memories || [];
            const today = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
            const newMemory = {
              date: today,
              text: e.currentTarget.value.trim()
            };
            const newMemories = [newMemory, ...memories];
            setEditedPreview(editedPreview ? {...editedPreview, memories: newMemories} : {memories: newMemories});
            e.currentTarget.value = '';
            e.currentTarget.style.height = 'auto';
          }
        }}
      />
      {editedPreview?.memories && editedPreview.memories.length > 0 ? (
        <div className="space-y-2">
          {(editedPreview?.memories || []).map((memory: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
              <span className="text-sm text-gray-600 flex-shrink-0">
                {memory.date || new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}
              </span>
              <span className="text-sm text-gray-700 flex-1">{typeof memory === 'string' ? memory : (memory.text || '')}</span>
              <button
                onClick={async () => {
                  // If this memory exists in DB (has an id), delete it
                  if (memory.id && memory.isExisting) {
                    if (!confirm('Delete this memory from the database?')) return;
                    
                    try {
                      const { data: { session } } = await supabase.auth.getSession();
                      const response = await fetch(`/api/delete-memory/${memory.id}`, {
                        method: 'DELETE',
                        headers: {
                          'Authorization': `Bearer ${session?.access_token}`
                        }
                      });
                      
                      if (!response.ok) {
                        throw new Error('Failed to delete memory');
                      }
                      console.log('✅ Memory deleted from DB');
                    } catch (error) {
                      console.error('Error deleting memory:', error);
                      alert('Failed to delete memory');
                      return;
                    }
                  }
                  
                  // Remove from UI
                  const newMemories = (editedPreview?.memories || []).filter((_: any, i: number) => i !== idx);
                  setEditedPreview(editedPreview ? {...editedPreview, memories: newMemories} : {memories: newMemories});
                }}
                className="text-red-600 hover:text-red-700 text-xs font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">No memories yet</p>
      )}
    </>
  );
}
