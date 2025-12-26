"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function BusinessCaseTab() {
  return (
    <div className="space-y-6">
      {/* Revenue Model */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Revenue Model</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Approach</label>
            <select 
              defaultValue="freemium"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="freemium">Freemium (Free + Paid tiers)</option>
              <option value="subscription">Subscription-only</option>
              <option value="usage">Usage-based pricing</option>
              <option value="b2b">B2B/Enterprise</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pricing Tiers</label>
            <div className="grid grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold mb-2">Free</h3>
                <input 
                  type="text"
                  defaultValue="$0/month"
                  className="w-full px-2 py-1 mb-2 border border-gray-200 rounded text-2xl font-bold"
                />
                <textarea 
                  rows={4}
                  defaultValue="- 10 contacts/month&#10;- Basic AI organization&#10;- Text capture only&#10;- 7-day memory search"
                  className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div className="border-2 border-purple-500 rounded-lg p-4 bg-purple-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold">Pro</h3>
                  <Badge className="bg-purple-600 text-white">Popular</Badge>
                </div>
                <input 
                  type="text"
                  defaultValue="$15/month"
                  className="w-full px-2 py-1 mb-2 border border-gray-200 rounded text-2xl font-bold"
                />
                <textarea 
                  rows={4}
                  defaultValue="- Unlimited contacts&#10;- Voice + text capture&#10;- LinkedIn parsing&#10;- Unlimited search&#10;- Follow-up reminders&#10;- Export data"
                  className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold mb-2">Teams</h3>
                <input 
                  type="text"
                  defaultValue="$50/user/month"
                  className="w-full px-2 py-1 mb-2 border border-gray-200 rounded text-2xl font-bold"
                />
                <textarea 
                  rows={4}
                  defaultValue="- Everything in Pro&#10;- Shared contacts&#10;- Team collaboration&#10;- Admin dashboard&#10;- Priority support&#10;- Custom integrations"
                  className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Unit Economics (Pro Tier)</label>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-gray-600">Price/Month</label>
                <input type="text" defaultValue="$15" className="w-full px-2 py-1 border border-gray-200 rounded font-medium" />
              </div>
              <div>
                <label className="text-xs text-gray-600">Cost to Serve</label>
                <input type="text" defaultValue="$0.70" className="w-full px-2 py-1 border border-gray-200 rounded font-medium" />
              </div>
              <div>
                <label className="text-xs text-gray-600">Gross Margin</label>
                <input type="text" defaultValue="95%" className="w-full px-2 py-1 border border-gray-200 rounded font-medium text-green-600" />
              </div>
              <div>
                <label className="text-xs text-gray-600">LTV (24mo)</label>
                <input type="text" defaultValue="$360" className="w-full px-2 py-1 border border-gray-200 rounded font-medium text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Go-to-Market Strategy */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Go-to-Market Strategy</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Launch Plan (First 100 Users)</label>
            <textarea 
              rows={4}
              defaultValue="1. Beta launch to personal network (founders, VCs we know) - Target: 20 users&#10;2. ProductHunt launch with video demo - Target: 50 sign-ups&#10;3. Y Combinator/founder communities (HN, Indie Hackers) - Target: 30 users&#10;4. LinkedIn thought leadership posts from founders - Organic reach"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Distribution Channels</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { channel: "Personal Network / Warm Intros", priority: "High", cost: "$0" },
                { channel: "ProductHunt Launch", priority: "High", cost: "$0" },
                { channel: "LinkedIn Organic Content", priority: "High", cost: "$0" },
                { channel: "Y Combinator Community", priority: "Medium", cost: "$0" },
                { channel: "Indie Hackers / HN", priority: "Medium", cost: "$0" },
                { channel: "Conference Sponsorships", priority: "Low", cost: "$5K+" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <input 
                      type="text"
                      defaultValue={item.channel}
                      className="w-full px-2 py-1 bg-white border border-gray-200 rounded mb-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <div className="flex gap-2 text-xs">
                      <Badge className={
                        item.priority === 'High' ? 'bg-green-100 text-green-700' :
                        item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {item.priority}
                      </Badge>
                      <span className="text-gray-600">{item.cost}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Marketing Approach (First 6 Months)</label>
            <textarea 
              rows={4}
              defaultValue="- Content: Weekly LinkedIn posts about networking tips + product updates (founder-led)&#10;- Partnerships: Partner with event organizers for exclusive beta access&#10;- Referrals: Offer 1 month free Pro for every referral that signs up&#10;- Community: Build Slack/Discord for power users to share best practices"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </Card>

      {/* Investment Ask */}
      <Card className="p-6 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <h2 className="text-xl font-bold mb-4">Investment Ask</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <label className="block text-sm font-medium mb-2">Amount Seeking</label>
              <input 
                type="text"
                defaultValue="$50,000"
                className="w-full px-4 py-2 text-3xl font-bold bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <label className="block text-sm font-medium mb-2">Stage</label>
              <select 
                defaultValue="pre-seed"
                className="w-full px-4 py-2 text-lg font-medium bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
              >
                <option value="pre-seed" className="text-gray-900">Pre-Seed</option>
                <option value="seed" className="text-gray-900">Seed</option>
                <option value="series-a" className="text-gray-900">Series A</option>
              </select>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
            <label className="block text-sm font-medium mb-2">Use of Funds Breakdown</label>
            <div className="space-y-2">
              {[
                { category: "Engineering (1 full-time, 1 part-time)", percent: "46%", amount: "$23,000" },
                { category: "Infrastructure & Tools (6 months)", percent: "6%", amount: "$3,000" },
                { category: "Marketing & User Acquisition", percent: "20%", amount: "$10,000" },
                { category: "Operations & Legal", percent: "10%", amount: "$5,000" },
                { category: "Buffer (contingency)", percent: "18%", amount: "$9,000" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="flex-1">{item.category}</span>
                  <span className="font-medium mx-3">{item.percent}</span>
                  <span className="font-bold">{item.amount}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
            <label className="block text-sm font-medium mb-2">Milestones This Funding Will Achieve</label>
            <div className="space-y-2">
              {[
                "Ship MVP to 100 beta users within 8 weeks",
                "Validate 80%+ AI accuracy in production",
                "Achieve 3x/week user retention",
                "Proven unit economics: < $1 cost per user",
                "Product-market fit signals for Series A"
              ].map((milestone, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge className="bg-white/20 text-white">✓</Badge>
                  <span>{milestone}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Competitive Landscape */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Competitive Landscape</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Competitor</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Strengths</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Weaknesses</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Our Advantage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                {
                  competitor: "Clay",
                  strengths: "Strong LinkedIn integration, sales focus",
                  weaknesses: "No voice capture, slow manual entry, $$$",
                  advantage: "Faster capture (voice), lower price, better UX"
                },
                {
                  competitor: "Folk",
                  strengths: "Beautiful UI, good for freelancers",
                  weaknesses: "No AI organization, manual tagging",
                  advantage: "AI does the work, zero manual tagging"
                },
                {
                  competitor: "Salesforce/HubSpot",
                  strengths: "Enterprise features, integrations",
                  weaknesses: "Overkill for individuals, slow, expensive",
                  advantage: "Built for individuals, 10x faster, affordable"
                },
                {
                  competitor: "LinkedIn",
                  strengths: "Everyone already has it, network effects",
                  weaknesses: "No memory/notes, just profiles",
                  advantage: "Captures conversation context, relationship intelligence"
                }
              ].map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium">{item.competitor}</td>
                  <td className="py-3 px-2 text-sm text-gray-600">{item.strengths}</td>
                  <td className="py-3 px-2 text-sm text-gray-600">{item.weaknesses}</td>
                  <td className="py-3 px-2 text-sm text-purple-600 font-medium">{item.advantage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
