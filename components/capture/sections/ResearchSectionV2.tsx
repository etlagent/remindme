/**
 * RESEARCH SECTION V2 - Persistent Research with Selective Refresh
 * 
 * Features:
 * - Personal Interests: Track hobbies, sports teams, topics (refreshable)
 * - Company Research: Overview, news, products (occasional refresh)
 * - Tech Stack: Technologies, infrastructure (rare refresh)
 * - Persistent storage per person
 * - Individual refresh buttons
 * - Manual notes section
 */

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@supabase/supabase-js";
import { Loader2, ExternalLink, RefreshCw, Trash2, Plus, X } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ResearchSectionProps {
  editedPreview: any;
  setEditedPreview: (preview: any) => void;
  personName?: string;
  personCompany?: string;
  personRole?: string;
  personId?: string; // For loading saved research
}

interface ResearchResult {
  id?: string;
  type: 'interest' | 'company' | 'tech_stack';
  topic: string;
  summary: string;
  data?: any;
  links: Array<{
    source: string;
    url: string;
    label: string;
  }>;
  last_updated: string;
}

export function ResearchSectionV2({
  editedPreview,
  setEditedPreview,
  personName,
  personCompany,
  personRole,
  personId,
}: ResearchSectionProps) {
  // Saved research results
  const [savedResults, setSavedResults] = useState<ResearchResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState<'interests' | 'company' | 'tech'>('interests');
  const [newInterest, setNewInterest] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  // Load saved research results when person changes
  useEffect(() => {
    if (personId) {
      loadResearchResults();
    }
  }, [personId]);

  const loadResearchResults = async () => {
    if (!personId) return;
    
    setLoadingResults(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`/api/research/list?person_id=${personId}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setSavedResults(data.results || []);
      }
    } catch (error) {
      console.error('Error loading research results:', error);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleAddInterest = async () => {
    if (!newInterest.trim() || !personId) return;

    setIsResearching(true);
    try {
      // Analyze the interest
      const analyzeResponse = await fetch('/api/research/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'interest',
          topic: newInterest,
        }),
      });

      const analyzeData = await analyzeResponse.json();
      if (!analyzeData.success) throw new Error(analyzeData.error);

      // Save to database
      const { data: { session } } = await supabase.auth.getSession();
      const saveResponse = await fetch('/api/research/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          person_id: personId,
          ...analyzeData.result,
        }),
      });

      const saveData = await saveResponse.json();
      if (saveData.success) {
        setSavedResults(prev => [saveData.result, ...prev]);
        setNewInterest('');
      }
    } catch (error) {
      console.error('Error adding interest:', error);
      alert('Failed to add interest');
    } finally {
      setIsResearching(false);
    }
  };

  const handleResearchCompany = async () => {
    if (!personCompany || !personId) return;

    setIsResearching(true);
    try {
      const analyzeResponse = await fetch('/api/research/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'company',
          companyName: personCompany,
          companyLinkedInUrl: editedPreview?.people?.[0]?.company_linkedin_url,
        }),
      });

      const analyzeData = await analyzeResponse.json();
      if (!analyzeData.success) throw new Error(analyzeData.error);

      const { data: { session } } = await supabase.auth.getSession();
      const saveResponse = await fetch('/api/research/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          person_id: personId,
          ...analyzeData.result,
        }),
      });

      const saveData = await saveResponse.json();
      if (saveData.success) {
        setSavedResults(prev => [saveData.result, ...prev.filter(r => r.type !== 'company')]);
      }
    } catch (error) {
      console.error('Error researching company:', error);
      alert('Failed to research company');
    } finally {
      setIsResearching(false);
    }
  };

  const handleResearchTechStack = async () => {
    if (!personCompany || !personId) return;

    setIsResearching(true);
    try {
      const analyzeResponse = await fetch('/api/research/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'tech_stack',
          companyName: personCompany,
          personContext: {
            name: personName,
            role: personRole,
            company: personCompany,
          },
        }),
      });

      const analyzeData = await analyzeResponse.json();
      if (!analyzeData.success) throw new Error(analyzeData.error);

      const { data: { session } } = await supabase.auth.getSession();
      const saveResponse = await fetch('/api/research/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          person_id: personId,
          ...analyzeData.result,
        }),
      });

      const saveData = await saveResponse.json();
      if (saveData.success) {
        setSavedResults(prev => [saveData.result, ...prev.filter(r => r.type !== 'tech_stack')]);
      }
    } catch (error) {
      console.error('Error researching tech stack:', error);
      alert('Failed to research tech stack');
    } finally {
      setIsResearching(false);
    }
  };

  const handleRefresh = async (result: ResearchResult) => {
    if (!result.id || !personId) return;

    setRefreshingId(result.id);
    try {
      // Re-analyze
      const analyzeResponse = await fetch('/api/research/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: result.type,
          topic: result.type === 'interest' ? result.topic : undefined,
          companyName: result.type !== 'interest' ? personCompany : undefined,
          companyLinkedInUrl: result.type === 'company' ? editedPreview?.people?.[0]?.company_linkedin_url : undefined,
          personContext: result.type === 'tech_stack' ? {
            name: personName,
            role: personRole,
            company: personCompany,
          } : undefined,
        }),
      });

      const analyzeData = await analyzeResponse.json();
      if (!analyzeData.success) throw new Error(analyzeData.error);

      // Update in database
      const { data: { session } } = await supabase.auth.getSession();
      const saveResponse = await fetch('/api/research/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          person_id: personId,
          ...analyzeData.result,
        }),
      });

      const saveData = await saveResponse.json();
      if (saveData.success) {
        setSavedResults(prev => prev.map(r => r.id === result.id ? saveData.result : r));
      }
    } catch (error) {
      console.error('Error refreshing research:', error);
      alert('Failed to refresh research');
    } finally {
      setRefreshingId(null);
    }
  };

  const handleDelete = async (result: ResearchResult) => {
    if (!result.id) return;
    if (!confirm(`Delete research on "${result.topic}"?`)) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`/api/research/delete?id=${result.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setSavedResults(prev => prev.filter(r => r.id !== result.id));
      }
    } catch (error) {
      console.error('Error deleting research:', error);
      alert('Failed to delete research');
    }
  };

  const addResultToNotes = (result: ResearchResult) => {
    const newNote = {
      date: new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' }),
      text: `${result.topic}: ${result.summary.substring(0, 200)}...`,
      source: result.links[0]?.url || '',
      tags: [result.type],
    };
    
    const existingResearch = editedPreview?.research || [];
    setEditedPreview({
      ...editedPreview,
      research: [newNote, ...existingResearch],
    });
  };

  // Filter results by type
  const interestResults = savedResults.filter(r => r.type === 'interest');
  const companyResult = savedResults.find(r => r.type === 'company');
  const techStackResult = savedResults.find(r => r.type === 'tech_stack');

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('interests')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'interests'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Personal Interests
        </button>
        <button
          onClick={() => setActiveTab('company')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'company'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Company
        </button>
        <button
          onClick={() => setActiveTab('tech')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'tech'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Tech Stack
        </button>
      </div>

      {/* Personal Interests Tab */}
      {activeTab === 'interests' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddInterest()}
              placeholder="Add interest (e.g., 'Michigan football', 'F1 Hamilton')"
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
            />
            <Button
              onClick={handleAddInterest}
              disabled={isResearching || !newInterest.trim()}
              size="sm"
            >
              {isResearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>

          {interestResults.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No interests tracked yet</p>
          ) : (
            <div className="space-y-3">
              {interestResults.map((result) => (
                <ResearchCard
                  key={result.id}
                  result={result}
                  onRefresh={() => handleRefresh(result)}
                  onDelete={() => handleDelete(result)}
                  onAddToNotes={() => addResultToNotes(result)}
                  isRefreshing={refreshingId === result.id}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Company Tab */}
      {activeTab === 'company' && (
        <div className="space-y-4">
          {!companyResult ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-600 mb-4">
                Research {personCompany || 'the company'} to get overview, news, and insights
              </p>
              <Button
                onClick={handleResearchCompany}
                disabled={isResearching || !personCompany}
              >
                {isResearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Researching...
                  </>
                ) : (
                  'Research Company'
                )}
              </Button>
            </div>
          ) : (
            <ResearchCard
              result={companyResult}
              onRefresh={() => handleRefresh(companyResult)}
              onDelete={() => handleDelete(companyResult)}
              onAddToNotes={() => addResultToNotes(companyResult)}
              isRefreshing={refreshingId === companyResult.id}
            />
          )}
        </div>
      )}

      {/* Tech Stack Tab */}
      {activeTab === 'tech' && (
        <div className="space-y-4">
          {!techStackResult ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-600 mb-4">
                Discover the technologies and tools used at {personCompany || 'the company'}
              </p>
              <Button
                onClick={handleResearchTechStack}
                disabled={isResearching || !personCompany}
              >
                {isResearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Researching...
                  </>
                ) : (
                  'Find Tech Stack'
                )}
              </Button>
            </div>
          ) : (
            <div>
              <ResearchCard
                result={techStackResult}
                onRefresh={() => handleRefresh(techStackResult)}
                onDelete={() => handleDelete(techStackResult)}
                onAddToNotes={() => addResultToNotes(techStackResult)}
                isRefreshing={refreshingId === techStackResult.id}
              />
              
              {/* Display structured tech data */}
              {techStackResult.data?.technologies && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Technologies Found:</h5>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(techStackResult.data.technologies).map(([category, techs]: [string, any]) => (
                      techs && techs.length > 0 && (
                        <div key={category}>
                          <p className="text-xs font-medium text-gray-600 mb-1 capitalize">{category}:</p>
                          <div className="flex flex-wrap gap-1">
                            {techs.map((tech: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Manual Notes Section (preserved from original) */}
      <div className="pt-6 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Manual Notes</h4>
        <ManualNotesSection
          editedPreview={editedPreview}
          setEditedPreview={setEditedPreview}
        />
      </div>
    </div>
  );
}

// Research Card Component
function ResearchCard({
  result,
  onRefresh,
  onDelete,
  onAddToNotes,
  isRefreshing,
}: {
  result: ResearchResult;
  onRefresh: () => void;
  onDelete: () => void;
  onAddToNotes: () => void;
  isRefreshing: boolean;
}) {
  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h5 className="text-sm font-semibold text-gray-800">{result.topic}</h5>
            <Badge variant="outline" className="text-xs">
              {result.type}
            </Badge>
          </div>
          <p className="text-xs text-gray-600 mb-2">{result.summary}</p>
        </div>
      </div>

      {result.links && result.links.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-600 mb-1">Resources:</p>
          <div className="flex flex-wrap gap-2">
            {result.links.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                {link.source}: {link.label}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-500">
          Updated: {new Date(result.last_updated).toLocaleDateString()}
        </span>
        <div className="flex gap-2">
          <Button
            onClick={onRefresh}
            disabled={isRefreshing}
            size="sm"
            variant="outline"
          >
            {isRefreshing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
          </Button>
          <Button
            onClick={onAddToNotes}
            size="sm"
            variant="outline"
          >
            Add to Notes
          </Button>
          <Button
            onClick={onDelete}
            size="sm"
            variant="outline"
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Manual Notes Section (preserved from original)
function ManualNotesSection({
  editedPreview,
  setEditedPreview,
}: {
  editedPreview: any;
  setEditedPreview: (preview: any) => void;
}) {
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
                  onClick={() => {
                    const newResearch = (editedPreview?.research || []).filter((_: any, i: number) => i !== idx);
                    setEditedPreview(editedPreview ? {...editedPreview, research: newResearch} : {research: newResearch});
                  }}
                  className="text-red-600 hover:text-red-700 text-xs font-bold"
                >
                  ×
                </button>
              </div>
              
              {item.source && (
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
              )}
              
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
