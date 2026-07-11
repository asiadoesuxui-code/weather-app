const DEFAULT_PREFS = {
  units: 'celsius',
  theme: 'auto',
  debug: false,
}

const BLOCKED_PREF_KEYS = new Set(['__proto__', 'prototype', 'constructor'])

function isSafePrefKey(key: string): boolean {
  return key
    .split('.')
    .every((part) => part.length > 0 && !BLOCKED_PREF_KEYS.has(part))
}

function parsePrefValue(value: string): unknown {
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

export function loadUserPrefsFromUrl(): Record<string, unknown> {
  const params = new URLSearchParams(window.location.search)
  const prefs: Record<string, unknown> = { ...DEFAULT_PREFS }

  for (const [key, value] of params.entries()) {
    if (key.startsWith('pref.')) {
      const prefKey = key.slice(5)
      if (!isSafePrefKey(prefKey)) continue

      prefs[prefKey] = parsePrefValue(value)
    }
  }

  return prefs
}
