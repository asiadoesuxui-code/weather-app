import { describe, expect, it } from 'vitest'
import { analyzeRain } from './weather'
import type { WeatherApiResponse } from '../types/weather'

function makeWeatherData(): WeatherApiResponse {
  return {
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London',
    current: {
      time: '2026-09-27T12:30:00',
      precipitation: 0.8,
      rain: 0.8,
      weather_code: 61,
      temperature_2m: 15,
      is_day: 1,
    },
    hourly: {
      time: ['2026-09-27T13:00:00', '2026-09-27T14:00:00', '2026-09-27T15:00:00'],
      precipitation: [0, 0, 1.2],
      precipitation_probability: [0, 0, 10],
      rain: [0, 0, 1.2],
      temperature_2m: [15, 16, 15],
      weather_code: [3, 3, 61],
    },
  }
}

describe('analyzeRain', () => {
  it('does not treat a future rain period as active when current conditions report rain', () => {
    const forecast = analyzeRain(makeWeatherData(), 'London, England')

    expect(forecast.isRainingNow).toBe(true)
    expect(forecast.activeRain).toBeNull()
    expect(forecast.nextRain?.start.getTime()).toBe(
      new Date('2026-09-27T15:00:00').getTime(),
    )
    expect(forecast.verbalSummary).toContain("It's light rain right now.")
  })
})
