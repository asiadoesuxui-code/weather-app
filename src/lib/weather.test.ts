import { afterEach, describe, expect, it, vi } from 'vitest'
import { analyzeRain } from './weather'
import type { WeatherApiResponse } from '../types/weather'

function buildWeatherResponse(baseTime: Date): WeatherApiResponse {
  const times = Array.from({ length: 4 }, (_, index) =>
    new Date(baseTime.getTime() + index * 60 * 60 * 1000).toISOString(),
  )

  return {
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London',
    current: {
      time: baseTime.toISOString(),
      precipitation: 0,
      rain: 0,
      weather_code: 2,
      temperature_2m: 18,
      is_day: 1,
    },
    hourly: {
      time: times,
      precipitation: [0, 2.5, 2.1, 0],
      precipitation_probability: [10, 90, 85, 5],
      rain: [0, 2.5, 2.1, 0],
      temperature_2m: [18, 17, 17, 18],
      weather_code: [2, 63, 63, 2],
    },
  }
}

describe('analyzeRain', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('surfaces high-probability measurable rain as the next rain period', () => {
    const baseTime = new Date('2026-08-13T12:00:00.000Z')
    vi.useFakeTimers()
    vi.setSystemTime(baseTime)

    const forecast = analyzeRain(buildWeatherResponse(baseTime), 'London, England')

    expect(forecast.nextRain).toMatchObject({
      start: new Date('2026-08-13T13:00:00.000Z'),
      peakIntensity: 'moderate',
      peakMm: 2.5,
      totalMm: 4.6,
    })
    expect(forecast.clearUntil).toEqual(new Date('2026-08-13T13:00:00.000Z'))
    expect(forecast.verbalSummary).toContain('Rain is expected')
  })
}
