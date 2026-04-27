import { useState } from 'react'

interface Props {
  onAdd: (flightIata: string) => Promise<void>
  onClose: () => void
}

export function AddFlightModal({ onAdd, onClose }: Props) {
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const iata = value.trim().toUpperCase().replace(/\s+/g, '')
    if (!iata) return

    setBusy(true)
    setError(null)
    try {
      await onAdd(iata)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add flight')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface-1 rounded-2xl p-6 w-full max-w-sm border border-white/10 shadow-2xl">
        <h2 className="text-base font-semibold text-white mb-1">Track a flight</h2>
        <p className="text-xs text-zinc-500 mb-4">Enter the IATA flight number, e.g. BA0178</p>

        <form onSubmit={(e) => void handleSubmit(e)}>
          <input
            autoFocus
            type="text"
            placeholder="BA0178"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full bg-surface-2 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 text-sm outline-none focus:border-white/30 mb-3 font-mono tracking-wider uppercase"
          />

          {error && (
            <p className="text-red-400 text-xs mb-3 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-white/15 rounded-lg px-4 py-2 text-sm text-zinc-400 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !value.trim()}
              className="flex-1 bg-white text-black rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-40 hover:bg-zinc-100 transition-colors"
            >
              {busy ? 'Looking up…' : 'Add flight'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
