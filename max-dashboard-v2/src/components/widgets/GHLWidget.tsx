'use client'

import { useState, useEffect } from 'react'

interface GHLData {
  unreadCount: number
  conversations: any[]
  contacts: number
}

interface Conversation {
  id: string
  contactName: string
  lastMessage: string
  type: string
  timestamp: string
  unread: boolean
}

export function GHLWidget() {
  const [data, setData] = useState<GHLData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGHLData = async () => {
    try {
      const response = await fetch('/api/ghl/conversations')
      if (response.ok) {
        const result = await response.json()
        setData(result)
        setError(null)
      } else {
        throw new Error('Failed to fetch')
      }
    } catch (err) {
      setError('Unable to connect to GHL')
      setData({
        unreadCount: 12,
        conversations: [
          { id: '1', contactName: 'Brenda Bernabe', lastMessage: 'Thank you so much!', type: 'sms', timestamp: new Date().toISOString(), unread: true },
          { id: '2', contactName: 'Julie Reneer', lastMessage: 'Sounds good!', type: 'instagram', timestamp: new Date(Date.now() - 3600000).toISOString(), unread: false },
          { id: '3', contactName: 'Paige & Spencer Hahn', lastMessage: 'Questions about pricing', type: 'sms', timestamp: new Date(Date.now() - 7200000).toISOString(), unread: true },
        ],
        contacts: 9202,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGHLData()
  }, [])

  const handleRefresh = () => {
    setLoading(true)
    fetchGHLData()
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sms': return '💬'
      case 'email': return '📧'
      case 'instagram': return '📷'
      case 'whatsapp': return '💭'
      default: return '💬'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffHours / 24)}d ago`
  }

  if (loading) {
    return (
      <div className="card p-4">
        <div className="animate-pulse">
          <div className="h-5 w-32 bg-[#2a2a2e] rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-[#2a2a2e] rounded"></div>
            <div className="h-4 bg-[#2a2a2e] rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-white">GoHighLevel</h3>
          {error && (
            <span className="text-xs text-[#fab005] bg-[#fab005]/20 px-2 py-0.5 rounded">
              Demo
            </span>
          )}
        </div>
        <button
          onClick={handleRefresh}
          className="p-1 rounded hover:bg-[#2a2a2e] transition-colors"
          title="Refresh"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#9a9a9e]">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
            <path d="M16 21h5v-5"/>
          </svg>
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#0d0d0f] rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-[#fa5252]">{data?.unreadCount}</p>
          <p className="text-xs text-[#9a9a9e]">Unread</p>
        </div>
        <div className="bg-[#0d0d0f] rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-[#40c057]">{data?.contacts?.toLocaleString() || '-'}</p>
          <p className="text-xs text-[#9a9a9e]">Contacts</p>
        </div>
      </div>

      {/* Recent Conversations */}
      <div className="space-y-2">
        {data?.conversations.slice(0, 5).map((conv: Conversation) => (
          <div
            key={conv.id}
            className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
              conv.unread ? 'bg-[#2a2a2e]' : 'hover:bg-[#2a2a2e]'
            }`}
          >
            <span className="text-lg">{getTypeIcon(conv.type)}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm truncate ${conv.unread ? 'text-white font-medium' : 'text-[#9a9a9e]'}`}>
                {conv.contactName}
              </p>
              <p className="text-xs text-[#9a9a9e] truncate">{conv.lastMessage}</p>
            </div>
            <span className="text-xs text-[#9a9a9e] whitespace-nowrap">{formatTime(conv.timestamp)}</span>
          </div>
        ))}
      </div>

      {/* Quick Link */}
      <a
        href="https://app.gohighlevel.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-4 text-center text-sm text-[#5c7cfa] hover:underline"
      >
        Open GoHighLevel →
      </a>
    </div>
  )
}
