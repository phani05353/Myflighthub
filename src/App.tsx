import { Header } from './components/Header'
import { StatsCards } from './components/StatsCards'
import { FlightsTable } from './components/FlightsTable'
import { AirportConditions } from './components/AirportConditions'
import { RecentAlerts } from './components/RecentAlerts'
import { ActionButtons } from './components/ActionButtons'
import { flights, airports, alerts } from './data'

export default function App() {
  return (
    <div className="min-h-screen bg-surface-0 text-white">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Header />
        <StatsCards flights={flights} alerts={alerts} />
        <FlightsTable flights={flights} />
        <AirportConditions airports={airports} />
        <RecentAlerts alerts={alerts} />
        <ActionButtons />
      </div>
    </div>
  )
}
