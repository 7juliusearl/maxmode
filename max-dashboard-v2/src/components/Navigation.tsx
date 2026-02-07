'use client'

import { useState } from 'react'
import Link from 'next/link'

interface NavItem {
  label: string
  href: string
  icon: string
}

export function Navigation({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const navItems: NavItem[] = [
    { label: 'Home', href: '/', icon: '🏠' },
    { label: 'Tasks', href: '/tasks', icon: '📋' },
    { label: 'Research', href: '/research', icon: '🔬' },
    { label: 'Settings', href: '/settings', icon: '⚙️' },
  ]

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0d0d0f]/95 backdrop-blur-sm border-b border-[#2a2a2e] md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-lg font-semibold text-white">MaxMode</span>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-[#9a9a9e] hover:text-white transition-colors"
            aria-label="Menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`
        fixed top-0 right-0 bottom-0 w-64 bg-[#0d0d0f] border-l border-[#2a2a2e] z-50 transform transition-transform duration-200 md:hidden
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-4 border-b border-[#2a2a2e]">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-white">Menu</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-[#9a9a9e] hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#9a9a9e] hover:bg-[#2a2a2e] hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col bg-[#0d0d0f] border-r border-[#2a2a2e]">
        <div className="p-6 border-b border-[#2a2a2e]">
          <h1 className="text-xl font-bold text-white">MaxMode</h1>
          <p className="text-sm text-[#9a9a9e] mt-1">Dashboard</p>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#9a9a9e] hover:bg-[#2a2a2e] hover:text-white transition-colors"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-[#2a2a2e]">
          <p className="text-xs text-[#9a9a9e] text-center">MaxMode v2.0</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:pl-64">
        <div className="md:hidden h-14" />
        {children}
      </main>
    </>
  )
}
