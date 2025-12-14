import { BusinessWithRelations } from '@/lib/types';

/**
 * Business Notes & Context View
 * Displays notes and context information for a specific business
 */
interface BusinessNotesViewProps {
  business: BusinessWithRelations | null;
  businessNotes: any[];
  expandedNotes: Set<string>;
  setExpandedNotes: (notes: Set<string>) => void;
  loadBusinessNotes: () => Promise<void>;
}

export default function BusinessNotesView({
  business,
  businessNotes,
  expandedNotes,
  setExpandedNotes,
  loadBusinessNotes
}: BusinessNotesViewProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes & Context</h2>
      {!business ? (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-2">No business selected</p>
          <p className="text-sm">Select a business to see notes</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              Notes and context about {business.name}
            </p>
            <button
              onClick={() => loadBusinessNotes()}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              🔄 Refresh
            </button>
          </div>

          {businessNotes.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No notes yet</p>
              <p className="text-sm mt-2">Use the Ideation panel to create notes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {businessNotes.map((note) => {
                const isExpanded = expandedNotes.has(note.id);
                const firstLine = note.content.split('\n')[0].substring(0, 80);
                const preview = note.content.length > 80 || note.content.includes('\n') 
                  ? `${firstLine}${note.content.length > 80 ? '...' : ''}`
                  : note.content;

                return (
                  <div
                    key={note.id}
                    className="border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors"
                  >
                    {/* Header - Always Visible */}
                    <div
                      onClick={() => {
                        const newExpanded = new Set(expandedNotes);
                        if (isExpanded) {
                          newExpanded.delete(note.id);
                        } else {
                          newExpanded.add(note.id);
                        }
                        setExpandedNotes(newExpanded);
                      }}
                      className="p-4 cursor-pointer flex items-start justify-between"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500">
                            {new Date(note.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                          {note.source && note.source !== 'manual' && (
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                              {note.source}
                            </span>
                          )}
                        </div>
                        {!isExpanded && (
                          <p className="text-sm text-gray-600 truncate">{preview}</p>
                        )}
                      </div>
                      <span className={`ml-3 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                        ▶
                      </span>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-4 pb-4">
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.content}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
