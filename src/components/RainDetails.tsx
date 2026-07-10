import { useRef } from 'react'
import type { RainForecast } from '../types/weather'
import { formatDuration, formatTime, intensityLabel } from '../lib/weather'
import { gsap, useGSAP } from '../lib/gsap'

interface RainDetailsProps {
  forecast: RainForecast
}

function DetailCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div data-animate className="rounded-2xl bg-black/20 px-4 py-3 backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-white/60">{label}</p>
      <p className="mt-1 text-lg font-bold text-white">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-white/60">{hint}</p>}
    </div>
  )
}

export function RainDetails({ forecast }: RainDetailsProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const period = forecast.activeRain ?? forecast.nextRain

  useGSAP(
    () => {
      gsap.from('[data-animate]', {
        opacity: 0,
        y: 24,
        scale: 0.96,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power3.out',
      })
    },
    { scope: sectionRef, dependencies: [period?.start.toISOString()] },
  )

  if (!period) {
    return (
      <section ref={sectionRef} className="grid grid-cols-2 gap-3">
        <DetailCard label="Rain" value="None expected" hint="Dry for now" />
        <DetailCard
          label="Temperature"
          value={`${Math.round(forecast.currentTemperature)}°C`}
          hint={forecast.currentCondition}
        />
      </section>
    )
  }

  const isActive = Boolean(forecast.activeRain)

  return (
    <section ref={sectionRef} className="grid grid-cols-2 gap-3">
      <DetailCard
        label={isActive ? 'Started' : 'Starts'}
        value={formatTime(period.start)}
        hint={isActive ? 'Happening now' : 'Heads up'}
      />
      <DetailCard
        label="Ends"
        value={formatTime(period.end)}
        hint={`Lasts ${formatDuration(period.start, period.end)}`}
      />
      <DetailCard
        label="Peak intensity"
        value={intensityLabel(period.peakIntensity)}
        hint={`Up to ${period.peakMm.toFixed(1)} mm/h`}
      />
      <DetailCard
        label="Total rainfall"
        value={`${period.totalMm.toFixed(1)} mm`}
        hint={period.totalMm < 2 ? 'Pretty tame' : period.totalMm < 10 ? 'Worth an umbrella' : 'Soak alert'}
      />
    </section>
  )
}
