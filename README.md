# FlightHub

A self-hosted flight tracking dashboard. Add any flight by IATA number — FlightHub fetches live status from AviationStack, persists it in SQLite, polls for updates every 15 minutes, and fires alerts whenever a flight's status changes.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript + Tailwind CSS |
| Backend | Node.js + Express |
| Database | SQLite via `better-sqlite3` |
| Build | Vite (client) + `tsc` (server) |
| Flight data | [AviationStack API](https://aviationstack.com) |

## Getting Started

### 1. Get an API key

Sign up at [aviationstack.com](https://aviationstack.com) for a free key (100 req/month).

### 2. Configure environment

```bash
cp .env.example .env
# edit .env and set AVIATIONSTACK_API_KEY=your_key
```

### 3. Run in development

```bash
npm install
npm run dev
```

Vite runs on `http://localhost:5173` and proxies `/api` to the Express server on port 3000. Both start with a single command.

### 4. Build for production

```bash
npm run build     # compiles server → dist-server/ and client → dist/
npm start         # NODE_ENV=production node dist-server/index.js
```

## Docker

```bash
docker build -t flighthub .
docker run -d \
  --name flighthub \
  -p 8090:3000 \
  -v $(pwd)/data:/app/data \
  --env-file .env \
  flighthub
```

The container serves both the API and the React build from a single Node.js process on port 3000.

## Homelab Deploy

Copy `deploy.sh` to your homelab alongside the repo directory:

```
flighthub/
├── deploy.sh        ← run this
├── myflighthub/     ← git repo (auto-cloned if missing)
├── data/            ← SQLite DB lives here (never deleted)
└── .env             ← API key
```

```bash
bash deploy.sh
```

## How it works

- **Add a flight** — enter an IATA flight number (e.g. `BA0178`). The backend fetches live data from AviationStack and stores it in SQLite.
- **Auto-refresh** — a scheduler runs every 15 minutes and re-fetches all non-terminal flights (anything not `landed` or `cancelled`).
- **Alerts** — whenever a flight's status changes (e.g. on-time → delayed, active → landed), an alert is written to the DB and surfaced in the Recent Alerts feed.
- **Airport conditions** — derived automatically from your tracked flights. If any flight departing or arriving at an airport is delayed >20 min, it shows "Delays".
- **Frontend polling** — the React app re-fetches all data every 60 seconds, so the UI stays current without a manual refresh.
