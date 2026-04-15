import EventEmitter from 'events'

const INFLUX_HOST = process.env.INFLUX_HOST || 'http://127.0.0.1:8086'
const INFLUX_ORG = process.env.INFLUX_ORG || ''
const INFLUX_BUCKET = process.env.INFLUX_BUCKET || ''
const INFLUX_TOKEN = process.env.INFLUX_TOKEN || ''

export type Parsed = {
  id?: string
  seriesName?: string
  seriesNo?: string
  location?: string
  lastTime?: string
  secondsAgo?: number
  ok?: boolean
  current?: number
  power_before?: number
  kWh?: number
}

// singleton guard for dev hot-reload
const globalAny: any = globalThis as any
if (!globalAny.__realtimeService) {
  globalAny.__realtimeService = {
    emitter: new EventEmitter(),
    polls: {} as Record<string, ReturnType<typeof setInterval>>,
    errorCounts: {} as Record<string, number>,
  }
}

const emitter: EventEmitter = globalAny.__realtimeService.emitter
const polls: Record<string, ReturnType<typeof setInterval>> = globalAny.__realtimeService.polls
const errorCounts: Record<string, number> = globalAny.__realtimeService.errorCounts

async function queryInfluxLast(deviceId: string): Promise<{ ok: boolean; raw?: string; parsed?: Parsed; error?: string }> {
  if (!deviceId) return { ok: false, error: 'missing deviceId' }
  if (!INFLUX_HOST || !INFLUX_ORG || !INFLUX_BUCKET || !INFLUX_TOKEN) {
    return { ok: false, error: 'INFLUX_HOST/ORG/BUCKET/TOKEN not configured' }
  }

  const sanitize = (s: string) => String(s).replace(/\"/g, '').replace(/\n|\r/g, '').replace(/"/g, '')
  const d = sanitize(deviceId)

  const flux = `from(bucket: "${INFLUX_BUCKET}")
    |> range(start: -1h)
    |> filter(fn: (r) => r._measurement != "" and (
        (exists r.ksave and r.ksave == "${d}") or
        (exists r.device and r.device == "${d}") or
        (exists r.host and r.host == "${d}") or
        (exists r.machine and r.machine == "${d}")
      ))
    |> last()`

  const queryUrl = `${INFLUX_HOST.replace(/\/$/, '')}/api/v2/query?org=${encodeURIComponent(INFLUX_ORG)}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/vnd.flux',
    Accept: 'application/json',
    Authorization: `Token ${INFLUX_TOKEN}`,
  }

  try {
    const res = await fetch(queryUrl, { method: 'POST', headers, body: flux })
    const text = await res.text()
    if (!res.ok) return { ok: false, error: text, raw: text }

    const raw = String(text || '')
    const parsed: Parsed = {}

    const mMatch = raw.match(/"_measurement"\s*:\s*"([^"]+)"/i)
    const kMatch = raw.match(/"ksave"\s*:\s*"([^"]+)"/i)
    const sMatch = raw.match(/"series(?:_name)?"\s*:\s*"([^"]+)"/i)
    const nameMatch = raw.match(/"name"\s*:\s*"([^"]+)"/i)
    parsed.seriesName = (kMatch && kMatch[1]) || (sMatch && sMatch[1]) || (mMatch && mMatch[1]) || (nameMatch && nameMatch[1])

    const snMatch = raw.match(/"series_no"\s*:\s*"?([0-9]+(?:\.[0-9]+)?)"?/i)
    const idMatch = raw.match(/"(?:device|host|machine|id)"\s*:\s*"?([0-9]+(?:\.[0-9]+)?)"?/i)
    const valueMatch = raw.match(/"_value"\s*:\s*([0-9.+\\-eE]+)/i)
    parsed.seriesNo = (snMatch && snMatch[1]) || (idMatch && idMatch[1]) || (valueMatch && valueMatch[1]) || undefined

    const locMatch = raw.match(/"location"\s*:\s*"([^"]+)"/i)
    const siteMatch = raw.match(/"site(?:_name)?"\s*:\s*"([^"]+)"/i)
    const locTagMatch = raw.match(/"loc"\s*:\s*"([^"]+)"/i)
    parsed.location = (locMatch && locMatch[1]) || (siteMatch && siteMatch[1]) || (locTagMatch && locTagMatch[1]) || undefined

    const timeMatch = raw.match(/"_time"\s*:\s*"([^"]+)"/i) || raw.match(/"time"\s*:\s*"([^"]+)"/i)
    if (timeMatch && timeMatch[1]) {
      const t = new Date(timeMatch[1])
      if (!Number.isNaN(t.getTime())) {
        parsed.lastTime = t.toISOString()
        parsed.secondsAgo = Math.floor((Date.now() - t.getTime()) / 1000)
        parsed.ok = parsed.secondsAgo <= 300
      }
    }

    try {
      const fieldNames = ['current','power_before','power_metrics','kWh','P','Q','S','PF','THD','F','power']
      for (const k of fieldNames) {
        const re = new RegExp(`"?${k}"?\\s*[:=]\\s*\"?([0-9.+\\-eE]+)\"?`, 'i')
        const m = raw.match(re)
        if (m && m[1]) {
          const v = Number(m[1])
          if (!Number.isNaN(v)) {
            if (k === 'power' && parsed.power_before == null) parsed.power_before = v
            else (parsed as any)[k] = v
          }
        }
      }
    } catch (_) {}

    errorCounts[deviceId] = 0

    return { ok: true, raw, parsed }
  } catch (err: any) {
    return { ok: false, error: String(err?.message || err) }
  }
}

async function fetchLatest(deviceId: string) {
  return await queryInfluxLast(deviceId)
}

function startPolling(deviceId: string, intervalMs = 3000) {
  if (!deviceId) return
  if (polls[deviceId]) return // already polling
  errorCounts[deviceId] = errorCounts[deviceId] || 0
  const id = setInterval(async () => {
    const result = await queryInfluxLast(deviceId)
    if (result.ok) {
      emitter.emit(deviceId, result.parsed)
      emitter.emit('all', { deviceId, parsed: result.parsed })
      errorCounts[deviceId] = 0
    } else {
      errorCounts[deviceId] = (errorCounts[deviceId] || 0) + 1
      emitter.emit(`${deviceId}:error`, result.error)
      if (errorCounts[deviceId] >= 5) {
        clearInterval(id)
        delete polls[deviceId]
        emitter.emit(`${deviceId}:stopped`, { reason: 'too many errors', lastError: result.error })
      }
    }
  }, intervalMs)
  polls[deviceId] = id
}

function stopPolling(deviceId: string) {
  const id = polls[deviceId]
  if (id) {
    clearInterval(id)
    delete polls[deviceId]
  }
  if (errorCounts[deviceId]) delete errorCounts[deviceId]
}

function subscribe(deviceId: string, cb: (parsed: Parsed) => void) {
  emitter.on(deviceId, cb)
  return () => emitter.off(deviceId, cb)
}

export {
  fetchLatest,
  startPolling,
  stopPolling,
  subscribe,
  emitter,
}