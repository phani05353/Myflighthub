# FlightHub

A real-time flight tracking dashboard built with React, TypeScript, and Tailwind CSS.

## Features

- Live flight status tracking (on-time, delayed, cancelled, boarding, landed)
- Summary stats: on-time count, delay averages, cancellations, alerts sent
- Airport conditions with on-time performance bars
- Recent alerts feed with color-coded alert types

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — dev server and bundler
- **Tailwind CSS v3** — utility-first styling

## Getting Started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Build

```bash
npm run build     # outputs to dist/
npm run preview   # serve the production build locally
```

## Docker

```bash
docker build -t flighthub .
docker run -p 8080:80 flighthub
```

The container serves the production build via Nginx on port 80 (mapped to 8080).
