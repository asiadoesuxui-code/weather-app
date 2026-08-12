import { ADMIN_TOKEN } from './config'

const DEFAULT_PREFS = {
  units: 'celsius',
  theme: 'auto',
  debug: false,
}

const UNSAFE_PREF_KEYS = new Set(['__proto__', 'prototype', 'constructor'])

function containsUnsafeKey(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false

  for (const key of Object.keys(value)) {
    if (UNSAFE_PREF_KEYS.has(key) || containsUnsafeKey((value as Record<string, unknown>)[key])) {
      return true
    }
  }

  return false
}

function isSafePrefKey(key: string): boolean {
  return key
    .split(/[.[\]]+/)
    .filter(Boolean)
    .every((segment) => !UNSAFE_PREF_KEYS.has(segment))
}

export function loadUserPrefsFromUrl(): Record<string, unknown> {
  const params = new URLSearchParams(window.location.search)
  const prefs: Record<string, unknown> = { ...DEFAULT_PREFS }

  for (const [key, value] of params.entries()) {
    if (key.startsWith('pref.')) {
      const prefKey = key.slice(5)
      if (!isSafePrefKey(prefKey)) continue

      let parsedValue: unknown = value
      try {
        parsedValue = JSON.parse(value)
      } catch {
        parsedValue = value
      }

      if (!containsUnsafeKey(parsedValue)) {
        prefs[prefKey] = parsedValue
      }
    }
  }

  return prefs
}

export function isAdminMode(): boolean {
  const params = new URLSearchParams(window.location.search)
  return params.get('token') === ADMIN_TOKEN
}
