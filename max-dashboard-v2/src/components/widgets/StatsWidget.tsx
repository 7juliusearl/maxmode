'use client'

import { useState, useEffect } from 'react'

interface Task {
  id: string
  text: string
  completed: boolean
  category: string
  createdAt: string
}

export function StatsWidget() {
  const [taskCount, setTaskCount] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)

  useEffect(() => {
    // Load task stats from localStorage
    const loadTaskStats = () => {
      const saved = localStorage.getItem('maxmode-tasks')
      if (saved) {
        const tasks: Task[] = JSON.parse(saved)
        setTaskCount(tasks.filter(t => !t.completed).length)
        setCompletedCount(tasks.filter(t => t.completed).length)
      } else {
        setTaskCount(0)
        setCompletedCount(0)
      }
    }

    // Load on mount
    loadTaskStats()

    // Listen for storage changes (when tasks page updates)
    window.addEventListener('storage', loadTaskStats)
    
    // Also poll for changes (for same-tab updates)
    const interval = setInterval(loadTaskStats, 1000)

    return () => {
      window.removeEventListener('storage', loadTaskStats)
      clearInterval(interval)
    }
  }, [])

  const items = [
    { label: 'Tasks', value: taskCount, icon: '📋', color: 'text-[#5c7cfa]', bg: 'bg-[#5c7cfa]/20' },
    { label: 'Done', value: completedCount, icon: '✅', color: 'text-[#40c057]', bg: 'bg-[#40c057]/20' },
    { label: 'Research', value: 0, icon: '🔍', color: 'text-[#fab005]', bg: 'bg-[#fab005]/20' },
    { label: 'Weddings', value: 0, icon: '💒', color: 'text-[#fa5252]', bg: 'bg-[#fa5252]/20' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {items.map((item) => (
        <div 
          key={item.label}
          className="card p-4 hover:border-[#2a2a2e] transition-colors cursor-pointer"
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
        </div>
      ))}
    </div>
  )
}
