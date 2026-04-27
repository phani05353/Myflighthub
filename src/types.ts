export type FlightStatus = 'on-time' | 'delayed' | 'cancelled' | 'landed' | 'boarding'

export type AirportConditionStatus = 'normal' | 'delays' | 'severe'

export type AlertType = 'delay' | 'cancellation' | 'landing' | 'info'

export interface Flight {
  id: string
  flightNumber: string
  airline: string
  origin: string
  destination: string
  aircraft: string
  duration: string
  scheduledDeparture: string
  actualDeparture?: string
  scheduledArrival: string
  actualArrival?: string
  delayMinutes?: number
  nextDayArrival?: boolean
  status: FlightStatus
}

export interface AirportCondition {
  code: string
  name: string
  city: string
  country: string
  status: AirportConditionStatus
  conditions: string
  depOnTime: number
  arrOnTime: number
}

export interface Alert {
  id: string
  type: AlertType
  message: string
  time: string
  flightNumber?: string
}
