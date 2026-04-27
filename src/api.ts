import type { Flight, AirportCondition, Alert } from './types'

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, init)
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error((body as { message?: string }).message ?? res.statusText)
  }
  return res.status === 204 ? (undefined as T) : (res.json() as Promise<T>)
}

export const api = {
  flights: {
    list: () => req<Flight[]>('/flights'),
    add: (flightIata: string) =>
      req<Flight>('/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightIata }),
      }),
    remove: (id: string) => req<void>(`/flights/${id}`, { method: 'DELETE' }),
  },
  airports: {
    list: () => req<AirportCondition[]>('/airports'),
  },
  alerts: {
    list: () => req<Alert[]>('/alerts'),
  },
}
