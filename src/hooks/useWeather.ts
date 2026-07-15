import * as Sentry from '@sentry/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchWeather } from '../lib/weather'
import type { RainForecast } from '../types/weather'

interface Coordinates {
  lat: number
  lon: number
}

type Status = 'loading' | 'ready' | 'error' | 'permission'

export function useWeather() {
  const [forecast, setForecast] = useState<RainForecast | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState<string | null>(null)
  const [coords, setCoords] = useState<Coordinates | null>(null)
  const geoAttempted = useRef(false)

  const loadWeather = useCallback(async (lat: number, lon: number) => {
    setStatus('loading')
    setError(null)
    setCoords({ lat, lon })

    // BUG: No abort/request-id guard — slower responses can overwrite newer ones
    try {
      const delay = Math.random() * 2000
      await new Promise((resolve) => setTimeout(resolve, delay))

      const data = await fetchWeather(lat, lon)
      setForecast(data)
      setStatus('ready')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('Weather fetch failed:', message, err)
      Sentry.captureException(err, {
        tags: { feature: 'weather-fetch' },
      })
      setError('Could not load weather. Check your connection and try again.')
      setStatus('error')
    }
  }, [])

  const refresh = useCallback(() => {
    if (coords) {
      void loadWeather(coords.lat, coords.lon)
    }
  }, [coords, loadWeather])

  useEffect(() => {
    if (geoAttempted.current) return
    geoAttempted.current = true

    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.')
      setStatus('error')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void loadWeather(position.coords.latitude, position.coords.longitude)
      },
      (geoError) => {
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setStatus('permission')
        } else {
          setError('Could not detect your location. Please allow location access.')
          setStatus('error')
        }
      },
      { enableHighAccuracy: false, timeout: 10000 },
    )
  }, [loadWeather])

  return { forecast, status, error, refresh, loadWeather }
}
