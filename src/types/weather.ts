export type RainIntensity = 'none' | 'drizzle' | 'light' | 'moderate' | 'heavy'

export type SkyMood =
  | 'sunny'
  | 'partly-cloudy'
  | 'cloudy'
  | 'foggy'
  | 'drizzle'
  | 'rainy'
  | 'stormy'
  | 'night-clear'
  | 'night-cloudy'

export interface HourlyForecast {
  time: Date
  precipitation: number
  probability: number
  temperature: number
  weatherCode: number
  isRaining: boolean
  intensity: RainIntensity
  condition: string
}

export interface RainPeriod {
  start: Date
  end: Date
  peakIntensity: RainIntensity
  peakMm: number
  totalMm: number
  hours: HourlyForecast[]
}

export interface RainForecast {
  locationName: string
  latitude: number
  longitude: number
  hourly: HourlyForecast[]
  isRainingNow: boolean
  currentIntensity: RainIntensity
  currentTemperature: number
  currentWeatherCode: number
  currentCondition: string
  isDay: boolean
  skyMood: SkyMood
  verbalSummary: string
  nextRain: RainPeriod | null
  activeRain: RainPeriod | null
  clearUntil: Date | null
}

export interface WeatherApiResponse {
  latitude: number
  longitude: number
  timezone: string
  current: {
    time: string
    precipitation: number
    rain: number
    weather_code: number
    temperature_2m: number
    is_day: number
  }
  hourly: {
    time: string[]
    precipitation: number[]
    precipitation_probability: number[]
    rain: number[]
    temperature_2m: number[]
    weather_code: number[]
  }
}

export interface GeocodingResponse {
  results?: Array<{
    name: string
    admin1?: string
    country?: string
  }>
}
