import { Router } from 'express';
import { getDb } from '../db.js';
export const alertsRouter = Router();
alertsRouter.get('/', (_req, res) => {
    const rows = getDb()
        .prepare('SELECT * FROM alerts ORDER BY created_at DESC LIMIT 20')
        .all();
    res.json(rows.map((r) => ({
        id: r.id,
        type: r.type,
        flightNumber: r.flight_iata ?? undefined,
        message: r.message,
        time: fmtTime(r.created_at),
    })));
});
function fmtTime(iso) {
    const d = new Date(iso);
    const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    const isToday = d.toDateString() === new Date().toDateString();
    return isToday
        ? `Today ${time}`
        : `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} ${time}`;
}
