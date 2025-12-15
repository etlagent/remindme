'use client';

import { useState } from 'react';
import { ProjectsBrowser } from './sources/ProjectsBrowser';
import { Project } from '@/lib/types/decide';

type SourceType = 'projects' | 'paste' | 'brainstorm' | 'meetings' | 'notes' | 'conversations';

interface SourceBrowserProps {
  onAddTodos: (todos: string[]) => Promise<void>;
  activeSource: SourceType;
  onChangeSource: (source: SourceType) => void;
}

export function SourceBrowser({ onAddTodos, activeSource, onChangeSource }: SourceBrowserProps) {
  const [pasteText, setPasteText] = useState('');
  const [brainstormText, setBrainstormText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const sources = [
    { id: 'projects' as SourceType, label: 'Projects', icon: '📁' },
    { id: 'paste' as SourceType, label: 'Paste', icon: '📋' },
    { id: 'brainstorm' as SourceType, label: 'Brainstorm', icon: '💡' },
    { id: 'meetings' as SourceType, label: 'Meetings', icon: '📅', badge: 'Soon' },
    { id: 'notes' as SourceType, label: 'Notes', icon: '📝', badge: 'Soon' },
    { id: 'conversations' as SourceType, label: 'Conversations', icon: '💬', badge: 'Soon' },
  ];

  const handleExtractFromPaste = async () => {
    if (!pasteText.trim()) return;

    setIsProcessing(true);
    try {
      // Parse bullets and lines
      const lines = pasteText.split('\n');
      const todos: string[] = [];

      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        const cleaned = trimmed
          .replace(/^[•\-*]\s+/, '')
          .replace(/^\d+\.\s+/, '')
          .replace(/^\[\s*\]\s*/, '')
          .trim();

        if (cleaned && cleaned.length > 3) {
          todos.push(cleaned);
        }
      });

      if (todos.length > 0) {
        await onAddTodos(todos);
        setPasteText('');
      }
    } catch (error) {
      console.error('Error extracting todos:', error);
      alert('Failed to extract TODOs. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExtractFromBrainstorm = async () => {
    if (!brainstormText.trim()) return;

    setIsProcessing(true);
    try {
      const lines = brainstormText.split('\n');
      const todos: string[] = [];

      lines.forEach(line => {
        const trimmed = line.trim();
        
        const actionWords = ['need to', 'should', 'must', 'todo:', 'action:', 'task:'];
        const startsWithVerb = /^(send|create|review|update|schedule|call|email|prepare|draft|finish|complete|build|design|implement|test|deploy|fix|investigate)/i.test(trimmed);
        const hasBullet = /^[•\-*\d+\.]/.test(trimmed);
        
        if (trimmed && (
          actionWords.some(word => trimmed.toLowerCase().includes(word)) ||
          startsWithVerb ||
          (hasBullet && trimmed.length > 10)
        )) {
          const cleaned = trimmed
            .replace(/^[•\-*]\s+/, '')
            .replace(/^\d+\.\s+/, '')
            .replace(/^\[\s*\]\s*/, '')
            .replace(/^(need to|should|must|todo:|action:|task:)\s*/i, '')
            .trim();
          
          if (cleaned && cleaned.length > 5) {
            todos.push(cleaned);
          }
        }
      });

      if (todos.length > 0) {
        await onAddTodos(todos);
        alert(`Added ${todos.length} TODOs!`);
      } else {
        alert('No action items found. Try using action words like "need to", "should", or start with verbs.');
      }
    } catch (error) {
      console.error('Error extracting todos:', error);
      alert('Failed to extract TODOs. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Source Tabs */}
      <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Browse Sources
        </h3>
        <div className="flex flex-wrap gap-2">
          {sources.map((source) => (
            <button
              key={source.id}
              onClick={() => onChangeSource(source.id)}
              disabled={!!source.badge}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeSource === source.id
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : source.badge
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span>{source.icon}</span>
              {source.label}
              {source.badge && (
                <span className="px-1.5 py-0.5 text-xs bg-gray-300 dark:bg-gray-600 rounded">
                  {source.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto mt-4">
        {activeSource === 'projects' && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Projects Moved
            </h3>
            <p className="text-sm mb-4">
              Projects now have their own dedicated section in the top navigation
            </p>
            <button
              onClick={() => window.location.href = '/projects'}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go to Projects
            </button>
          </div>
        )}

        {activeSource === 'paste' && (
          <div className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Paste Any Text
              </label>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Paste meeting notes, emails, Granola summaries, or any text...

Example:
- Follow up with Sarah on dashboard design
- Schedule demo for next Tuesday
- Review contract with legal team
- Send email to stakeholders"
                className="w-full h-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white resize-none text-sm"
              />
              
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleExtractFromPaste}
                  disabled={!pasteText.trim() || isProcessing}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      Add to List
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => setPasteText('')}
                  disabled={!pasteText.trim()}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Clear
                </button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Supports bullets (•, -, *) and numbered lists. Each line becomes a TODO.
              </p>
            </div>
          </div>
        )}

        {activeSource === 'brainstorm' && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Free-form Notes & Brainstorming
              </label>
              <textarea
                value={brainstormText}
                onChange={(e) => setBrainstormText(e.target.value)}
                placeholder="Write anything - ideas, notes, thoughts, plans...

Example:
Weekly Planning - Dec 14

Focus areas for next week:
- Need to finalize Q4 goals by Wednesday
- Should push dashboard launch by Friday
- Must schedule 1:1s with team

Ideas:
- Maybe automate the report generation?
- Consider hiring a contractor"
                className="w-full h-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white resize-none text-sm"
              />
              
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleExtractFromBrainstorm}
                  disabled={!brainstormText.trim() || isProcessing}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      Extract TODOs
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => setBrainstormText('')}
                  disabled={!brainstormText.trim()}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Clear
                </button>
              </div>

              <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border border-green-200 dark:border-green-700">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
                  💡 Tips for better extraction:
                </p>
                <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <li>• Use action words: "need to", "should", "must"</li>
                  <li>• Start with verbs: "Send", "Schedule", "Review"</li>
                  <li>• Use bullets or checkboxes</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {(activeSource === 'meetings' || activeSource === 'notes' || activeSource === 'conversations') && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="text-6xl mb-4">{sources.find(s => s.id === activeSource)?.icon}</div>
            <p className="text-lg font-medium mb-2">
              {sources.find(s => s.id === activeSource)?.label} Coming Soon
            </p>
            <p className="text-sm">
              Browse your {activeSource} and extract TODOs directly into your list
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
