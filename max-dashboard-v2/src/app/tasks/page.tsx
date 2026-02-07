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
  taskId?: string
  task?: Task
}

const COLUMNS = [
  { id: 'pending', label: 'Awaiting Max', color: 'border-[#fa5252]', icon: '⏳' },
  { id: 'todo', label: 'To Do', color: 'border-[#fab005]', icon: '📋' },
  { id: 'inprogress', label: 'In Progress', color: 'border-[#5c7cfa]', icon: '🔄' },
  { id: 'done', label: 'Done', color: 'border-[#40c057]', icon: '✅' },
] as const

const ASSIGNEES = [
  { id: 'julius', label: 'Julius', emoji: '👤' },
  { id: 'max', label: 'Max', emoji: '🤖' },
] as const

const TASK_CHANGED = 'maxmode-task-changed'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'assistant', 
      content: 'Hi! I\'m Max. When you assign tasks to me, I\'ll: \n\n1️⃣ Review the task\n2️⃣ Ask clarifying questions if needed\n3️⃣ Wait for your confirmation\n4️⃣ Get to work!\n\nTry assigning a task to me!'
    }
  ])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showChat, setShowChat] = useState(true)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

  // Parse task from natural language
  const parseTask = (text: string): Partial<Task> | null => {
    const lower = text.toLowerCase()
    let category = 'General'
    const categoryKeywords: Record<string, string[]> = {
      'wedding': ['wedding', 'bride', 'groom', 'venue', 'vendor', 'marriage'],
      'business': ['quote', 'invoice', 'client', 'lead', 'sale', 'proposal', 'contract'],
      'marketing': ['email', 'social', 'post', 'ad', 'campaign', 'content'],
      'personal': ['personal', 'family', 'friend', 'birthday'],
    }
    
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(k => lower.includes(k))) {
        category = cat.charAt(0).toUpperCase() + cat.slice(1)
        break
      }
    }

    let priority: 'high' | 'medium' | 'low' = 'medium'
    if (lower.includes('urgent') || lower.includes('asap') || lower.includes('important') || lower.includes('!')) {
      priority = 'high'
    } else if (lower.includes('whenever') || lower.includes('sometime')) {
      priority = 'low'
    }

    let assignee: 'julius' | 'max' = 'julius'
    if (lower.includes('max') || lower.includes('you')) {
      assignee = 'max'
    }

    let dueDate: string | null = null
    const today = new Date()
    
    if (lower.includes('tomorrow')) {
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      dueDate = tomorrow.toISOString().split('T')[0]
    } else if (lower.includes('next week')) {
      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)
      dueDate = nextWeek.toISOString().split('T')[0]
    } else if (lower.includes('today')) {
      dueDate = today.toISOString().split('T')[0]
    }

    let cleanText = lower
      .replace(/tomorrow/g, '')
      .replace(/today/g, '')
      .replace(/next week/g, '')
      .replace(/urgent/g, '')
      .replace(/asap/g, '')
      .replace(/important/g, '')
      .replace(/whenever/g, '')
      .replace(/max/g, '')
      .replace(/you/g, '')
      .replace(/julius/g, '')
      .replace(/remember to /g, '')
      .replace(/remind me to /g, '')
      .replace(/i need to /g, '')
      .replace(/i should /g, '')
      .replace(/can you /g, '')
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
      id: Date.now().toString(),
      text: taskData.text || '',
      status: taskData.assignee === 'max' ? 'pending' : 'todo',
      assignee: taskData.assignee || 'julius',
      category: taskData.category || 'General',
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate || null,
      createdAt: new Date().toISOString(),
    }
    saveTasks([task, ...tasks])
    return task
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isProcessing) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsProcessing(true)

    await new Promise(resolve => setTimeout(resolve, 600))

    // Check if this is a Max task interaction
    const pendingMaxTask = tasks.find(t => t.assignee === 'max' && t.status === 'pending')
    
    if (pendingMaxTask) {
      // Max is asking a question or waiting for confirmation
      const lower = userMessage.toLowerCase()
      
      if (lower.includes('go') || lower.includes('yes') || lower.includes('do it') || lower.includes('proceed') || lower.includes('confirmed')) {
        // User confirms - start the task
        saveTasks(tasks.map(t => 
          t.id === pendingMaxTask.id ? { ...t, status: 'todo' } : t
        ))
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '👍 Got it! Starting work on this task now. I\'ll let you know when it\'s done.',
          taskId: pendingMaxTask.id
        }])
        setActiveTaskId(pendingMaxTask.id)
      } else if (lower.includes('cancel') || lower.includes('nevermind') || lower.includes('dont') || lower.includes('stop')) {
        // User cancels
        saveTasks(tasks.filter(t => t.id !== pendingMaxTask.id))
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'No problem! Task cancelled.'
        }])
      } else {
        // Max is asking a question
        saveTasks(tasks.map(t => 
          t.id === pendingMaxTask.id ? { ...t, maxNotes: (t.maxNotes || '') + '\n' + userMessage } : t
        ))
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Got it. Before I start, I have a question: What would you like me to do with this task? Say "go" to proceed or "cancel" to skip.',
          taskId: pendingMaxTask.id
        }])
      }
    } else {
      // Creating a new task
      const taskData = parseTask(userMessage)
      
      if (taskData && taskData.text) {
        const newTask = createTask(taskData)
        
        if (newTask.assignee === 'max') {
          // Max was assigned - acknowledge
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `📋 I've noted the task: "${newTask.text}"\n\n${newTask.priority === 'high' ? '⚡ Priority: High\n' : ''}${newTask.dueDate ? `📅 Due: ${newTask.dueDate}\n` : ''}Category: ${newTask.category}\n\nI have a question before I start: Should I proceed with this task now, or would you like to provide more details?`,
            task: newTask
          }])
        } else {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `Created task for Julius: "${newTask.text}"`,
            task: newTask
          }])
        }
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'I didn\'t understand. Try: "Follow up with bride tomorrow" or "Send quote to client"'
        }])
      }
    }

    setIsProcessing(false)
  }

  const markComplete = (taskId: string) => {
    saveTasks(tasks.map(t => 
      t.id === taskId ? { ...t, status: 'done' } : t
    ))
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '✅ Task completed!'
    }])
    setActiveTaskId(null)
  }

  const getColumnTasks = (status: string) => tasks.filter(t => t.status === status)

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
      default: return 'bg-[#2a2a2e] text-[#9a9a9e]'
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

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Tasks</h1>
          <p className="text-[#9a9a9e]">AI Assistant + Workflow</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowChat(!showChat)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showChat ? 'bg-[#5c7cfa] text-white' : 'bg-[#2a2a2e] text-[#9a9a9e]'
            }`}
          >
            {showChat ? '📋 Board' : '💬 Chat'}
          </button>
        </div>
      </div>

      {showChat ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-4 flex flex-col h-[600px]">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-lg p-3 ${
                    msg.role === 'user' ? 'bg-[#5c7cfa] text-white' : 'bg-[#2a2a2e] text-white'
                  }`}>
                    <p className="whitespace-pre-line text-sm">{msg.content}</p>
                    {msg.task && msg.task.assignee === 'max' && (
                      <div className="mt-2 pt-2 border-t border-[#3a3a3e]">
                        <p className="text-xs opacity-70">Assigned to Max</p>
                        <p className="font-medium">{msg.task.text}</p>
                        {msg.task.status === 'pending' && (
                          <p className="text-xs text-[#fab005] mt-1">⏳ Awaiting confirmation</p>
                        )}
                        {msg.task.status === 'inprogress' && (
                          <p className="text-xs text-[#5c7cfa] mt-1">🔄 In progress...</p>
                        )}
                      </div>
                    )}
                    {msg.taskId && msg.role === 'assistant' && msg.content.includes('completed') && (
                      <div className="mt-2">
                        <button
                          onClick={() => markComplete(msg.taskId!)}
                          className="w-full bg-[#40c057] hover:bg-[#37b24d] text-white py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Mark Complete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-[#2a2a2e] rounded-lg p-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-[#9a9a9e] rounded-full animate-bounce"/>
                      <span className="w-2 h-2 bg-[#9a9a9e] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}/>
                      <span className="w-2 h-2 bg-[#9a9a9e] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}/>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={tasks.find(t => t.assignee === 'max' && t.status === 'pending') ? 'Say "go" or ask a question...' : 'Describe a task...'}
                className="flex-1 bg-[#0d0d0f] border border-[#2a2a2e] rounded-lg px-4 py-3 text-white placeholder-[#9a9a9e] focus:outline-none focus:border-[#5c7cfa]"
              />
              <button
                type="submit"
                disabled={isProcessing || !input.trim()}
                className="bg-[#5c7cfa] hover:bg-[#4c6ef5] disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                →
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {COLUMNS.map(col => (
                <div key={col.id} className={`bg-[#161618] rounded-lg px-4 py-3 border-t-2 ${col.color}`}>
                  <p className="text-2xl font-bold text-white">{getColumnTasks(col.id).length}</p>
                  <p className="text-xs text-[#9a9a9e]">{col.icon} {col.label}</p>
                </div>
              ))}
            </div>

            {tasks.some(t => t.assignee === 'max') && (
              <div className="card p-4">
                <h3 className="text-sm font-medium text-[#fab005] mb-3">🤖 Max&apos;s Pending Tasks</h3>
                <div className="space-y-2">
                  {tasks.filter(t => t.assignee === 'max').map(task => (
                    <div key={task.id} className="bg-[#0d0d0f] rounded-lg p-3">
                      <p className="text-white text-sm">{task.text}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                        {task.dueDate && <span className="text-xs px-2 py-0.5 rounded bg-[#2a2a2e]">{formatDate(task.dueDate)}</span>}
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          task.status === 'pending' ? 'bg-[#fab005]/20 text-[#fab005]' : 
                          task.status === 'inprogress' ? 'bg-[#5c7cfa]/20 text-[#5c7cfa]' :
                          task.status === 'done' ? 'bg-[#40c057]/20 text-[#40c057]' :
                          'bg-[#2a2a2e] text-[#9a9a9e]'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="card p-4">
              <h3 className="text-sm font-medium text-[#9a9a9e] mb-3">Try saying:</h3>
              <div className="space-y-2 text-sm">
                <p className="text-white bg-[#0d0d0f] px-3 py-2 rounded">"Max, research wedding venues next week"</p>
                <p className="text-white bg-[#0d0d0f] px-3 py-2 rounded">"Send quote to client urgent"</p>
                <p className="text-white bg-[#0d0d0f] px-3 py-2 rounded">"Follow up with bride tomorrow"</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map(column => (
            <div key={column.id} className="flex flex-col">
              <div className={`bg-[#161618] rounded-t-lg px-4 py-3 border-t-2 ${column.color}`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">{column.icon} {column.label}</span>
                  <span className="text-xs text-[#9a9a9e] bg-[#0d0d0f] px-2 py-0.5 rounded-full">
                    {getColumnTasks(column.id).length}
                  </span>
                </div>
              </div>
              
              <div className="bg-[#161618]/50 rounded-b-lg p-2 flex-1 min-h-[200px] space-y-2">
                {getColumnTasks(column.id).map(task => (
                  <div key={task.id} className="card p-3">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-white flex-1">{task.text}</p>
                      {task.assignee === 'max' && <span className="text-sm ml-2">🤖</span>}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-[#2a2a2e]">{task.category}</span>
                      <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                      {task.dueDate && <span className="text-xs px-2 py-0.5 rounded bg-[#2a2a2e]">{formatDate(task.dueDate)}</span>}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {column.id !== 'pending' && column.id !== 'todo' && column.id !== 'inprogress' && column.id !== 'done' && (
                          <></>
                        )}
                        {column.id === 'pending' && (
                          <span className="text-xs text-[#fab005]">⏳ Awaiting Max</span>
                        )}
                        {column.id === 'todo' && task.assignee === 'max' && (
                          <button onClick={() => moveTask(task.id, 'inprogress')} className="text-xs px-2 py-0.5 rounded bg-[#5c7cfa]/20 text-[#5c7cfa]">→ Start</button>
                        )}
                        {column.id === 'inprogress' && task.assignee === 'max' && (
                          <button onClick={() => moveTask(task.id, 'done')} className="text-xs px-2 py-0.5 rounded bg-[#40c057]/20 text-[#40c057]">→ Done</button>
                        )}
                      </div>
                      <button onClick={() => deleteTask(task.id)} className="p-1 text-[#9a9a9e] hover:text-[#fa5252]">×</button>
                    </div>
                  </div>
                ))}
                {getColumnTasks(column.id).length === 0 && (
                  <div className="text-center py-8 text-[#9a9a9e] text-sm">No tasks</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
