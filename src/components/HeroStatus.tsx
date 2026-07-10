import type { RainForecast } from '../types/weather'
import {
  formatMinutes,
  formatTime,
  intensityLabel,
  minutesUntil,
  weatherCodeEmoji,
} from '../lib/weather'

interface HeroStatusProps {
  forecast: RainForecast
}

function getHeadline(forecast: RainForecast): string {
  if (forecast.isRainingNow) return "It's raining!"
  if (forecast.nextRain) {
    const startsIn = minutesUntil(forecast.nextRain.start)
    return startsIn < 90 ? 'Rain on the way' : 'Rain later today'
  }
  return 'All clear!'
}

function getSubline(forecast: RainForecast): string {
  if (forecast.isRainingNow && forecast.activeRain) {
    const endsIn = minutesUntil(forecast.activeRain.end)
    return endsIn < 60
      ? `Should ease off ${formatMinutes(endsIn)}`
      : `Likely until around ${formatTime(forecast.activeRain.end)}`
  }

  if (forecast.nextRain) {
    const startsIn = minutesUntil(forecast.nextRain.start)
    return `Starts ${formatMinutes(startsIn)} · around ${formatTime(forecast.nextRain.start)}`
  }

  if (forecast.clearUntil) {
    return `Dry until at least ${formatTime(forecast.clearUntil)}`
  }

  return 'No rain on the horizon'
}

export function HeroStatus({ forecast }: HeroStatusProps) {
  const temp = Math.round(forecast.currentTemperature)
  const emoji = forecast.isRainingNow
    ? weatherCodeEmoji(forecast.currentWeatherCode, forecast.isDay)
    : weatherCodeEmoji(forecast.currentWeatherCode, forecast.isDay)

  return (
    <section className="text-center">
      <div className="animate-float mb-2 text-7xl sm:text-8xl">{emoji}</div>

      <p className="text-6xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-7xl">
        {temp}°
      </p>

      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-4xl">
        {getHeadline(forecast)}
      </h1>

      <p className="mt-2 text-lg font-semibold text-white/90">{forecast.currentCondition}</p>
      <p className="mt-1 text-base font-medium text-white/80">{getSubline(forecast)}</p>

      {forecast.currentIntensity !== 'none' && (
        <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-white/70">
          {intensityLabel(forecast.currentIntensity)}
        </p>
      )}

      <p className="mx-auto mt-6 max-w-md rounded-2xl bg-black/20 px-5 py-4 text-left text-sm leading-relaxed text-white/95 backdrop-blur-sm">
        {forecast.verbalSummary}
      </p>
    </section>
  )
}
