import { Badge } from '@/components/ui/badge';
import { BusinessWithRelations } from '@/lib/types';

/**
 * Business Follow-ups View
 * Displays action items and next steps for a specific business
 */
interface BusinessFollowupsViewProps {
  business: BusinessWithRelations | null;
  businessFollowups: any[];
  expandedFollowups: Set<string>;
  setExpandedFollowups: (followups: Set<string>) => void;
  loadBusinessFollowups: () => Promise<void>;
}

export default function BusinessFollowupsView({
  business,
  businessFollowups,
  expandedFollowups,
  setExpandedFollowups,
  loadBusinessFollowups
}: BusinessFollowupsViewProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Follow Ups</h2>
      {!business ? (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-2">No business selected</p>
          <p className="text-sm">Select a business to see follow-ups</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              Track action items and next steps for {business.name}
            </p>
            <button
              onClick={() => loadBusinessFollowups()}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              🔄 Refresh
            </button>
          </div>

          {businessFollowups.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No follow-ups yet</p>
              <p className="text-sm mt-2">Use the Ideation panel to create follow-ups</p>
            </div>
          ) : (
            <div className="space-y-3">
              {businessFollowups.map((followup) => {
                const isExpanded = expandedFollowups.has(followup.id);
                const firstLine = followup.description.split('\n')[0].substring(0, 60);
                const preview = followup.description.length > 60 || followup.description.includes('\n')
                  ? `${firstLine}${followup.description.length > 60 ? '...' : ''}`
                  : followup.description;

                return (
                  <div
                    key={followup.id}
                    className="border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors"
                  >
                    {/* Header - Always Visible */}
                    <div
                      onClick={() => {
                        const newExpanded = new Set(expandedFollowups);
                        if (isExpanded) {
                          newExpanded.delete(followup.id);
                        } else {
                          newExpanded.add(followup.id);
                        }
                        setExpandedFollowups(newExpanded);
                      }}
                      className="p-4 cursor-pointer flex items-start justify-between"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs text-gray-500">
                            {new Date(followup.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <Badge
                            className={
                              followup.priority === 'high'
                                ? 'bg-red-100 text-red-700 border-red-200'
                                : followup.priority === 'medium'
                                ? 'bg-amber-100 text-amber-700 border-amber-200'
                                : 'bg-gray-100 text-gray-700 border-gray-200'
                            }
                          >
                            {followup.priority}
                          </Badge>
                          <Badge
                            className={
                              followup.status === 'completed'
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : followup.status === 'cancelled'
                                ? 'bg-gray-100 text-gray-500 border-gray-200'
                                : 'bg-blue-100 text-blue-700 border-blue-200'
                            }
                          >
                            {followup.status}
                          </Badge>
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
                          <p className="text-sm text-gray-800 whitespace-pre-wrap">{followup.description}</p>
                          {followup.due_date && (
                            <p className="text-xs text-gray-500 mt-3">
                              📅 Due: {new Date(followup.due_date).toLocaleDateString()}
                            </p>
                          )}
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
