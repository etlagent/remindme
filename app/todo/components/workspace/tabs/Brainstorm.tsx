'use client';

import { useState } from 'react';

interface BrainstormProps {
  onCreateBulk: (todos: string[]) => Promise<void>;
}

export function Brainstorm({ onCreateBulk }: BrainstormProps) {
  const [noteText, setNoteText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  const handleExtractTodos = async () => {
    if (!noteText.trim()) return;

    setIsExtracting(true);
    try {
      // Simple extraction: look for lines that seem like action items
      const lines = noteText.split('\n');
      const todos: string[] = [];

      lines.forEach(line => {
        const trimmed = line.trim();
        
        // Look for action-oriented phrases
        const actionWords = ['need to', 'should', 'must', 'todo:', 'action:', 'task:', '[]', '[ ]'];
        const startsWithVerb = /^(send|create|review|update|schedule|call|email|prepare|draft|finish|complete|build|design|implement|test|deploy|fix|investigate)/i.test(trimmed);
        const hasBullet = /^[•\-*\d+\.]/.test(trimmed);
        
        if (trimmed && (
          actionWords.some(word => trimmed.toLowerCase().includes(word)) ||
          startsWithVerb ||
          (hasBullet && trimmed.length > 10)
        )) {
          // Clean up the text
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
        await onCreateBulk(todos);
        alert(`Extracted ${todos.length} action items!`);
      } else {
        alert('No action items found. Try using action words like "need to", "should", or start with verbs.');
      }
    } catch (error) {
      console.error('Error extracting todos:', error);
      alert('Failed to extract TODOs. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveNote = () => {
    // TODO: Save note to database for later reference
    alert('Note saving feature coming soon!');
  };

  return (
    <div className="space-y-4">
      {/* Free-form Note Area */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Free-form Notes & Brainstorming
        </label>
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Write anything here - ideas, notes, thoughts, plans...

Example:
Weekly Planning - Dec 14

Focus areas for next week:
- Need to finalize Q4 goals by Wednesday
- Should push dashboard launch by Friday
- Must schedule 1:1s with team

Blockers:
- Waiting on legal for contract review
- Need design feedback from Sarah
- Backend API still not ready

Ideas to explore:
- Maybe automate the report generation?
- Consider hiring a contractor
- Look into new CRM options"
          className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white resize-none text-sm"
        />
        
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleExtractTodos}
            disabled={!noteText.trim() || isExtracting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isExtracting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Extract TODOs
              </>
            )}
          </button>
          
          <button
            onClick={handleSaveNote}
            disabled={!noteText.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Note
          </button>
          
          <button
            onClick={() => setNoteText('')}
            disabled={!noteText.trim()}
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
            <li>• Use bullets or checkboxes: [ ] Task name</li>
            <li>• Keep tasks on separate lines</li>
          </ul>
        </div>
      </div>

      {/* Helper Info */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Use this space for:
        </h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• <strong>Weekly planning</strong> - Think through your week</li>
          <li>• <strong>Meeting prep</strong> - Jot down discussion points</li>
          <li>• <strong>Problem solving</strong> - Work through blockers</li>
          <li>• <strong>Ideas & thoughts</strong> - Capture anything</li>
          <li>• <strong>Quick notes</strong> - Temporary scratch space</li>
        </ul>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          This is your thinking space. Write freely, then extract action items when ready.
        </p>
      </div>
    </div>
  );
}
