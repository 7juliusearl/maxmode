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

export function StatsWidget() {
  const [taskCount, setTaskCount] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)

  useEffect(() => {
    const loadTaskStats = () => {
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

    loadTaskStats()

    const interval = setInterval(loadTaskStats, 1000)
    window.addEventListener('storage', loadTaskStats)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', loadTaskStats)
    }
  }, [])

  const items = [
    { 
      label: 'Tasks', 
      value: taskCount, 
      icon: '📋', 
      color: 'text-[#5c7cfa]', 
      bg: 'bg-[#5c7cfa]/20',
      href: '/tasks'
    },
    { 
      label: 'Done', 
      value: completedCount, 
      icon: '✅', 
      color: 'text-[#40c057]', 
      bg: 'bg-[#40c057]/20',
      href: '/tasks'
    },
    { 
      label: 'Research', 
      value: 0, 
      icon: '🔍', 
      color: 'text-[#fab005]', 
      bg: 'bg-[#fab005]/20',
      href: '/research'
    },
    { 
      label: 'Weddings', 
      value: 0, 
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
