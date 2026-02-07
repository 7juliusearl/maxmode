'use client'

import { useState, useEffect } from 'react'
import { Mail } from 'lucide-react'

interface Email {
  id: string
  from: string
  subject: string
  snippet: string
  date: string
  unread: boolean
}

export function GmailWidget() {
  const [data, setData] = useState<{ unreadCount: number; emails: Email[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await fetch('/api/gmail/emails')
        if (response.ok) {
          const result = await response.json()
          setData(result)
        }
      } catch (err) {
        console.error('Failed to fetch emails:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEmails()
  }, [])

  const formatTime = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffHours / 24)}d ago`
  }

  if (loading) {
    return (
      <div className="card p-4">
        <div className="animate-pulse">
          <div className="h-5 w-20 bg-[#2a2a2e] rounded mb-4"></div>
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
        <h3 className="text-lg font-semibold text-white">Gmail</h3>
        <a
          href="https://mail.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[#5c7cfa] hover:underline"
        >
          Open →
        </a>
      </div>

      {/* Unread Count */}
      <div className="bg-[#0d0d0f] rounded-lg p-3 mb-4 flex items-center gap-3">
        <div className="p-2 bg-[#40c057]/20 rounded-lg">
          <Mail className="w-5 h-5 text-[#40c057]" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{data?.unreadCount}</p>
          <p className="text-xs text-[#9a9a9e]">unread emails</p>
        </div>
      </div>

      {/* Recent Emails */}
      <div className="space-y-2">
        {data?.emails.slice(0, 4).map((email) => (
          <div
            key={email.id}
            className={`p-2 rounded-lg transition-colors ${
              email.unread ? 'bg-[#2a2a2e]' : 'hover:bg-[#2a2a2e]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <p className={`text-sm truncate ${email.unread ? 'text-white font-medium' : 'text-[#9a9a9e]'}`}>
                {email.from}
              </p>
              <span className="text-xs text-[#9a9a9e]">{formatTime(email.date)}</span>
            </div>
            <p className={`text-sm truncate ${email.unread ? 'text-white' : 'text-[#9a9a9e]'}`}>
              {email.subject}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
