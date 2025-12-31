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
  
  // State - start with empty arrays, load from database
  const [knowns, setKnowns] = useState<Array<{id: string, value: string}>>([])
  const [userBehaviorQuestions, setUserBehaviorQuestions] = useState<Array<{id: string, value: string}>>([])
  const [technicalQuestions, setTechnicalQuestions] = useState<Array<{id: string, value: string}>>([])
  const [businessQuestions, setBusinessQuestions] = useState<Array<{id: string, value: string}>>([])
  const [risks, setRisks] = useState<Array<{id: string, risk: string, impact: string, likelihood: string, mitigation: string}>>([])
  const [assumptions, setAssumptions] = useState<Array<{id: string, value: string, tested: boolean}>>([])

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
          
          // Load data from database or start with one example per section
          setKnowns(data.knowns ?? [
            { id: "example-1", value: "Example: Budget approved and materials are in stock" }
          ])
          setUserBehaviorQuestions(data.user_behavior_questions ?? [
            { id: "example-1", value: "Example: Will the timeline work with contractor availability?" }
          ])
          setTechnicalQuestions(data.technical_questions ?? [
            { id: "example-1", value: "Example: Can the existing plumbing support the new fixtures?" }
          ])
          setBusinessQuestions(data.business_questions ?? [
            { id: "example-1", value: "Example: What's the total budget including unexpected costs?" }
          ])
          setRisks(data.risks ?? [
            { id: "example-1", risk: "Example: Delays due to material shortages", impact: "Medium", likelihood: "Medium", mitigation: "Order materials early and have backup suppliers" }
          ])
          setAssumptions(data.assumptions_to_test ?? [
            { id: "example-1", value: "Example: Contractor can complete work within 2 weeks", tested: false }
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

  // Auto-resize textareas based on content
  useEffect(() => {
    const textareas = document.querySelectorAll('textarea')
    textareas.forEach((textarea) => {
      autoResizeTextarea(textarea as HTMLTextAreaElement)
    })
  }, [knowns, userBehaviorQuestions, technicalQuestions, businessQuestions, risks, assumptions])

  const autoResizeTextarea = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto'
    element.style.height = element.scrollHeight + 'px'
  }

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

  // Handle Enter key to blur textarea
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      e.currentTarget.blur()
    }
  }

  // Handle input Enter key to blur
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.currentTarget.blur()
    }
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
              onDragOver={(e) => handleKnownDragOver(e, index)}
              onDrop={(e) => handleKnownDrop(e, index)}
              className={`relative flex items-start gap-2 ${draggedKnownIndex === index ? 'opacity-50' : ''}`}
            >
              <div 
                draggable
                onDragStart={() => handleKnownDragStart(index)}
                onDragEnd={handleKnownDragEnd}
                className="text-gray-400 hover:text-gray-600 mt-2 cursor-move"
              >
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
                  onChange={(e) => {
                    updateItem(known.id, e.target.value, setKnowns)
                    autoResizeTextarea(e.target)
                  }}
                  onKeyDown={handleTextareaKeyDown}
                  onMouseDown={(e) => e.stopPropagation()}
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
                  onDragOver={(e) => handleUBDragOver(e, index)}
                  onDrop={(e) => handleUBDrop(e, index)}
                  className={`relative flex items-start gap-2 ${draggedUBIndex === index ? 'opacity-50' : ''}`}
                >
                  <div 
                    draggable
                    onDragStart={() => handleUBDragStart(index)}
                    onDragEnd={handleUBDragEnd}
                    className="text-gray-400 hover:text-gray-600 mt-2 cursor-move"
                  >
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
                      onChange={(e) => {
                        updateItem(q.id, e.target.value, setUserBehaviorQuestions)
                        autoResizeTextarea(e.target)
                      }}
                      onKeyDown={handleTextareaKeyDown}
                      onMouseDown={(e) => e.stopPropagation()}
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
                  onDragOver={(e) => handleTechDragOver(e, index)}
                  onDrop={(e) => handleTechDrop(e, index)}
                  className={`relative flex items-start gap-2 ${draggedTechIndex === index ? 'opacity-50' : ''}`}
                >
                  <div 
                    draggable
                    onDragStart={() => handleTechDragStart(index)}
                    onDragEnd={handleTechDragEnd}
                    className="text-gray-400 hover:text-gray-600 mt-2 cursor-move"
                  >
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
                      onChange={(e) => {
                        updateItem(q.id, e.target.value, setTechnicalQuestions)
                        autoResizeTextarea(e.target)
                      }}
                      onKeyDown={handleTextareaKeyDown}
                      onMouseDown={(e) => e.stopPropagation()}
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
                  onDragOver={(e) => handleBizDragOver(e, index)}
                  onDrop={(e) => handleBizDrop(e, index)}
                  className={`relative flex items-start gap-2 ${draggedBizIndex === index ? 'opacity-50' : ''}`}
                >
                  <div 
                    draggable
                    onDragStart={() => handleBizDragStart(index)}
                    onDragEnd={handleBizDragEnd}
                    className="text-gray-400 hover:text-gray-600 mt-2 cursor-move"
                  >
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
                      onChange={(e) => {
                        updateItem(q.id, e.target.value, setBusinessQuestions)
                        autoResizeTextarea(e.target)
                      }}
                      onKeyDown={handleTextareaKeyDown}
                      onMouseDown={(e) => e.stopPropagation()}
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
                  onDragOver={(e) => handleRiskDragOver(e, index)}
                  onDrop={(e) => handleRiskDrop(e, index)}
                  className={`hover:bg-gray-50 ${draggedRiskIndex === index ? 'opacity-50' : ''}`}
                >
                  <td className="py-3 px-2">
                    <div 
                      draggable
                      onDragStart={() => handleRiskDragStart(index)}
                      onDragEnd={handleRiskDragEnd}
                      className="text-gray-400 hover:text-gray-600 cursor-move"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <textarea 
                      draggable={false}
                      value={item.risk}
                      onChange={(e) => {
                        updateRisk(item.id, 'risk', e.target.value)
                        autoResizeTextarea(e.target)
                      }}
                      onKeyDown={handleTextareaKeyDown}
                      onMouseDown={(e) => e.stopPropagation()}
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
                      onChange={(e) => {
                        updateRisk(item.id, 'mitigation', e.target.value)
                        autoResizeTextarea(e.target)
                      }}
                      onKeyDown={handleTextareaKeyDown}
                      onMouseDown={(e) => e.stopPropagation()}
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
              onDragOver={(e) => handleAssumptionDragOver(e, index)}
              onDrop={(e) => handleAssumptionDrop(e, index)}
              className={`flex items-center gap-2 ${draggedAssumptionIndex === index ? 'opacity-50' : ''}`}
            >
              <div 
                draggable
                onDragStart={() => handleAssumptionDragStart(index)}
                onDragEnd={handleAssumptionDragEnd}
                className="text-gray-400 hover:text-gray-600 mt-3 cursor-move"
              >
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
                  onKeyDown={handleInputKeyDown}
                  onMouseDown={(e) => e.stopPropagation()}
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
