interface SentryBreadcrumb {
  message?: string
  data?: Record<string, unknown>
  [key: string]: unknown
}

interface SentryRequest {
  url?: string
  query_string?: string
  [key: string]: unknown
}

interface SentryLikeEvent {
  extra?: Record<string, unknown>
  request?: SentryRequest
  breadcrumbs?: SentryBreadcrumb[]
  [key: string]: unknown
}

const LOCATION_PARAM_NAMES = new Set(['lat', 'lon', 'latitude', 'longitude'])

function hasLocationParam(name: string): boolean {
  return LOCATION_PARAM_NAMES.has(name.toLowerCase())
}

function scrubLocationParams(value: string): string {
  const hasScheme = /^[a-z][a-z\d+\-.]*:/i.test(value)

  try {
    const url = new URL(value, 'https://weather-app.local')
    let changed = false

    for (const name of Array.from(url.searchParams.keys())) {
      if (hasLocationParam(name)) {
        url.searchParams.set(name, '[Filtered]')
        changed = true
      }
    }

    if (!changed) return value
    if (hasScheme) return url.toString()
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return value.replace(
      /([?&](?:lat|lon|latitude|longitude)=)[^&#]*/gi,
      '$1[Filtered]',
    )
  }
}

function scrubData(data: Record<string, unknown>): Record<string, unknown> {
  let next: Record<string, unknown> | null = null

  for (const [key, value] of Object.entries(data)) {
    let scrubbed: unknown = value

    if (hasLocationParam(key)) {
      scrubbed = '[Filtered]'
    } else if (typeof value === 'string') {
      scrubbed = scrubLocationParams(value)
    }

    if (scrubbed !== value) {
      next ??= { ...data }
      next[key] = scrubbed
    }
  }

  return next ?? data
}

function scrubBreadcrumb(breadcrumb: SentryBreadcrumb): SentryBreadcrumb {
  const message =
    typeof breadcrumb.message === 'string'
      ? scrubLocationParams(breadcrumb.message)
      : breadcrumb.message
  const data = breadcrumb.data ? scrubData(breadcrumb.data) : breadcrumb.data

  if (message === breadcrumb.message && data === breadcrumb.data) {
    return breadcrumb
  }

  return { ...breadcrumb, message, data }
}

export function scrubSentryEventLocation<T extends SentryLikeEvent>(event: T): T {
  const extra = event.extra ? scrubData(event.extra) : event.extra
  const request = event.request
    ? {
        ...event.request,
        url:
          typeof event.request.url === 'string'
            ? scrubLocationParams(event.request.url)
            : event.request.url,
        query_string:
          typeof event.request.query_string === 'string'
            ? scrubLocationParams(`?${event.request.query_string}`).slice(1)
            : event.request.query_string,
      }
    : event.request
  const breadcrumbs = event.breadcrumbs?.map(scrubBreadcrumb)

  if (
    extra === event.extra &&
    request === event.request &&
    breadcrumbs === event.breadcrumbs
  ) {
    return event
  }

  return { ...event, extra, request, breadcrumbs }
}
