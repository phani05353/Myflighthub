import { useState } from 'react'
import { Header } from './components/Header'
import { StatsCards } from './components/StatsCards'
import { FlightsTable } from './components/FlightsTable'
import { AirportConditions } from './components/AirportConditions'
import { RecentAlerts } from './components/RecentAlerts'
import { AddFlightModal } from './components/AddFlightModal'
import { useFlightHub } from './hooks/useFlightHub'

export default function App() {
  const [showModal, setShowModal] = useState(false)
  const { flights, airports, alerts, loading, error, addFlight, removeFlight } = useFlightHub()

  return (
    <div className="min-h-screen bg-surface-0 text-white">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Header flightCount={flights.length} onAddFlight={() => setShowModal(true)} />

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-48 text-zinc-600 text-sm">
            Loading…
          </div>
        ) : (
          <>
            <StatsCards flights={flights} alerts={alerts} />
            <FlightsTable flights={flights} onRemove={(id) => void removeFlight(id)} />
            {airports.length > 0 && <AirportConditions airports={airports} />}
            {alerts.length > 0 && <RecentAlerts alerts={alerts} />}
          </>
        )}
      </div>

      {showModal && (
        <AddFlightModal onAdd={addFlight} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}
