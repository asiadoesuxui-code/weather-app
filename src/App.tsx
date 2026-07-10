import { useRef } from 'react'
import { SkyBackground } from './components/SkyBackground'
import { HeroStatus } from './components/HeroStatus'
import { HourlyForecastList } from './components/HourlyForecastList'
import { RainDetails } from './components/RainDetails'
import { LocationHeader } from './components/LocationHeader'
import { LoadingState } from './components/LoadingState'
import { ErrorState } from './components/ErrorState'
import { useWeather } from './hooks/useWeather'
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

  const skyMood = getSkyMood(forecast, status)

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
    <>
      <SkyBackground mood={skyMood} />
      {content}
    </>
  )
}

export default App
