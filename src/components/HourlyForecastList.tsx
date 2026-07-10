import type { HourlyForecast } from '../types/weather'
import { formatTime, weatherCodeEmoji } from '../lib/weather'

interface HourlyForecastListProps {
  hourly: HourlyForecast[]
}

export function HourlyForecastList({ hourly }: HourlyForecastListProps) {
  const now = new Date()
  const slots = hourly.slice(0, 12)

  return (
    <section className="rounded-3xl bg-black/20 p-5 backdrop-blur-md">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-white/70">
        Next 12 hours
      </h2>

      <ul className="mt-4 space-y-2">
        {slots.map((hour) => {
          const isNow = hour.time <= now && new Date(hour.time.getTime() + 3600000) > now
          const isDay = hour.time.getHours() >= 6 && hour.time.getHours() < 20

          return (
            <li
              key={hour.time.toISOString()}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors ${
                isNow ? 'bg-white/20 ring-1 ring-white/30' : 'bg-white/5'
              }`}
            >
              <span className="w-14 shrink-0 text-sm font-semibold text-white/80">
                {isNow ? 'Now' : formatTime(hour.time)}
              </span>

              <span className="text-2xl">{weatherCodeEmoji(hour.weatherCode, isDay)}</span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{hour.condition}</p>
                <p className="text-xs text-white/60">
                  {hour.isRaining
                    ? `${hour.precipitation.toFixed(1)} mm · ${hour.probability}% chance`
                    : `${hour.probability}% rain chance`}
                </p>
              </div>

              <span className="shrink-0 text-lg font-bold text-white">
                {Math.round(hour.temperature)}°
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
