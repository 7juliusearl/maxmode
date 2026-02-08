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

const mobileMenuStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  zIndex: 9999,
}

const menuPanelStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  right: 0,
  width: 280,
  height: '100%',
  backgroundColor: '#0D1117',
  borderLeft: '1px solid #30363D',
  padding: 20,
  display: 'flex',
  flexDirection: 'column',
}

const navItemStyle = (isActive: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '16px 20px',
  borderRadius: 12,
  marginBottom: 8,
  fontSize: 16,
  fontWeight: 500,
  color: isActive ? '#FFFFFF' : '#9CA3AF',
  backgroundColor: isActive ? '#0D9488' : 'transparent',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
})

const navItemHoverStyle: React.CSSProperties = {
  color: '#FFFFFF',
  backgroundColor: '#21262D',
}

export function Navigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  return (
    <>
      {/* Desktop navigation */}
      <nav style={{ 
        display: 'none', 
        alignItems: 'center', 
        gap: 4, 
        padding: 8 
      }} className="md:flex">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 8,
                fontWeight: 500,
                color: isActive ? '#FFFFFF' : '#9CA3AF',
                backgroundColor: isActive ? '#0D9488' : 'transparent',
                transition: 'all 0.2s ease',
              }}
              className="hover:opacity-80"
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        style={{
          display: 'block',
          padding: 8,
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
        className="md:hidden"
      >
        <svg style={{ width: 24, height: 24, color: '#9CA3AF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div style={mobileMenuStyle} onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            style={menuPanelStyle} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: 24,
              paddingTop: 8
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
                Menu
              </h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  padding: 8,
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  borderRadius: 8,
                }}
              >
                ✕
              </button>
            </div>

            {/* Nav Items */}
            <div style={{ flex: 1 }}>
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href
                const isHovered = hoveredItem === item.href
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    onMouseEnter={() => setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                    style={{
                      ...navItemStyle(isActive),
                      ...(isHovered && !isActive ? navItemHoverStyle : {}),
                      textDecoration: 'none',
                    }}
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
      {/* Header */}
      <header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #30363D',
      }}>
        <div style={{ 
          maxWidth: '100%', 
          margin: '0 auto', 
          padding: '0 16px' 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            height: 64 
          }}>
            {/* Logo */}
            <Link href="/" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8, 
              textDecoration: 'none' 
            }}>
              <span style={{ fontSize: 24 }}>🦊</span>
              <span style={{ fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' }}>
                MaxMode
              </span>
            </Link>

            {/* Navigation */}
            <Navigation />
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main>{children}</main>
    </div>
  )
}
