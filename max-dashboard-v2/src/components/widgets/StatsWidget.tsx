'use client'

import { useState, useEffect } from 'react'

interface Stats {
  tasksPending: number
  tasksCompleted: number
  researchCount: number
  weddingsThisMonth: number
}

export function StatsWidget() {
  const [stats, setStats] = useState<Stats>({
    tasksPending: 0,
    tasksCompleted: 0,
    researchCount: 0,
    weddingsThisMonth: 0,
  })

  useEffect(() => {
    // Fetch from localStorage or API
    const saved = localStorage.getItem('maxmode-stats')
    if (saved) {
      setStats(JSON.parse(saved))
    }
  }, [])

  const items = [
    { label: 'Tasks', value: stats.tasksPending, icon: '📋', color: 'text-[#5c7cfa]', bg: 'bg-[#5c7cfa]/20' },
    { label: 'Done', value: stats.tasksCompleted, icon: '✅', color: 'text-[#40c057]', bg: 'bg-[#40c057]/20' },
    { label: 'Research', value: stats.researchCount, icon: '🔍', color: 'text-[#fab005]', bg: 'bg-[#fab005]/20' },
    { label: 'Weddings', value: stats.weddingsThisMonth, icon: '💒', color: 'text-[#fa5252]', bg: 'bg-[#fa5252]/20' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {items.map((item) => (
        <div 
          key={item.label}
          className="card p-4 hover:border-[#2a2a2e] transition-colors cursor-pointer"
          onClick={() => {
            // Navigate to respective section
          }}
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
