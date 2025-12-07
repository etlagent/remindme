/**
 * RESEARCH SECTION COMPONENT
 * 
 * NEW section for tracking research notes, findings, and sources.
 * Features:
 * - Add research notes with sources/links
 * - Tag research items (e.g., "technical", "market", "competitive")
 * - Auto-date stamping
 * - Delete research items (with DB sync when implemented)
 */

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ResearchSectionProps {
  editedPreview: any;
  setEditedPreview: (preview: any) => void;
}

export function ResearchSection({
  editedPreview,
  setEditedPreview,
}: ResearchSectionProps) {
  const [showSourceInput, setShowSourceInput] = useState(false);
  const [tempSource, setTempSource] = useState("");

  return (
    <>
      <div className="mb-3">
        <textarea
          placeholder="Add research note (Enter to save, Shift+Enter for new line)"
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2 resize-none overflow-hidden"
          rows={1}
          onInput={(e) => {
            e.currentTarget.style.height = 'auto';
            e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && e.currentTarget.value.trim()) {
              e.preventDefault();
              const research = editedPreview?.research || [];
              const today = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
              const newResearch = {
                date: today,
                text: e.currentTarget.value.trim(),
                source: '',
                tags: []
              };
              const newResearchItems = [newResearch, ...research];
              setEditedPreview(editedPreview ? {...editedPreview, research: newResearchItems} : {research: newResearchItems});
              e.currentTarget.value = '';
              e.currentTarget.style.height = 'auto';
            }
          }}
        />
        
        {/* Quick tag filters */}
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => {
              const research = editedPreview?.research || [];
              if (research.length > 0) {
                const lastItem = research[0];
                const tags = lastItem.tags || [];
                if (!tags.includes('technical')) {
                  tags.push('technical');
                  const updatedResearch = [...research];
                  updatedResearch[0] = { ...lastItem, tags };
                  setEditedPreview({ ...editedPreview, research: updatedResearch });
                }
              }
            }}
            className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
          >
            + Technical
          </button>
          <button
            onClick={() => {
              const research = editedPreview?.research || [];
              if (research.length > 0) {
                const lastItem = research[0];
                const tags = lastItem.tags || [];
                if (!tags.includes('market')) {
                  tags.push('market');
                  const updatedResearch = [...research];
                  updatedResearch[0] = { ...lastItem, tags };
                  setEditedPreview({ ...editedPreview, research: updatedResearch });
                }
              }
            }}
            className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100"
          >
            + Market
          </button>
          <button
            onClick={() => {
              const research = editedPreview?.research || [];
              if (research.length > 0) {
                const lastItem = research[0];
                const tags = lastItem.tags || [];
                if (!tags.includes('competitive')) {
                  tags.push('competitive');
                  const updatedResearch = [...research];
                  updatedResearch[0] = { ...lastItem, tags };
                  setEditedPreview({ ...editedPreview, research: updatedResearch });
                }
              }
            }}
            className="text-xs px-2 py-1 bg-orange-50 text-orange-700 rounded hover:bg-orange-100"
          >
            + Competitive
          </button>
        </div>
      </div>

      {editedPreview?.research && editedPreview.research.length > 0 ? (
        <div className="space-y-3">
          {(editedPreview?.research || []).map((item: any, idx: number) => (
            <div key={idx} className="p-3 bg-white rounded border border-gray-200">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-sm text-gray-600 flex-shrink-0">
                  {item.date || new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}
                </span>
                <span className="text-sm text-gray-700 flex-1">{typeof item === 'string' ? item : (item.text || '')}</span>
                <button
                  onClick={async () => {
                    // If this research exists in DB (has an id), delete it
                    if (item.id && item.isExisting) {
                      if (!confirm('Delete this research item from the database?')) return;
                      
                      try {
                        const { data: { session } } = await supabase.auth.getSession();
                        // Note: You'll need to create this API endpoint
                        const response = await fetch(`/api/delete-research/${item.id}`, {
                          method: 'DELETE',
                          headers: {
                            'Authorization': `Bearer ${session?.access_token}`
                          }
                        });
                        
                        if (!response.ok) {
                          throw new Error('Failed to delete research item');
                        }
                        console.log('✅ Research item deleted from DB');
                      } catch (error) {
                        console.error('Error deleting research item:', error);
                        // Don't show alert for now since endpoint may not exist yet
                        console.warn('Research deletion endpoint not implemented yet');
                      }
                    }
                    
                    // Remove from UI
                    const newResearch = (editedPreview?.research || []).filter((_: any, i: number) => i !== idx);
                    setEditedPreview(editedPreview ? {...editedPreview, research: newResearch} : {research: newResearch});
                  }}
                  className="text-red-600 hover:text-red-700 text-xs font-bold"
                >
                  ×
                </button>
              </div>
              
              {/* Source/Link */}
              {item.source ? (
                <div className="mb-2">
                  <a 
                    href={item.source} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    🔗 {item.source}
                  </a>
                </div>
              ) : (
                <button
                  onClick={() => {
                    const source = prompt('Add source URL or reference:');
                    if (source) {
                      const research = editedPreview?.research || [];
                      const updatedResearch = research.map((r: any, i: number) => 
                        i === idx ? { ...r, source } : r
                      );
                      setEditedPreview({ ...editedPreview, research: updatedResearch });
                    }
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  + Add source
                </button>
              )}
              
              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {(item.tags || []).map((tag: string, tagIdx: number) => (
                  <Badge 
                    key={tagIdx}
                    className={`text-xs cursor-pointer ${
                      tag === 'technical' ? 'bg-blue-100 text-blue-700' :
                      tag === 'market' ? 'bg-green-100 text-green-700' :
                      tag === 'competitive' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => {
                      const research = editedPreview?.research || [];
                      const updatedResearch = research.map((r: any, i: number) => {
                        if (i === idx) {
                          const newTags = (r.tags || []).filter((_: string, tIdx: number) => tIdx !== tagIdx);
                          return { ...r, tags: newTags };
                        }
                        return r;
                      });
                      setEditedPreview({ ...editedPreview, research: updatedResearch });
                    }}
                  >
                    {tag} ×
                  </Badge>
                ))}
                <button
                  onClick={() => {
                    const tag = prompt('Add custom tag:');
                    if (tag) {
                      const research = editedPreview?.research || [];
                      const updatedResearch = research.map((r: any, i: number) => {
                        if (i === idx) {
                          const tags = [...(r.tags || []), tag.toLowerCase()];
                          return { ...r, tags };
                        }
                        return r;
                      });
                      setEditedPreview({ ...editedPreview, research: updatedResearch });
                    }
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  + tag
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">No research notes yet</p>
      )}
    </>
  );
}
