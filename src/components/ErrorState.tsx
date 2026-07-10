interface ErrorStateProps {
  message: string
  onRetry?: () => void
  showDemo?: boolean
  onDemo?: () => void
  isLoading?: boolean
}

export function ErrorState({ message, onRetry, showDemo, onDemo, isLoading }: ErrorStateProps) {
  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center text-white">
      <div className="text-6xl drop-shadow-md">😕</div>
      <p className="max-w-sm text-lg font-semibold drop-shadow-md">{message}</p>
      <div className="flex flex-wrap justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            disabled={isLoading}
            className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-800 disabled:opacity-60"
          >
            {isLoading ? 'Loading…' : 'Try again'}
          </button>
        )}
        {showDemo && onDemo && (
          <button
            type="button"
            onClick={onDemo}
            disabled={isLoading}
            className="rounded-full bg-white/25 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm ring-1 ring-white/30 disabled:opacity-60"
          >
            {isLoading ? 'Loading…' : 'Try demo (London)'}
          </button>
        )}
      </div>
    </div>
  )
}
