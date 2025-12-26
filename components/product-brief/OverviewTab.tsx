"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"

interface CustomField {
  id: string
  title: string
  value: string
}

export default function OverviewTab() {
  const [execSummaryFields, setExecSummaryFields] = useState<CustomField[]>([])
  const [problemFields, setProblemFields] = useState<CustomField[]>([])
  const [buildingFields, setBuildingFields] = useState<CustomField[]>([])
  const [journeySteps, setJourneySteps] = useState<CustomField[]>([])
  const [differentiators, setDifferentiators] = useState<CustomField[]>([])
  const [competitors, setCompetitors] = useState<Array<{id: string, name: string, failure: string}>>([])

  // Helper functions for each section
  const addField = (setter: React.Dispatch<React.SetStateAction<CustomField[]>>) => {
    setter(prev => [...prev, { id: Date.now().toString(), title: "", value: "" }])
  }

  const removeField = (id: string, setter: React.Dispatch<React.SetStateAction<CustomField[]>>) => {
    setter(prev => prev.filter(field => field.id !== id))
  }

  const updateFieldTitle = (id: string, title: string, setter: React.Dispatch<React.SetStateAction<CustomField[]>>) => {
    setter(prev => prev.map(field => field.id === id ? { ...field, title } : field))
  }

  const updateFieldValue = (id: string, value: string, setter: React.Dispatch<React.SetStateAction<CustomField[]>>) => {
    setter(prev => prev.map(field => field.id === id ? { ...field, value } : field))
  }

  const addCompetitor = () => {
    setCompetitors([...competitors, { id: Date.now().toString(), name: "", failure: "" }])
  }

  const removeCompetitor = (id: string) => {
    setCompetitors(competitors.filter(comp => comp.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Executive Summary</h2>
          <Button 
            onClick={() => addField(setExecSummaryFields)}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Field
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
            <input 
              type="text"
              defaultValue="RemindMe"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter product name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
            <input 
              type="text"
              defaultValue="AI-powered personal memory assistant for professional networking"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="One compelling sentence"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Version</label>
            <input 
              type="text"
              defaultValue="MVP v1.0"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., MVP v1.0, POC, Pre-Seed Pitch"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Elevator Pitch (2-3 sentences)</label>
            <textarea 
              rows={3}
              defaultValue="Capture conversations via voice/text, AI organizes them into actionable relationship intelligence. RemindMe helps professionals remember people, conversations, and important moments without manual data entry."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="What you're building + Who it's for + Why it matters"
            />
          </div>

          {/* Custom Fields */}
          {execSummaryFields.map((field) => (
            <div key={field.id} className="relative bg-purple-50 p-4 rounded-lg border border-purple-200">
              <button
                onClick={() => removeField(field.id, setExecSummaryFields)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="space-y-2">
                <input 
                  type="text"
                  value={field.title}
                  onChange={(e) => updateFieldTitle(field.id, e.target.value, setExecSummaryFields)}
                  className="w-full px-3 py-1.5 text-sm font-medium bg-white border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Field Title (e.g., Last Updated, Owner, Stage)"
                />
                <textarea 
                  value={field.value}
                  onChange={(e) => updateFieldValue(field.id, e.target.value, setExecSummaryFields)}
                  rows={2}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter value..."
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Problem Statement */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Problem Statement</h2>
          <Button 
            onClick={() => addField(setProblemFields)}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Field
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">The Problem</label>
            <textarea 
              rows={4}
              defaultValue="Professionals meet 20-50+ people at conferences, networking events, and meetings monthly. 80% of valuable connections are lost within 2 weeks due to poor note-taking. Existing CRM tools require manual data entry (15-20 min per contact). LinkedIn connections accumulate but relationship context disappears."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="What pain point are you solving? How big is the pain? Why hasn't this been solved yet?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Who Has This Problem</label>
            <div className="space-y-2">
              <input 
                type="text"
                defaultValue="Primary: Founders, VCs, business development professionals, sales leaders"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Primary Audience"
              />
              <input 
                type="text"
                defaultValue="Secondary: Consultants, recruiters, event organizers, community builders"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Secondary Audiences"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Market Size</label>
            <textarea 
              rows={2}
              defaultValue="Professional networking events: $15B+ industry. CRM market: $60B+. 150M+ knowledge workers in US alone who attend networking events."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="TAM/SAM/SOM or qualitative description"
            />
          </div>

          {/* Custom Fields */}
          {problemFields.map((field) => (
            <div key={field.id} className="relative bg-purple-50 p-4 rounded-lg border border-purple-200">
              <button
                onClick={() => removeField(field.id, setProblemFields)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="space-y-2">
                <input 
                  type="text"
                  value={field.title}
                  onChange={(e) => updateFieldTitle(field.id, e.target.value, setProblemFields)}
                  className="w-full px-3 py-1.5 text-sm font-medium bg-white border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Field Title"
                />
                <textarea 
                  value={field.value}
                  onChange={(e) => updateFieldValue(field.id, e.target.value, setProblemFields)}
                  rows={2}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter value..."
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Our Solution */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Our Solution</h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">What We're Building</label>
              <Button 
                onClick={() => addField(setBuildingFields)}
                size="sm"
                variant="outline"
                className="h-7 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>
            <textarea 
              rows={3}
              defaultValue="RemindMe is an AI-first relationship intelligence platform that turns unstructured conversation notes into organized, actionable contact profiles—with zero manual data entry."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Core product description in 2-3 sentences"
            />
            {buildingFields.map((field) => (
              <div key={field.id} className="relative bg-purple-50 p-3 rounded-lg border border-purple-200 mt-2">
                <button
                  onClick={() => removeField(field.id, setBuildingFields)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="space-y-2">
                  <input 
                    type="text"
                    value={field.title}
                    onChange={(e) => updateFieldTitle(field.id, e.target.value, setBuildingFields)}
                    className="w-full px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Field Title"
                  />
                  <textarea 
                    value={field.value}
                    onChange={(e) => updateFieldValue(field.id, e.target.value, setBuildingFields)}
                    rows={2}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter value..."
                  />
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">How It Works (User Journey)</label>
              <Button 
                onClick={() => addField(setJourneySteps)}
                size="sm"
                variant="outline"
                className="h-7 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Step
              </Button>
            </div>
            <div className="space-y-2">
              {[
                "Capture (15 seconds): User records voice note or types quick thoughts after meeting someone",
                "AI Organizes (5 seconds): GPT-4 extracts person details, keywords, companies, follow-ups",
                "Enrich (optional): Paste LinkedIn profile for automatic background parsing",
                "Edit & Save (30 seconds): Review AI-organized data, add notes, save to library",
                "Follow-Up (ongoing): Get reminders, search past conversations, build relationships"
              ].map((step, index) => (
                <input 
                  key={index}
                  type="text"
                  defaultValue={step}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder={`Step ${index + 1}`}
                />
              ))}
              {journeySteps.map((field) => (
                <div key={field.id} className="relative bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <button
                    onClick={() => removeField(field.id, setJourneySteps)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <input 
                    type="text"
                    value={field.value}
                    onChange={(e) => updateFieldValue(field.id, e.target.value, setJourneySteps)}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Additional step..."
                  />
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Key Differentiators</label>
              <Button 
                onClick={() => addField(setDifferentiators)}
                size="sm"
                variant="outline"
                className="h-7 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {[
                "Speed: 1 minute vs. 15 minutes (CRM manual entry)",
                "Voice-First: Capture in-the-moment vs. later desk work",
                "AI Organization: Zero manual field filling",
                "Relationship Intelligence: Not just contact storage—actionable insights"
              ].map((diff, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Badge className="bg-purple-100 text-purple-700 mt-1">✓</Badge>
                  <input 
                    type="text"
                    defaultValue={diff}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder={`Differentiator ${index + 1}`}
                  />
                </div>
              ))}
              {differentiators.map((field) => (
                <div key={field.id} className="relative flex items-start gap-2 bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <Badge className="bg-purple-100 text-purple-700 mt-1">✓</Badge>
                  <input 
                    type="text"
                    value={field.value}
                    onChange={(e) => updateFieldValue(field.id, e.target.value, setDifferentiators)}
                    className="flex-1 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Additional differentiator..."
                  />
                  <button
                    onClick={() => removeField(field.id, setDifferentiators)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Current Solutions & Their Failures */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Current Solutions & Their Failures</h2>
          <Button 
            onClick={addCompetitor}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Competitor
          </Button>
        </div>
        <div className="space-y-3">
          {[
            { name: "Manual CRM (Salesforce, HubSpot)", failure: "Too slow for networking contexts" },
            { name: "Note apps (Apple Notes, Notion)", failure: "Unstructured, no intelligence" },
            { name: "LinkedIn", failure: "Profile info only, no conversation memory" },
            { name: "Business cards", failure: "Physical clutter, no digital workflow" }
          ].map((solution, index) => (
            <div key={index} className="grid grid-cols-2 gap-3">
              <input 
                type="text"
                defaultValue={solution.name}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Solution name"
              />
              <input 
                type="text"
                defaultValue={solution.failure}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Why it fails"
              />
            </div>
          ))}
          
          {/* Dynamic Competitors */}
          {competitors.map((comp) => (
            <div key={comp.id} className="relative grid grid-cols-2 gap-3 bg-purple-50 p-3 rounded-lg border border-purple-200">
              <button
                onClick={() => removeCompetitor(comp.id)}
                className="absolute -top-2 -right-2 bg-white rounded-full p-1 text-gray-400 hover:text-red-600 transition-colors shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
              <input 
                type="text"
                value={comp.name}
                onChange={(e) => setCompetitors(competitors.map(c => 
                  c.id === comp.id ? { ...c, name: e.target.value } : c
                ))}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Competitor name"
              />
              <input 
                type="text"
                value={comp.failure}
                onChange={(e) => setCompetitors(competitors.map(c => 
                  c.id === comp.id ? { ...c, failure: e.target.value } : c
                ))}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Why it fails"
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
