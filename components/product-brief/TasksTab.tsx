"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Plus } from "lucide-react"

interface Task {
  id: string
  text: string
  completed: boolean
}

export default function TasksTab() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { 
        id: Date.now().toString(), 
        text: newTask, 
        completed: false 
      }])
      setNewTask("")
    }
  }

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTask()
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <p className="text-gray-600 mb-6">Break down your project into actionable tasks</p>
        
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a task..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Button 
            onClick={addTask}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>

        <div className="space-y-2">
          {tasks.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No tasks yet. Add your first task above.</p>
          ) : (
            tasks.map(task => (
              <div 
                key={task.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className={`flex-1 ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                  {task.text}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
