"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function MVPScopeTab() {
  return (
    <div className="space-y-6">
      {/* Objective */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">MVP Objective</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">What are we trying to prove/validate?</label>
            <textarea 
              rows={2}
              defaultValue="Validate that professionals will use voice/text capture for networking contacts and that AI can accurately extract structured data from unstructured notes."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="What you're trying to prove with this MVP"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Why Are We Building This?</label>
            <div className="space-y-2">
              <input 
                type="text"
                defaultValue="Business: Validate market demand from target users (founders, VCs, BD professionals)"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Business Reason"
              />
              <input 
                type="text"
                defaultValue="Technical: Prove AI accuracy at 80%+ on data extraction from conversational notes"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Technical Reason"
              />
              <input 
                type="text"
                defaultValue="Strategic: Get first 100 users for feedback and iteration before full launch"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Strategic Reason"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Core Features */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Core Features (Must-Have for Launch)</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Feature</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">User Value</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Owner</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { feature: "Voice/Text Capture", value: "Quick input after meetings", status: "complete", owner: "Engineering", percent: "100" },
                { feature: "AI Organization (OpenAI)", value: "Auto-structure notes", status: "complete", owner: "Engineering", percent: "100" },
                { feature: "LinkedIn Profile Parsing", value: "Background enrichment", status: "complete", owner: "Engineering", percent: "100" },
                { feature: "Edit Preview Mode", value: "Review before saving", status: "complete", owner: "Engineering", percent: "100" },
                { feature: "Database Persistence", value: "Save contacts permanently", status: "in-progress", owner: "Engineering", percent: "60" },
                { feature: "Memory Library", value: "View all saved contacts", status: "planned", owner: "Engineering", percent: "0" },
                { feature: "Follow-Up Tracking", value: "Task management", status: "planned", owner: "Engineering", percent: "0" },
                { feature: "Search & Filter", value: "Find past conversations", status: "planned", owner: "Engineering", percent: "0" }
              ].map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-3 px-2">
                    <input 
                      type="text"
                      defaultValue={item.feature}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <input 
                      type="text"
                      defaultValue={item.value}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <select 
                      defaultValue={item.status}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="complete">✅ Complete</option>
                      <option value="in-progress">🔨 In Progress</option>
                      <option value="planned">📋 Planned</option>
                    </select>
                  </td>
                  <td className="py-3 px-2">
                    <input 
                      type="text"
                      defaultValue={item.owner}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <input 
                      type="number"
                      defaultValue={item.percent}
                      className="w-20 px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Success Metrics */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Success Metrics (How We Know MVP Works)</h2>
        <div className="space-y-3">
          {[
            "10 beta users capturing 50+ contacts each within 30 days",
            "Average capture time < 90 seconds per person",
            "80%+ accuracy on AI-extracted data",
            "Users return 3x/week to add new contacts"
          ].map((metric, index) => (
            <div key={index} className="flex items-center gap-3">
              <Badge className="bg-green-100 text-green-700">Metric {index + 1}</Badge>
              <input 
                type="text"
                defaultValue={metric}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Success metric"
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Out of Scope */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Explicitly Out of Scope (v2+)</h2>
        <div className="space-y-2">
          {[
            "Mobile native apps (web-first MVP)",
            "Screenshot OCR processing",
            "Q&A chat interface over memories",
            "Calendar/email integrations",
            "Team collaboration features"
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Badge className="bg-gray-200 text-gray-700">v2+</Badge>
              <input 
                type="text"
                defaultValue={item}
                className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Feature deferred to v2"
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
