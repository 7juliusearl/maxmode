import { GHLWidget } from '@/components/widgets/GHLWidget'
import { GmailWidget } from '@/components/widgets/GmailWidget'

export default function HomePage() {
  return (
    <div className="min-h-screen p-4 md:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Good {getTimeOfDay()}, Max
        </h1>
        <p className="text-[#9a9a9e]">{formatDate()}</p>
      </div>

      {/* GHL & Gmail Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <GHLWidget />
        <GmailWidget />
      </div>
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
