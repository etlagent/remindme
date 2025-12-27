"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, X, GripVertical } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface CustomField {
  id: string
  title: string
  value: string
}

interface OverviewTabProps {
  projectId: string
}

export default function OverviewTab({ projectId }: OverviewTabProps) {
  // Executive Summary state
  const [productName, setProductName] = useState("")
  const [tagline, setTagline] = useState("")
  const [version, setVersion] = useState("")
  const [elevatorPitch, setElevatorPitch] = useState("")
  const [execSummaryFields, setExecSummaryFields] = useState<CustomField[]>([])
  
  // Problem Statement state
  const [theProblem, setTheProblem] = useState("")
  const [whoPrimary, setWhoPrimary] = useState("")
  const [whoSecondary, setWhoSecondary] = useState("")
  const [marketSize, setMarketSize] = useState("")
  const [problemFields, setProblemFields] = useState<CustomField[]>([])
  
  // Our Solution state
  const [whatBuilding, setWhatBuilding] = useState("")
  const [buildingFields, setBuildingFields] = useState<CustomField[]>([])
  const [journeySteps, setJourneySteps] = useState<CustomField[]>([])
  const [differentiators, setDifferentiators] = useState<CustomField[]>([])
  const [competitors, setCompetitors] = useState<Array<{id: string, name: string, failure: string}>>([])
  
  const [isLoading, setIsLoading] = useState(true)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Load data when projectId changes
  useEffect(() => {
    const loadOverviewData = async () => {
      setIsLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) {
          setIsLoading(false)
          return
        }

        const response = await fetch(`/api/decide/projects/${projectId}/overview`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        })

        const result = await response.json()
        if (result.success && result.data) {
          const data = result.data
          
          // Populate all fields
          setProductName(data.product_name || "")
          setTagline(data.tagline || "")
          setVersion(data.version || "")
          setElevatorPitch(data.elevator_pitch || "")
          setExecSummaryFields(data.exec_summary_custom_fields || [])
          
          setTheProblem(data.the_problem || "")
          setWhoPrimary(data.who_has_problem_primary || "")
          setWhoSecondary(data.who_has_problem_secondary || "")
          setMarketSize(data.market_size || "")
          setProblemFields(data.problem_custom_fields || [])
          
          setWhatBuilding(data.what_building || "")
          setBuildingFields(data.building_custom_fields || [])
          setJourneySteps(data.journey_custom_steps && data.journey_custom_steps.length > 0 ? data.journey_custom_steps : [
            { id: "default-1", title: "", value: "Capture (15 seconds): User records voice note or types quick thoughts after meeting someone" },
            { id: "default-2", title: "", value: "AI Organizes (5 seconds): GPT-4 extracts person details, keywords, companies, follow-ups" },
            { id: "default-3", title: "", value: "Enrich (optional): Paste LinkedIn profile for automatic background parsing" },
            { id: "default-4", title: "", value: "Edit & Save (30 seconds): Review AI-organized data, add notes, save to library" },
            { id: "default-5", title: "", value: "Follow-Up (ongoing): Get reminders, search past conversations, build relationships" }
          ])
          setDifferentiators(data.differentiator_custom_fields && data.differentiator_custom_fields.length > 0 ? data.differentiator_custom_fields : [
            { id: "diff-1", title: "", value: "Speed: 1 minute vs. 15 minutes (CRM manual entry)" },
            { id: "diff-2", title: "", value: "Voice-First: Capture in-the-moment vs. later desk work" },
            { id: "diff-3", title: "", value: "AI Organization: Zero manual field filling" },
            { id: "diff-4", title: "", value: "Relationship Intelligence: Not just contact storage—actionable insights" }
          ])
          setCompetitors(data.competitors && data.competitors.length > 0 ? data.competitors : [
            { id: "comp-1", name: "Manual CRM (Salesforce, HubSpot)", failure: "Too slow for networking contexts" },
            { id: "comp-2", name: "Note apps (Apple Notes, Notion)", failure: "Unstructured, no intelligence" },
            { id: "comp-3", name: "LinkedIn", failure: "Profile info only, no conversation memory" },
            { id: "comp-4", name: "Business cards", failure: "Physical clutter, no digital workflow" }
          ])
        } else {
          // No data exists yet for this project - reset to empty with default journey steps
          setProductName("")
          setTagline("")
          setVersion("")
          setElevatorPitch("")
          setExecSummaryFields([])
          setTheProblem("")
          setWhoPrimary("")
          setWhoSecondary("")
          setMarketSize("")
          setProblemFields([])
          setWhatBuilding("")
          setBuildingFields([])
          setJourneySteps([
            { id: "default-1", title: "", value: "Capture (15 seconds): User records voice note or types quick thoughts after meeting someone" },
            { id: "default-2", title: "", value: "AI Organizes (5 seconds): GPT-4 extracts person details, keywords, companies, follow-ups" },
            { id: "default-3", title: "", value: "Enrich (optional): Paste LinkedIn profile for automatic background parsing" },
            { id: "default-4", title: "", value: "Edit & Save (30 seconds): Review AI-organized data, add notes, save to library" },
            { id: "default-5", title: "", value: "Follow-Up (ongoing): Get reminders, search past conversations, build relationships" }
          ])
          setDifferentiators([
            { id: "diff-1", title: "", value: "Speed: 1 minute vs. 15 minutes (CRM manual entry)" },
            { id: "diff-2", title: "", value: "Voice-First: Capture in-the-moment vs. later desk work" },
            { id: "diff-3", title: "", value: "AI Organization: Zero manual field filling" },
            { id: "diff-4", title: "", value: "Relationship Intelligence: Not just contact storage—actionable insights" }
          ])
          setCompetitors([
            { id: "comp-1", name: "Manual CRM (Salesforce, HubSpot)", failure: "Too slow for networking contexts" },
            { id: "comp-2", name: "Note apps (Apple Notes, Notion)", failure: "Unstructured, no intelligence" },
            { id: "comp-3", name: "LinkedIn", failure: "Profile info only, no conversation memory" },
            { id: "comp-4", name: "Business cards", failure: "Physical clutter, no digital workflow" }
          ])
        }
      } catch (error) {
        console.error('Error loading overview:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadOverviewData()
  }, [projectId])

  // Auto-save with debouncing
  const autoSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) return

        const overviewData = {
          product_name: productName,
          tagline,
          version,
          elevator_pitch: elevatorPitch,
          exec_summary_custom_fields: execSummaryFields,
          
          the_problem: theProblem,
          who_has_problem_primary: whoPrimary,
          who_has_problem_secondary: whoSecondary,
          market_size: marketSize,
          problem_custom_fields: problemFields,
          
          what_building: whatBuilding,
          building_custom_fields: buildingFields,
          journey_custom_steps: journeySteps,
          differentiator_custom_fields: differentiators,
          competitors,
        }

        await fetch(`/api/decide/projects/${projectId}/overview`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(overviewData),
        })
      } catch (error) {
        console.error('Error auto-saving overview:', error)
      }
    }, 1000) // 1 second debounce
  }

  // Trigger auto-save when any state changes
  useEffect(() => {
    if (!isLoading) {
      autoSave()
    }
  }, [
    productName, tagline, version, elevatorPitch, execSummaryFields,
    theProblem, whoPrimary, whoSecondary, marketSize, problemFields,
    whatBuilding, buildingFields, journeySteps, differentiators, competitors
  ])

  // Auto-resize textareas based on content
  useEffect(() => {
    const textareas = document.querySelectorAll('textarea')
    textareas.forEach((textarea) => {
      autoResizeTextarea(textarea as HTMLTextAreaElement)
    })
  }, [elevatorPitch, theProblem, marketSize, whatBuilding, execSummaryFields, problemFields, buildingFields, journeySteps, differentiators, competitors])

  const autoResizeTextarea = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto'
    element.style.height = element.scrollHeight + 'px'
  }

  // Drag and drop handlers for journey steps
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) return

    const newSteps = [...journeySteps]
    const [draggedItem] = newSteps.splice(draggedIndex, 1)
    newSteps.splice(dropIndex, 0, draggedItem)
    
    setJourneySteps(newSteps)
    setDraggedIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  // Drag and drop handlers for differentiators
  const [draggedDiffIndex, setDraggedDiffIndex] = useState<number | null>(null)

  const handleDiffDragStart = (index: number) => {
    setDraggedDiffIndex(index)
  }

  const handleDiffDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
  }

  const handleDiffDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedDiffIndex === null || draggedDiffIndex === dropIndex) return

    const newDiffs = [...differentiators]
    const [draggedItem] = newDiffs.splice(draggedDiffIndex, 1)
    newDiffs.splice(dropIndex, 0, draggedItem)
    
    setDifferentiators(newDiffs)
    setDraggedDiffIndex(null)
  }

  const handleDiffDragEnd = () => {
    setDraggedDiffIndex(null)
  }

  // Drag and drop handlers for competitors
  const [draggedCompIndex, setDraggedCompIndex] = useState<number | null>(null)

  const handleCompDragStart = (index: number) => {
    setDraggedCompIndex(index)
  }

  const handleCompDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
  }

  const handleCompDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedCompIndex === null || draggedCompIndex === dropIndex) return

    const newComps = [...competitors]
    const [draggedItem] = newComps.splice(draggedCompIndex, 1)
    newComps.splice(dropIndex, 0, draggedItem)
    
    setCompetitors(newComps)
    setDraggedCompIndex(null)
  }

  const handleCompDragEnd = () => {
    setDraggedCompIndex(null)
  }

  // Helper functions
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

  if (isLoading) {
    return <div className="flex items-center justify-center py-12">
      <div className="text-gray-500">Loading...</div>
    </div>
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
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter product name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
            <input 
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="One compelling sentence"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Version</label>
            <input 
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., MVP v1.0, POC, Pre-Seed Pitch"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Elevator Pitch (2-3 sentences)</label>
            <textarea 
              rows={3}
              value={elevatorPitch}
              onChange={(e) => setElevatorPitch(e.target.value)}
              onInput={(e) => autoResizeTextarea(e.currentTarget)}
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
              value={theProblem}
              onChange={(e) => setTheProblem(e.target.value)}
              onInput={(e) => autoResizeTextarea(e.currentTarget)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="What pain point are you solving? How big is the pain? Why hasn't this been solved yet?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Who Has This Problem</label>
            <div className="space-y-2">
              <input 
                type="text"
                value={whoPrimary}
                onChange={(e) => setWhoPrimary(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Primary Audience"
              />
              <input 
                type="text"
                value={whoSecondary}
                onChange={(e) => setWhoSecondary(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Secondary Audiences"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Market Size</label>
            <textarea 
              rows={2}
              value={marketSize}
              onChange={(e) => setMarketSize(e.target.value)}
              onInput={(e) => autoResizeTextarea(e.currentTarget)}
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
              value={whatBuilding}
              onChange={(e) => setWhatBuilding(e.target.value)}
              onInput={(e) => autoResizeTextarea(e.currentTarget)}
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
              {journeySteps.map((field, index) => (
                <div 
                  key={field.id} 
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`relative flex items-start gap-2 cursor-move ${draggedIndex === index ? 'opacity-50' : ''}`}
                >
                  <div className="mt-2 text-gray-400 hover:text-gray-600">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div className="flex-1 relative">
                    <button
                      onClick={() => removeField(field.id, setJourneySteps)}
                      className="absolute top-2 right-8 z-10 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <textarea 
                      draggable={false}
                      rows={2}
                      value={field.value}
                      onChange={(e) => updateFieldValue(field.id, e.target.value, setJourneySteps)}
                      onInput={(e) => autoResizeTextarea(e.currentTarget)}
                      className="w-full px-4 py-2 pr-14 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 whitespace-pre-wrap break-words"
                      placeholder="Describe this step..."
                    />
                  </div>
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
              {differentiators.map((field, index) => (
                <div 
                  key={field.id} 
                  draggable
                  onDragStart={() => handleDiffDragStart(index)}
                  onDragOver={(e) => handleDiffDragOver(e, index)}
                  onDrop={(e) => handleDiffDrop(e, index)}
                  onDragEnd={handleDiffDragEnd}
                  className={`relative flex items-start gap-2 cursor-move ${draggedDiffIndex === index ? 'opacity-50' : ''}`}
                >
                  <div className="mt-2 text-gray-400 hover:text-gray-600">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div className="flex-1 relative">
                    <button
                      onClick={() => removeField(field.id, setDifferentiators)}
                      className="absolute top-2 right-8 z-10 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <textarea 
                      draggable={false}
                      rows={2}
                      value={field.value}
                      onChange={(e) => updateFieldValue(field.id, e.target.value, setDifferentiators)}
                      onInput={(e) => autoResizeTextarea(e.currentTarget)}
                      className="w-full px-4 py-2 pr-14 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 whitespace-pre-wrap break-words"
                      placeholder="Describe this differentiator..."
                    />
                  </div>
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
            variant="outline"
            className="h-7 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Competitor
          </Button>
        </div>
        <div className="space-y-3">
          {competitors.map((comp, index) => (
            <div 
              key={comp.id} 
              onDragOver={(e) => handleCompDragOver(e, index)}
              onDrop={(e) => handleCompDrop(e, index)}
              className={`flex items-start gap-2 ${draggedCompIndex === index ? 'opacity-50' : ''}`}
            >
              <div 
                draggable
                onDragStart={() => handleCompDragStart(index)}
                onDragEnd={handleCompDragEnd}
                className="cursor-move mt-2 text-gray-400 hover:text-gray-600"
              >
                <GripVertical className="w-4 h-4" />
              </div>
              <div className="flex-1 relative border border-gray-200 rounded-lg p-3">
                <button
                  onClick={() => removeCompetitor(comp.id)}
                  className="absolute -top-2 -right-2 z-10 bg-white rounded-full p-1 text-gray-400 hover:text-red-600 transition-colors shadow-sm border border-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <textarea 
                    draggable={false}
                    rows={1}
                    value={comp.name}
                    onChange={(e) => setCompetitors(competitors.map(c => 
                      c.id === comp.id ? { ...c, name: e.target.value } : c
                    ))}
                    onInput={(e) => autoResizeTextarea(e.currentTarget)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 whitespace-pre-wrap break-words resize-none overflow-hidden"
                    placeholder="Solution name"
                  />
                  <textarea 
                    draggable={false}
                    rows={1}
                    value={comp.failure}
                    onChange={(e) => setCompetitors(competitors.map(c => 
                      c.id === comp.id ? { ...c, failure: e.target.value } : c
                    ))}
                    onInput={(e) => autoResizeTextarea(e.currentTarget)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 whitespace-pre-wrap break-words resize-none overflow-hidden"
                    placeholder="Why it fails"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
