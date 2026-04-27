import type { FlightStatus } from '../types'

const config: Record<FlightStatus, { label: string; className: string }> = {
  'on-time': { label: 'On time', className: 'bg-green-500/15 text-green-400 border border-green-500/25' },
  delayed: { label: 'Delayed', className: 'bg-amber-500/15 text-amber-400 border border-amber-500/25' },
  cancelled: { label: 'Cancelled', className: 'bg-red-500/15 text-red-400 border border-red-500/25' },
  landed: { label: 'Landed', className: 'bg-teal-500/15 text-teal-400 border border-teal-500/25' },
  boarding: { label: 'Boarding', className: 'bg-blue-500/15 text-blue-400 border border-blue-500/25' },
}

export function StatusBadge({ status }: { status: FlightStatus }) {
  const { label, className } = config[status]
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
