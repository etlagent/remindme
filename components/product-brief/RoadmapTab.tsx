"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function RoadmapTab() {
  return (
    <div className="space-y-6">
      {/* Phase 0: Foundation */}
      <Card className="p-6 border-l-4 border-green-500">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Phase 0: Foundation (Pre-MVP)</h2>
          <Badge className="bg-green-100 text-green-700">✅ Completed</Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timeline</label>
            <input 
              type="text"
              defaultValue="Week 1-2 (Nov 2024)"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Goal</label>
            <input 
              type="text"
              defaultValue="Set up technical infrastructure and core architecture"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Deliverables</label>
          <div className="space-y-2">
            {[
              "Next.js project setup with TypeScript",
              "Supabase database configuration",
              "OpenAI API integration",
              "shadcn/ui component library",
              "Basic UI mockups and design system"
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                <Badge className="bg-green-200 text-green-800">✓</Badge>
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="text-sm text-gray-600">Est. Hours</label>
            <input type="number" defaultValue="40" className="w-full mt-1 px-2 py-1 border border-gray-200 rounded" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Actual Hours</label>
            <input type="number" defaultValue="45" className="w-full mt-1 px-2 py-1 border border-gray-200 rounded" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Cost</label>
            <input type="text" defaultValue="$4,500" className="w-full mt-1 px-2 py-1 border border-gray-200 rounded" />
          </div>
        </div>
      </Card>

      {/* Phase 1: MVP Build */}
      <Card className="p-6 border-l-4 border-yellow-500">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Phase 1: MVP Build & Launch</h2>
          <Badge className="bg-yellow-100 text-yellow-700">🔨 In Progress (60%)</Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timeline</label>
            <input 
              type="text"
              defaultValue="Week 3-8 (Dec 2024 - Jan 2025)"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Goal</label>
            <input 
              type="text"
              defaultValue="Ship working MVP to first 10 beta users"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto mb-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-sm font-medium text-gray-700">Feature</th>
                <th className="text-left py-2 text-sm font-medium text-gray-700">Complexity</th>
                <th className="text-left py-2 text-sm font-medium text-gray-700">Est. Hours</th>
                <th className="text-left py-2 text-sm font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { feature: "Voice/Text Capture UI", complexity: "M", hours: "16", status: "complete" },
                { feature: "AI Organization (OpenAI)", complexity: "H", hours: "24", status: "complete" },
                { feature: "LinkedIn Parsing", complexity: "M", hours: "20", status: "complete" },
                { feature: "Database Integration", complexity: "H", hours: "32", status: "in-progress" },
                { feature: "User Authentication", complexity: "M", hours: "16", status: "planned" },
                { feature: "Memory Library View", complexity: "M", hours: "24", status: "planned" },
                { feature: "Search & Filter", complexity: "M", hours: "20", status: "planned" },
                { feature: "Follow-up Management", complexity: "L", hours: "12", status: "planned" }
              ].map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-2 text-sm">{item.feature}</td>
                  <td className="py-2">
                    <Badge className={
                      item.complexity === 'H' ? 'bg-red-100 text-red-700' :
                      item.complexity === 'M' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }>
                      {item.complexity}
                    </Badge>
                  </td>
                  <td className="py-2 text-sm">{item.hours}h</td>
                  <td className="py-2">
                    <Badge className={
                      item.status === 'complete' ? 'bg-green-100 text-green-700' :
                      item.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }>
                      {item.status === 'complete' ? '✅' : item.status === 'in-progress' ? '🔨' : '📋'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Success Metrics</label>
          <div className="space-y-2">
            {[
              "10 beta users onboarded",
              "50+ contacts captured per user",
              "80%+ AI accuracy on data extraction",
              "< 90 seconds average capture time"
            ].map((metric, index) => (
              <div key={index} className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-purple-600 rounded" />
                <span className="text-gray-700">{metric}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="text-sm text-gray-600">Est. Hours</label>
            <input type="number" defaultValue="164" className="w-full mt-1 px-2 py-1 border border-gray-200 rounded" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Actual Hours</label>
            <input type="number" defaultValue="98" className="w-full mt-1 px-2 py-1 border border-gray-200 rounded" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Total Cost</label>
            <input type="text" defaultValue="$16,400" className="w-full mt-1 px-2 py-1 border border-gray-200 rounded" />
          </div>
        </div>
      </Card>

      {/* Phase 2: Validation */}
      <Card className="p-6 border-l-4 border-gray-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Phase 2: Early Validation & Iteration</h2>
          <Badge className="bg-gray-100 text-gray-700">📋 Planned</Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timeline</label>
            <input 
              type="text"
              defaultValue="Week 9-12 (Feb 2025)"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Goal</label>
            <input 
              type="text"
              defaultValue="Gather user feedback and iterate on core features"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Learning Objectives</label>
          <textarea 
            rows={3}
            defaultValue="- Do users prefer voice or text capture?&#10;- What's the average session length?&#10;- Which features drive retention?&#10;- What additional data do users want to capture?"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="text-sm text-gray-600">Est. Hours</label>
            <input type="number" defaultValue="80" className="w-full mt-1 px-2 py-1 border border-gray-200 rounded" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Budget</label>
            <input type="text" defaultValue="$8,000" className="w-full mt-1 px-2 py-1 border border-gray-200 rounded" />
          </div>
          <div>
            <label className="text-sm text-gray-600">User Testing</label>
            <input type="text" defaultValue="$2,000" className="w-full mt-1 px-2 py-1 border border-gray-200 rounded" />
          </div>
        </div>
      </Card>

      {/* Phase 3: PMF */}
      <Card className="p-6 border-l-4 border-gray-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Phase 3: Product-Market Fit</h2>
          <Badge className="bg-gray-100 text-gray-700">📋 Planned</Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timeline</label>
            <input 
              type="text"
              defaultValue="Q2 2025"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Goal</label>
            <input 
              type="text"
              defaultValue="Scale to 1,000 users and validate revenue model"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Key Features</label>
          <div className="space-y-2">
            {[
              "Mobile app (iOS/Android)",
              "Screenshot OCR processing",
              "Q&A chat over memories",
              "Calendar integration",
              "Team collaboration features"
            ].map((feature, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded">
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="text-sm text-gray-600">Est. Engineering Hours</label>
            <input type="number" defaultValue="320" className="w-full mt-1 px-2 py-1 border border-gray-200 rounded" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Total Budget</label>
            <input type="text" defaultValue="$35,000" className="w-full mt-1 px-2 py-1 border border-gray-200 rounded" />
          </div>
        </div>
      </Card>
    </div>
  )
}
