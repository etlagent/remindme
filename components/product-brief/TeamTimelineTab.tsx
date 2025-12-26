"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function TeamTimelineTab() {
  return (
    <div className="space-y-6">
      {/* Core Team */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Core Team</h2>
        <div className="space-y-3">
          {[
            {
              name: "Founder Name",
              role: "CEO / Product Lead",
              expertise: "10+ years in product, 3 successful exits, deep network in VC/founder community",
              time: "Full-time"
            },
            {
              name: "Engineer Name",
              role: "Lead Engineer",
              expertise: "Full-stack dev, AI/ML experience, previously at [Company], built similar platforms",
              time: "Full-time"
            },
            {
              name: "Designer Name",
              role: "Product Designer",
              expertise: "UI/UX specialist, worked on consumer apps with 1M+ users",
              time: "Part-time (20h/week)"
            }
          ].map((member, index) => (
            <div key={index} className="grid grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg">
              <input 
                type="text"
                defaultValue={member.name}
                placeholder="Name"
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input 
                type="text"
                defaultValue={member.role}
                placeholder="Role"
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input 
                type="text"
                defaultValue={member.expertise}
                placeholder="Expertise/Background"
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex items-center gap-2">
                <Badge className={member.time.includes('Full') ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                  {member.time}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Roles to Fill */}
      <Card className="p-6 border-l-4 border-orange-500">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Badge className="bg-orange-100 text-orange-700">Open Positions</Badge>
          Roles We Need to Fill
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Role</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Required Skills</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Start Date</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Commitment</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Compensation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                {
                  role: "Backend Engineer",
                  skills: "Node.js, PostgreSQL, API design, AI integration",
                  start: "Jan 2025",
                  commitment: "Full-time",
                  comp: "Equity + $80-100K"
                },
                {
                  role: "Marketing / Growth Lead",
                  skills: "B2C SaaS growth, content creation, community building",
                  start: "Feb 2025",
                  commitment: "Part-time → Full",
                  comp: "Equity + $60-80K"
                },
                {
                  role: "Product Advisor",
                  skills: "SaaS product strategy, fundraising experience",
                  start: "Immediate",
                  commitment: "Advisor (5h/mo)",
                  comp: "0.5% equity"
                }
              ].map((role, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-3 px-2">
                    <input 
                      type="text"
                      defaultValue={role.role}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <input 
                      type="text"
                      defaultValue={role.skills}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <input 
                      type="text"
                      defaultValue={role.start}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <input 
                      type="text"
                      defaultValue={role.commitment}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <input 
                      type="text"
                      defaultValue={role.comp}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MVP Timeline */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">MVP Timeline & Milestones</h2>
        <div className="relative">
          {/* Timeline */}
          <div className="space-y-6">
            {[
              {
                week: "Week 1-2",
                date: "Nov 1-15, 2024",
                milestone: "Foundation & Setup",
                deliverables: "Next.js setup, Supabase config, OpenAI integration, UI components",
                status: "complete",
                owner: "Engineering"
              },
              {
                week: "Week 3-4",
                date: "Nov 16-30, 2024",
                milestone: "Core Capture Features",
                deliverables: "Voice/text capture UI, AI organization endpoint, LinkedIn parsing",
                status: "complete",
                owner: "Engineering"
              },
              {
                week: "Week 5-6",
                date: "Dec 1-15, 2024",
                milestone: "Database Integration",
                deliverables: "User auth, data persistence, memory library, search",
                status: "in-progress",
                owner: "Engineering"
              },
              {
                week: "Week 7-8",
                date: "Dec 16-31, 2024",
                milestone: "Beta Launch",
                deliverables: "Bug fixes, polish, onboard first 10 users, gather feedback",
                status: "planned",
                owner: "Team"
              },
              {
                week: "Week 9-12",
                date: "Jan 2025",
                milestone: "Iteration & Scale",
                deliverables: "Feature improvements, 100 users, ProductHunt launch",
                status: "planned",
                owner: "Team"
              }
            ].map((item, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full ${
                    item.status === 'complete' ? 'bg-green-500' :
                    item.status === 'in-progress' ? 'bg-yellow-500' :
                    'bg-gray-300'
                  }`}></div>
                  {index < 4 && <div className="w-0.5 h-full bg-gray-300 mt-2"></div>}
                </div>
                <div className="flex-1 pb-8">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <input 
                        type="text"
                        defaultValue={item.week}
                        className="font-bold px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      <input 
                        type="text"
                        defaultValue={item.date}
                        className="text-sm text-gray-600 px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <Badge className={
                      item.status === 'complete' ? 'bg-green-100 text-green-700' :
                      item.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }>
                      {item.status === 'complete' ? '✅ Complete' :
                       item.status === 'in-progress' ? '🔨 In Progress' :
                       '📋 Planned'}
                    </Badge>
                  </div>
                  <input 
                    type="text"
                    defaultValue={item.milestone}
                    className="text-lg font-semibold mb-2 w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <textarea 
                    defaultValue={item.deliverables}
                    rows={2}
                    className="text-sm text-gray-600 w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    Owner: <span className="font-medium">{item.owner}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Current Status */}
      <Card className="p-6 bg-blue-50">
        <h2 className="text-xl font-bold mb-4">Current Status</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">As of Date</label>
            <input 
              type="date"
              defaultValue="2024-12-25"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Where We Are Today</label>
            <textarea 
              rows={3}
              defaultValue="Phase 1 MVP is 60% complete. Voice/text capture and AI organization working well. Currently integrating database persistence. On track for beta launch in 2 weeks."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Blockers</label>
            <textarea 
              rows={2}
              defaultValue="Need to finalize Supabase RLS policies for multi-user support. Waiting on design feedback for memory library UI."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Next Steps (This Week)</label>
            <textarea 
              rows={3}
              defaultValue="1. Complete database integration (save-memory API)&#10;2. Implement user authentication&#10;3. Build memory library view&#10;4. Start recruiting first 10 beta users"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
