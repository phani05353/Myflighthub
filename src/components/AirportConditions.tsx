import type { AirportCondition, AirportConditionStatus } from '../types'

interface Props {
  airports: AirportCondition[]
}

function ConditionBadge({ status }: { status: AirportConditionStatus }) {
  if (status === 'delays') {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/25">
        Delays
      </span>
    )
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/15 text-green-400 border border-green-500/25">
      Normal
    </span>
  )
}

function OnTimeBar({ value, label }: { value: number; label: string }) {
  const barColor = value >= 85 ? 'bg-green-500' : value >= 70 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-zinc-500">{label}</span>
        <span className="text-xs text-zinc-400">{value}% on time</span>
      </div>
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

export function AirportConditions({ airports }: Props) {
  return (
    <div className="mb-8">
      <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Airport Conditions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {airports.map((airport) => (
          <div key={airport.code} className="bg-surface-1 rounded-xl p-4 border border-white/5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-semibold text-white">{airport.name}</div>
                <div className="text-xs text-zinc-500">
                  {airport.code} · {airport.city}
                </div>
              </div>
              <ConditionBadge status={airport.status} />
            </div>
            <p className="text-xs text-zinc-400 mb-3">{airport.conditions}</p>
            <div className="flex gap-4">
              <OnTimeBar value={airport.depOnTime} label="Dep" />
              <OnTimeBar value={airport.arrOnTime} label="Arr" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
