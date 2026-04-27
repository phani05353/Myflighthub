export function Header() {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-white leading-tight">FlightHub</h1>
        <p className="text-sm text-zinc-400 mt-0.5">6 tracked flights · Live · Sun 27 Apr</p>
      </div>
      <button className="flex items-center gap-1.5 border border-white/20 rounded-lg px-4 py-2 text-sm font-medium text-white hover:bg-white/5 transition-colors">
        + Add flight
        <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
          <path d="M2 12L12 2M12 2H6M12 2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}
