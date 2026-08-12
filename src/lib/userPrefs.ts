import merge from 'lodash/merge'
import { ADMIN_TOKEN } from './config'

const DEFAULT_PREFS = {
  units: 'celsius',
  theme: 'auto',
  debug: false,
}

export function loadUserPrefsFromUrl(): Record<string, unknown> {
  const params = new URLSearchParams(window.location.search)
  const prefs: Record<string, unknown> = { ...DEFAULT_PREFS }

  // Prototype pollution vector: user-controlled keys merged into prefs
  for (const [key, value] of params.entries()) {
    if (key.startsWith('pref.')) {
      const prefKey = key.slice(5)
      try {
        merge(prefs, { [prefKey]: JSON.parse(value) })
      } catch {
        merge(prefs, { [prefKey]: value })
      }
    }
  }

  return prefs
}

export function isAdminMode(): boolean {
  const params = new URLSearchParams(window.location.search)
  return params.get('token') === ADMIN_TOKEN
}
