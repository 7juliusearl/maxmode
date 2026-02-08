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
          const saved = localStorage.getItem('maxmode-tasks-kanban')
          if (saved) {
            const tasks: Task[] = JSON.parse(saved)
            setTaskCount(tasks.filter(t => t.status !== 'done').length)
            setCompletedCount(tasks.filter(t => t.status === 'done').length)
          }
        }
      } catch (error) {
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
    const interval = setInterval(loadTaskStats, 10000)
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
      value: isLoading ? '...' : taskCount, 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      color: 'var(--color-primary)',
      bg: 'rgba(14, 165, 233, 0.15)',
      href: '/tasks'
    },
    { 
      label: 'Done', 
      value: isLoading ? '...' : completedCount, 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'var(--color-success)',
      bg: 'rgba(34, 197, 94, 0.15)',
      href: '/tasks'
    },
    { 
      label: 'Research', 
      value: '-', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      color: 'var(--color-warning)',
      bg: 'rgba(251, 191, 36, 0.15)',
      href: '/research'
    },
    { 
      label: 'Weddings', 
      value: '-', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      color: '#F472B6',
      bg: 'rgba(244, 114, 182, 0.15)',
      href: '#'
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href}
          className="card p-5 hover:border-[var(--color-primary)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-primary)]/10 cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ background: item.bg, color: item.color }}
            >
              {item.icon}
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{item.value}</p>
              <p className="text-sm text-[var(--color-text-muted)]">{item.label}</p>
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}
