"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, X, GripVertical } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface KnownsUnknownsTabProps {
  projectId: string
}

export default function KnownsUnknownsTab({ projectId }: KnownsUnknownsTabProps) {
  const [isLoading, setIsLoading] = useState(true)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  // Knowns state
  const [knowns, setKnowns] = useState<Array<{id: string, value: string}>>([
    { id: "known-1", value: "AI (GPT-4) can accurately extract structured data from conversational notes with 80%+ accuracy" },
    { id: "known-2", value: "Voice capture is technically feasible using Web Speech API and OpenAI Whisper" },
    { id: "known-3", value: "LinkedIn profile parsing works reliably for extracting background info" },
    { id: "known-4", value: "Target users (founders, VCs, BD professionals) actively attend 2+ networking events per month" },
    { id: "known-5", value: "Current CRM solutions are too slow/manual for in-the-moment networking contexts" },
    { id: "known-6", value: "Users prefer mobile-friendly web app over native app for MVP (lower barrier)" }
  ])

  // Unknowns state
  const [userBehaviorQuestions, setUserBehaviorQuestions] = useState<Array<{id: string, value: string}>>([
    { id: "ub-1", value: "Will users actually capture notes immediately after meetings, or wait until later?" },
    { id: "ub-2", value: "Do users prefer voice or text input? What's the split?" },
    { id: "ub-3", value: "How many contacts does the average user need to capture per month?" },
    { id: "ub-4", value: "What's the acceptable capture time? (We assume < 90 seconds)" }
  ])

  const [technicalQuestions, setTechnicalQuestions] = useState<Array<{id: string, value: string}>>([
    { id: "tech-1", value: "Can we maintain 80%+ AI accuracy across different conversation styles?" },
    { id: "tech-2", value: "What's the OpenAI API cost at scale? (Need to validate unit economics)" },
    { id: "tech-3", value: "How well does voice transcription work in noisy conference environments?" },
    { id: "tech-4", value: "Database performance with 10K+ users and millions of memories?" }
  ])

  const [businessQuestions, setBusinessQuestions] = useState<Array<{id: string, value: string}>>([
    { id: "biz-1", value: "What pricing model works best? (Freemium vs. paid-only vs. usage-based)" },
    { id: "biz-2", value: "Will users pay $10-20/month for this? What's the willingness to pay?" },
    { id: "biz-3", value: "Is this a B2C product or does it need B2B/team features to scale?" },
    { id: "biz-4", value: "What's the viral coefficient? Will users refer others organically?" }
  ])

  // Risks state
  const [risks, setRisks] = useState<Array<{id: string, risk: string, impact: string, likelihood: string, mitigation: string}>>([
    { id: "risk-1", risk: "AI accuracy drops below 80% in production", impact: "High", likelihood: "Medium", mitigation: "Build feedback loop for users to correct AI. Fine-tune model with real data. Offer manual edit mode as fallback." },
    { id: "risk-2", risk: "OpenAI API costs become prohibitive at scale", impact: "High", likelihood: "Medium", mitigation: "Implement caching for similar queries. Consider cheaper models for non-critical features. Explore self-hosted alternatives." },
    { id: "risk-3", risk: "Users don't adopt voice capture (too awkward in public)", impact: "Medium", likelihood: "Medium", mitigation: "Make text input equally fast. Add 'quick capture' shortcuts. Focus on post-event capture rather than during-event." },
    { id: "risk-4", risk: "Competitors (Clay, Folk) add similar AI features", impact: "High", likelihood: "High", mitigation: "Move fast to build brand with early users. Focus on superior UX (speed). Add unique features (relationship insights)." },
    { id: "risk-5", risk: "LinkedIn blocks profile scraping", impact: "Low", likelihood: "Low", mitigation: "We only parse user-pasted content, not automated scraping. Add manual profile entry as fallback." },
    { id: "risk-6", risk: "Privacy concerns prevent user adoption", impact: "High", likelihood: "Low", mitigation: "Build trust with transparency. Allow users to delete data. SOC 2 compliance. Clear privacy policy." }
  ])

  // Assumptions to test state
  const [assumptions, setAssumptions] = useState<Array<{id: string, value: string, tested: boolean}>>([
    { id: "assumption-1", value: "Users will capture notes within 24 hours of meeting someone", tested: false },
    { id: "assumption-2", value: "80%+ of captured data is accurate enough to be useful", tested: false },
    { id: "assumption-3", value: "Users return 3x/week to add new contacts (indicates habit formation)", tested: false },
    { id: "assumption-4", value: "Average session time is < 3 minutes (quick capture, not deep CRM work)", tested: false },
    { id: "assumption-5", value: "Users are willing to paste LinkedIn profiles manually (not too much friction)", tested: false }
  ])

  const [draggedAssumptionIndex, setDraggedAssumptionIndex] = useState<number | null>(null)
  const [draggedRiskIndex, setDraggedRiskIndex] = useState<number | null>(null)
  const [draggedUBIndex, setDraggedUBIndex] = useState<number | null>(null)
  const [draggedTechIndex, setDraggedTechIndex] = useState<number | null>(null)
  const [draggedBizIndex, setDraggedBizIndex] = useState<number | null>(null)
  const [draggedKnownIndex, setDraggedKnownIndex] = useState<number | null>(null)

  // Load data when projectId changes
  useEffect(() => {
    const loadKnownsUnknownsData = async () => {
      setIsLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) {
          setIsLoading(false)
          return
        }

        const response = await fetch(`/api/decide/projects/${projectId}/knowns-unknowns`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        })

        const result = await response.json()
        if (result.success && result.data) {
          const data = result.data
          
          // Populate all fields with defaults if empty
          setKnowns(data.knowns && data.knowns.length > 0 ? data.knowns : [
            { id: "known-1", value: "AI (GPT-4) can accurately extract structured data from conversational notes with 80%+ accuracy" },
            { id: "known-2", value: "Voice capture is technically feasible using Web Speech API and OpenAI Whisper" },
            { id: "known-3", value: "LinkedIn profile parsing works reliably for extracting background info" },
            { id: "known-4", value: "Target users (founders, VCs, BD professionals) actively attend 2+ networking events per month" },
            { id: "known-5", value: "Current CRM solutions are too slow/manual for in-the-moment networking contexts" },
            { id: "known-6", value: "Users prefer mobile-friendly web app over native app for MVP (lower barrier)" }
          ])
          
          setUserBehaviorQuestions(data.user_behavior_questions && data.user_behavior_questions.length > 0 ? data.user_behavior_questions : [
            { id: "ub-1", value: "Will users actually capture notes immediately after meetings, or wait until later?" },
            { id: "ub-2", value: "Do users prefer voice or text input? What's the split?" },
            { id: "ub-3", value: "How many contacts does the average user need to capture per month?" },
            { id: "ub-4", value: "What's the acceptable capture time? (We assume < 90 seconds)" }
          ])
          
          setTechnicalQuestions(data.technical_questions && data.technical_questions.length > 0 ? data.technical_questions : [
            { id: "tech-1", value: "Can we maintain 80%+ AI accuracy across different conversation styles?" },
            { id: "tech-2", value: "What's the OpenAI API cost at scale? (Need to validate unit economics)" },
            { id: "tech-3", value: "How well does voice transcription work in noisy conference environments?" },
            { id: "tech-4", value: "Database performance with 10K+ users and millions of memories?" }
          ])
          
          setBusinessQuestions(data.business_questions && data.business_questions.length > 0 ? data.business_questions : [
            { id: "biz-1", value: "What pricing model works best? (Freemium vs. paid-only vs. usage-based)" },
            { id: "biz-2", value: "Will users pay $10-20/month for this? What's the willingness to pay?" },
            { id: "biz-3", value: "Is this a B2C product or does it need B2B/team features to scale?" },
            { id: "biz-4", value: "What's the viral coefficient? Will users refer others organically?" }
          ])
          
          setRisks(data.risks && data.risks.length > 0 ? data.risks : [
            { id: "risk-1", risk: "AI accuracy drops below 80% in production", impact: "High", likelihood: "Medium", mitigation: "Build feedback loop for users to correct AI. Fine-tune model with real data. Offer manual edit mode as fallback." },
            { id: "risk-2", risk: "OpenAI API costs become prohibitive at scale", impact: "High", likelihood: "Medium", mitigation: "Implement caching for similar queries. Consider cheaper models for non-critical features. Explore self-hosted alternatives." },
            { id: "risk-3", risk: "Users don't adopt voice capture (too awkward in public)", impact: "Medium", likelihood: "Medium", mitigation: "Make text input equally fast. Add 'quick capture' shortcuts. Focus on post-event capture rather than during-event." },
            { id: "risk-4", risk: "Competitors (Clay, Folk) add similar AI features", impact: "High", likelihood: "High", mitigation: "Move fast to build brand with early users. Focus on superior UX (speed). Add unique features (relationship insights)." },
            { id: "risk-5", risk: "LinkedIn blocks profile scraping", impact: "Low", likelihood: "Low", mitigation: "We only parse user-pasted content, not automated scraping. Add manual profile entry as fallback." },
            { id: "risk-6", risk: "Privacy concerns prevent user adoption", impact: "High", likelihood: "Low", mitigation: "Build trust with transparency. Allow users to delete data. SOC 2 compliance. Clear privacy policy." }
          ])
          
          setAssumptions(data.assumptions_to_test && data.assumptions_to_test.length > 0 ? data.assumptions_to_test : [
            { id: "assumption-1", value: "Users will capture notes within 24 hours of meeting someone", tested: false },
            { id: "assumption-2", value: "80%+ of captured data is accurate enough to be useful", tested: false },
            { id: "assumption-3", value: "Users return 3x/week to add new contacts (indicates habit formation)", tested: false },
            { id: "assumption-4", value: "Average session time is < 3 minutes (quick capture, not deep CRM work)", tested: false },
            { id: "assumption-5", value: "Users are willing to paste LinkedIn profiles manually (not too much friction)", tested: false }
          ])
        }
      } catch (error) {
        console.error('Error loading knowns/unknowns:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (projectId) {
      loadKnownsUnknownsData()
    }
  }, [projectId])

  // Auto-save function with debounce
  const autoSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) return

        const knownsUnknownsData = {
          knowns,
          user_behavior_questions: userBehaviorQuestions,
          technical_questions: technicalQuestions,
          business_questions: businessQuestions,
          risks,
          assumptions_to_test: assumptions,
        }

        await fetch(`/api/decide/projects/${projectId}/knowns-unknowns`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(knownsUnknownsData),
        })
      } catch (error) {
        console.error('Error auto-saving knowns/unknowns:', error)
      }
    }, 1000) // 1 second debounce
  }

  // Trigger auto-save when any state changes
  useEffect(() => {
    if (!isLoading) {
      autoSave()
    }
  }, [knowns, userBehaviorQuestions, technicalQuestions, businessQuestions, risks, assumptions])

  const addItem = (setter: React.Dispatch<React.SetStateAction<Array<{id: string, value: string}>>>) => {
    setter(prev => [...prev, { id: Date.now().toString(), value: "" }])
  }

  const removeItem = (id: string, setter: React.Dispatch<React.SetStateAction<Array<{id: string, value: string}>>>) => {
    setter(prev => prev.filter(item => item.id !== id))
  }

  const updateItem = (id: string, value: string, setter: React.Dispatch<React.SetStateAction<Array<{id: string, value: string}>>>) => {
    setter(prev => prev.map(item => item.id === id ? { ...item, value } : item))
  }

  // Risk management functions
  const addRisk = () => {
    setRisks([...risks, { id: Date.now().toString(), risk: "", impact: "Medium", likelihood: "Medium", mitigation: "" }])
  }

  const removeRisk = (id: string) => {
    setRisks(risks.filter(risk => risk.id !== id))
  }

  const updateRisk = (id: string, field: string, value: string) => {
    setRisks(risks.map(risk => risk.id === id ? { ...risk, [field]: value } : risk))
  }

  // Drag and drop handlers for risks
  const handleRiskDragStart = (index: number) => {
    setDraggedRiskIndex(index)
  }

  const handleRiskDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
  }

  const handleRiskDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedRiskIndex === null || draggedRiskIndex === dropIndex) return

    const newRisks = [...risks]
    const [draggedItem] = newRisks.splice(draggedRiskIndex, 1)
    newRisks.splice(dropIndex, 0, draggedItem)
    
    setRisks(newRisks)
    setDraggedRiskIndex(null)
  }

  const handleRiskDragEnd = () => {
    setDraggedRiskIndex(null)
  }

  // Assumptions management functions
  const addAssumption = () => {
    setAssumptions([...assumptions, { id: Date.now().toString(), value: "", tested: false }])
  }

  const removeAssumption = (id: string) => {
    setAssumptions(assumptions.filter(assumption => assumption.id !== id))
  }

  const updateAssumption = (id: string, value: string) => {
    setAssumptions(assumptions.map(assumption => assumption.id === id ? { ...assumption, value } : assumption))
  }

  const toggleAssumptionTested = (id: string) => {
    setAssumptions(assumptions.map(assumption => assumption.id === id ? { ...assumption, tested: !assumption.tested } : assumption))
  }

  // Drag and drop handlers for assumptions
  const handleAssumptionDragStart = (index: number) => {
    setDraggedAssumptionIndex(index)
  }

  const handleAssumptionDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
  }

  const handleAssumptionDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedAssumptionIndex === null || draggedAssumptionIndex === dropIndex) return

    const newAssumptions = [...assumptions]
    const [draggedItem] = newAssumptions.splice(draggedAssumptionIndex, 1)
    newAssumptions.splice(dropIndex, 0, draggedItem)
    
    setAssumptions(newAssumptions)
    setDraggedAssumptionIndex(null)
  }

  const handleAssumptionDragEnd = () => {
    setDraggedAssumptionIndex(null)
  }

  // Drag and drop handlers for user behavior questions
  const handleUBDragStart = (index: number) => {
    setDraggedUBIndex(index)
  }

  const handleUBDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
  }

  const handleUBDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedUBIndex === null || draggedUBIndex === dropIndex) return

    const newQuestions = [...userBehaviorQuestions]
    const [draggedItem] = newQuestions.splice(draggedUBIndex, 1)
    newQuestions.splice(dropIndex, 0, draggedItem)
    
    setUserBehaviorQuestions(newQuestions)
    setDraggedUBIndex(null)
  }

  const handleUBDragEnd = () => {
    setDraggedUBIndex(null)
  }

  // Drag and drop handlers for technical questions
  const handleTechDragStart = (index: number) => {
    setDraggedTechIndex(index)
  }

  const handleTechDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
  }

  const handleTechDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedTechIndex === null || draggedTechIndex === dropIndex) return

    const newQuestions = [...technicalQuestions]
    const [draggedItem] = newQuestions.splice(draggedTechIndex, 1)
    newQuestions.splice(dropIndex, 0, draggedItem)
    
    setTechnicalQuestions(newQuestions)
    setDraggedTechIndex(null)
  }

  const handleTechDragEnd = () => {
    setDraggedTechIndex(null)
  }

  // Drag and drop handlers for business questions
  const handleBizDragStart = (index: number) => {
    setDraggedBizIndex(index)
  }

  const handleBizDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
  }

  const handleBizDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedBizIndex === null || draggedBizIndex === dropIndex) return

    const newQuestions = [...businessQuestions]
    const [draggedItem] = newQuestions.splice(draggedBizIndex, 1)
    newQuestions.splice(dropIndex, 0, draggedItem)
    
    setBusinessQuestions(newQuestions)
    setDraggedBizIndex(null)
  }

  const handleBizDragEnd = () => {
    setDraggedBizIndex(null)
  }

  // Drag and drop handlers for knowns
  const handleKnownDragStart = (index: number) => {
    setDraggedKnownIndex(index)
  }

  const handleKnownDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
  }

  const handleKnownDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedKnownIndex === null || draggedKnownIndex === dropIndex) return

    const newKnowns = [...knowns]
    const [draggedItem] = newKnowns.splice(draggedKnownIndex, 1)
    newKnowns.splice(dropIndex, 0, draggedItem)
    
    setKnowns(newKnowns)
    setDraggedKnownIndex(null)
  }

  const handleKnownDragEnd = () => {
    setDraggedKnownIndex(null)
  }
  return (
    <div className="space-y-6">
      {/* Knowns */}
      <Card className="p-6 border-l-4 border-green-500">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Badge className="bg-green-100 text-green-700">✓</Badge>
            Knowns (Validated Assumptions)
          </h2>
          <Button 
            onClick={() => addItem(setKnowns)}
            size="sm"
            variant="outline"
            className="h-7 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        </div>
        <div className="space-y-2">
          {knowns.map((known, index) => (
            <div 
              key={known.id} 
              draggable
              onDragStart={() => handleKnownDragStart(index)}
              onDragOver={(e) => handleKnownDragOver(e, index)}
              onDrop={(e) => handleKnownDrop(e, index)}
              onDragEnd={handleKnownDragEnd}
              className={`relative flex items-start gap-2 cursor-move ${draggedKnownIndex === index ? 'opacity-50' : ''}`}
            >
              <div className="text-gray-400 hover:text-gray-600 mt-2">
                <GripVertical className="w-4 h-4" />
              </div>
              <div className="flex-1 relative">
                <button
                  onClick={() => removeItem(known.id, setKnowns)}
                  className="absolute top-2 right-2 z-10 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <textarea 
                  draggable={false}
                  value={known.value}
                  onChange={(e) => updateItem(known.id, e.target.value, setKnowns)}
                  rows={2}
                  className="w-full px-4 py-2 pr-8 bg-green-50 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none overflow-hidden"
                  placeholder="Enter a validated assumption..."
                />
              </div>
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
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">User Behavior</h3>
              <Button 
                onClick={() => addItem(setUserBehaviorQuestions)}
                size="sm"
                variant="outline"
                className="h-6 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {userBehaviorQuestions.map((q, index) => (
                <div 
                  key={q.id} 
                  draggable
                  onDragStart={() => handleUBDragStart(index)}
                  onDragOver={(e) => handleUBDragOver(e, index)}
                  onDrop={(e) => handleUBDrop(e, index)}
                  onDragEnd={handleUBDragEnd}
                  className={`relative flex items-start gap-2 cursor-move ${draggedUBIndex === index ? 'opacity-50' : ''}`}
                >
                  <div className="text-gray-400 hover:text-gray-600 mt-2">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div className="flex-1 relative">
                    <button
                      onClick={() => removeItem(q.id, setUserBehaviorQuestions)}
                      className="absolute top-2 right-2 z-10 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <textarea 
                      draggable={false}
                      value={q.value}
                      onChange={(e) => updateItem(q.id, e.target.value, setUserBehaviorQuestions)}
                      rows={2}
                      className="w-full px-4 py-2 pr-8 bg-yellow-50 border border-yellow-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none overflow-hidden"
                      placeholder="Enter a question..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">Technical</h3>
              <Button 
                onClick={() => addItem(setTechnicalQuestions)}
                size="sm"
                variant="outline"
                className="h-6 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {technicalQuestions.map((q, index) => (
                <div 
                  key={q.id} 
                  draggable
                  onDragStart={() => handleTechDragStart(index)}
                  onDragOver={(e) => handleTechDragOver(e, index)}
                  onDrop={(e) => handleTechDrop(e, index)}
                  onDragEnd={handleTechDragEnd}
                  className={`relative flex items-start gap-2 cursor-move ${draggedTechIndex === index ? 'opacity-50' : ''}`}
                >
                  <div className="text-gray-400 hover:text-gray-600 mt-2">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div className="flex-1 relative">
                    <button
                      onClick={() => removeItem(q.id, setTechnicalQuestions)}
                      className="absolute top-2 right-2 z-10 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <textarea 
                      draggable={false}
                      value={q.value}
                      onChange={(e) => updateItem(q.id, e.target.value, setTechnicalQuestions)}
                      rows={2}
                      className="w-full px-4 py-2 pr-8 bg-yellow-50 border border-yellow-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none overflow-hidden"
                      placeholder="Enter a question..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">Business</h3>
              <Button 
                onClick={() => addItem(setBusinessQuestions)}
                size="sm"
                variant="outline"
                className="h-6 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {businessQuestions.map((q, index) => (
                <div 
                  key={q.id} 
                  draggable
                  onDragStart={() => handleBizDragStart(index)}
                  onDragOver={(e) => handleBizDragOver(e, index)}
                  onDrop={(e) => handleBizDrop(e, index)}
                  onDragEnd={handleBizDragEnd}
                  className={`relative flex items-start gap-2 cursor-move ${draggedBizIndex === index ? 'opacity-50' : ''}`}
                >
                  <div className="text-gray-400 hover:text-gray-600 mt-2">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div className="flex-1 relative">
                    <button
                      onClick={() => removeItem(q.id, setBusinessQuestions)}
                      className="absolute top-2 right-2 z-10 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <textarea 
                      draggable={false}
                      value={q.value}
                      onChange={(e) => updateItem(q.id, e.target.value, setBusinessQuestions)}
                      rows={2}
                      className="w-full px-4 py-2 pr-8 bg-yellow-50 border border-yellow-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none overflow-hidden"
                      placeholder="Enter a question..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Risks & Mitigations */}
      <Card className="p-6 border-l-4 border-red-500">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Badge className="bg-red-100 text-red-700">⚠️</Badge>
            Risks & Mitigations
          </h2>
          <Button 
            onClick={addRisk}
            size="sm"
            variant="outline"
            className="h-7 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Risk
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="w-10"></th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Risk</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Impact</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Likelihood</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Mitigation Strategy</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {risks.map((item, index) => (
                <tr 
                  key={item.id} 
                  draggable
                  onDragStart={() => handleRiskDragStart(index)}
                  onDragOver={(e) => handleRiskDragOver(e, index)}
                  onDrop={(e) => handleRiskDrop(e, index)}
                  onDragEnd={handleRiskDragEnd}
                  className={`hover:bg-gray-50 cursor-move ${draggedRiskIndex === index ? 'opacity-50' : ''}`}
                >
                  <td className="py-3 px-2">
                    <div className="text-gray-400 hover:text-gray-600">
                      <GripVertical className="w-4 h-4" />
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <textarea 
                      draggable={false}
                      value={item.risk}
                      onChange={(e) => updateRisk(item.id, 'risk', e.target.value)}
                      rows={2}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none overflow-hidden"
                      placeholder="Describe the risk..."
                    />
                  </td>
                  <td className="py-3 px-2">
                    <select 
                      draggable={false}
                      value={item.impact}
                      onChange={(e) => updateRisk(item.id, 'impact', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="High">🔴 High</option>
                      <option value="Medium">🟡 Medium</option>
                      <option value="Low">🟢 Low</option>
                    </select>
                  </td>
                  <td className="py-3 px-2">
                    <select 
                      draggable={false}
                      value={item.likelihood}
                      onChange={(e) => updateRisk(item.id, 'likelihood', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="High">🔴 High</option>
                      <option value="Medium">🟡 Medium</option>
                      <option value="Low">🟢 Low</option>
                    </select>
                  </td>
                  <td className="py-3 px-2">
                    <textarea 
                      draggable={false}
                      value={item.mitigation}
                      onChange={(e) => updateRisk(item.id, 'mitigation', e.target.value)}
                      rows={2}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none overflow-hidden"
                      placeholder="Mitigation strategy..."
                    />
                  </td>
                  <td className="py-3 px-2">
                    <button
                      onClick={() => removeRisk(item.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Assumptions to Test */}
      <Card className="p-6 bg-blue-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Key Assumptions to Test in MVP</h2>
          <Button 
            onClick={addAssumption}
            size="sm"
            variant="outline"
            className="h-7 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        </div>
        <div className="space-y-2">
          {assumptions.map((assumption, index) => (
            <div 
              key={assumption.id}
              draggable
              onDragStart={() => handleAssumptionDragStart(index)}
              onDragOver={(e) => handleAssumptionDragOver(e, index)}
              onDrop={(e) => handleAssumptionDrop(e, index)}
              onDragEnd={handleAssumptionDragEnd}
              className={`flex items-center gap-2 cursor-move ${draggedAssumptionIndex === index ? 'opacity-50' : ''}`}
            >
              <div className="text-gray-400 hover:text-gray-600 mt-3">
                <GripVertical className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg flex-1 relative">
                <button
                  onClick={() => removeAssumption(assumption.id)}
                  className="absolute top-2 right-2 z-10 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <input 
                  draggable={false}
                  type="text"
                  value={assumption.value}
                  onChange={(e) => updateAssumption(assumption.id, e.target.value)}
                  className="flex-1 px-4 py-2 pr-8 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter assumption to test..."
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
