'use client'

import { useState, useEffect } from 'react'

export function TimeWidget() {
  const [time, setTime] = useState<string>('')
  const [ampm, setAmpm] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      let hours = now.getHours()
      const minutes = now.getMinutes().toString().padStart(2, '0')
      setAmpm(hours >= 12 ? 'PM' : 'AM')
      hours = hours % 12 || 12
      setTime(`${hours}:${minutes}`)
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-2 text-[#9a9a9e]">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      <span className="text-lg font-medium text-white">{time}</span>
      <span className="text-sm">{ampm}</span>
    </div>
  )
}
