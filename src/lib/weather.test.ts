import { afterEach, describe, expect, it, vi } from 'vitest'
import { analyzeRain } from './weather'
import type { WeatherApiResponse } from '../types/weather'

const BASE_TIME = '2026-07-12T05:00:00.000Z'

function makeWeatherData(overrides: Partial<WeatherApiResponse> = {}): WeatherApiResponse {
  const base: WeatherApiResponse = {
    latitude: 51.5,
    longitude: -0.13,
    timezone: 'UTC',
    current: {
      time: BASE_TIME,
      precipitation: 0,
      rain: 0,
      weather_code: 3,
      temperature_2m: 18,
      is_day: 1,
    },
    hourly: {
      time: ['2026-07-12T06:00:00.000Z'],
      precipitation: [10],
      precipitation_probability: [100],
      rain: [10],
      temperature_2m: [17],
      weather_code: [65],
    },
  }

  return {
    ...base,
    ...overrides,
    current: {
      ...base.current,
      ...overrides.current,
    },
    hourly: {
      ...base.hourly,
      ...overrides.hourly,
    },
  }
}

describe('analyzeRain', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('keeps high-probability heavy rain in upcoming rain periods', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(BASE_TIME))

    const forecast = analyzeRain(makeWeatherData(), 'London, England')

    expect(forecast.hourly[0].isRaining).toBe(true)
    expect(forecast.hourly[0].intensity).toBe('heavy')
    expect(forecast.nextRain?.peakIntensity).toBe('heavy')
    expect(forecast.verbalSummary).toContain('heavy rain')
  })
})
