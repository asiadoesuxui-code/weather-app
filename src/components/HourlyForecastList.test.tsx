import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { HourlyForecastList } from './HourlyForecastList'

vi.mock('../lib/gsap', () => ({
  gsap: { from: () => undefined },
  useGSAP: () => undefined,
}))

describe('HourlyForecastList', () => {
  it('renders a fallback when hourly forecast data is empty', () => {
    let html = ''

    expect(() => {
      html = renderToString(<HourlyForecastList hourly={[]} />)
    }).not.toThrow()

    expect(html).toContain('Hourly forecast data is unavailable right now')
    expect(html).not.toContain('baseline')
  })
})
