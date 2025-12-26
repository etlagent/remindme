"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function KnownsUnknownsTab() {
  return (
    <div className="space-y-6">
      {/* Knowns */}
      <Card className="p-6 border-l-4 border-green-500">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Badge className="bg-green-100 text-green-700">✓</Badge>
          Knowns (Validated Assumptions)
        </h2>
        <div className="space-y-3">
          {[
            "AI (GPT-4) can accurately extract structured data from conversational notes with 80%+ accuracy",
            "Voice capture is technically feasible using Web Speech API and OpenAI Whisper",
            "LinkedIn profile parsing works reliably for extracting background info",
            "Target users (founders, VCs, BD professionals) actively attend 2+ networking events per month",
            "Current CRM solutions are too slow/manual for in-the-moment networking contexts",
            "Users prefer mobile-friendly web app over native app for MVP (lower barrier)"
          ].map((known, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <Badge className="bg-green-200 text-green-800 mt-1">✓</Badge>
              <textarea 
                defaultValue={known}
                rows={2}
                className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Unknowns */}
      <Card className="p-6 border-l-4 border-yellow-500">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Badge className="bg-yellow-100 text-yellow-700">?</Badge>
          Unknowns (Questions to Answer)
        </h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">User Behavior</h3>
            <div className="space-y-2">
              {[
                "Will users actually capture notes immediately after meetings, or wait until later?",
                "Do users prefer voice or text input? What's the split?",
                "How many contacts does the average user need to capture per month?",
                "What's the acceptable capture time? (We assume < 90 seconds)"
              ].map((q, index) => (
                <textarea 
                  key={index}
                  defaultValue={q}
                  rows={2}
                  className="w-full px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Technical</h3>
            <div className="space-y-2">
              {[
                "Can we maintain 80%+ AI accuracy across different conversation styles?",
                "What's the OpenAI API cost at scale? (Need to validate unit economics)",
                "How well does voice transcription work in noisy conference environments?",
                "Database performance with 10K+ users and millions of memories?"
              ].map((q, index) => (
                <textarea 
                  key={index}
                  defaultValue={q}
                  rows={2}
                  className="w-full px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Business</h3>
            <div className="space-y-2">
              {[
                "What pricing model works best? (Freemium vs. paid-only vs. usage-based)",
                "Will users pay $10-20/month for this? What's the willingness to pay?",
                "Is this a B2C product or does it need B2B/team features to scale?",
                "What's the viral coefficient? Will users refer others organically?"
              ].map((q, index) => (
                <textarea 
                  key={index}
                  defaultValue={q}
                  rows={2}
                  className="w-full px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Risks & Mitigations */}
      <Card className="p-6 border-l-4 border-red-500">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Badge className="bg-red-100 text-red-700">⚠️</Badge>
          Risks & Mitigations
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Risk</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Impact</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Likelihood</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Mitigation Strategy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { 
                  risk: "AI accuracy drops below 80% in production", 
                  impact: "High", 
                  likelihood: "Medium",
                  mitigation: "Build feedback loop for users to correct AI. Fine-tune model with real data. Offer manual edit mode as fallback."
                },
                { 
                  risk: "OpenAI API costs become prohibitive at scale", 
                  impact: "High", 
                  likelihood: "Medium",
                  mitigation: "Implement caching for similar queries. Consider cheaper models for non-critical features. Explore self-hosted alternatives."
                },
                { 
                  risk: "Users don't adopt voice capture (too awkward in public)", 
                  impact: "Medium", 
                  likelihood: "Medium",
                  mitigation: "Make text input equally fast. Add 'quick capture' shortcuts. Focus on post-event capture rather than during-event."
                },
                { 
                  risk: "Competitors (Clay, Folk) add similar AI features", 
                  impact: "High", 
                  likelihood: "High",
                  mitigation: "Move fast to build brand with early users. Focus on superior UX (speed). Add unique features (relationship insights)."
                },
                { 
                  risk: "LinkedIn blocks profile scraping", 
                  impact: "Low", 
                  likelihood: "Low",
                  mitigation: "We only parse user-pasted content, not automated scraping. Add manual profile entry as fallback."
                },
                { 
                  risk: "Privacy concerns prevent user adoption", 
                  impact: "High", 
                  likelihood: "Low",
                  mitigation: "Build trust with transparency. Allow users to delete data. SOC 2 compliance. Clear privacy policy."
                }
              ].map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-3 px-2">
                    <textarea 
                      defaultValue={item.risk}
                      rows={2}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <select 
                      defaultValue={item.impact}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="High">🔴 High</option>
                      <option value="Medium">🟡 Medium</option>
                      <option value="Low">🟢 Low</option>
                    </select>
                  </td>
                  <td className="py-3 px-2">
                    <select 
                      defaultValue={item.likelihood}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="High">🔴 High</option>
                      <option value="Medium">🟡 Medium</option>
                      <option value="Low">🟢 Low</option>
                    </select>
                  </td>
                  <td className="py-3 px-2">
                    <textarea 
                      defaultValue={item.mitigation}
                      rows={2}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Assumptions to Test */}
      <Card className="p-6 bg-blue-50">
        <h2 className="text-xl font-bold mb-4">Key Assumptions to Test in MVP</h2>
        <div className="space-y-2">
          {[
            "Users will capture notes within 24 hours of meeting someone",
            "80%+ of captured data is accurate enough to be useful",
            "Users return 3x/week to add new contacts (indicates habit formation)",
            "Average session time is < 3 minutes (quick capture, not deep CRM work)",
            "Users are willing to paste LinkedIn profiles manually (not too much friction)"
          ].map((assumption, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <input type="checkbox" className="w-5 h-5 text-purple-600 rounded" />
              <input 
                type="text"
                defaultValue={assumption}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
