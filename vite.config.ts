import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import { readFileSync } from 'node:fs'

const packageVersion = JSON.parse(
  readFileSync('./package.json', 'utf-8'),
) as { version: string }

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const sentryAuthToken = env.SENTRY_AUTH_TOKEN

  return {
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(
        `weather-app@${packageVersion.version}`,
      ),
    },
    build: {
      sourcemap: sentryAuthToken ? 'hidden' : false,
    },
    plugins: [
      react(),
      tailwindcss(),
      ...(sentryAuthToken
        ? [
            sentryVitePlugin({
              org: env.SENTRY_ORG,
              project: env.SENTRY_PROJECT,
              authToken: sentryAuthToken,
            }),
          ]
        : []),
    ],
    server: {
      proxy: {
        '/api/weather': {
          target: 'https://api.open-meteo.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/weather/, '/v1/forecast'),
        },
      },
    },
  }
})
