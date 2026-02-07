'use client'

import { useState } from 'react'

interface QuickAction {
  id: string
  label: string
  icon: string
  url: string
  color: string
}

export function QuickActionsWidget() {
  const [actions] = useState<QuickAction[]>([
    { id: 'ghl', label: 'GoHighLevel', icon: '💬', url: 'https://app.gohighlevel.com/', color: 'bg-[#fa5252]/20' },
    { id: 'gmail', label: 'Gmail', icon: '📧', url: 'https://mail.google.com', color: 'bg-[#40c057]/20' },
    { id: 'calendar', label: 'Calendar', icon: '📅', url: 'https://calendar.google.com', color: 'bg-[#5c7cfa]/20' },
    { id: 'research', label: 'Research', icon: '🔬', url: '/research', color: 'bg-[#099268]/20' },
  ])

  return (
    <div className="card p-4">
      <h3 className="text-sm font-medium text-[#9a9a9e] mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {actions.map((action) => (
          <a
            key={action.id}
            href={action.url}
            target={action.url.startsWith('/') ? '_self' : '_blank'}
            rel="noopener noreferrer"
            className={`${action.color} hover:opacity-80 transition-opacity rounded-lg p-3 flex flex-col items-center gap-1`}
          >
            <span className="text-xl">{action.icon}</span>
            <span className="text-xs text-white text-center">{action.label}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
