import { useState, useEffect, useCallback } from 'react'
import { api } from '../api'
import type { Flight, AirportCondition, Alert } from '../types'

interface State {
  flights: Flight[]
  airports: AirportCondition[]
  alerts: Alert[]
  loading: boolean
  error: string | null
}

export function useFlightHub() {
  const [state, setState] = useState<State>({
    flights: [],
    airports: [],
    alerts: [],
    loading: true,
    error: null,
  })

  const refresh = useCallback(async () => {
    try {
      const [flights, airports, alerts] = await Promise.all([
        api.flights.list(),
        api.airports.list(),
        api.alerts.list(),
      ])
      setState({ flights, airports, alerts, loading: false, error: null })
    } catch (e) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: e instanceof Error ? e.message : 'Failed to load data',
      }))
    }
  }, [])

  useEffect(() => {
    void refresh()
    const id = setInterval(() => void refresh(), 60_000)
    return () => clearInterval(id)
  }, [refresh])

  const addFlight = async (flightIata: string) => {
    await api.flights.add(flightIata)
    await refresh()
  }

  const removeFlight = async (id: string) => {
    await api.flights.remove(id)
    await refresh()
  }

  return { ...state, refresh, addFlight, removeFlight }
}
