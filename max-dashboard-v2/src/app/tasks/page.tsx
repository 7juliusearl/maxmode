'use client'

import { useState, useRef, useEffect } from 'react'

interface Task {
  id: string
  text: string
  status: 'pending' | 'todo' | 'inprogress' | 'done'
  assignee: 'julius' | 'max'
  category: string
  priority: 'high' | 'medium' | 'low'
  dueDate: string | null
  createdAt: string
  maxNotes?: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  type?: 'task_confirmation' | 'task_update' | 'info'
  taskData?: Partial<Task>
}

const COLUMNS = [
  { id: 'pending', label: 'Awaiting Julius', color: 'border-[#FBBF24]', icon: '⏳' },
  { id: 'todo', label: 'To Do', color: 'border-[#0D9488]', icon: '📋' },
  { id: 'inprogress', label: 'In Progress', color: 'border-[#60A5FA]', icon: '🔄' },
  { id: 'done', label: 'Done', color: 'border-[#22C55E]', icon: '✅' },
] as const

type TaskConfirmation = {
  text: string
  category: string
  priority: 'high' | 'medium' | 'low'
  assignee: 'julius' | 'max'
  dueDate: string | null
} | null

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'assistant', 
      content: "Hi! I'm Max, your AI task manager. Just describe what you need to do, and I'll:\n\n1️⃣ Create a task from your description\n2️⃣ Ask clarifying questions if needed\n3️⃣ Add it to your task board\n\nWhat would you like to get done today?",
      type: 'info'
    }
  ])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [pendingConfirmation, setPendingConfirmation] = useState<TaskConfirmation>(null)
  const [kvConnected, setKvConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks/get')
      const data = await response.json()
      if (data.success && data.tasks) {
        setTasks(data.tasks)
        setKvConnected(true)
      }
    } catch {
      const saved = localStorage.getItem('maxmode-tasks-kanban')
      if (saved) setTasks(JSON.parse(saved))
    }
  }

  const saveTasks = async (newTasks: Task[]) => {
    setTasks(newTasks)
    try {
      await fetch('/api/tasks/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: newTasks })
      })
      setKvConnected(true)
    } catch (e) { console.error(e) }
    localStorage.setItem('maxmode-tasks-kanban', JSON.stringify(newTasks))
    window.dispatchEvent(new Event('maxmode-task-changed'))
  }

  // Parse task from natural language
  const parseTask = (text: string): Partial<Task> => {
    const lower = text.toLowerCase()
    
    // Parse category
    let category = 'General'
    const categoryKeywords: Record<string, string[]> = {
      'wedding': ['wedding', 'bride', 'groom', 'venue', 'vendor', 'marriage'],
      'business': ['quote', 'invoice', 'client', 'lead', 'sale', 'proposal', 'contract', 'business'],
      'marketing': ['email', 'social', 'post', 'ad', 'campaign', 'content', 'marketing'],
      'personal': ['personal', 'family', 'friend', 'birthday', 'kids', 'wife'],
    }
    
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(k => lower.includes(k))) {
        category = cat.charAt(0).toUpperCase() + cat.slice(1)
        break
      }
    }

    // Parse priority
    let priority: 'high' | 'medium' | 'low' = 'medium'
    if (lower.includes('urgent') || lower.includes('asap') || lower.includes('important') || lower.includes('!')) {
      priority = 'high'
    } else if (lower.includes('whenever') || lower.includes('sometime') || lower.includes('low priority')) {
      priority = 'low'
    }

    // Parse assignee
    let assignee: 'julius' | 'max' = 'julius'
    if (lower.includes('max') || lower.includes('you')) {
      assignee = 'max'
    }

    // Parse due date
    let dueDate: string | null = null
    const today = new Date()
    
    if (lower.includes('tomorrow')) {
      const d = new Date(today)
      d.setDate(d.getDate() + 1)
      dueDate = d.toISOString().split('T')[0]
    } else if (lower.includes('next week')) {
      const d = new Date(today)
      d.setDate(d.getDate() + 7)
      dueDate = d.toISOString().split('T')[0]
    } else if (lower.includes('today')) {
      dueDate = today.toISOString().split('T')[0]
    }

    // Clean text
    let cleanText = lower
      .replace(/tomorrow|today|next week|urgent|asap|important|whenever|sometime|max|you|julius|remember to |remind me to |i need to |i should |can you |task: /gi, '')
      .replace(/\s+/g, ' ')
      .trim()
    cleanText = cleanText.charAt(0).toUpperCase() + cleanText.slice(1)

    return {
      text: cleanText || text,
      category,
      priority,
      assignee,
      dueDate,
    }
  }

  const createTask = (taskData: Partial<Task>) => {
    const task: Task = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text: taskData.text || '',
      status: taskData.assignee === 'max' ? 'pending' : 'todo',
      assignee: taskData.assignee || 'julius',
      category: taskData.category || 'General',
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate || null,
      createdAt: new Date().toISOString(),
    }
    
    const newTasks = [task, ...tasks]
    saveTasks(newTasks)
    return task
  }

  const formatTaskConfirmation = (data: Partial<Task>) => {
    const parts = [`📝 **Task Summary**`]
    parts.push(`"${data.text}"`)
    
    if (data.priority === 'high') parts.push('🔴 Priority: High')
    else if (data.priority === 'low') parts.push('🟢 Priority: Low')
    else parts.push('🟡 Priority: Medium')
    
    if (data.dueDate) {
      const date = new Date(data.dueDate)
      const today = new Date()
      if (date.toDateString() === today.toDateString()) parts.push('📅 Due: Today')
      else if (date.toDateString() === new Date(today.setDate(today.getDate() + 1)).toDateString()) parts.push('📅 Due: Tomorrow')
      else parts.push(`📅 Due: ${date.toLocaleDateString()}`)
    }
    
    parts.push(`📁 Category: ${data.category}`)
    parts.push(`👤 Assignee: ${data.assignee === 'max' ? '🤖 Max' : '👤 Julius'}`)
    
    return parts.join('\n')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isProcessing) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsProcessing(true)

    await new Promise(resolve => setTimeout(resolve, 600))

    const lower = userMessage.toLowerCase()

    // Check if we're waiting for confirmation
    if (pendingConfirmation) {
      if (lower.includes('yes') || lower.includes('yeah') || lower.includes('yep') || lower.includes('sure') || lower.includes('go') || lower.includes('do it')) {
        // User confirmed - create the task
        const newTask = createTask(pendingConfirmation)
        setPendingConfirmation(null)
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `✅ Task created successfully!\n\n"${newTask.text}" has been added to your board.\n\nAnything else I can help with?`,
          type: 'task_update'
        }])
      } else if (lower.includes('no') || lower.includes('nope') || lower.includes('cancel') || lower.includes('nevermind')) {
        setPendingConfirmation(null)
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "No problem! Task cancelled.\n\nWhat else would you like to do?",
          type: 'info'
        }])
      } else if (lower.includes('change') || lower.includes('modify') || lower.includes('edit')) {
        // User wants to modify the task
        const updatedData = { ...pendingConfirmation }
        
        if (lower.includes('high priority') || lower.includes('urgent')) updatedData.priority = 'high'
        else if (lower.includes('low priority')) updatedData.priority = 'low'
        else if (lower.includes('medium priority')) updatedData.priority = 'medium'
        
        if (lower.includes('tomorrow')) {
          const d = new Date()
          d.setDate(d.getDate() + 1)
          updatedData.dueDate = d.toISOString().split('T')[0]
        }
        
        setPendingConfirmation(updatedData)
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Updated! Here's the new task:\n\n${formatTaskConfirmation(updatedData)}\n\nSay "yes" to confirm or "change" to modify.`,
          type: 'task_confirmation',
          taskData: updatedData
        }])
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "Please say \"yes\" to confirm or \"no\" to cancel.",
          type: 'info'
        }])
      }
    } else {
      // New task request
      const taskData = parseTask(userMessage)
      
      if (taskData.text && taskData.text.length > 2) {
        setPendingConfirmation(taskData as TaskConfirmation)
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `I've analyzed your request. Here's what I understood:\n\n${formatTaskConfirmation(taskData)}\n\nDoes this look correct? Say "yes" to create or "no" to cancel.`,
          type: 'task_confirmation',
          taskData: taskData
        }])
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "I'm not sure what you mean. Could you describe the task more clearly?\n\nTry: \"Follow up with the bride tomorrow\" or \"Send quote to client urgent\"",
          type: 'info'
        }])
      }
    }

    setIsProcessing(false)
  }

  const getColumnTasks = (status: string) => tasks.filter(t => t.status === status)
  const moveTask = (id: string, newStatus: Task['status']) => saveTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t))
  const deleteTask = (id: string) => saveTasks(tasks.filter(t => t.id !== id))

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'high': return '🔴 High'
      case 'medium': return '🟡 Medium'
      case 'low': return '🟢 Low'
      default: return p
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const today = new Date()
    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === new Date(today.setDate(today.getDate() + 1)).toDateString()) return 'Tomorrow'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="p-4 md:p-6 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Tasks</h1>
        <p className="text-[var(--color-text-muted)]">
          {tasks.length} tasks • {kvConnected ? '☁️ Synced' : '📱 Local'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {COLUMNS.map(col => (
          <div key={col.id} className={`bg-[var(--color-surface)] rounded-xl px-4 py-3 border-t-2 ${col.color}`}>
            <p className="text-2xl font-bold text-white">{getColumnTasks(col.id).length}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{col.icon} {col.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Panel */}
        <div className="lg:col-span-2">
          <div className="card flex flex-col h-[600px]">
            {/* Chat Header */}
            <div className="bg-[var(--color-surface)] px-5 py-4 border-b border-[var(--color-border-subtle)] rounded-t-xl">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <span className="text-xl">💬</span>
                Chat with Max
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Describe tasks naturally, I'll handle the rest
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-[var(--color-text-muted)]">
                  <p className="text-lg">👋 Welcome!</p>
                  <p className="text-sm mt-2">Describe a task and I'll create it for you.</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                      msg.role === 'user' 
                        ? 'bg-[var(--color-primary)] text-white rounded-tr-sm' 
                        : msg.type === 'task_confirmation'
                        ? 'bg-[var(--color-surface)] border border-[var(--color-primary)] text-white rounded-tl-sm'
                        : 'bg-[var(--color-surface)] text-white rounded-tl-sm'
                    }`}>
                      {msg.type === 'task_confirmation' && (
                        <div className="mb-3 pb-3 border-b border-[var(--color-border-subtle)]">
                          <p className="text-xs text-[var(--color-text-muted)] mb-2">📝 Task to create:</p>
                          {msg.taskData && (
                            <div className="space-y-1 text-sm">
                              <p className="font-medium">{msg.taskData.text}</p>
                              <p className="text-xs opacity-80">
                                {msg.taskData.priority && getPriorityBadge(msg.taskData.priority)} • {msg.taskData.category}
                                {msg.taskData.dueDate && ` • ${formatDate(msg.taskData.dueDate)}`}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      <p className="whitespace-pre-line text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-[var(--color-surface)] rounded-2xl rounded-tl-sm px-5 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-[var(--color-text-muted)] rounded-full animate-bounce"/>
                      <span className="w-2 h-2 bg-[var(--color-text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}/>
                      <span className="w-2 h-2 bg-[var(--color-text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}/>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-[var(--color-border-subtle)] flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={pendingConfirmation ? '"yes" to confirm, "no" to cancel...' : 'Describe a task...'}
                className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-3 text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)]"
              />
              <button
                type="submit"
                disabled={isProcessing || !input.trim()}
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                →
              </button>
            </form>
          </div>
        </div>

        {/* Task Board */}
        <div className="lg:col-span-1">
          <div className="card h-[600px] flex flex-col">
            <div className="bg-[var(--color-surface)] px-5 py-4 border-b border-[var(--color-border-subtle)] rounded-t-xl">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <span className="text-xl">📋</span>
                Task Board
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {getColumnTasks('todo').length === 0 && getColumnTasks('inprogress').length === 0 && getColumnTasks('done').length === 0 ? (
                <div className="text-center py-8 text-[var(--color-text-muted)]">
                  <p className="text-sm">No tasks yet</p>
                  <p className="text-xs mt-1">Create one in the chat!</p>
                </div>
              ) : (
                <>
                  {/* To Do */}
                  {getColumnTasks('todo').map(task => (
                    <div key={task.id} className="bg-[var(--color-bg)] rounded-lg p-4 border border-[var(--color-border-subtle)]">
                      <p className="text-white font-medium mb-2">{task.text}</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded ${
                          task.priority === 'high' ? 'priority-high' :
                          task.priority === 'low' ? 'priority-low' : 'priority-medium'
                        }`}>
                          {task.priority}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[var(--color-surface)] text-[var(--color-text-muted)]">
                          {task.category}
                        </span>
                        {task.dueDate && (
                          <span className="px-2 py-0.5 rounded bg-[var(--color-surface)] text-[var(--color-text-muted)]">
                            {formatDate(task.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* In Progress */}
                  {getColumnTasks('inprogress').map(task => (
                    <div key={task.id} className="bg-[var(--color-bg)] rounded-lg p-4 border border-[#60A5FA]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[#60A5FA]">🔄</span>
                        <p className="text-white font-medium">{task.text}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded bg-[#60A5FA]/20 text-[#60A5FA]">In Progress</span>
                      </div>
                    </div>
                  ))}
                  
                  {/* Done */}
                  {getColumnTasks('done').slice(0, 5).map(task => (
                    <div key={task.id} className="bg-[var(--color-bg)] rounded-lg p-4 border border-[#22C55E]/30 opacity-75">
                      <p className="text-white line-through decoration-[#22C55E]">{task.text}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
