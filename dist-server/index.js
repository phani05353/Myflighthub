import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb, getDb } from './db.js';
import { startScheduler } from './scheduler.js';
import { flightsRouter } from './routes/flights.js';
import { alertsRouter } from './routes/alerts.js';
import { AIRPORT_INFO } from './airports.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 3000);
const app = express();
app.use(express.json());
app.use('/api/flights', flightsRouter);
app.use('/api/alerts', alertsRouter);
app.get('/api/airports', (_req, res) => {
    const flights = getDb()
        .prepare('SELECT * FROM tracked_flights')
        .all();
    const map = new Map();
    const bucket = (code) => {
        if (!map.has(code))
            map.set(code, { deps: [], arrs: [] });
        return map.get(code);
    };
    for (const f of flights) {
        if (f.origin)
            bucket(f.origin).deps.push(f);
        if (f.destination)
            bucket(f.destination).arrs.push(f);
    }
    const airports = Array.from(map.entries()).map(([code, { deps, arrs }]) => {
        const depDelayed = deps.filter((f) => f.delay_minutes > 20).length;
        const arrDelayed = arrs.filter((f) => f.delay_minutes > 20).length;
        const depOnTime = deps.length ? Math.round(((deps.length - depDelayed) / deps.length) * 100) : 100;
        const arrOnTime = arrs.length ? Math.round(((arrs.length - arrDelayed) / arrs.length) * 100) : 100;
        const delayedFlights = [...deps, ...arrs].filter((f) => f.delay_minutes > 0);
        const avgDelay = delayedFlights.length
            ? Math.round(delayedFlights.reduce((s, f) => s + f.delay_minutes, 0) / delayedFlights.length)
            : 0;
        const hasDelays = depDelayed > 0 || arrDelayed > 0;
        const info = AIRPORT_INFO[code] ?? { name: code, city: '', country: '' };
        return {
            code,
            name: info.name,
            city: info.city,
            country: info.country,
            status: hasDelays ? 'delays' : 'normal',
            conditions: hasDelays ? `Delays · avg ${avgDelay} min` : 'Operations normal',
            depOnTime,
            arrOnTime,
        };
    });
    res.json(airports);
});
// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));
// Serve React build in production
if (process.env.NODE_ENV === 'production') {
    const clientDist = path.join(__dirname, '../dist');
    app.use(express.static(clientDist));
    app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}
initDb();
startScheduler();
app.listen(PORT, () => {
    console.log(`FlightHub running on http://localhost:${PORT}`);
    if (!process.env.AVIATIONSTACK_API_KEY) {
        console.warn('⚠  AVIATIONSTACK_API_KEY not set — flight lookups will fail until you add it to .env');
    }
});
