'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/',
    label: 'Dashboard',
    icon: (
      <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/tasks',
    label: 'Tasks',
    icon: (
      <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    href: '/research',
    label: 'Research',
    icon: (
      <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
]

const mobileStyles = `
  .mobile-overlay { position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.85); z-index: 9999; }
  .menu-panel { position: absolute; top: 0; right: 0; width: 280px; height: 100%; background-color: #0D1117; border-left: 1px solid #30363D; padding: 20px; display: flex; flex-direction: column; }
  .nav-item { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-radius: 12px; margin-bottom: 8px; font-size: 16px; font-weight: 500; color: #FFFFFF; cursor: pointer; transition: all 0.2s ease; text-decoration: none; }
  .nav-item.active { background-color: #0D9488; }
  .nav-item.inactive { color: #9CA3AF; }
  .nav-item.inactive:hover { background-color: #21262D; }
  .menu-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; padding-top: 8px; }
  .menu-title { font-size: 18px; font-weight: 600; color: #FFFFFF; margin: 0; }
  .close-btn { padding: 8px; background-color: transparent; border: none; color: #9CA3AF; cursor: pointer; border-radius: 8px; font-size: 18px; }
  .close-btn:hover { background-color: #21262D; color: #FFFFFF; }
`

export function Navigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: mobileStyles }} />

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        style={{ display: 'block', padding: 8, backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
        className="md:hidden"
      >
        <svg style={{ width: 24, height: 24, color: '#9CA3AF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="menu-panel" onClick={(e) => e.stopPropagation()}>
            <div className="menu-header">
              <h2 className="menu-title">Menu</h2>
              <button className="close-btn" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
            </div>
            <div style={{ flex: 1 }}>
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`nav-item ${isActive ? 'active' : 'inactive'}`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #30363D' }}>
        <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <span style={{ fontSize: 24 }}>🦊</span>
              <span style={{ fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' }}>MaxMode</span>
            </Link>
            <Navigation />
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
