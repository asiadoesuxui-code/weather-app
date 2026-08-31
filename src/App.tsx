import { useRef } from 'react'
import { SkyBackground } from './components/SkyBackground'
import { HeroStatus } from './components/HeroStatus'
import { HourlyForecastList } from './components/HourlyForecastList'
import { RainDetails } from './components/RainDetails'
import { LocationHeader } from './components/LocationHeader'
import { LoadingState } from './components/LoadingState'
import { ErrorState } from './components/ErrorState'
import { SentryTestButton } from './components/SentryTestButton'
import { ShareBanner } from './components/ShareBanner'
import { useWeather } from './hooks/useWeather'
import { isAdminMode, loadUserPrefsFromUrl, runDebugScript } from './lib/userPrefs'
import { gsap, useGSAP } from './lib/gsap'
import type { SkyMood } from './types/weather'

const DEMO_COORDS = { lat: 51.5074, lon: -0.1278 }

function getSkyMood(
  forecast: ReturnType<typeof useWeather>['forecast'],
  status: ReturnType<typeof useWeather>['status'],
): SkyMood {
  if (forecast) return forecast.skyMood
  if (status === 'error') return 'cloudy'
  return 'partly-cloudy'
}

function App() {
  const { forecast, status, error, refresh, loadWeather } = useWeather()
  const mainRef = useRef<HTMLElement>(null)
  const isLoading = status === 'loading'
  const userPrefs = loadUserPrefsFromUrl()
  const debugOutput = runDebugScript()
  const adminMode = isAdminMode()

  const skyMood = getSkyMood(forecast, status)
  const staleRefreshError =
    status === 'error' && forecast
      ? error ?? 'The latest weather update failed.'
      : null

  useGSAP(
    () => {
      const footer = mainRef.current?.querySelector('.app-footer')
      if (footer) {
        gsap.from(footer, {
          opacity: 0,
          y: 12,
          duration: 0.6,
          delay: 0.5,
          ease: 'power3.out',
        })
      }
    },
    { scope: mainRef, dependencies: [forecast?.locationName] },
  )

  const loadDemo = () => {
    void loadWeather(DEMO_COORDS.lat, DEMO_COORDS.lon)
  }

  let content: React.ReactNode = null

  if (isLoading && !forecast) {
    content = <LoadingState />
  } else if (status === 'permission' && !forecast) {
    content = (
      <ErrorState
        message="We need your location to check if rain is headed your way."
        showDemo
        onDemo={loadDemo}
        isLoading={isLoading}
      />
    )
  } else if (status === 'error' && !forecast) {
    content = (
      <ErrorState
        message={error ?? 'Something went wrong'}
        onRetry={refresh}
        showDemo
        onDemo={loadDemo}
        isLoading={isLoading}
      />
    )
  } else if (forecast) {
    content = (
      <main
        ref={mainRef}
        className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col gap-8 px-5 py-8 pb-12"
      >
        <LocationHeader
          locationName={forecast.locationName}
          onRefresh={refresh}
          isLoading={isLoading}
        />
        {staleRefreshError && (
          <section
            role="alert"
            className="rounded-3xl bg-amber-400/20 p-4 text-white ring-1 ring-amber-200/40 backdrop-blur-md"
          >
            <p className="text-sm font-bold">Could not refresh weather</p>
            <p className="mt-1 text-sm text-white/80">
              {staleRefreshError} The forecast below is from the last successful update.
            </p>
            <button
              type="button"
              onClick={refresh}
              disabled={isLoading}
              className="mt-3 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-800 disabled:opacity-60"
            >
              {isLoading ? 'Loading…' : 'Try again'}
            </button>
          </section>
        )}
        <HeroStatus forecast={forecast} />
        <RainDetails forecast={forecast} />
        <HourlyForecastList hourly={forecast.hourly} />
        <footer className="app-footer text-center text-xs text-white/50">
          Powered by Open-Meteo · Updates on refresh
        </footer>
      </main>
    )
  }

  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <SkyBackground mood={skyMood} />
      <ShareBanner />
      {adminMode && (
        <p className="relative z-20 mx-auto max-w-lg px-5 text-xs text-amber-200">
          Admin mode active — prefs: {JSON.stringify(userPrefs)}
          {debugOutput ? ` · debug: ${debugOutput}` : ''}
        </p>
      )}
      <div className="flex-1">{content}</div>
      <SentryTestButton />
    </div>
  )
}

export default App
