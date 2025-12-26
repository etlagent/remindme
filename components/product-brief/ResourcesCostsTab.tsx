"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ResourcesCostsTab() {
  return (
    <div className="space-y-6">
      {/* Engineering Hours Summary */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Total Engineering Hours</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Phase</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Est. Hours</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Actual Hours</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Rate</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Total Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { phase: "Phase 0: Foundation", est: "40", actual: "45", rate: "$100", cost: "$4,500" },
                { phase: "Phase 1: MVP Build", est: "164", actual: "98", rate: "$100", cost: "$9,800" },
                { phase: "Phase 2: Validation", est: "80", actual: "-", rate: "$100", cost: "$8,000" },
                { phase: "Phase 3: PMF", est: "320", actual: "-", rate: "$100", cost: "$32,000" }
              ].map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium">{item.phase}</td>
                  <td className="py-3 px-2">
                    <input type="number" defaultValue={item.est} className="w-20 px-2 py-1 border border-gray-200 rounded" />
                  </td>
                  <td className="py-3 px-2">
                    <input type="text" defaultValue={item.actual} className="w-20 px-2 py-1 border border-gray-200 rounded" />
                  </td>
                  <td className="py-3 px-2">
                    <input type="text" defaultValue={item.rate} className="w-24 px-2 py-1 border border-gray-200 rounded" />
                  </td>
                  <td className="py-3 px-2 font-medium text-purple-600">{item.cost}</td>
                </tr>
              ))}
              <tr className="bg-purple-50 font-bold">
                <td className="py-3 px-2">TOTAL ENGINEERING</td>
                <td className="py-3 px-2">604h</td>
                <td className="py-3 px-2">143h</td>
                <td className="py-3 px-2">-</td>
                <td className="py-3 px-2 text-purple-700">$54,300</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Infrastructure & Services Costs */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Infrastructure & Services Costs (Monthly)</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Service</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Provider</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">MVP (0-100 users)</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Scale (1K users)</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Growth (10K users)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { service: "AI Processing", provider: "OpenAI", mvp: "$50", scale: "$200", growth: "$800" },
                { service: "Database", provider: "Supabase", mvp: "$0", scale: "$25", growth: "$100" },
                { service: "Hosting", provider: "Vercel", mvp: "$0", scale: "$20", growth: "$50" },
                { service: "Voice Transcription", provider: "OpenAI Whisper", mvp: "$20", scale: "$100", growth: "$400" },
                { service: "Auth", provider: "Supabase", mvp: "$0", scale: "$0", growth: "$25" },
                { service: "Monitoring", provider: "Sentry", mvp: "$0", scale: "$26", growth: "$80" }
              ].map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium">{item.service}</td>
                  <td className="py-3 px-2">{item.provider}</td>
                  <td className="py-3 px-2">
                    <input type="text" defaultValue={item.mvp} className="w-20 px-2 py-1 border border-gray-200 rounded" />
                  </td>
                  <td className="py-3 px-2">
                    <input type="text" defaultValue={item.scale} className="w-20 px-2 py-1 border border-gray-200 rounded" />
                  </td>
                  <td className="py-3 px-2">
                    <input type="text" defaultValue={item.growth} className="w-20 px-2 py-1 border border-gray-200 rounded" />
                  </td>
                </tr>
              ))}
              <tr className="bg-blue-50 font-bold">
                <td className="py-3 px-2" colSpan={2}>TOTAL MONTHLY</td>
                <td className="py-3 px-2 text-blue-700">$70/mo</td>
                <td className="py-3 px-2 text-blue-700">$371/mo</td>
                <td className="py-3 px-2 text-blue-700">$1,455/mo</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Total Investment Breakdown */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
        <h2 className="text-xl font-bold mb-4">Total Investment Needed (Pre-Seed)</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">Engineering (Phases 0-2)</label>
              <input 
                type="text"
                defaultValue="$22,300"
                className="w-full px-4 py-2 text-2xl font-bold text-purple-600 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">Infrastructure (6 months)</label>
              <input 
                type="text"
                defaultValue="$3,000"
                className="w-full px-4 py-2 text-2xl font-bold text-blue-600 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">Marketing/Growth</label>
              <input 
                type="text"
                defaultValue="$10,000"
                className="w-full px-4 py-2 text-2xl font-bold text-green-600 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">Operations/Legal</label>
              <input 
                type="text"
                defaultValue="$5,000"
                className="w-full px-4 py-2 text-2xl font-bold text-orange-600 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">Buffer (20%)</label>
              <input 
                type="text"
                defaultValue="$8,060"
                className="w-full px-4 py-2 text-2xl font-bold text-gray-600 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-4 rounded-lg shadow-lg">
              <label className="block text-sm font-medium text-white mb-2">TOTAL ASK</label>
              <div className="text-3xl font-bold text-white">$48,360</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">What This Investment Buys</label>
            <div className="space-y-2">
              {[
                "6 months runway to reach MVP + validation",
                "1 full-time engineer + 1 part-time designer",
                "100 beta users with validated product-market fit signals",
                "Proven AI accuracy and user retention metrics"
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-700">✓</Badge>
                  <input 
                    type="text"
                    defaultValue={item}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Cost per User */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Unit Economics</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cost per User (MVP)</label>
            <input 
              type="text"
              defaultValue="~$0.70/user/month (mostly AI costs)"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Revenue per User</label>
            <input 
              type="text"
              defaultValue="$10-20/month (freemium + premium)"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gross Margin</label>
            <input 
              type="text"
              defaultValue="93-96% (excellent SaaS margins)"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
