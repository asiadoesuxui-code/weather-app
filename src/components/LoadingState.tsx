export function LoadingState() {
  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center text-white">
      <div className="animate-float text-6xl">🌦️</div>
      <p className="text-xl font-semibold drop-shadow-md">Checking the skies…</p>
      <p className="text-sm text-white/80 drop-shadow">Finding your location and scanning for raindrops</p>
    </div>
  )
}
