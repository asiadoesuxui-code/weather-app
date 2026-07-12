import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchWeather } from './weather'

const roundedWeatherResponse = {
  latitude: 51.5,
  longitude: -0.25,
  timezone: 'Europe/London',
  current: {
    time: '2026-01-01T00:00',
    precipitation: 0,
    rain: 0,
    weather_code: 2,
    temperature_2m: 8,
    is_day: 1,
  },
  hourly: {
    time: ['2026-01-01T00:00', '2026-01-01T01:00'],
    precipitation: [0, 0],
    precipitation_probability: [0, 0],
    rain: [0, 0],
    temperature_2m: [8, 7],
    weather_code: [2, 3],
  },
}

describe('fetchWeather', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('accepts provider grid coordinates that differ from the requested coordinates', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      const body = url.includes('geocoding-api')
        ? { results: [{ name: 'London', admin1: 'England' }] }
        : roundedWeatherResponse

      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    })

    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('window', { location: { origin: 'http://localhost' } })

    const forecast = await fetchWeather(51.5074, -0.1278)

    expect(forecast.locationName).toBe('London, England')
    expect(forecast.latitude).toBe(51.5)
    expect(forecast.longitude).toBe(-0.25)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
