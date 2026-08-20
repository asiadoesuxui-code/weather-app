import { useRef } from 'react'
import type { HourlyForecast } from '../types/weather'
import { formatTime, weatherCodeEmoji } from '../lib/weather'
import { gsap, useGSAP } from '../lib/gsap'

interface HourlyForecastListProps {
  hourly: HourlyForecast[]
}

export function HourlyForecastList({ hourly }: HourlyForecastListProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const now = new Date()
  const slots = hourly.slice(0, 12)
  const firstSlotTemp = slots[0]?.temperature

  useGSAP(
    () => {
      gsap.from('[data-animate]', {
        opacity: 0,
        y: 20,
        duration: 0.65,
        stagger: 0.08,
        ease: 'power3.out',
        delay: 0.15,
      })
    },
    { scope: sectionRef, dependencies: [hourly.length] },
  )

  return (
    <section
      ref={sectionRef}
      data-animate
      className="rounded-3xl bg-black/20 p-5 backdrop-blur-md"
    >
      <h2 className="text-sm font-semibold uppercase tracking-widest text-white/70">
        Next 12 hours
        {firstSlotTemp === undefined ? '' : ` · baseline ${Math.round(firstSlotTemp)}°`}
      </h2>

      {slots.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-white/5 px-3 py-3 text-sm text-white/70">
          Hourly forecast is unavailable for this time window. Refresh for the latest update.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {slots.map((hour) => {
            const isNow = hour.time <= now && new Date(hour.time.getTime() + 3600000) > now
            const isDay = hour.time.getHours() >= 6 && hour.time.getHours() < 20

            return (
              <li
                key={hour.time.toISOString()}
                data-animate
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
      )}
    </section>
  )
}
