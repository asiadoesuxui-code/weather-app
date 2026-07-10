import type { SkyMood } from '../types/weather'

interface SkyBackgroundProps {
  mood: SkyMood
}

const MOOD_GRADIENTS: Record<SkyMood, string> = {
  sunny: 'from-sky-400 via-sky-300 to-amber-200',
  'partly-cloudy': 'from-sky-500 via-slate-300 to-slate-200',
  cloudy: 'from-slate-500 via-slate-400 to-slate-300',
  foggy: 'from-slate-400 via-slate-300 to-slate-200',
  drizzle: 'from-slate-600 via-slate-500 to-slate-400',
  rainy: 'from-slate-700 via-slate-600 to-slate-500',
  stormy: 'from-indigo-950 via-slate-800 to-slate-700',
  'night-clear': 'from-indigo-950 via-indigo-900 to-slate-900',
  'night-cloudy': 'from-slate-900 via-slate-800 to-slate-700',
}

const SUN_RAY_COUNT = 10

export function SkyBackground({ mood }: SkyBackgroundProps) {
  const showSun = mood === 'sunny'
  const showMoon = mood === 'night-clear'
  const showClouds = ['partly-cloudy', 'cloudy', 'night-cloudy', 'foggy'].includes(mood)

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <div className={`absolute inset-0 bg-gradient-to-b ${MOOD_GRADIENTS[mood]}`} />

      {showSun && (
        <div className="absolute -top-16 right-6 h-44 w-44">
          {Array.from({ length: SUN_RAY_COUNT }).map((_, index) => (
            <div
              key={index}
              className="absolute left-1/2 top-1/2 h-28 w-1 -translate-x-1/2 -translate-y-full rounded-full bg-gradient-to-t from-yellow-200/0 via-yellow-200/30 to-yellow-100/50 opacity-25"
              style={{ rotate: `${index * (360 / SUN_RAY_COUNT)}deg` }}
            />
          ))}
          <div className="absolute inset-0 rounded-full bg-yellow-300/80 blur-md" />
        </div>
      )}

      {showMoon && (
        <div className="absolute top-10 right-10 h-16 w-16 rounded-full bg-slate-100/90 shadow-[0_0_40px_rgba(255,255,255,0.35)]" />
      )}

      {showClouds && (
        <>
          <div className="absolute top-16 left-[8%] h-20 w-36 rounded-full bg-white/30 blur-md" />
          <div className="absolute top-28 right-[12%] h-24 w-44 rounded-full bg-white/25 blur-lg" />
          <div className="absolute top-40 left-[40%] h-16 w-32 rounded-full bg-white/20 blur-md" />
        </>
      )}

      {mood === 'foggy' && (
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
      )}
    </div>
  )
}
