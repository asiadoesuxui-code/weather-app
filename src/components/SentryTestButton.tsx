import { useState } from 'react'
import * as Sentry from '@sentry/react'

export function SentryTestButton() {
  const [status, setStatus] = useState<string | null>(null)

  if (!import.meta.env.DEV) return null

  const showStatus = (message: string) => {
    setStatus(message)
    window.setTimeout(() => setStatus(null), 2500)
  }

  return (
    <section className="relative z-20 mx-auto w-full max-w-lg px-5 pb-6">
      <div className="rounded-2xl border border-white/20 bg-black/30 p-4 backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
          Sentry test
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              Sentry.captureException(new Error('Sentry test error'))
              showStatus('Test error sent to Sentry')
            }}
            className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-800"
          >
            Test Sentry error
          </button>
          <button
            type="button"
            onClick={() => {
              Sentry.captureMessage('Sentry test message', 'info')
              showStatus('Test message sent to Sentry')
            }}
            className="rounded-full bg-white/20 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/30"
          >
            Test Sentry message
          </button>
        </div>
        {status && (
          <p className="mt-3 text-sm font-medium text-emerald-200" role="status">
            {status}
          </p>
        )}
      </div>
    </section>
  )
}
