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
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Good {getTimeOfDay()}, Max 👋
            </h1>
            <p className="text-[var(--color-text-muted)]">
              {formatDate()}
            </p>
          </div>
          <div className="flex items-center gap-3 animate-fade-in">
            <TimeWidget />
          </div>
        </div>
      </header>

      {/* Stats Row */}
      <section className="mb-8 animate-slide-up">
        <StatsWidget />
      </section>

      {/* Main Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <GHLWidget />
        </div>
        <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <WeatherWidget />
          <GmailWidget />
        </div>
      </div>

      {/* Quick Actions */}
      <section className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <QuickActionsWidget />
      </section>
    </div>
  )
}

function getTimeOfDay() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Morning'
  if (hour < 17) return 'Afternoon'
  return 'Evening'
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}
