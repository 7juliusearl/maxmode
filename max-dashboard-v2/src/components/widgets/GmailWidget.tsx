'use client'

import { useState, useEffect } from 'react'
import { Mail } from 'lucide-react'

interface GmailData {
  unreadCount: number
  recentEmails: any[]
}

export function GmailWidget() {
  const [data, setData] = useState<GmailData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for now
    setData({
      unreadCount: 5,
      recentEmails: [
        { id: '1', from: 'WeddingWire', subject: 'New inquiry', unread: true },
        { id: '2', from: 'The Knot', subject: 'Review reminder', unread: true },
        { id: '3', from: 'Google Ads', subject: 'Campaign report', unread: false },
      ],
    })
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="card p-4">
        <div className="animate-pulse">
          <div className="h-5 w-20 bg-[#2a2a2e] rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-[#2a2a2e] rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Gmail</h3>
        <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer" className="text-sm text-[#5c7cfa] hover:underline">
          Open →
        </a>
      </div>

      <div className="bg-[#0d0d0f] rounded-lg p-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#40c057]/20 rounded-lg">
            <Mail className="w-5 h-5 text-[#40c057]" />
          </div>
          <div>
            <p className="text-2xl font-bold">{data?.unreadCount}</p>
            <p className="text-xs text-[#9a9a9e]">unread emails</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {data?.recentEmails.map((email) => (
          <div key={email.id} className={`p-2 rounded-lg ${email.unread ? 'bg-[#2a2a2e]' : 'hover:bg-[#2a2a2e]'}`}>
            <p className={`text-sm ${email.unread ? 'font-medium' : 'text-[#9a9a9e]'}`}>{email.from}</p>
            <p className="text-sm text-[#9a9a9e] truncate">{email.subject}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
