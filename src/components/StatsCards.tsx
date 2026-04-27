import type { Flight, Alert } from '../types'

interface Props {
  flights: Flight[]
  alerts: Alert[]
}

export function StatsCards({ flights, alerts }: Props) {
  const onTime = flights.filter((f) => f.status === 'on-time' || f.status === 'landed' || f.status === 'boarding').length
  const delayed = flights.filter((f) => f.status === 'delayed')
  const cancelled = flights.find((f) => f.status === 'cancelled')

  const avgDelay =
    delayed.length > 0
      ? Math.round(delayed.reduce((sum, f) => sum + (f.delayMinutes ?? 0), 0) / delayed.length)
      : 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      <div className="bg-surface-1 rounded-xl p-4 border border-white/5">
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">On time</p>
        <p className="text-4xl font-bold text-green-400">{onTime}</p>
        <p className="text-xs text-zinc-500 mt-1">of {flights.length} tracked</p>
      </div>

      <div className="bg-surface-1 rounded-xl p-4 border border-white/5">
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Delayed</p>
        <p className="text-4xl font-bold text-amber-400">{delayed.length}</p>
        <p className="text-xs text-zinc-500 mt-1">avg +{avgDelay} min</p>
      </div>

      <div className="bg-surface-1 rounded-xl p-4 border border-white/5">
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Cancelled</p>
        <p className="text-4xl font-bold text-red-400">1</p>
        {cancelled && (
          <p className="text-xs text-zinc-500 mt-1">
            {cancelled.origin} → {cancelled.destination}
          </p>
        )}
      </div>

      <div className="bg-surface-1 rounded-xl p-4 border border-white/5">
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Alerts sent</p>
        <p className="text-4xl font-bold text-white">{alerts.length + 1}</p>
        <p className="text-xs text-zinc-500 mt-1">today</p>
      </div>
    </div>
  )
}
