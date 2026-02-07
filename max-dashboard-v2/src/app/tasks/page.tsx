'use client'

import { useState, useEffect } from 'react'

interface Task {
  id: string
  text: string
  status: 'todo' | 'inprogress' | 'done'
  assignee: 'julius' | 'max' | null
  category: string
  priority: 'high' | 'medium' | 'low'
  dueDate: string | null
  createdAt: string
}

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'border-[#fab005]' },
  { id: 'inprogress', label: 'In Progress', color: 'border-[#5c7cfa]' },
  { id: 'done', label: 'Done', color: 'border-[#40c057]' },
] as const

const CATEGORIES = ['General', 'Wedding', 'Business', 'Personal', 'Marketing']
const PRIORITIES = ['high', 'medium', 'low'] as const
const ASSIGNEES = [
  { id: 'julius', label: 'Julius', emoji: '👤' },
  { id: 'max', label: 'Max', emoji: '🤖' },
] as const

const TASK_CHANGED = 'maxmode-task-changed'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [category, setCategory] = useState('General')
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium')
  const [assignee, setAssignee] = useState<'julius' | 'max' | null>(null)
  const [dueDate, setDueDate] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('maxmode-tasks-kanban')
    if (saved) {
      setTasks(JSON.parse(saved))
    }
  }, [])

  const broadcastChange = () => {
    window.dispatchEvent(new Event(TASK_CHANGED))
  }

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('maxmode-tasks-kanban')
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
    localStorage.setItem('maxmode-tasks-kanban', JSON.stringify(newTasks))
    broadcastChange()
  }

  const addTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) return

    const task: Task = {
      id: Date.now().toString(),
      text: newTask.trim(),
      status: 'todo',
      assignee,
      category,
      priority,
      dueDate: dueDate || null,
      createdAt: new Date().toISOString(),
    }

    saveTasks([task, ...tasks])
    setNewTask('')
    setAssignee(null)
    setDueDate('')
    setShowAddForm(false)
  }

  const moveTask = (id: string, newStatus: Task['status']) => {
    saveTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t))
  }

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter(t => t.id !== id))
  }

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'bg-[#fa5252]/20 text-[#fa5252] border-[#fa5252]'
      case 'medium': return 'bg-[#fab005]/20 text-[#fab005] border-[#fab005]'
      case 'low': return 'bg-[#40c057]/20 text-[#40c057] border-[#40c057]'
      default: return 'bg-[#2a2a2e] text-[#9a9a9e] border-[#2a2a2e]'
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getColumnTasks = (status: string) => tasks.filter(t => t.status === status)

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
            Tasks
          </h1>
          <p className="text-[#9a9a9e]">Kanban Board</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Assignee legend */}
          <div className="flex items-center gap-2">
            {ASSIGNEES.map(a => (
              <div key={a.id} className="flex items-center gap-1 text-xs text-[#9a9a9e]">
                <span>{a.emoji}</span>
                <span>{a.label}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showAddForm 
                ? 'bg-[#2a2a2e] text-[#9a9a9e]' 
                : 'bg-[#5c7cfa] hover:bg-[#4c6ef5] text-white'
            }`}
          >
            {showAddForm ? 'Cancel' : '+ Add Task'}
          </button>
        </div>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <form onSubmit={addTask} className="card p-4 mb-6">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full bg-[#0d0d0f] border border-[#2a2a2e] rounded-lg px-4 py-3 text-white placeholder-[#9a9a9e] focus:outline-none focus:border-[#5c7cfa] transition-colors mb-4"
            autoFocus
          />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {/* Assignee */}
            <div>
              <label className="block text-xs text-[#9a9a9e] mb-1">Assign to</label>
              <div className="flex gap-1">
                {ASSIGNEES.map(a => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAssignee(a.id as 'julius' | 'max')}
                    className={`flex-1 py-2 rounded text-xs font-medium capitalize transition-colors flex items-center justify-center gap-1 ${
                      assignee === a.id 
                        ? 'bg-[#5c7cfa] text-white' 
                        : 'bg-[#0d0d0f] text-[#9a9a9e] hover:bg-[#2a2a2e]'
                    }`}
                  >
                    <span>{a.emoji}</span>
                    <span>{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Category */}
            <div>
              <label className="block text-xs text-[#9a9a9e] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0d0d0f] border border-[#2a2a2e] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#5c7cfa]"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            
            {/* Priority */}
            <div>
              <label className="block text-xs text-[#9a9a9e] mb-1">Priority</label>
              <div className="flex gap-1">
                {PRIORITIES.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-2 rounded text-xs font-medium capitalize transition-colors ${
                      priority === p 
                        ? getPriorityColor(p) 
                        : 'bg-[#0d0d0f] text-[#9a9a9e] hover:bg-[#2a2a2e]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Due Date */}
            <div>
              <label className="block text-xs text-[#9a9a9e] mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#0d0d0f] border border-[#2a2a2e] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#5c7cfa]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#40c057] hover:bg-[#37b24d] text-white py-3 rounded-lg font-medium transition-colors"
          >
            Add Task
          </button>
        </form>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map(column => (
          <div key={column.id} className="flex flex-col">
            {/* Column Header */}
            <div className={`bg-[#161618] rounded-t-lg px-4 py-3 border-t-2 ${column.color}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">{column.label}</span>
                <span className="text-xs text-[#9a9a9e] bg-[#0d0d0f] px-2 py-0.5 rounded-full">
                  {getColumnTasks(column.id).length}
                </span>
              </div>
            </div>
            
            {/* Column Body */}
            <div className="bg-[#161618]/50 rounded-b-lg p-2 flex-1 min-h-[200px] space-y-2">
              {getColumnTasks(column.id).map(task => (
                <div
                  key={task.id}
                  className="card p-3 hover:border-[#2a2a2e] transition-colors cursor-pointer"
                  onClick={() => {
                    const nextStatus = column.id === 'todo' ? 'inprogress' : column.id === 'inprogress' ? 'done' : 'todo'
                    if (column.id !== 'done') {
                      moveTask(task.id, nextStatus)
                    }
                  }}
                >
                  <p className="text-white mb-2">{task.text}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {/* Assignee */}
                    {task.assignee && (
                      <span className="text-xs px-2 py-0.5 rounded bg-[#2a2a2e] text-[#9a9a9e]">
                        {ASSIGNEES.find(a => a.id === task.assignee)?.emoji} {ASSIGNEES.find(a => a.id === task.assignee)?.label}
                      </span>
                    )}
                    
                    {/* Category */}
                    <span className="text-xs px-2 py-0.5 rounded bg-[#2a2a2e] text-[#9a9a9e]">
                      {task.category}
                    </span>
                    
                    {/* Priority */}
                    <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    
                    {/* Due Date */}
                    {task.dueDate && (
                      <span className="text-xs px-2 py-0.5 rounded bg-[#2a2a2e] text-[#9a9a9e]">
                        {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    {/* Move arrows */}
                    <div className="flex gap-1">
                      {column.id !== 'todo' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const prevStatus = column.id === 'done' ? 'inprogress' : 'todo'
                            moveTask(task.id, prevStatus)
                          }}
                          className="p-1 text-[#9a9a9e] hover:text-white"
                        >
                          ←
                        </button>
                      )}
                      {column.id !== 'done' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const nextStatus = column.id === 'todo' ? 'inprogress' : 'done'
                            moveTask(task.id, nextStatus)
                          }}
                          className="p-1 text-[#9a9a9e] hover:text-white"
                        >
                          →
                        </button>
                      )}
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteTask(task.id)
                      }}
                      className="p-1 text-[#9a9a9e] hover:text-[#fa5252]"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              
              {getColumnTasks(column.id).length === 0 && (
                <div className="text-center py-8 text-[#9a9a9e] text-sm">
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
