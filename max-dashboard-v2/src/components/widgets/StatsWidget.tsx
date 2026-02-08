'use client'

import { useState, useEffect } from 'react'

interface Task {
  id: string
  text: string
  status: string
  assignee: string
  category: string
  priority: string
  dueDate: string | null
  createdAt: string
}

export function StatsWidget() {
  const [taskCount, setTaskCount] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTaskStats = async () => {
      setIsLoading(true)
      
      try {
        const response = await fetch('/api/tasks/get')
        const data = await response.json()
        
        if (data.success && data.tasks) {
          const tasks: Task[] = data.tasks
          setTaskCount(tasks.filter(t => t.status !== 'done').length)
          setCompletedCount(tasks.filter(t => t.status === 'done').length)
        } else {
          // Fallback to localStorage
          const saved = localStorage.getItem('maxmode-tasks-kanban')
          if (saved) {
            const tasks: Task[] = JSON.parse(saved)
            setTaskCount(tasks.filter(t => t.status !== 'done').length)
            setCompletedCount(tasks.filter(t => t.status === 'done').length)
          } else {
            setTaskCount(0)
            setCompletedCount(0)
          }
        }
      } catch (error) {
        // Fallback to localStorage
        const saved = localStorage.getItem('maxmode-tasks-kanban')
        if (saved) {
          const tasks: Task[] = JSON.parse(saved)
          setTaskCount(tasks.filter(t => t.status !== 'done').length)
          setCompletedCount(tasks.filter(t => t.status === 'done').length)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadTaskStats()
    
    // Poll for updates every 10 seconds
    const interval = setInterval(loadTaskStats, 10000)
    
    // Listen for task changes from other tabs
    const handleChange = () => loadTaskStats()
    window.addEventListener('maxmode-task-changed', handleChange)
    window.addEventListener('storage', handleChange)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('maxmode-task-changed', handleChange)
      window.removeEventListener('storage', handleChange)
    }
  }, [])

  const items = [
    { 
      label: 'Tasks', 
      value: isLoading ? '-' : taskCount, 
      icon: '📋', 
      color: 'text-[#5c7cfa]', 
      bg: 'bg-[#5c7cfa]/20',
      href: '/tasks'
    },
    { 
      label: 'Done', 
      value: isLoading ? '-' : completedCount, 
      icon: '✅', 
      color: 'text-[#40c057]', 
      bg: 'bg-[#40c057]/20',
      href: '/tasks'
    },
    { 
      label: 'Research', 
      value: '-', 
      icon: '🔍', 
      color: 'text-[#fab005]', 
      bg: 'bg-[#fab005]/20',
      href: '/research'
    },
    { 
      label: 'Weddings', 
      value: '-', 
      icon: '💒', 
      color: 'text-[#fa5252]', 
      bg: 'bg-[#fa5252]/20',
      href: '#'
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href}
          className="card p-4 hover:border-[#5c7cfa] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center text-lg`}>
              {item.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{item.value}</p>
              <p className="text-xs text-[#9a9a9e]">{item.label}</p>
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}
