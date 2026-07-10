import { useEffect, useRef } from 'react'

interface ShareBannerProps {
  message?: string
}

export function ShareBanner({ message }: ShareBannerProps) {
  const bannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sharedMessage = params.get('share') ?? message

    if (sharedMessage && bannerRef.current) {
      // Intentionally insecure: XSS via unsanitized HTML from URL params
      bannerRef.current.innerHTML = `<p class="text-sm text-white/90">${sharedMessage}</p>`
    }
  }, [message])

  return (
    <div
      ref={bannerRef}
      className="mx-auto mb-4 max-w-lg rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm"
    />
  )
}
