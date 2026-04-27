import type { Flight } from '../types'
import { StatusBadge } from './StatusBadge'

interface Props {
  flights: Flight[]
  onRemove: (id: string) => void
}

function TimeCell({ scheduled, delay }: { scheduled: string; delay?: number }) {
  if (!scheduled) return <span className="text-zinc-600">—</span>
  if (delay && delay > 0) {
    return (
      <div>
        <span className="line-through text-zinc-600 text-sm">{scheduled}</span>
        <div className="text-amber-400 text-sm">+{delay} min</div>
      </div>
    )
  }
  return <span className="text-white text-sm">{scheduled}</span>
}

function ArrivalCell({
  scheduled,
  actualArrival,
  delay,
  nextDay,
  status,
}: {
  scheduled: string
  actualArrival?: string
  delay?: number
  nextDay?: boolean
  status: string
}) {
  if (!scheduled) return <span className="text-zinc-600">—</span>

  const suffix = nextDay ? <sup className="text-zinc-400 text-[10px]">+1</sup> : null
  const localSuffix =
    status === 'on-time' || status === 'boarding' || status === 'landed' ? (
      <span className="text-zinc-500 text-xs ml-1">local</span>
    ) : null

  if (delay && delay > 0 && actualArrival) {
    return (
      <div>
        <div className="text-sm text-white">
          {scheduled}
          {suffix}
        </div>
        <div className="text-amber-400 text-sm">{actualArrival}</div>
      </div>
    )
  }

  return (
    <div className="text-sm text-white">
      {scheduled}
      {suffix}
      {localSuffix}
    </div>
  )
}

export function FlightsTable({ flights, onRemove }: Props) {
  if (flights.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
          Tracked Flights
        </h2>
        <div className="bg-surface-1 rounded-xl border border-white/5 px-6 py-12 text-center text-zinc-600 text-sm">
          No flights tracked yet. Press <span className="text-zinc-400">+ Add flight</span> to start.
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
        Tracked Flights
      </h2>
      <div className="bg-surface-1 rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-xs text-zinc-500 font-medium px-4 py-3">Flight</th>
              <th className="text-left text-xs text-zinc-500 font-medium px-4 py-3">Route</th>
              <th className="text-left text-xs text-zinc-500 font-medium px-4 py-3 hidden sm:table-cell">
                Departs
              </th>
              <th className="text-left text-xs text-zinc-500 font-medium px-4 py-3 hidden sm:table-cell">
                Arrives
              </th>
              <th className="text-right text-xs text-zinc-500 font-medium px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {flights.map((flight, i) => (
              <tr
                key={flight.id}
                className={`group ${i < flights.length - 1 ? 'border-b border-white/5' : ''} hover:bg-white/[0.02] transition-colors`}
              >
                <td className="px-4 py-3.5">
                  <div className="font-semibold text-white text-sm">{flight.flightNumber}</div>
                  <div className="text-xs text-zinc-500">{flight.airline}</div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="text-sm text-white">
                    {flight.origin} → {flight.destination}
                  </div>
                  {flight.aircraft && (
                    <div className="text-xs text-zinc-500">
                      {flight.aircraft}
                      {flight.duration ? ` · ${flight.duration}` : ''}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3.5 hidden sm:table-cell">
                  <TimeCell
                    scheduled={flight.scheduledDeparture}
                    delay={flight.status === 'delayed' ? flight.delayMinutes : undefined}
                  />
                </td>
                <td className="px-4 py-3.5 hidden sm:table-cell">
                  <ArrivalCell
                    scheduled={flight.scheduledArrival}
                    actualArrival={flight.actualArrival}
                    delay={flight.status === 'delayed' ? flight.delayMinutes : undefined}
                    nextDay={flight.nextDayArrival}
                    status={flight.status}
                  />
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <StatusBadge status={flight.status} />
                    <button
                      onClick={() => onRemove(flight.id)}
                      className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all"
                      title="Stop tracking"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                        <path
                          d="M2 2L12 12M12 2L2 12"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
