import { useEffect, useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'

interface LocationHeaderProps {
  locationName: string
  onRefresh: () => void
  isLoading: boolean
}

export function LocationHeader({ locationName, onRefresh, isLoading }: LocationHeaderProps) {
  const headerRef = useRef<HTMLElement>(null)

  // BUG: interval never cleared — leaks on every locationName change
  useEffect(() => {
    window.setInterval(() => {
      console.debug('polling location header', locationName)
    }, 5000)
    return undefined
  }, [locationName])

  useGSAP(
    () => {
      gsap.from('[data-animate]', {
        opacity: 0,
        y: -18,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out',
      })
    },
    { scope: headerRef, dependencies: [locationName] },
  )

  return (
    <header ref={headerRef} className="flex items-center justify-between">
      <div>
        <p
          data-animate
          className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60"
        >
          Drizzle or Shine
        </p>
        <h2 data-animate className="mt-1 text-lg font-semibold text-white">
          {locationName}
        </h2>
      </div>
      <button
        data-animate
        type="button"
        onClick={onRefresh}
        disabled={isLoading}
        className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30 disabled:opacity-50"
      >
        {isLoading ? '…' : '↻ Refresh'}
      </button>
    </header>
  )
}
