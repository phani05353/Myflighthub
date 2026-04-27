import cron from 'node-cron';
import { v4 as uuid } from 'uuid';
import { getDb } from './db.js';
import { lookupFlight, mapToRow } from './aviation.js';
export function startScheduler() {
    // Refresh all non-terminal flights every 15 minutes
    cron.schedule('*/15 * * * *', () => void refreshActive());
    console.log('Scheduler started (every 15 min)');
}
export async function refreshActive() {
    const db = getDb();
    const active = db
        .prepare(`SELECT * FROM tracked_flights WHERE status NOT IN ('landed','cancelled')`)
        .all();
    if (!active.length)
        return;
    console.log(`Refreshing ${active.length} flight(s)…`);
    for (const row of active) {
        try {
            await refreshOne(row);
        }
        catch (e) {
            console.error(`Refresh failed for ${row.flight_iata}:`, e.message);
        }
    }
}
async function refreshOne(existing) {
    const raw = await lookupFlight(existing.flight_iata);
    if (!raw)
        return;
    const updated = mapToRow(raw, existing.id, existing.added_at);
    getDb()
        .prepare(`UPDATE tracked_flights SET
        airline_name=?, origin=?, destination=?, aircraft=?,
        scheduled_departure=?, scheduled_arrival=?,
        actual_departure=?, actual_arrival=?,
        delay_minutes=?, status=?, next_day_arrival=?, updated_at=?
       WHERE id=?`)
        .run(updated.airline_name, updated.origin, updated.destination, updated.aircraft, updated.scheduled_departure, updated.scheduled_arrival, updated.actual_departure, updated.actual_arrival, updated.delay_minutes, updated.status, updated.next_day_arrival, updated.updated_at, existing.id);
    if (updated.status !== existing.status) {
        emitAlert(existing.flight_iata, updated.status, updated.delay_minutes);
    }
}
function emitAlert(flightIata, newStatus, delay) {
    const db = getDb();
    let type;
    let message;
    if (newStatus === 'cancelled') {
        type = 'cancellation';
        message = `${flightIata} cancelled · Rebooking options available`;
    }
    else if (newStatus === 'landed') {
        type = 'landing';
        message = `${flightIata} has landed`;
    }
    else if (newStatus === 'delayed') {
        type = 'delay';
        message = `${flightIata} delayed ${delay} min`;
    }
    else {
        type = 'info';
        message = `${flightIata} is now ${newStatus}`;
    }
    db.prepare(`INSERT INTO alerts (id, flight_iata, type, message, created_at) VALUES (?,?,?,?,?)`).run(uuid(), flightIata, type, message, new Date().toISOString());
}
