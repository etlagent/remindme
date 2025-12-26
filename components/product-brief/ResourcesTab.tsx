"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, ExternalLink, Link as LinkIcon } from "lucide-react"

interface Resource {
  id: string
  title: string
  url: string
  description: string
}

export default function ResourcesTab() {
  const [resources, setResources] = useState<Resource[]>([])
  const [newTitle, setNewTitle] = useState("")
  const [newUrl, setNewUrl] = useState("")
  const [newDescription, setNewDescription] = useState("")

  const addResource = () => {
    if (newTitle.trim() && newUrl.trim()) {
      setResources([...resources, {
        id: Date.now().toString(),
        title: newTitle,
        url: newUrl,
        description: newDescription
      }])
      setNewTitle("")
      setNewUrl("")
      setNewDescription("")
    }
  }

  const deleteResource = (id: string) => {
    setResources(resources.filter(resource => resource.id !== id))
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <p className="text-gray-600 mb-6">Store important links, documents, and resources for this project</p>
        
        <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-lg">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Resource title..."
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="text"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Description (optional)..."
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Button 
            onClick={addResource}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Resource
          </Button>
        </div>

        <div className="space-y-3">
          {resources.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No resources yet. Add links, docs, and files above.</p>
          ) : (
            resources.map(resource => (
              <div 
                key={resource.id}
                className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="p-2 bg-purple-100 rounded-lg">
                  <LinkIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{resource.title}</h4>
                      {resource.description && (
                        <p className="text-sm text-gray-500 mt-1">{resource.description}</p>
                      )}
                      <a 
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1 mt-2"
                      >
                        {resource.url}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <button
                      onClick={() => deleteResource(resource.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
