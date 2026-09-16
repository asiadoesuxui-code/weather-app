import { describe, expect, it } from 'vitest'
import { analyzeRain } from './weather'
import type { WeatherApiResponse } from '../types/weather'

function makeWeatherData(): WeatherApiResponse {
  return {
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London',
    current: {
      time: '2026-09-16T12:15:00',
      precipitation: 1,
      rain: 1,
      weather_code: 61,
      temperature_2m: 16,
      is_day: 1,
    },
    hourly: {
      time: ['2026-09-16T12:00:00', '2026-09-16T13:00:00'],
      precipitation: [1, 0],
      precipitation_probability: [10, 0],
      rain: [1, 0],
      temperature_2m: [16, 17],
      weather_code: [61, 3],
    },
  }
}

describe('analyzeRain', () => {
  it('keeps the current hourly bucket when current time is mid-hour', () => {
    const forecast = analyzeRain(makeWeatherData(), 'London, England')
    const currentHour = new Date('2026-09-16T12:00:00')
    const nextHour = new Date('2026-09-16T13:00:00')

    expect(forecast.hourly.map((hour) => hour.time.getTime())).toEqual([
      currentHour.getTime(),
      nextHour.getTime(),
    ])
    expect(forecast.activeRain?.start.getTime()).toBe(currentHour.getTime())
    expect(forecast.activeRain?.end.getTime()).toBe(nextHour.getTime())
  })
})
