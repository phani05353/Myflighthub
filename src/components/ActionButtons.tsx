const actions = [
  { label: 'Best API to use' },
  { label: 'Delay alerts system' },
  { label: 'Scaffold backend' },
]

export function ActionButtons() {
  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action) => (
        <button
          key={action.label}
          className="flex items-center gap-1.5 border border-white/20 rounded-lg px-4 py-2.5 text-sm font-medium text-white hover:bg-white/5 transition-colors"
        >
          {action.label}
          <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
            <path d="M2 12L12 2M12 2H6M12 2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ))}
    </div>
  )
}
