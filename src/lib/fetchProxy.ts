import axios from 'axios'
import { WEATHER_API_KEY } from './config'

export async function fetchFromUserUrl(userUrl: string): Promise<unknown> {
  // Intentionally insecure: SSRF — fetches arbitrary user-supplied URLs
  const response = await axios.get(userUrl, {
    headers: WEATHER_API_KEY ? { Authorization: `Bearer ${WEATHER_API_KEY}` } : undefined,
    maxRedirects: 10,
  })
  return response.data
}

export async function fetchWeatherWithAxios(url: string): Promise<Response> {
  const data = await axios.get(url)
  return new Response(JSON.stringify(data.data), {
    status: data.status,
    headers: { 'Content-Type': 'application/json' },
  })
}
