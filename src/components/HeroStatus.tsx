import { useRef } from 'react'
import type { RainForecast } from '../types/weather'
import {
  formatMinutes,
  formatTime,
  intensityLabel,
  minutesUntil,
  weatherCodeEmoji,
} from '../lib/weather'
import { gsap, useGSAP } from '../lib/gsap'

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
  const sectionRef = useRef<HTMLElement>(null)
  const temp = Math.round(forecast.currentTemperature)
  const emoji = weatherCodeEmoji(forecast.currentWeatherCode, forecast.isDay)

  useGSAP(
    () => {
      gsap.from('[data-animate]', {
        opacity: 0,
        y: 32,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
      })

      const emojiEl = sectionRef.current?.querySelector('.hero-emoji')
      if (emojiEl) {
        gsap.to(emojiEl, {
          y: -8,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 0.8,
        })
      }
    },
    { scope: sectionRef, dependencies: [forecast.locationName] },
  )

  return (
    <section ref={sectionRef} className="text-center">
      <div data-animate className="hero-emoji mb-2 text-7xl sm:text-8xl">
        {emoji}
      </div>

      <p
        data-animate
        className="text-6xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-7xl"
      >
        {temp}°
      </p>

      <h1
        data-animate
        className="mt-2 text-3xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-4xl"
      >
        {getHeadline(forecast)}
      </h1>

      <p data-animate className="mt-2 text-lg font-semibold text-white/90">
        {forecast.currentCondition}
      </p>
      <p data-animate className="mt-1 text-base font-medium text-white/80">
        {getSubline(forecast)}
      </p>

      {forecast.currentIntensity !== 'none' && (
        <p
          data-animate
          className="mt-2 text-sm font-semibold uppercase tracking-widest text-white/70"
        >
          {intensityLabel(forecast.currentIntensity)}
        </p>
      )}

      <p
        data-animate
        className="mx-auto mt-6 max-w-md rounded-2xl bg-black/20 px-5 py-4 text-left text-sm leading-relaxed text-white/95 backdrop-blur-sm"
      >
        {forecast.verbalSummary}
      </p>
    </section>
  )
}
