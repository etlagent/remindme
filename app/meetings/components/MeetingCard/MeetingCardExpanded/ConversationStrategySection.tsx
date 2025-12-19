'use client';

interface ConversationStrategySectionProps {
  meetingId: string;
}

export default function ConversationStrategySection({ meetingId }: ConversationStrategySectionProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">💬 Conversation Strategy</h3>
        <button
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          disabled
        >
          Build Strategy
        </button>
      </div>

      {/* Placeholder for Business.conversations component integration */}
      <div className="p-6 text-center border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-gray-500 space-y-2">
          <p className="font-medium">Conversation Strategy Placeholder</p>
          <p className="text-sm">
            This will integrate with the Business.conversations component
          </p>
          <ul className="text-sm text-left max-w-md mx-auto mt-4 space-y-1">
            <li>• Define situation & goal</li>
            <li>• Select context sources (LinkedIn, notes, etc.)</li>
            <li>• Generate AI-powered conversation steps</li>
            <li>• Prepare talking points for each attendee</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
