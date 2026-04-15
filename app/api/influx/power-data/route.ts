import { NextResponse } from 'next/server'

export const runtime = 'edge'

async function runFluxQuery(INFLUX_HOST: string, INFLUX_ORG: string, INFLUX_TOKEN: string, flux: string) {
  const queryUrl = `${INFLUX_HOST.replace(/\/$/, '')}/api/v2/query?org=${encodeURIComponent(INFLUX_ORG)}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/vnd.flux',
    Accept: 'application/csv',
  }
  if (INFLUX_TOKEN) headers['Authorization'] = `Token ${INFLUX_TOKEN}`
  const res = await fetch(queryUrl, { method: 'POST', headers, body: flux })
  const text = await res.text()
  if (!res.ok) throw new Error(`Influx query failed: ${res.status} ${text}`)
  return String(text || '')
}

function parseCsvRows(csv: string) {
  const lines = csv.split(/\r?\n/)
  const cols: string[] = []
  const rows: any[] = []
  for (const line of lines) {
    if (!line) continue
    if (line.startsWith('#')) continue
    if (cols.length === 0) {
      // header line
      const header = line.split(',').map((s) => s.trim())
      cols.push(...header)
      continue
    }
    const parts = line.split(',')
    if (parts.length < cols.length) continue
    const obj: any = {}
    for (let i = 0; i < cols.length; i++) {
      obj[cols[i]] = parts[i]?.trim()
    }
    rows.push(obj)
  }
  return rows
}

/**
 * Get complete power data from InfluxDB including power_before and power_metrics
 * Query parameters:
 * - range: time range (e.g., -5m, -1h, -24h)
 */
export async function GET(req: Request) {
  try {
    const INFLUX_HOST = process.env.INFLUX_HOST || process.env.DOCKER_INFLUXDB_INIT_HOST || 'http://127.0.0.1:8086'
    const INFLUX_BUCKET = process.env.INFLUX_BUCKET || process.env.DOCKER_INFLUXDB_INIT_BUCKET || 'k_db'
    const INFLUX_ORG = process.env.INFLUX_ORG || process.env.DOCKER_INFLUXDB_INIT_ORG || 'K-Energy_Save'
    const INFLUX_TOKEN = process.env.INFLUX_TOKEN || process.env.DOCKER_INFLUXDB_INIT_TOKEN || ''

    const url = new URL(req.url)
    const rawRange = url.searchParams.get('range') || ''
    const allowed = /^-\d+(m|h|d)$/
    const range = allowed.test(rawRange) ? rawRange : '-5m'

    // Query for all power measurements
    const flux = `
from(bucket: "${INFLUX_BUCKET}")
  |> range(start: ${range})
  |> filter(fn: (r) => r._measurement == "power_before" or r._measurement == "power_metrics")
  |> last()
  |> keep(columns: ["_time","_measurement","_field","_value","ksave","device","location"])
`

    const csv = await runFluxQuery(INFLUX_HOST, INFLUX_ORG, INFLUX_TOKEN, flux)
    const rows = parseCsvRows(csv)

    const out = rows.map((r) => ({
      time: r._time,
      measurement: r._measurement,
      field: r._field,
      value: parseFloat(r._value) || 0,
      ksave: r.ksave || null,
      device: r.device || null,
      location: r.location || null,
    }))

    return NextResponse.json({ ok: true, rows: out })
  } catch (err: any) {
    console.error('InfluxDB power data query error:', err)

    // Fallback sample data for development when InfluxDB is not available
    if (process.env.NODE_ENV !== 'production') {
      const sampleData = [
        // Device 1 - power_before
        { time: new Date().toISOString(), measurement: 'power_before', field: 'L1', value: 220.5, ksave: 'KSAVE01', device: 'Ksave01', location: 'Site A' },
        { time: new Date().toISOString(), measurement: 'power_before', field: 'L2', value: 221.3, ksave: 'KSAVE01', device: 'Ksave01', location: 'Site A' },
        { time: new Date().toISOString(), measurement: 'power_before', field: 'L3', value: 219.8, ksave: 'KSAVE01', device: 'Ksave01', location: 'Site A' },
        { time: new Date().toISOString(), measurement: 'power_before', field: 'P', value: 150.5, ksave: 'KSAVE01', device: 'Ksave01', location: 'Site A' },
        { time: new Date().toISOString(), measurement: 'power_before', field: 'Q', value: 50.2, ksave: 'KSAVE01', device: 'Ksave01', location: 'Site A' },
        { time: new Date().toISOString(), measurement: 'power_before', field: 'S', value: 158.7, ksave: 'KSAVE01', device: 'Ksave01', location: 'Site A' },
        { time: new Date().toISOString(), measurement: 'power_before', field: 'PF', value: 0.95, ksave: 'KSAVE01', device: 'Ksave01', location: 'Site A' },
        { time: new Date().toISOString(), measurement: 'power_before', field: 'THD', value: 2.1, ksave: 'KSAVE01', device: 'Ksave01', location: 'Site A' },
        { time: new Date().toISOString(), measurement: 'power_before', field: 'F', value: 50.0, ksave: 'KSAVE01', device: 'Ksave01', location: 'Site A' },
        { time: new Date().toISOString(), measurement: 'power_before', field: 'kWh', value: 10.5, ksave: 'KSAVE01', device: 'Ksave01', location: 'Site A' },
        // Device 1 - power_metrics
        { time: new Date().toISOString(), measurement: 'power_metrics', field: 'L1', value: 220.2, ksave: 'KSAVE01', device: 'Ksave01', location: 'Site A' },
        { time: new Date().toISOString(), measurement: 'power_metrics', field: 'L2', value: 221.0, ksave: 'KSAVE01', device: 'Ksave01', location: 'Site A' },
        { time: new Date().toISOString(), measurement: 'power_metrics', field: 'L3', value: 219.5, ksave: 'KSAVE01', device: 'Ksave01', location: 'Site A' },
        { time: new Date().toISOString(), measurement: 'power_metrics', field: 'P', value: 120.3, ksave: 'KSAVE01', device: 'Ksave01', location: 'Site A' },
        { time: new Date().toISOString(), measurement: 'power_metrics', field: 'Q', value: 40.1, ksave: 'KSAVE01', device: 'Ksave01', location: 'Site A' },
        { time: new Date().toISOString(), measurement: 'power_metrics', field: 'S', value: 126.8, ksave: 'KSAVE01', device: 'Ksave01', location: 'Site A' },
        { time: new Date().toISOString(), measurement: 'power_metrics', field: 'PF', value: 0.95, ksave: 'KSAVE01', device: 'Ksave01', location: 'Site A' },
        { time: new Date().toISOString(), measurement: 'power_metrics', field: 'THD', value: 1.8, ksave: 'KSAVE01', device: 'Ksave01', location: 'Site A' },
        { time: new Date().toISOString(), measurement: 'power_metrics', field: 'F', value: 50.0, ksave: 'KSAVE01', device: 'Ksave01', location: 'Site A' },
        { time: new Date().toISOString(), measurement: 'power_metrics', field: 'kWh', value: 8.3, ksave: 'KSAVE01', device: 'Ksave01', location: 'Site A' },
      ]
      return NextResponse.json({ ok: true, rows: sampleData, note: 'fallback-sample' })
    }

    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
