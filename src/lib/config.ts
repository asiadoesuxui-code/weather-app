export const WEATHER_API_KEY: string | undefined = undefined
export const SENTRY_INTERNAL_DSN: string | undefined = undefined

// A client-side token is visible to every production visitor, so only allow
// this local helper in development until admin access is backed by server auth.
export const ADMIN_TOKEN: string | undefined = import.meta.env.DEV
  ? import.meta.env.VITE_ADMIN_TOKEN
  : undefined
