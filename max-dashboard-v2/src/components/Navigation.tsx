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
  #mobile-menu-overlay { 
    position: fixed !important; 
    inset: 0 !important; 
    background-color: #000000 !important; 
    z-index: 99999 !important; 
  }
  #mobile-menu-panel { 
    position: absolute !important; 
    top: 0 !important; 
    right: 0 !important; 
    width: 300px !important; 
    height: 100% !important; 
    background-color: #0D1117 !important; 
    border-left: 2px solid #30363D !important; 
    padding: 24px !important; 
    display: flex !important; 
    flex-direction: column !important;
  }
  .mobile-nav-item { 
    display: flex !important; 
    align-items: center !important; 
    gap: 12px !important; 
    padding: 18px 20px !important; 
    border-radius: 12px !important; 
    margin-bottom: 8px !important; 
    font-size: 17px !important; 
    font-weight: 600 !important; 
    color: #FFFFFF !important; 
    cursor: pointer !important; 
    transition: all 0.2s ease !important; 
    text-decoration: none !important; 
  }
  .mobile-nav-item.active { 
    background-color: #0D9488 !important; 
  }
  .mobile-nav-item.inactive { 
    color: #9CA3AF !important; 
    background-color: transparent !important; 
  }
  .mobile-nav-item.inactive:hover { 
    background-color: #21262D !important; 
    color: #FFFFFF !important;
  }
  #mobile-menu-header { 
    display: flex !important; 
    align-items: center !important; 
    justify-content: space-between !important; 
    margin-bottom: 32px !important; 
    padding-top: 8px !important; 
  }
  #mobile-menu-title { 
    font-size: 20px !important; 
    font-weight: 700 !important; 
    color: #FFFFFF !important; 
    margin: 0 !important; 
  }
  #mobile-close-btn { 
    padding: 12px !important; 
    background-color: #21262D !important; 
    border: none !important; 
    color: #FFFFFF !important; 
    cursor: pointer !important; 
    border-radius: 10px !important; 
    font-size: 20px !important; 
    font-weight: bold !important;
  }
  #mobile-close-btn:hover { 
    background-color: #30363D !important; 
  }
`

export function Navigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: mobileStyles }} />

      {/* Mobile Menu Button */}
      <button
        id="hamburger-btn"
        onClick={() => setIsMobileMenuOpen(true)}
        style={{ display: 'block', padding: 10, backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
        className="md:hidden"
      >
        <svg style={{ width: 28, height: 28, color: '#FFFFFF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div id="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div id="mobile-menu-panel" onClick={(e) => e.stopPropagation()}>
            <div id="mobile-menu-header">
              <h2 id="mobile-menu-title">MENU</h2>
              <button id="mobile-close-btn" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
            </div>
            <div style={{ flex: 1 }}>
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`mobile-nav-item ${isActive ? 'active' : 'inactive'}`}
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
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, backgroundColor: '#000000', borderBottom: '1px solid #30363D' }}>
        <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <span style={{ fontSize: 26 }}>🦊</span>
              <span style={{ fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' }}>MaxMode</span>
            </Link>
            <Navigation />
          </div>
        </div>
      </header>
      <main style={{ paddingTop: 80 }}>{children}</main>
    </div>
  )
}
