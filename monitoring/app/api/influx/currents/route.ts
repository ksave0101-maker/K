import { NextResponse } from 'next/server'

export const runtime = 'edge'

// Simple edge-compatible cache
const globalForCache = globalThis as unknown as {
  edgeCurrentsCache: Map<string, { data: any; expires: number }>
}
if (!globalForCache.edgeCurrentsCache) {
  globalForCache.edgeCurrentsCache = new Map()
}

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

export async function GET(req: Request) {
  try {
    // allow client to request a time range like -15m, -1h, -24h, -7d
    const url = new URL(req.url)
    const rawRange = url.searchParams.get('range') || ''
    const rawAt = url.searchParams.get('at') || ''

    // Check cache (5 second TTL)
    const cacheKey = `currents:${rawRange}:${rawAt}`
    const now = Date.now()
    const cached = globalForCache.edgeCurrentsCache.get(cacheKey)
    if (cached && cached.expires > now) {
      return NextResponse.json(cached.data)
    }

    const INFLUX_HOST = process.env.INFLUX_HOST || process.env.DOCKER_INFLUXDB_INIT_HOST || 'http://127.0.0.1:8086'
    const INFLUX_BUCKET = process.env.INFLUX_BUCKET || process.env.DOCKER_INFLUXDB_INIT_BUCKET || 'k_db'
    const INFLUX_ORG = process.env.INFLUX_ORG || process.env.DOCKER_INFLUXDB_INIT_ORG || 'K-Energy_Save'
    const INFLUX_TOKEN = process.env.INFLUX_TOKEN || process.env.DOCKER_INFLUXDB_INIT_TOKEN || ''

    // If `at` is provided (ISO timestamp), return points around that moment (±1min)
    let flux: string
    if (rawAt) {
      const atTime = Date.parse(rawAt)
      if (isNaN(atTime)) throw new Error('invalid at parameter')
      const start = new Date(atTime - 60 * 1000).toISOString()
      const stop = new Date(atTime + 60 * 1000).toISOString()
      flux = `from(bucket: "${INFLUX_BUCKET}")\n  |> range(start: ${start}, stop: ${stop})\n  |> last()\n  |> keep(columns: ["_time","_measurement","_field","_value","ksave","device","location"])`
    } else {
      // basic validation: only allow formats like -15m, -1h, -24h, -7d
      const allowed = /^-\d+(m|h|d)$/
      const range = allowed.test(rawRange) ? rawRange : '-1h'
      flux = `from(bucket: "${INFLUX_BUCKET}")\n  |> range(start: ${range})\n  |> last()\n  |> keep(columns: ["_time","_measurement","_field","_value","ksave","device","location"])`
    }

    const csv = await runFluxQuery(INFLUX_HOST, INFLUX_ORG, INFLUX_TOKEN, flux)
    const rows = parseCsvRows(csv)

    const out = rows.map((r) => ({
      time: r._time,
      measurement: r._measurement,
      field: r._field,
      value: Number(r._value),
      ksave: r.ksave || null,
      device: r.device || null,
      location: r.location || null,
    }))

    const result = { ok: true, rows: out }

    // Cache for 5 seconds
    globalForCache.edgeCurrentsCache.set(cacheKey, {
      data: result,
      expires: Date.now() + 5000
    })

    return NextResponse.json(result)
  } catch (err: any) {
    // If Influx is not reachable, provide a small development fallback so the UI can render during local dev.
    // ⚠️ IMPORTANT: In production, data MUST come from InfluxDB database only!
    if (process.env.NODE_ENV !== 'production') {
      const sample = [
        { time: new Date().toISOString(), measurement: 'power', field: 'P', value: 150.5, ksave: 'KSAVE01', device: 'Ksave01', location: 'Site A',
          power_before: { L1: 220.5, L2: 221.3, L3: 219.8, kWh: 10.5, P: 150.5, Q: 50.2, S: 158.7, PF: 0.95, THD: 2.1, F: 50.0 },
          power_metrics: { L1: 220.2, L2: 221.0, L3: 219.5, kWh: 8.3, P: 120.3, Q: 40.1, S: 126.8, PF: 0.95, THD: 1.8, F: 50.0 }
        },
        { time: new Date(Date.now() - 60000).toISOString(), measurement: 'power', field: 'P', value: 145.2, ksave: 'KSAVE02', device: 'Ksave02', location: 'Site B',
          power_before: { L1: 219.8, L2: 220.5, L3: 221.2, kWh: 12.2, P: 145.2, Q: 48.5, S: 152.9, PF: 0.95, THD: 2.3, F: 50.0 },
          power_metrics: { L1: 219.5, L2: 220.2, L3: 220.9, kWh: 9.8, P: 115.8, Q: 38.7, S: 122.1, PF: 0.95, THD: 2.0, F: 50.0 }
        },
        { time: new Date(Date.now() - 120000).toISOString(), measurement: 'power', field: 'P', value: 138.9, ksave: 'KSAVE03', device: 'Ksave03', location: 'Site E',
          power_before: { L1: 221.1, L2: 219.9, L3: 220.6, kWh: 11.8, P: 138.9, Q: 46.3, S: 146.3, PF: 0.95, THD: 2.2, F: 50.0 },
          power_metrics: { L1: 220.8, L2: 219.6, L3: 220.3, kWh: 9.2, P: 110.5, Q: 36.9, S: 116.5, PF: 0.95, THD: 1.9, F: 50.0 }
        },
        { time: new Date(Date.now() - 180000).toISOString(), measurement: 'power', field: 'P', value: 152.7, ksave: 'KSAVE04', device: 'Ksave04', location: 'Site C',
          power_before: { L1: 220.3, L2: 221.5, L3: 219.7, kWh: 13.1, P: 152.7, Q: 51.0, S: 160.9, PF: 0.95, THD: 2.4, F: 50.0 },
          power_metrics: { L1: 220.0, L2: 221.2, L3: 219.4, kWh: 10.5, P: 122.1, Q: 40.8, S: 128.7, PF: 0.95, THD: 2.1, F: 50.0 }
        },
        { time: new Date(Date.now() - 240000).toISOString(), measurement: 'power', field: 'P', value: 141.3, ksave: 'KSAVE05', device: 'Ksave05', location: 'Site D',
          power_before: { L1: 219.6, L2: 220.8, L3: 221.4, kWh: 10.9, P: 141.3, Q: 47.1, S: 148.9, PF: 0.95, THD: 2.0, F: 50.0 },
          power_metrics: { L1: 219.3, L2: 220.5, L3: 221.1, kWh: 8.7, P: 112.9, Q: 37.7, S: 119.0, PF: 0.95, THD: 1.7, F: 50.0 }
        }
      ]
      return NextResponse.json({ ok: true, rows: sample, note: 'fallback-sample' })
    }

    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
