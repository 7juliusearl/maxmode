'use client'

import { useState, useEffect } from 'react'

interface WeatherData {
  temp: number
  condition: string
  humidity: number
  wind: number
  location: string
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Default to Palm Springs/Indio area for wedding forecasts
    const defaultWeather = {
      temp: 72,
      condition: 'Sunny',
      humidity: 25,
      wind: 8,
      location: 'Indio, CA',
    }

    // Try to get from API, fall back to default
    setWeather(defaultWeather)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="card p-4">
        <div className="animate-pulse">
          <div className="h-4 w-24 bg-[#2a2a2e] rounded mb-3"></div>
          <div className="h-12 w-20 bg-[#2a2a2e] rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-[#9a9a9e]">Weather</h3>
        <span className="text-xs text-[#9a9a9e]">{weather?.location}</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-4xl font-bold text-white">
          {weather?.temp}°
        </div>
        <div>
          <p className="text-white font-medium">{weather?.condition}</p>
          <p className="text-xs text-[#9a9a9e]">Humidity: {weather?.humidity}%</p>
          <p className="text-xs text-[#9a9a9e]">Wind: {weather?.wind} mph</p>
        </div>
      </div>
    </div>
  )
}
