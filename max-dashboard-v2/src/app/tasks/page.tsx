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

const TELEGRAM_CHAT_ID = '8199918956'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [kvConnected, setKvConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLInputElement>(null)

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

  const sendTelegramNotification = async (task: Task) => {
    const priorityEmoji = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'
    const dueText = task.dueDate ? `\n📅 Due: ${task.dueDate}` : ''
    const text = `🤖 *New Task for Max*\n\n"${task.text}"\n\n${priorityEmoji} Priority: ${task.priority}${dueText}\n📁 Category: ${task.category}\n\nClick ▶️ to start!`
    
    try {
      await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: TELEGRAM_CHAT_ID, text, tasks: [task] })
      })
    } catch (e) { console.error('Telegram error:', e) }
  }

  const parseTask = (text: string): Partial<Task> | null => {
    const lower = text.toLowerCase()
    let category = 'General'
    const categoryKeywords: Record<string, string[]> = {
      'wedding': ['wedding', 'bride', 'groom', 'venue', 'vendor'],
      'business': ['quote', 'invoice', 'client', 'lead', 'sale', 'proposal'],
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
    if (lower.includes('urgent') || lower.includes('asap') || lower.includes('important')) priority = 'high'
    else if (lower.includes('whenever') || lower.includes('sometime')) priority = 'low'

    let assignee: 'julius' | 'max' = 'julius'
    if (lower.includes('max') || lower.includes('you')) assignee = 'max'

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

    let cleanText = lower
      .replace(/tomorrow|today|next week|urgent|asap|important|whenever|sometime|max|you|julius|remember to |remind me to |i need to |i should |can you /g, '')
      .replace(/\s+/g, ' ')
      .trim()
    cleanText = cleanText.charAt(0).toUpperCase() + cleanText.slice(1)

    return { text: cleanText || text, category, priority, assignee, dueDate }
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
    if (task.assignee === 'max') sendTelegramNotification(task)
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

    const pendingMaxTask = tasks.find(t => t.assignee === 'max' && t.status === 'pending')
    const lower = userMessage.toLowerCase()

    if (pendingMaxTask) {
      if (lower.includes('go') || lower.includes('yes') || lower.includes('proceed') || lower.includes('confirmed')) {
        saveTasks(tasks.map(t => t.id === pendingMaxTask.id ? { ...t, status: 'todo' as const } : t))
        setMessages(prev => [...prev, { role: 'assistant', content: '👍 Got it! Starting work now.', taskId: pendingMaxTask.id }])
      } else if (lower.includes('cancel') || lower.includes('nevermind') || lower.includes('dont') || lower.includes('stop')) {
        saveTasks(tasks.filter(t => t.id !== pendingMaxTask.id))
        setMessages(prev => [...prev, { role: 'assistant', content: 'No problem! Task cancelled.' }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Say "go" to proceed or "cancel" to skip.', taskId: pendingMaxTask.id }])
      }
    } else {
      const taskData = parseTask(userMessage)
      if (taskData && taskData.text) {
        const newTask = createTask(taskData)
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: taskData.assignee === 'max' 
            ? `📋 Task sent to your Telegram!`
            : `Created: "${newTask.text}"`,
          task: newTask 
        }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Try: "Follow up with bride tomorrow"' }])
      }
    }
    setIsProcessing(false)
  }

  const getColumnTasks = (status: string) => tasks.filter(t => t.status === status)
  const moveTask = (id: string, newStatus: Task['status']) => saveTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t))
  const deleteTask = (id: string) => saveTasks(tasks.filter(t => t.id !== id))

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'bg-[#fa5252]/20 text-[#fa5252]'
      case 'medium': return 'bg-[#fab005]/20 text-[#fab005]'
      case 'low': return 'bg-[#40c057]/20 text-[#40c057]'
      default: return 'bg-[#2a2a2e] text-[#9a9a9e]'
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

  const pendingMaxTasks = tasks.filter(t => t.assignee === 'max' && t.status === 'pending')
  const inprogressMaxTasks = tasks.filter(t => t.assignee === 'max' && t.status === 'inprogress')

  return (
    <div className="p-4 md:p-6 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Tasks</h1>
        <p className="text-[#9a9a9e]">{tasks.length} total • {kvConnected ? '☁️ Synced' : '📱 Local'}</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {COLUMNS.map(col => (
          <div key={col.id} className={`bg-[#161618] rounded-lg px-3 py-2 border-t-2 ${col.color}`}>
            <p className="text-xl font-bold text-white">{getColumnTasks(col.id).length}</p>
            <p className="text-xs text-[#9a9a9e] truncate">{col.icon} {col.label}</p>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map(column => (
          <div key={column.id} className="flex flex-col">
            <div className={`bg-[#161618] rounded-t-lg px-4 py-3 border-t-2 ${column.color}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">{column.icon} {column.label}</span>
                <span className="text-xs bg-[#0d0d0f] px-2 py-0.5 rounded-full">{getColumnTasks(column.id).length}</span>
              </div>
            </div>
            <div className="bg-[#161618]/50 rounded-b-lg p-2 flex-1 min-h-[300px] space-y-2">
              {getColumnTasks(column.id).map(task => (
                <div key={task.id} className="card p-3">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-white flex-1">{task.text}</p>
                    {task.assignee === 'max' && <span className="ml-2">🤖</span>}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-[#2a2a2e]">{task.category}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                    {task.dueDate && <span className="text-xs px-2 py-0.5 rounded bg-[#2a2a2e]">{formatDate(task.dueDate)}</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    {task.assignee === 'max' && column.id === 'todo' && (
                      <button onClick={() => moveTask(task.id, 'inprogress')} className="text-xs px-3 py-1 rounded bg-[#5c7cfa]/20 text-[#5c7cfa]">▶️ Start</button>
                    )}
                    {task.assignee === 'max' && column.id === 'inprogress' && (
                      <button onClick={() => moveTask(task.id, 'done')} className="text-xs px-3 py-1 rounded bg-[#40c057]/20 text-[#40c057]">✅ Done</button>
                    )}
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

      {/* Floating Chat Button */}
      <button
        onClick={() => { setShowChat(true); setTimeout(() => chatInputRef.current?.focus(), 100) }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#5c7cfa] hover:bg-[#4c6ef5] rounded-full shadow-lg flex items-center justify-center text-2xl transition-all hover:scale-110 z-50"
      >
        💬
      </button>

      {/* Chat Overlay */}
      {showChat && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-[#0d0d0f] w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-in">
            {/* Chat Header */}
            <div className="bg-[#161618] px-4 py-3 border-b border-[#2a2a2e] flex items-center justify-between">
              <div>
                <h2 className="font-bold text-white">💬 Chat with Max</h2>
                <p className="text-xs text-[#9a9a9e]">Describe a task or ask questions</p>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="p-2 hover:bg-[#2a2a2e] rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Max Tasks Section */}
            {(pendingMaxTasks.length > 0 || inprogressMaxTasks.length > 0) && (
              <div className="bg-[#161618]/50 px-4 py-3 border-b border-[#2a2a2e] space-y-3">
                {pendingMaxTasks.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-[#fab005] mb-2">⏳ Awaiting Max</h3>
                    {pendingMaxTasks.map(task => (
                      <div key={task.id} className="bg-[#0d0d0f] rounded-lg p-3 mb-2">
                        <p className="text-white text-sm">{task.text}</p>
                        <div className="flex gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                          {task.dueDate && <span className="text-xs px-2 py-0.5 rounded bg-[#2a2a2e]">{formatDate(task.dueDate)}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {inprogressMaxTasks.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-[#5c7cfa] mb-2">🔄 Working On</h3>
                    {inprogressMaxTasks.map(task => (
                      <div key={task.id} className="bg-[#0d0d0f] rounded-lg p-3">
                        <p className="text-white text-sm">{task.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-[#9a9a9e]">
                  <p className="text-lg mb-2">💬 Chat with Max</p>
                  <p className="text-sm">Describe a task naturally!</p>
                  <p className="text-xs mt-4 opacity-50">Try: &quot;Follow up with bride tomorrow&quot;</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-lg p-3 ${
                      msg.role === 'user' ? 'bg-[#5c7cfa] text-white' : 'bg-[#2a2a2e] text-white'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
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

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-[#2a2a2e] flex gap-2">
              <input
                ref={chatInputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-[#161618] border border-[#2a2a2e] rounded-lg px-4 py-3 text-white placeholder-[#9a9a9e] focus:outline-none focus:border-[#5c7cfa]"
              />
              <button
                type="submit"
                disabled={isProcessing || !input.trim()}
                className="bg-[#5c7cfa] hover:bg-[#4c6ef5] disabled:opacity-50 text-white px-6 rounded-lg transition-colors"
              >
                →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CSS for slide animation */}
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
