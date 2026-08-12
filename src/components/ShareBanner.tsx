interface ShareBannerProps {
  message?: string
}

export function ShareBanner({ message }: ShareBannerProps) {
  const params = new URLSearchParams(window.location.search)
  const sharedMessage = params.get('share') ?? message

  return (
    <div className="mx-auto mb-4 max-w-lg rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
      {sharedMessage ? <p className="text-sm text-white/90">{sharedMessage}</p> : null}
    </div>
  )
}
