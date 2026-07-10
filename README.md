# Drizzle or Shine

A simple, playful rain forecast app. It tells you whether rain is coming to your location, when it starts, how strong it gets, and when it ends.

## Features

- Location-based rain forecast using your browser's geolocation
- Clear hero status: raining now, rain on the way, or all clear
- 12-hour visual rain timeline
- Key details: start time, end time, peak intensity, total rainfall
- Animated sky background that shifts between sunny and rainy moods
- Demo mode (London) if location access is denied

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Data

Weather data comes from [Open-Meteo](https://open-meteo.com/) — free, no API key required.
