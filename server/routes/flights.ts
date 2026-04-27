import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import { getDb, type FlightRow } from '../db.js'
import { lookupFlight, mapToRow } from '../aviation.js'

export const flightsRouter = Router()

flightsRouter.get('/', (_req, res) => {
  const rows = getDb()
    .prepare('SELECT * FROM tracked_flights ORDER BY added_at DESC')
    .all() as FlightRow[]
  res.json(rows.map(toClient))
})

flightsRouter.post('/', async (req, res) => {
  const { flightIata } = req.body as { flightIata?: string }
  if (!flightIata?.trim()) {
    return res.status(400).json({ message: 'flightIata is required' })
  }

  const iata = flightIata.trim().toUpperCase().replace(/\s+/g, '')
  const db = getDb()

  if (db.prepare('SELECT id FROM tracked_flights WHERE flight_iata=?').get(iata)) {
    return res.status(409).json({ message: `${iata} is already being tracked` })
  }

  try {
    const raw = await lookupFlight(iata)
    if (!raw) return res.status(404).json({ message: `Flight ${iata} not found` })

    const row = mapToRow(raw, uuid(), new Date().toISOString())
    db.prepare(
      `INSERT INTO tracked_flights
        (id,flight_iata,airline_name,origin,destination,aircraft,
         scheduled_departure,scheduled_arrival,actual_departure,actual_arrival,
         delay_minutes,status,next_day_arrival,added_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).run(
      row.id, row.flight_iata, row.airline_name, row.origin, row.destination, row.aircraft,
      row.scheduled_departure, row.scheduled_arrival, row.actual_departure, row.actual_arrival,
      row.delay_minutes, row.status, row.next_day_arrival, row.added_at, row.updated_at
    )

    return res.status(201).json(toClient(row as FlightRow))
  } catch (e) {
    return res.status(502).json({ message: (e as Error).message })
  }
})

flightsRouter.delete('/:id', (req, res) => {
  const result = getDb()
    .prepare('DELETE FROM tracked_flights WHERE id=?')
    .run(req.params.id)
  if (result.changes === 0) return res.status(404).json({ message: 'Not found' })
  res.status(204).send()
})

function toClient(r: FlightRow) {
  return {
    id: r.id,
    flightNumber: r.flight_iata,
    airline: r.airline_name ?? '',
    origin: r.origin ?? '',
    destination: r.destination ?? '',
    aircraft: r.aircraft ?? '',
    duration: '',
    scheduledDeparture: r.scheduled_departure ?? '',
    actualDeparture: r.actual_departure ?? undefined,
    scheduledArrival: r.scheduled_arrival ?? '',
    actualArrival: r.actual_arrival ?? undefined,
    delayMinutes: r.delay_minutes,
    nextDayArrival: r.next_day_arrival === 1,
    status: r.status,
  }
}
