'use client'

import { useState, useEffect } from 'react'

interface GHLData {
  unreadCount: number
  conversations: any[]
  contacts: number
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
          { id: '1', contactName: 'Brenda Bernabe', lastMessage: 'Thank you!', type: 'sms', unread: true },
          { id: '2', contactName: 'Julie Reneer', lastMessage: 'Sounds good', type: 'instagram', unread: false },
        ],
        contacts: 156,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchGHLData() }, [])

  if (loading) {
    return (
      <div className="card p-4">
        <div className="animate-pulse">
          <div className="h-5 w-24 bg-[#2a2a2e] rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-[#2a2a2e] rounded"></div>
            <div className="h-4 bg-[#2a2a2e] rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">GoHighLevel</h3>
        {error && <span className="text-xs text-[#fab005] bg-[#fab005]/20 px-2 py-0.5 rounded">Demo</span>}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#0d0d0f] rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-[#fa5252]">{data?.unreadCount}</p>
          <p className="text-xs text-[#9a9a9e]">Unread</p>
        </div>
        <div className="bg-[#0d0d0f] rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-[#40c057]">{data?.contacts || '-'}</p>
          <p className="text-xs text-[#9a9a9e]">Contacts</p>
        </div>
      </div>

      <div className="space-y-2">
        {data?.conversations.slice(0, 5).map((conv) => (
          <div key={conv.id} className={`p-2 rounded-lg ${conv.unread ? 'bg-[#2a2a2e]' : 'hover:bg-[#2a2a2e]'}`}>
            <p className={`text-sm ${conv.unread ? 'font-medium' : 'text-[#9a9a9e]'}`}>{conv.contactName}</p>
            <p className="text-xs text-[#9a9a9e] truncate">{conv.lastMessage}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
