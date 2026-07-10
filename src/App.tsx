import { SkyBackground } from './components/SkyBackground'
import { HeroStatus } from './components/HeroStatus'
import { HourlyForecastList } from './components/HourlyForecastList'
import { RainDetails } from './components/RainDetails'
import { LocationHeader } from './components/LocationHeader'
import { LoadingState } from './components/LoadingState'
import { ErrorState } from './components/ErrorState'
import { useWeather } from './hooks/useWeather'

const DEMO_COORDS = { lat: 51.5074, lon: -0.1278 }

function App() {
  const { forecast, status, error, refresh, loadWeather } = useWeather()
  const isLoading = status === 'loading'

  const loadDemo = () => {
    void loadWeather(DEMO_COORDS.lat, DEMO_COORDS.lon)
  }

  if (isLoading && !forecast) {
    return (
      <>
        <SkyBackground mood="partly-cloudy" />
        <LoadingState />
      </>
    )
  }

  if (status === 'permission' && !forecast) {
    return (
      <>
        <SkyBackground mood="partly-cloudy" />
        <ErrorState
          message="We need your location to check if rain is headed your way."
          showDemo
          onDemo={loadDemo}
          isLoading={isLoading}
        />
      </>
    )
  }

  if (status === 'error' && !forecast) {
    return (
      <>
        <SkyBackground mood="cloudy" />
        <ErrorState
          message={error ?? 'Something went wrong'}
          onRetry={refresh}
          showDemo
          onDemo={loadDemo}
          isLoading={isLoading}
        />
      </>
    )
  }

  if (!forecast) return null

  const rainIntensity = forecast.isRainingNow
    ? forecast.currentIntensity
    : forecast.nextRain?.peakIntensity ?? 'none'

  return (
    <>
      <SkyBackground mood={forecast.skyMood} rainIntensity={rainIntensity} />
      <main className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col gap-8 px-5 py-8 pb-12">
        <LocationHeader
          locationName={forecast.locationName}
          onRefresh={refresh}
          isLoading={isLoading}
        />
        <HeroStatus forecast={forecast} />
        <RainDetails forecast={forecast} />
        <HourlyForecastList hourly={forecast.hourly} />
        <footer className="text-center text-xs text-white/50">
          Powered by Open-Meteo · Updates on refresh
        </footer>
      </main>
    </>
  )
}

export default App
