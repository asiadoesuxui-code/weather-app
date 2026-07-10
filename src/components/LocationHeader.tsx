interface LocationHeaderProps {
  locationName: string
  onRefresh: () => void
  isLoading: boolean
}

export function LocationHeader({ locationName, onRefresh, isLoading }: LocationHeaderProps) {
  return (
    <header className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
          Drizzle or Shine
        </p>
        <h2 className="mt-1 text-lg font-semibold text-white">{locationName}</h2>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        disabled={isLoading}
        className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30 disabled:opacity-50"
      >
        {isLoading ? '…' : '↻ Refresh'}
      </button>
    </header>
  )
}
