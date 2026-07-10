import * as Sentry from '@sentry/react'

const isDev = import.meta.env.DEV

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  release: import.meta.env.VITE_APP_VERSION,

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  tracesSampleRate: isDev ? 1.0 : 0.2,
  tracePropagationTargets: ['localhost', /^\/api\//],

  replaysSessionSampleRate: isDev ? 1.0 : 0.1,
  replaysOnErrorSampleRate: 1.0,

  enableLogs: true,
})
