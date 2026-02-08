'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ResearchItem {
  id: string
  title: string
  content: string
  type: 'research' | 'content' | 'analysis'
  createdAt: string
  taskId?: string
}

export default function ResearchPage() {
  const [items, setItems] = useState<ResearchItem[]>([])
  const [selectedItem, setSelectedItem] = useState<ResearchItem | null>(null)
  const [kvConnected, setKvConnected] = useState(false)

  useEffect(() => {
    fetchResearch()
  }, [])

  const fetchResearch = async () => {
    try {
      const response = await fetch('/api/research/get')
      const data = await response.json()
      if (data.success && data.items) {
        setItems(data.items)
        setKvConnected(true)
      }
    } catch {
      const saved = localStorage.getItem('maxmode-research')
      if (saved) setItems(JSON.parse(saved))
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'research': return '🔍'
      case 'content': return '📝'
      case 'analysis': return '📊'
      default: return '📄'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'research': return 'border-[#60A5FA] bg-[#60A5FA]/10'
      case 'content': return 'border-[#A78BFA] bg-[#A78BFA]/10'
      case 'analysis': return 'border-[#F472B6] bg-[#F472B6]/10'
      default: return 'border-[var(--color-border-subtle)]'
    }
  }

  return (
    <div className="p-4 md:p-6 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <Link href="/tasks" className="text-[var(--color-text-muted)] hover:text-white transition-colors">
            ← Back to Tasks
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">📚 Research & Content</h1>
        <p className="text-[var(--color-text-muted)]">
          {items.length} items • {kvConnected ? '☁️ Synced' : '📱 Local'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className={`rounded-xl px-4 py-3 border ${getTypeColor('research')}`}>
          <p className="text-2xl font-bold text-white">{items.filter(i => i.type === 'research').length}</p>
          <p className="text-xs text-[var(--color-text-muted)]">🔍 Research</p>
        </div>
        <div className={`rounded-xl px-4 py-3 border ${getTypeColor('content')}`}>
          <p className="text-2xl font-bold text-white">{items.filter(i => i.type === 'content').length}</p>
          <p className="text-xs text-[var(--color-text-muted)]">📝 Content</p>
        </div>
        <div className={`rounded-xl px-4 py-3 border ${getTypeColor('analysis')}`}>
          <p className="text-2xl font-bold text-white">{items.filter(i => i.type === 'analysis').length}</p>
          <p className="text-xs text-[var(--color-text-muted)]">📊 Analysis</p>
        </div>
      </div>

      {/* Items Grid */}
      {items.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-4">📚</p>
          <p className="text-white font-medium mb-2">No research items yet</p>
          <p className="text-[var(--color-text-muted)] text-sm mb-6">
            When you ask Max to research something, it will appear here.
          </p>
          <Link href="/tasks" className="inline-block bg-[var(--color-primary)] text-white px-6 py-3 rounded-xl font-medium hover:bg-[var(--color-primary-hover)] transition-colors">
            Go to Tasks
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => (
            <div 
              key={item.id} 
              className={`card p-5 border cursor-pointer hover:border-[var(--color-primary)] transition-all ${getTypeColor(item.type)}`}
              onClick={() => setSelectedItem(item)}
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">{getTypeIcon(item.type)}</span>
                <div className="flex-1">
                  <h3 className="text-white font-medium mb-1">{item.title}</h3>
                  <p className="text-xs text-[var(--color-text-muted)]">{formatDate(item.createdAt)}</p>
                </div>
              </div>
              <p className="text-[var(--color-text-muted)] text-sm line-clamp-3">{item.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedItem(null)}>
          <div className="bg-[var(--color-surface)] rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-[var(--color-border-subtle)]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getTypeIcon(selectedItem.type)}</span>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedItem.title}</h2>
                    <p className="text-xs text-[var(--color-text-muted)]">{formatDate(selectedItem.createdAt)}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="p-2 hover:bg-[var(--color-bg)] rounded-lg transition-colors text-[var(--color-text-muted)] hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-[var(--color-text-muted)] text-sm font-sans">
                  {selectedItem.content}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
