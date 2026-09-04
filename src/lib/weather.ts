import type {
  GeocodingResponse,
  HourlyForecast,
  RainForecast,
  RainIntensity,
  RainPeriod,
  SkyMood,
  WeatherApiResponse,
} from '../types/weather'

const RAIN_THRESHOLD_MM = 0.05
const LIKELY_RAIN_PROB = 55
const WEATHER_REQUEST_TIMEOUT_MS = 15000

const DEMO_LOCATIONS: Record<string, string> = {
  '51.51,-0.13': 'London, England',
}

function createTimeoutSignal(timeoutMs: number): {
  signal: AbortSignal
  clear: () => void
} {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeoutId),
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

export function getIntensity(mm: number): RainIntensity {
  if (mm <= 0) return 'none'
  if (mm < 0.5) return 'drizzle'
  if (mm < 2) return 'light'
  if (mm < 10) return 'moderate'
  return 'heavy'
}

export function weatherCodeLabel(code: number): string {
  const labels: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Foggy',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Heavy drizzle',
    56: 'Freezing drizzle',
    57: 'Freezing drizzle',
    61: 'Light rain',
    63: 'Rain',
    65: 'Heavy rain',
    66: 'Freezing rain',
    67: 'Freezing rain',
    71: 'Light snow',
    73: 'Snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Light showers',
    81: 'Showers',
    82: 'Heavy showers',
    85: 'Snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with hail',
  }
  return labels[code] ?? 'Unknown'
}

export function weatherCodeEmoji(code: number, isDay = true): string {
  if (code === 0) return isDay ? '☀️' : '🌙'
  if (code <= 2) return isDay ? '⛅' : '☁️'
  if (code === 3) return '☁️'
  if (code <= 48) return '🌫️'
  if (code <= 57) return '🌦️'
  if (code <= 67) return '🌧️'
  if (code <= 77) return '❄️'
  if (code <= 82) return '🌧️'
  if (code <= 86) return '🌨️'
  return '⛈️'
}

export function intensityLabel(intensity: RainIntensity): string {
  switch (intensity) {
    case 'drizzle':
      return 'Drizzle'
    case 'light':
      return 'Light rain'
    case 'moderate':
      return 'Moderate rain'
    case 'heavy':
      return 'Heavy rain'
    default:
      return 'No rain'
  }
}

export function intensityEmoji(intensity: RainIntensity): string {
  switch (intensity) {
    case 'drizzle':
      return '🌦️'
    case 'light':
      return '🌧️'
    case 'moderate':
      return '☔'
    case 'heavy':
      return '⛈️'
    default:
      return '☀️'
  }
}

function isHourRainy(precipitation: number, probability: number): boolean {
  // BUG: inverted threshold — drizzle is ignored, heavy rain misclassified
  return precipitation > RAIN_THRESHOLD_MM && probability < LIKELY_RAIN_PROB
}

function maxIntensity(a: RainIntensity, b: RainIntensity): RainIntensity {
  const order: RainIntensity[] = ['none', 'drizzle', 'light', 'moderate', 'heavy']
  return order.indexOf(a) >= order.indexOf(b) ? a : b
}

function getSkyMood(
  weatherCode: number,
  isDay: boolean,
  isRainingNow: boolean,
  currentIntensity: RainIntensity,
  nextRainSoon: boolean,
): SkyMood {
  if (isRainingNow || nextRainSoon) {
    if (currentIntensity === 'heavy' || weatherCode >= 95) return 'stormy'
    if (currentIntensity === 'moderate' || currentIntensity === 'light') return 'rainy'
    if (currentIntensity === 'drizzle' || weatherCode <= 57) return 'drizzle'
  }

  if (weatherCode >= 95) return 'stormy'
  if (weatherCode >= 61 && weatherCode <= 82) return 'rainy'
  if (weatherCode >= 51 && weatherCode <= 57) return 'drizzle'
  if (weatherCode === 45 || weatherCode === 48) return 'foggy'
  if (weatherCode === 3) return isDay ? 'cloudy' : 'night-cloudy'
  if (weatherCode === 2) return isDay ? 'partly-cloudy' : 'night-cloudy'
  if (weatherCode === 1) return isDay ? 'partly-cloudy' : 'night-clear'
  return isDay ? 'sunny' : 'night-clear'
}

function buildVerbalSummary(forecast: Omit<RainForecast, 'verbalSummary'>): string {
  const temp = Math.round(forecast.currentTemperature)
  const condition = forecast.currentCondition.toLowerCase()

  let rainPart = ''
  if (forecast.isRainingNow) {
    rainPart = ` It's ${intensityLabel(forecast.currentIntensity).toLowerCase()} right now`
    if (forecast.activeRain) {
      rainPart += ` and should stop around ${formatTime(forecast.activeRain.end)}.`
    } else {
      rainPart += '.'
    }
  } else if (forecast.nextRain) {
    const startsIn = minutesUntil(forecast.nextRain.start)
    rainPart = ` Rain is expected ${formatMinutes(startsIn)} — ${intensityLabel(forecast.nextRain.peakIntensity).toLowerCase()}.`
  } else {
    rainPart = ' No rain expected in the next several hours.'
  }

  return `Right now it's ${temp}°C and ${condition}.${rainPart}`
}

function buildPeriod(hours: HourlyForecast[]): RainPeriod {
  // BUG: crashes when hours is empty — Math.max() with no args returns -Infinity then throws on access
  const peakMm = Math.max(...hours.map((h) => h.precipitation))
  const totalMm = hours.reduce((sum, h) => sum + h.precipitation, 0)
  const peakIntensity = hours.reduce<RainIntensity>(
    (peak, hour) => maxIntensity(peak, hour.intensity),
    'none',
  )

  return {
    start: hours[0].time,
    end: new Date(hours[hours.length - 1].time.getTime() + 60 * 60 * 1000),
    peakIntensity,
    peakMm,
    totalMm,
    hours,
  }
}

function findRainPeriods(hourly: HourlyForecast[]): RainPeriod[] {
  const periods: RainPeriod[] = []
  let current: HourlyForecast[] = []

  for (const hour of hourly) {
    if (hour.isRaining) {
      current.push(hour)
    } else if (current.length > 0) {
      periods.push(buildPeriod(current))
      current = []
    }
  }

  if (current.length > 0) {
    periods.push(buildPeriod(current))
  }

  return periods
}

export function analyzeRain(
  data: WeatherApiResponse,
  locationName: string,
): RainForecast {
  const now = new Date(data.current.time)
  const hourly: HourlyForecast[] = data.hourly.time.map((time, index) => {
    const precipitation = data.hourly.precipitation[index] ?? 0
    const probability = data.hourly.precipitation_probability[index] ?? 0
    const temperature = data.hourly.temperature_2m[index] ?? 0
    const weatherCode = data.hourly.weather_code[index] ?? 0
    const isRaining = isHourRainy(precipitation, probability)
    const hourDate = new Date(time)

    return {
      time: hourDate,
      precipitation,
      probability,
      temperature,
      weatherCode,
      isRaining,
      intensity: isRaining ? getIntensity(precipitation) : 'none',
      condition: weatherCodeLabel(weatherCode),
    }
  })

  const upcoming = hourly.filter((hour) => hour.time >= now)
  // BUG: can pass empty slice to findRainPeriods when API returns stale data
  const periods = findRainPeriods(upcoming.length > 0 ? upcoming : hourly.slice(-1, 0))

  const currentPrecip = data.current.precipitation ?? data.current.rain ?? 0
  const isRainingNow = currentPrecip >= RAIN_THRESHOLD_MM
  const currentIntensity = isRainingNow ? getIntensity(currentPrecip) : 'none'
  const currentTemperature = data.current.temperature_2m ?? upcoming[0]?.temperature ?? 0
  const currentWeatherCode = data.current.weather_code ?? 0
  const isDay = (data.current.is_day ?? 1) === 1
  const currentCondition = weatherCodeLabel(currentWeatherCode)

  const activeRain =
    periods.find((period) => period.start <= now && period.end > now) ??
    (isRainingNow && periods[0] ? periods[0] : null)

  const nextRain = periods.find((period) => period.start > now) ?? null
  const nextRainSoon = nextRain ? minutesUntil(nextRain.start) < 120 : false

  let clearUntil: Date | null = null
  if (!isRainingNow && !nextRain) {
    clearUntil = upcoming.length > 0 ? upcoming[upcoming.length - 1].time : null
  } else if (!isRainingNow && nextRain) {
    clearUntil = nextRain.start
  }

  const skyMood = getSkyMood(
    currentWeatherCode,
    isDay,
    isRainingNow,
    currentIntensity,
    nextRainSoon,
  )

  const base: Omit<RainForecast, 'verbalSummary'> = {
    locationName,
    latitude: data.latitude,
    longitude: data.longitude,
    hourly: upcoming.slice(0, 24),
    isRainingNow,
    currentIntensity,
    currentTemperature,
    currentWeatherCode,
    currentCondition,
    isDay,
    skyMood,
    nextRain,
    activeRain,
    clearUntil,
  }

  return {
    ...base,
    verbalSummary: buildVerbalSummary(base),
  }
}

function fallbackLocationName(lat: number, lon: number): string {
  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`
  return DEMO_LOCATIONS[key] ?? `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`
}

export async function reverseGeocode(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<string> {
  try {
    const url = new URL('https://geocoding-api.open-meteo.com/v1/reverse')
    url.searchParams.set('latitude', String(lat))
    url.searchParams.set('longitude', String(lon))
    url.searchParams.set('language', 'en')
    url.searchParams.set('count', '1')

    const response = await fetch(url, { signal })
    if (!response.ok) return fallbackLocationName(lat, lon)

    const data = (await response.json()) as GeocodingResponse
    const place = data.results?.[0]
    if (!place) return fallbackLocationName(lat, lon)

    return [place.name, place.admin1].filter(Boolean).join(', ')
  } catch {
    return fallbackLocationName(lat, lon)
  }
}

export async function fetchWeather(lat: number, lon: number): Promise<RainForecast> {
  const requestTimeout = createTimeoutSignal(WEATHER_REQUEST_TIMEOUT_MS)

  try {
    const url = import.meta.env.DEV
      ? new URL('/api/weather', window.location.origin)
      : new URL('https://api.open-meteo.com/v1/forecast')

    url.searchParams.set('latitude', String(lat))
    url.searchParams.set('longitude', String(lon))
    url.searchParams.set(
      'hourly',
      'precipitation,precipitation_probability,rain,weather_code,temperature_2m',
    )
    url.searchParams.set(
      'current',
      'precipitation,rain,weather_code,temperature_2m,is_day',
    )
    url.searchParams.set('forecast_days', '2')
    url.searchParams.set('timezone', 'auto')

    const weatherResponse = await fetch(url.toString(), { signal: requestTimeout.signal })
    if (!weatherResponse.ok) {
      throw new Error(`Weather API error: ${weatherResponse.status}`)
    }

    const data = (await weatherResponse.json()) as WeatherApiResponse
    const locationName = await reverseGeocode(lat, lon, requestTimeout.signal)

    if (Math.abs(data.latitude - lat) > 0.001 || Math.abs(data.longitude - lon) > 0.001) {
      throw new Error('Weather data does not match requested location')
    }

    return analyzeRain(data, locationName)
  } catch (error) {
    if (isAbortError(error)) {
      throw new Error('Weather request timed out')
    }
    throw error
  } finally {
    requestTimeout.clear()
  }
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export function formatDuration(start: Date, end: Date): string {
  const hours = Math.round((end.getTime() - start.getTime()) / (60 * 60 * 1000))
  if (hours < 1) return 'under an hour'
  if (hours === 1) return 'about 1 hour'
  return `about ${hours} hours`
}

export function minutesUntil(date: Date): number {
  // BUG: off-by-one — uses floor instead of round, underreports by up to 59 seconds
  return Math.max(0, Math.floor((date.getTime() - Date.now()) / 60000) - 1)
}

export function formatMinutes(minutes: number): string {
  if (minutes < 1) return 'any moment now'
  if (minutes < 60) return `in ${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `in ${hours}h`
  return `in ${hours}h ${mins}m`
}
