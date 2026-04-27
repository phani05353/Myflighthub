import type { Alert, AlertType } from '../types'

interface Props {
  alerts: Alert[]
}

const dotColor: Record<AlertType, string> = {
  delay: 'bg-amber-500',
  cancellation: 'bg-red-500',
  landing: 'bg-blue-500',
  info: 'bg-zinc-400',
}

const bgColor: Record<AlertType, string> = {
  delay: 'bg-amber-500/10 border-amber-500/15',
  cancellation: 'bg-red-500/10 border-red-500/15',
  landing: 'bg-blue-500/10 border-blue-500/15',
  info: 'bg-white/5 border-white/10',
}

export function RecentAlerts({ alerts }: Props) {
  return (
    <div className="mb-8">
      <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Recent Alerts</h2>
      <div className="flex flex-col gap-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start gap-3 rounded-xl px-4 py-3.5 border ${bgColor[alert.type]}`}
          >
            <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${dotColor[alert.type]}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white">{alert.message}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{alert.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
