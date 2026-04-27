export async function lookupFlight(flightIata) {
    const key = process.env.AVIATIONSTACK_API_KEY;
    if (!key) {
        throw new Error('AVIATIONSTACK_API_KEY is not set. Get a free key at aviationstack.com and add it to .env');
    }
    const url = `http://api.aviationstack.com/v1/flights?access_key=${key}&flight_iata=${encodeURIComponent(flightIata)}&limit=1`;
    const res = await fetch(url);
    if (!res.ok)
        throw new Error(`AviationStack HTTP ${res.status}`);
    const json = (await res.json());
    if (json.error)
        throw new Error(`AviationStack: ${json.error.message}`);
    return json.data?.[0] ?? null;
}
function hhmm(iso) {
    if (!iso)
        return '';
    const d = new Date(iso);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}
function crossesMidnight(dep, arr) {
    if (!dep || !arr)
        return false;
    const d = new Date(dep);
    const a = new Date(arr);
    return a.getUTCDate() !== d.getUTCDate() || a.getUTCFullYear() !== d.getUTCFullYear();
}
export function deriveStatus(raw, delay, depScheduled) {
    if (raw === 'landed')
        return 'landed';
    if (raw === 'cancelled')
        return 'cancelled';
    if (delay > 15)
        return 'delayed';
    if (raw === 'scheduled' && depScheduled) {
        const mins = (new Date(depScheduled).getTime() - Date.now()) / 60_000;
        if (mins > 0 && mins <= 45)
            return 'boarding';
    }
    return 'on-time';
}
export function mapToRow(raw, id, addedAt) {
    const delay = Math.max(raw.departure.delay ?? 0, raw.arrival.delay ?? 0);
    return {
        id,
        flight_iata: raw.flight.iata,
        airline_name: raw.airline.name,
        origin: raw.departure.iata,
        destination: raw.arrival.iata,
        aircraft: raw.aircraft?.iata ?? '',
        scheduled_departure: hhmm(raw.departure.scheduled),
        scheduled_arrival: hhmm(raw.arrival.scheduled),
        actual_departure: raw.departure.actual ? hhmm(raw.departure.actual) : null,
        actual_arrival: raw.arrival.actual ? hhmm(raw.arrival.actual) : null,
        delay_minutes: delay,
        status: deriveStatus(raw.flight_status, delay, raw.departure.scheduled),
        next_day_arrival: crossesMidnight(raw.departure.scheduled, raw.arrival.scheduled) ? 1 : 0,
        added_at: addedAt,
        updated_at: new Date().toISOString(),
    };
}
