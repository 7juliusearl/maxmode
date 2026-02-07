'use client'

import { useState, useEffect } from 'react'

interface Task {
  id: string
  text: string
  completed: boolean
  category: string
  createdAt: string
}

// Event names for cross-tab sync
const TASK_CHANGED = 'maxmode-task-changed'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')

  useEffect(() => {
    const saved = localStorage.getItem('maxmode-tasks')
    if (saved) {
      setTasks(JSON.parse(saved))
    }
  }, [])

  // Broadcast task changes to other tabs
  const broadcastChange = () => {
    window.dispatchEvent(new Event(TASK_CHANGED))
  }

  // Listen for changes from other tabs
  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('maxmode-tasks')
      if (saved) {
        setTasks(JSON.parse(saved))
      }
    }
    
    window.addEventListener('storage', handleStorage)
    window.addEventListener(TASK_CHANGED, handleStorage)
    
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener(TASK_CHANGED, handleStorage)
    }
  }, [])

  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks)
    localStorage.setItem('maxmode-tasks', JSON.stringify(newTasks))
    broadcastChange()
  }

  const addTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) return

    const task: Task = {
      id: Date.now().toString(),
      text: newTask.trim(),
      completed: false,
      category: 'General',
      createdAt: new Date().toISOString(),
    }

    saveTasks([task, ...tasks])
    setNewTask('')
  }

  const toggleTask = (id: string) => {
    saveTasks(tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ))
  }

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter(t => t.id !== id))
  }

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  const pendingCount = tasks.filter(t => !t.completed).length
  const completedCount = tasks.filter(t => t.completed).length

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Tasks
        </h1>
        <p className="text-[#9a9a9e]">Manage your to-dos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-white">{tasks.length}</p>
          <p className="text-xs text-[#9a9a9e]">Total</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-[#fab005]">{pendingCount}</p>
          <p className="text-xs text-[#9a9a9e]">Pending</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-[#40c057]">{completedCount}</p>
          <p className="text-xs text-[#9a9a9e]">Done</p>
        </div>
      </div>

      {/* Add Task */}
      <form onSubmit={addTask} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 bg-[#161618] border border-[#2a2a2e] rounded-lg px-4 py-3 text-white placeholder-[#9a9a9e] focus:outline-none focus:border-[#5c7cfa] transition-colors"
          />
          <button
            type="submit"
            className="bg-[#5c7cfa] hover:bg-[#4c6ef5] text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Add
          </button>
        </div>
      </form>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {(['all', 'pending', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f 
                ? 'bg-[#5c7cfa] text-white' 
                : 'bg-[#161618] text-[#9a9a9e] hover:bg-[#2a2a2e]'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-[#9a9a9e]">
              {filter === 'all' ? 'No tasks yet' : 
               filter === 'pending' ? 'No pending tasks' : 
               'No completed tasks'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`card p-4 flex items-center gap-3 transition-colors ${
                task.completed ? 'opacity-50' : 'hover:bg-[#1a1a1c]'
              }`}
            >
              <button
                onClick={() => toggleTask(task.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  task.completed 
                    ? 'bg-[#40c057] border-[#40c057]' 
                    : 'border-[#2a2a2e] hover:border-[#5c7cfa]'
                }`}
              >
                {task.completed && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
              
              <span className={`flex-1 ${task.completed ? 'line-through text-[#9a9a9e]' : 'text-white'}`}>
                {task.text}
              </span>
              
              <button
                onClick={() => deleteTask(task.id)}
                className="p-2 text-[#9a9a9e] hover:text-[#fa5252] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
