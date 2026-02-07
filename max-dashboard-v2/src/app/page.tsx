import { GHLWidget } from '@/components/widgets/GHLWidget'
import { GmailWidget } from '@/components/widgets/GmailWidget'
import { WeatherWidget } from '@/components/widgets/WeatherWidget'
import { TimeWidget } from '@/components/widgets/TimeWidget'
import { QuickActionsWidget } from '@/components/widgets/QuickActionsWidget'
import { StatsWidget } from '@/components/widgets/StatsWidget'

export default function HomePage() {
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
              Good {getTimeOfDay()}, Max 👋
            </h1>
            <p className="text-[#9a9a9e]">{formatDate()}</p>
          </div>
          <div className="flex items-center gap-3">
            <TimeWidget />
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <StatsWidget />

      {/* Main Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2">
          <GHLWidget />
        </div>
        <div className="space-y-4">
          <WeatherWidget />
          <GmailWidget />
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActionsWidget />
    </div>
  )
}

function getTimeOfDay() {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}
