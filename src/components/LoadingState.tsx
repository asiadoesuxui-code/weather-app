import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'

export function LoadingState() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.from('[data-animate]', {
        opacity: 0,
        y: 24,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power3.out',
      })

      const emoji = containerRef.current?.querySelector('.loading-emoji')
      if (emoji) {
        gsap.to(emoji, {
          y: -10,
          duration: 2.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 0.5,
        })
      }
    },
    { scope: containerRef },
  )

  return (
    <div
      ref={containerRef}
      className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center text-white"
    >
      <div data-animate className="loading-emoji text-6xl">
        🌦️
      </div>
      <p data-animate className="text-xl font-semibold drop-shadow-md">
        Checking the skies…
      </p>
      <p data-animate className="text-sm text-white/80 drop-shadow">
        Finding your location and scanning for raindrops
      </p>
    </div>
  )
}
