import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format minutes as "2h 30m" or "45 mins"
export function formatTime(minutes: number): string {
  if (!minutes) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h && m) return `${h}h ${m}m`
  if (h)      return `${h}h`
  return `${m} mins`
}

// Format pence as "£12.50"
export function formatPrice(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`
}

// Format decimal price as "£12.50"
export function formatPriceDecimal(amount: number): string {
  return `£${Number(amount).toFixed(2)}`
}

// Geocode a UK postcode using postcodes.io (free, no key required)
export async function geocodePostcode(postcode: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const clean = postcode.replace(/\s+/g, '').toUpperCase()
    const res = await fetch(`https://api.postcodes.io/postcodes/${clean}`)
    if (!res.ok) return null
    const data = await res.json()
    if (data.status !== 200) return null
    return { lat: data.result.latitude, lng: data.result.longitude }
  } catch {
    return null
  }
}

// Haversine distance in miles between two lat/lng points
export function haversineMiles(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 3958.8 // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Customer-facing job status labels
export function jobStatusLabel(status: string, viewer: 'customer' | 'fitter' | 'public' = 'public'): string {
  if (viewer === 'customer') {
    const labels: Record<string, string> = {
      open:      'Finding Fitter',
      claimed:   'Fitter Matched',
      closed:    'Completed',
      cancelled: 'Cancelled',
    }
    return labels[status] ?? status
  }
  const labels: Record<string, string> = {
    open:      'Open',
    claimed:   'Claimed',
    closed:    'Closed',
    cancelled: 'Cancelled',
  }
  return labels[status] ?? status
}

// Affiliate commission rate tier
export function affiliateRate(jobValue: number): number {
  if (jobValue >= 1000) return 0.025
  if (jobValue >= 500)  return 0.020
  return 0.015
}

export function affiliateTierName(jobValue: number): string {
  if (jobValue >= 1000) return 'Gold'
  if (jobValue >= 500)  return 'Silver'
  return 'Bronze'
}

// Calculate job totals from items
export function calcJobTotals(items: Array<{ quantity: number; time_min: number; unit_price: number }>) {
  return items.reduce(
    (acc, item) => ({
      total_items:  acc.total_items  + item.quantity,
      est_time_min: acc.est_time_min + item.quantity * item.time_min,
      est_price:    acc.est_price    + item.quantity * item.unit_price,
    }),
    { total_items: 0, est_time_min: 0, est_price: 0 }
  )
}

// Build a job title from items
export function buildJobTitle(items: Array<{ name: string; quantity: number }>): string {
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0)
  if (!totalQty) return 'Assembly Job'
  const first = items[0]
  const label = items.length === 1
    ? `${first.quantity}x ${first.name} Assembly`
    : `${totalQty} Items Assembly`
  const rest = items.slice(1)
  const preview = rest.length
    ? ` (${first.quantity}x ${first.name}…)`
    : ` (${first.quantity}x ${first.name})`
  return label + (items.length > 1 ? preview : '')
}

// Credit cost for a job based on est_price
export function calcCreditCost(estPrice: number): number {
  if (estPrice >= 200) return 3
  if (estPrice >= 100) return 2
  return 1
}
