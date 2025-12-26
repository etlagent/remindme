"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function TechnicalSpecsTab() {
  return (
    <div className="space-y-6">
      {/* Tech Stack */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Tech Stack</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frontend</label>
            <input 
              type="text"
              defaultValue="Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Backend</label>
            <input 
              type="text"
              defaultValue="Next.js API Routes, Node.js"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Database</label>
            <input 
              type="text"
              defaultValue="Supabase (PostgreSQL)"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">AI/ML</label>
            <input 
              type="text"
              defaultValue="OpenAI GPT-4, Whisper API"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Authentication</label>
            <input 
              type="text"
              defaultValue="Supabase Auth"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Deployment</label>
            <input 
              type="text"
              defaultValue="Vercel (Frontend + API), Supabase (Database)"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </Card>

      {/* Architecture Decisions */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Architecture Decisions</h2>
        <div className="space-y-3">
          {[
            { decision: "Next.js App Router", rationale: "Server-side rendering for better SEO, built-in API routes, modern React patterns" },
            { decision: "Supabase over Firebase", rationale: "PostgreSQL gives more flexibility for complex queries, better pricing at scale" },
            { decision: "OpenAI GPT-4", rationale: "Best-in-class NLP for extracting structured data from conversational notes" },
            { decision: "Server-side AI processing", rationale: "Keep API keys secure, better error handling, rate limiting control" }
          ].map((item, index) => (
            <div key={index} className="grid grid-cols-2 gap-3">
              <div>
                <input 
                  type="text"
                  defaultValue={item.decision}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Decision made"
                />
              </div>
              <div>
                <input 
                  type="text"
                  defaultValue={item.rationale}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Why this decision"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Scalability Considerations */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Scalability Considerations</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">1K Users</label>
            <textarea 
              rows={2}
              defaultValue="Current architecture handles this easily. Vercel auto-scales. Supabase free tier supports 500MB database + 2GB bandwidth."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">10K Users</label>
            <textarea 
              rows={2}
              defaultValue="Need Supabase Pro ($25/mo). Implement caching layer (Redis). Optimize database queries with indexes. Consider rate limiting per user."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">What Needs Refactoring Later</label>
            <textarea 
              rows={2}
              defaultValue="Move AI processing to queue system (Bull/BullMQ). Implement CDN for static assets. Database sharding if hitting query limits. Consider microservices for AI vs. CRUD operations."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </Card>

      {/* Key Dependencies */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Key Dependencies & Costs</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Service</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Provider</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Cost/Month (at scale)</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Risk if it Fails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { service: "AI Processing", provider: "OpenAI", cost: "$200-500", risk: "Critical - app unusable without AI" },
                { service: "Database", provider: "Supabase", cost: "$25-100", risk: "Critical - data storage required" },
                { service: "Hosting", provider: "Vercel", cost: "$20", risk: "Critical - no app access" },
                { service: "Voice Transcription", provider: "OpenAI Whisper", cost: "$50-150", risk: "High - fallback to text-only" }
              ].map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-3 px-2">
                    <input 
                      type="text"
                      defaultValue={item.service}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <input 
                      type="text"
                      defaultValue={item.provider}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <input 
                      type="text"
                      defaultValue={item.cost}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <input 
                      type="text"
                      defaultValue={item.risk}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Database Schema */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Database Schema (Key Tables)</h2>
        <div className="space-y-4">
          {[
            { table: "people", description: "User contacts with LinkedIn data, skills, relationship scores" },
            { table: "memories", description: "Conversation notes, AI summaries, keywords, context" },
            { table: "follow_ups", description: "Action items, priorities, due dates, completion status" },
            { table: "experiences", description: "Work history from LinkedIn profiles" },
            { table: "education", description: "Educational background from LinkedIn" }
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Badge className="bg-blue-100 text-blue-700 mt-1">{item.table}</Badge>
              <input 
                type="text"
                defaultValue={item.description}
                className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Table description"
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
