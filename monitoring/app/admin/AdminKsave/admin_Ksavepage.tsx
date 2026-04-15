"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
// import InfluxToMysqlSync from '@/components/InfluxToMysqlSync' // Uncomment if component exists

type AnyObj = Record<string, any>

export default function AdminPage(): React.ReactElement {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [services, setServices] = useState<AnyObj | null>(null)

  const [currents, setCurrents] = useState<AnyObj[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastInfluxUpdate, setLastInfluxUpdate] = useState<Date | null>(null)

  // Database states
  const [devices, setDevices] = useState<AnyObj[]>([])
  const [deviceMetrics, setDeviceMetrics] = useState<AnyObj[]>([])
  const [dbLoading, setDbLoading] = useState(false)
  const [dbError, setDbError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [debouncedQuery, setDebouncedQuery] = useState<string>('')
  const [selectedRange, setSelectedRange] = useState<string>('-1h')
  const [selectedDevice, setSelectedDevice] = useState<string>('all')
  
  // Pagination states
  const [currentPageDB, setCurrentPageDB] = useState<number>(1)
  const [itemsPerPageDB, setItemsPerPageDB] = useState<number>(10)
  const [currentPageInflux, setCurrentPageInflux] = useState<number>(1)
  const [itemsPerPageInflux, setItemsPerPageInflux] = useState<number>(20)
  // custom start/stop datetime (datetime-local format)
  const [startAt, setStartAt] = useState<string>(() => {
    try {
      const now = new Date()
      const start = new Date(now.getTime() - 60 * 60 * 1000)
      return start.toISOString().slice(0, 16)
    } catch (_) { return '' }
  })
  const [endAt, setEndAt] = useState<string>(() => {
    try { return new Date().toISOString().slice(0, 16) } catch (_) { return '' }
  })

  const [lastUpdateTime, setLastUpdateTime] = useState<string>('')
  useEffect(() => {
    setLastUpdateTime(new Date().toLocaleTimeString())
    const iv = setInterval(() => setLastUpdateTime(new Date().toLocaleTimeString()), 10000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => { try { setToken(localStorage.getItem('k_system_admin_token')) } catch (_) {} }, [])

  useEffect(() => {
    let mounted = true
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/status')
        if (!res.ok) return
        const b = await res.json().catch(() => ({}))
        if (mounted) setServices(b.services)
      } catch (_) {}
    }
    fetchStatus()
    const iv = setInterval(fetchStatus, 5000)
    return () => { mounted = false; clearInterval(iv) }
  }, [])

  // Fetch synced InfluxDB data from MySQL database (real-time polling every 3 seconds)
  useEffect(() => {
    let mounted = true
    const fetchDatabaseData = async () => {
      setDbLoading(true)
      setDbError(null)
      try {
        // Fetch synced InfluxDB data from MySQL power_records table
        const syncedRes = await fetch('/api/database/influx-to-mysql?limit=100')
        if (syncedRes.ok) {
          const syncedBody = await syncedRes.json()
          if (mounted && syncedBody.ok && syncedBody.data) {
            // Group by device and get latest entry for each
            const deviceMap = new Map<string, any>()
            syncedBody.data.forEach((row: any) => {
              const deviceKey = row.device || row.ksave_id
              if (!deviceMap.has(deviceKey) || new Date(row.measurement_time) > new Date(deviceMap.get(deviceKey).measurement_time)) {
                deviceMap.set(deviceKey, row)
              }
            })

            // Transform synced data to match the expected device format
            const transformedDevices = Array.from(deviceMap.values()).map((row: any) => ({
              deviceid: row.id,
              devicename: row.device,
              ksaveid: row.ksave_id,
              ipaddress: '-',
              location: row.location,
              status: 'ON', // Assume ON if data exists
              latestMetric: {
                timestamp: row.measurement_time,
                location: row.location,
                before_p: row.before_p,
                before_q: row.before_q,
                before_s: row.before_s,
                metrics_p: row.metrics_p,
                metrics_q: row.metrics_q,
                metrics_s: row.metrics_s,
                er: row.er
              }
            }))
            setDevices(transformedDevices)
          }
        } else {
          // Fallback to old API if sync table doesn't exist yet
          const devicesRes = await fetch('/api/devices')
          if (devicesRes.ok) {
            const devicesBody = await devicesRes.json()
            if (mounted && devicesBody.devices) {
              setDevices(devicesBody.devices)
            }
          }

          const metricsRes = await fetch('/api/device-metrics')
          if (metricsRes.ok) {
            const metricsBody = await metricsRes.json()
            if (mounted && metricsBody.metrics) {
              setDeviceMetrics(metricsBody.metrics)
            }
          }
        }
      } catch (e: any) {
        if (mounted) setDbError(String(e))
      } finally {
        if (mounted) setDbLoading(false)
      }
    }
    fetchDatabaseData()
    const iv = setInterval(fetchDatabaseData, 10000) // Poll every 10 seconds (reduced from 3s to save connections)
    return () => {
      mounted = false
      clearInterval(iv)
    }
  }, [])

  useEffect(() => {
    // fetcher can be called from UI (Search button) as well as interval/useEffect
    let mounted = true
    const fetchCurrents = async () => {
      setLoading(true)
      setError(null)
      try {
        let url = `/api/influx/currents?range=${encodeURIComponent(selectedRange)}`
        // if both startAt and endAt are present, prefer explicit start/stop query params
        if (startAt && endAt) {
          const startIso = new Date(startAt).toISOString()
          const endIso = new Date(endAt).toISOString()
          url = `/api/influx/currents?start=${encodeURIComponent(startIso)}&stop=${encodeURIComponent(endIso)}`
        }
        const res = await fetch(url)
        const body = await res.json().catch(() => ({}))
        if (!res.ok) {
          if (mounted) setError(body?.error || 'Failed to load currents')
        } else {
          if (mounted) {
            setCurrents(body.rows || body || [])
            setLastInfluxUpdate(new Date())
          }
        }
      } catch (e: any) {
        if (mounted) setError(String(e))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchCurrents()
    const iv = setInterval(fetchCurrents, 15000)
    return () => { mounted = false; clearInterval(iv) }
  }, [selectedRange, startAt, endAt])

  function handleLogout() {
    try { localStorage.removeItem('k_system_admin_token') } catch (_) {}
    router.replace('/admin/AdminKsavelogin')
  }

  // Debounce the search input so filtering doesn't happen on every keystroke
  useEffect(() => {
    const iv = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300)
    return () => clearTimeout(iv)
  }, [searchQuery])

  const devicesFromInflux = useMemo(() => {
    const s = new Set<string>()
    for (const r of currents) {
      const d = (r.device || r.ksave || r.ksave_id || r.device_id || '')?.toString() || ''
      if (d) s.add(d)
    }
    return Array.from(s).sort()
  }, [currents])

  // Merge database devices with their latest metrics from PostgreSQL only
  const mergedDeviceData = useMemo(() => {
    return devices.map(device => {
      const metric = deviceMetrics.find(m => m.ksaveid === device.ksaveid || m.devicename === device.devicename)

      return {
        ...device,
        latestMetric: metric
      }
    })
  }, [devices, deviceMetrics])

  // Paginated database data
  const paginatedDBData = useMemo(() => {
    const startIndex = (currentPageDB - 1) * itemsPerPageDB
    const endIndex = startIndex + itemsPerPageDB
    return mergedDeviceData.slice(startIndex, endIndex)
  }, [mergedDeviceData, currentPageDB, itemsPerPageDB])

  const today = new Date().toISOString().slice(0, 10)
  const paginatedDBDataToday = paginatedDBData.filter(device => {
    const metric = device.latestMetric
    if (!metric?.record_time) return false
    return metric.record_time.slice(0, 10) === today
  })

  const totalPagesDB = Math.ceil(mergedDeviceData.length / itemsPerPageDB)

  const filtered = useMemo(() => {
    const q = (debouncedQuery || '').trim().toLowerCase()
    return currents.filter((r: AnyObj) => {
      // if a device is selected, filter by exact device/ksave match first
      if (selectedDevice && selectedDevice !== 'all') {
        const rd = (r.device || r.ksave || r.ksave_id || r.device_id || '')?.toString() || ''
        if (rd !== selectedDevice) return false
      }
      if (!q) return true
      // otherwise match across common fields: series name/no, measurement/field, device, ksave, location
      // match across common fields: series name/no, measurement/field, device, ksave, location
      const name = (r.series_name || r.seriesName || (r.series && r.series.name) || '').toString().toLowerCase()
      const no = (r.series_no || r.seriesNo || (r.series && (r.series.no || r.series.number)) || '').toString().toLowerCase()
      const device = (r.device || r.ksave || r.ksave_id || '').toString().toLowerCase()
      const location = (r.location || r.site || '').toString().toLowerCase()
      const measurement = (r.measurement || r._measurement || '').toString().toLowerCase()
      const field = (r.field || r._field || '').toString().toLowerCase()
      return (
        name.includes(q) ||
        no.includes(q) ||
        device.includes(q) ||
        location.includes(q) ||
        measurement.includes(q) ||
        field.includes(q)
      )
    })
  }, [currents, debouncedQuery, selectedDevice])

  // Paginated filtered data for InfluxDB table
  const paginatedFiltered = useMemo(() => {
    const startIndex = (currentPageInflux - 1) * itemsPerPageInflux
    const endIndex = startIndex + itemsPerPageInflux
    return filtered.slice(startIndex, endIndex)
  }, [filtered, currentPageInflux, itemsPerPageInflux])

  const totalPagesInflux = Math.ceil(filtered.length / itemsPerPageInflux)

  const rows = useMemo(() => {
    if (loading) return [<tr key="loading"><td colSpan={24} style={{ padding: 20, textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <div style={{
          width: 20,
          height: 20,
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <span style={{ color: '#6b7280' }}>Loading data...</span>
      </div>
    </td></tr>]
    if (error) return [<tr key="error"><td colSpan={24} style={{ padding: 12, textAlign: 'center', color: '#b91c1c' }}>Error: {error}</td></tr>]
    if (!loading && currents.length === 0) return [<tr key="none"><td colSpan={24} style={{ padding: 12, textAlign: 'center' }}>No recent metrics</td></tr>]
    if (filtered.length === 0) return [<tr key="nomatch"><td colSpan={24} style={{ padding: 12, textAlign: 'center' }}>No matching metrics</td></tr>]

    const trs: React.ReactElement[] = []
    const totals = {
      b_L1: 0, b_L2: 0, b_L3: 0, b_kWh: 0, b_P: 0, b_Q: 0, b_S: 0, b_PF: 0, b_THD: 0, b_F: 0,
      m_L1: 0, m_L2: 0, m_L3: 0, m_kWh: 0, m_P: 0, m_Q: 0, m_S: 0, m_PF: 0, m_THD: 0, m_F: 0,
      er: 0,
      count: 0
    }

    paginatedFiltered.forEach((r: AnyObj, i: number) => {
      const before = r.power_before ?? r.before ?? {}
      const metrics = r.power_metrics ?? r.metrics ?? {}

      const b_L1 = Number(before.L1 ?? before.l1 ?? r.power_before_L1 ?? 0) || 0
      const b_L2 = Number(before.L2 ?? before.l2 ?? r.power_before_L2 ?? 0) || 0
      const b_L3 = Number(before.L3 ?? before.l3 ?? r.power_before_L3 ?? 0) || 0
      const b_kWh = Number(before.kWh ?? before.kwh ?? r.power_before_kWh ?? r.kWh ?? 0) || 0
      const b_P = Number(before.P ?? before.p ?? before.active_power ?? r.power_before_P ?? r.P ?? 0) || 0
      const b_Q = Number(before.Q ?? before.q ?? before.reactive_power ?? r.power_before_Q ?? r.Q ?? 0) || 0
      const b_S = Number(before.S ?? before.s ?? before.apparent_power ?? r.power_before_S ?? r.S ?? 0) || 0
      const b_PF = Number((before.PF ?? before.pf ?? before.power_factor ?? r.power_before_PF ?? r.PF ?? 0)) || 0
      const b_THD = Number(before.THD ?? before.thd ?? before.total_harmonic_distortion ?? r.power_before_THD ?? r.THD ?? 0) || 0
      const b_F = Number(before.F ?? before.f ?? before.freq ?? before.frequency ?? r.power_before_F ?? r.F ?? 0) || 0

      const m_L1 = Number(metrics.L1 ?? metrics.l1 ?? r.power_metrics_L1 ?? 0) || 0
      const m_L2 = Number(metrics.L2 ?? metrics.l2 ?? r.power_metrics_L2 ?? 0) || 0
      const m_L3 = Number(metrics.L3 ?? metrics.l3 ?? r.power_metrics_L3 ?? 0) || 0
      const m_kWh = Number(metrics.kWh ?? metrics.kwh ?? r.power_metrics_kWh ?? r.kWh ?? 0) || 0
      const m_P = Number(metrics.P ?? metrics.p ?? metrics.active_power ?? r.power_metrics_P ?? r.P ?? 0) || 0
      const m_Q = Number(metrics.Q ?? metrics.q ?? metrics.reactive_power ?? r.power_metrics_Q ?? r.Q ?? 0) || 0
      const m_S = Number(metrics.S ?? metrics.s ?? metrics.apparent_power ?? r.power_metrics_S ?? r.S ?? 0) || 0
      const m_PF = Number((metrics.PF ?? metrics.pf ?? metrics.power_factor ?? r.power_metrics_PF ?? r.PF ?? 0)) || 0
      const m_THD = Number(metrics.THD ?? metrics.thd ?? metrics.total_harmonic_distortion ?? r.power_metrics_THD ?? r.THD ?? 0) || 0
      const m_F = Number(metrics.F ?? metrics.f ?? metrics.freq ?? metrics.frequency ?? r.power_metrics_F ?? r.F ?? 0) || 0

      const er = Number(r.er ?? r.ER ?? r.efficiency_ratio ?? 0) || 0

      totals.b_L1 += b_L1
      totals.b_L2 += b_L2
      totals.b_L3 += b_L3
      totals.b_kWh += b_kWh
      totals.b_P += b_P
      totals.b_Q += b_Q
      totals.b_S += b_S
      totals.b_PF += b_PF
      totals.b_THD += b_THD
      totals.b_F += b_F

      totals.m_L1 += m_L1
      totals.m_L2 += m_L2
      totals.m_L3 += m_L3
      totals.m_kWh += m_kWh
      totals.m_P += m_P
      totals.m_Q += m_Q
      totals.m_S += m_S
      totals.m_PF += m_PF
      totals.m_THD += m_THD
      totals.m_F += m_F

      totals.er += er

      totals.count += 1

      trs.push(
        <tr key={i} style={{ borderTop: '1px solid #f1f5f9' }}>
          <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>{r.time ? new Date(r.time).toLocaleString() : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>{r.device || r.ksave || '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>{r.location || '-'}</td>

          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(b_L1) ? b_L1.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(b_L2) ? b_L2.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(b_L3) ? b_L3.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(b_kWh) ? b_kWh.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(b_P) ? b_P.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(b_Q) ? b_Q.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(b_S) ? b_S.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(b_PF) ? b_PF.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(b_THD) ? b_THD.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(b_F) ? b_F.toFixed(3) : '-'}</td>

          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(m_L1) ? m_L1.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(m_L2) ? m_L2.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(m_L3) ? m_L3.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(m_kWh) ? m_kWh.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(m_P) ? m_P.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(m_Q) ? m_Q.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(m_S) ? m_S.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(m_PF) ? m_PF.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(m_THD) ? m_THD.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(m_F) ? m_F.toFixed(3) : '-'}</td>

          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(er) ? er.toFixed(3) : '-'}</td>
        </tr>
      )
    })

    // totals row (sums for L1, L2, L3, kWh, P, Q, S, ER; averages for PF, THD, F)
    const cnt = totals.count || 1
    const avg = (v: number) => (cnt ? (v / cnt) : 0)
    trs.push(
      <tr key="totals" style={{ borderTop: '2px solid #cbd5e1', background: '#fbfdff', fontWeight: 700 }}>
        <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>Total</td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8 }}></td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8 }}></td>

        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{totals.b_L1.toFixed(3)}</td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{totals.b_L2.toFixed(3)}</td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{totals.b_L3.toFixed(3)}</td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{totals.b_kWh.toFixed(3)}</td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{totals.b_P.toFixed(3)}</td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{totals.b_Q.toFixed(3)}</td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{totals.b_S.toFixed(3)}</td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{avg(totals.b_PF).toFixed(3)}</td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{avg(totals.b_THD).toFixed(3)}</td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{avg(totals.b_F).toFixed(3)}</td>

        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{totals.m_L1.toFixed(3)}</td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{totals.m_L2.toFixed(3)}</td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{totals.m_L3.toFixed(3)}</td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{totals.m_kWh.toFixed(3)}</td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{totals.m_P.toFixed(3)}</td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{totals.m_Q.toFixed(3)}</td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{totals.m_S.toFixed(3)}</td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{avg(totals.m_PF).toFixed(3)}</td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{avg(totals.m_THD).toFixed(3)}</td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{avg(totals.m_F).toFixed(3)}</td>

        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{totals.er.toFixed(3)}</td>
      </tr>
    )

    return trs
  }, [filtered, loading, error, currents.length])

  return (
    <div className="page-shell">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Admin System</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link href="/sites" className="k-btn k-btn-ghost crisp-text">Back to Sites</Link>
          <Link href="/add-machine" className="k-btn k-btn-ghost crisp-text">Add Machine</Link>
          <Link href="/admin/set-values" className="k-btn k-btn-ghost crisp-text">Add Value</Link>
          <Link href="/admin/database" className="k-btn k-btn-ghost crisp-text">Database</Link>

          <button className="k-btn k-btn-primary crisp-text" onClick={handleLogout}>
            {token ? 'Logout' : 'Exit'}
          </button>
        </div>
      </header>

      <section style={{ marginTop: 18 }}>
        <h3>System Services</h3>
        <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <strong>InfluxDB:</strong>
            <span className="clickable-status">{services?.influx?.ok ? 'OK' : services?.influx?.ok === false ? 'Down' : 'Unknown'}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <strong>Grafana:</strong>
            <span className="clickable-status">{services?.grafana?.ok ? 'OK' : services?.grafana?.ok === false ? 'Down' : 'Unknown'}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <strong>MQTT:</strong>
            <span className="clickable-status">{services?.mqtt?.ok ? 'OK' : services?.mqtt?.ok === false ? 'Down' : 'Unknown'}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <strong>Telegraf:</strong>
            <span className="clickable-status">{services?.telegraf?.ok ? 'OK' : services?.telegraf?.ok === false ? 'Down' : 'Unknown'}</span>
          </div>
        </div>
      </section>

      <section style={{ marginTop: 18 }}>
        <div className="data-card" style={{ border: '2px solid #2563eb', borderRadius: 12, boxShadow: '0 2px 8px #e0e7ef', padding: 24, background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, color: '#2563eb' }}>Device Status (MySQL)</h3>
            <div style={{ fontSize: 14, color: '#6b7280' }}>
              {dbLoading ? 'Loading...' : `Last updated: ${lastUpdateTime}`}
            </div>
          </div>
          {/* ดึงข้อมูลจากฐานข้อมูล MySQL มาสร้างตารางด้านล่างนี้ */}
          <div className="k-table-wrapper" style={{ border: '1.5px solid #cbd5e1', borderRadius: 8, overflow: 'auto', background: '#f8fafc' }}>
            <table className="k-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th rowSpan={2} style={{ padding: 8, textAlign: 'left', border: '1px solid #e5e7eb' }}>Device Name</th>
                  <th rowSpan={2} style={{ padding: 8, textAlign: 'left', border: '1px solid #e5e7eb' }}>KSAVE ID</th>
                  <th rowSpan={2} style={{ padding: 8, textAlign: 'left', border: '1px solid #e5e7eb' }}>Location</th>
                  <th rowSpan={2} style={{ padding: 8, textAlign: 'left', border: '1px solid #e5e7eb' }}>Status</th>
                  <th colSpan={7} style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb', background: '#fef3c7' }}>Power Before</th>
                  <th colSpan={7} style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb', background: '#dbeafe' }}>Power Metrics</th>
                  <th rowSpan={2} style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb' }}>ER</th>
                  <th rowSpan={2} style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb' }}>Energy Reduction</th>
                  <th rowSpan={2} style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb' }}>CO2 Reduction</th>
                  <th rowSpan={2} style={{ padding: 8, textAlign: 'left', border: '1px solid #e5e7eb' }}>Last Update</th>
                </tr>
                <tr>
                  <th style={{ padding: 8, textAlign: 'right', border: '1px solid #e5e7eb', background: '#fef3c7' }}>L1 (V)</th>
                  <th style={{ padding: 8, textAlign: 'right', border: '1px solid #e5e7eb', background: '#fef3c7' }}>L2 (V)</th>
                  <th style={{ padding: 8, textAlign: 'right', border: '1px solid #e5e7eb', background: '#fef3c7' }}>L3 (V)</th>
                  <th style={{ padding: 8, textAlign: 'right', border: '1px solid #e5e7eb', background: '#fef3c7' }}>kWh</th>
                  <th style={{ padding: 8, textAlign: 'right', border: '1px solid #e5e7eb', background: '#fef3c7' }}>PF</th>
                  <th style={{ padding: 8, textAlign: 'right', border: '1px solid #e5e7eb', background: '#fef3c7' }}>THD</th>
                  <th style={{ padding: 8, textAlign: 'right', border: '1px solid #e5e7eb', background: '#fef3c7' }}>F (Hz)</th>
                  <th style={{ padding: 8, textAlign: 'right', border: '1px solid #e5e7eb', background: '#dbeafe' }}>L1 (V)</th>
                  <th style={{ padding: 8, textAlign: 'right', border: '1px solid #e5e7eb', background: '#dbeafe' }}>L2 (V)</th>
                  <th style={{ padding: 8, textAlign: 'right', border: '1px solid #e5e7eb', background: '#dbeafe' }}>L3 (V)</th>
                  <th style={{ padding: 8, textAlign: 'right', border: '1px solid #e5e7eb', background: '#dbeafe' }}>kWh</th>
                  <th style={{ padding: 8, textAlign: 'right', border: '1px solid #e5e7eb', background: '#dbeafe' }}>PF</th>
                  <th style={{ padding: 8, textAlign: 'right', border: '1px solid #e5e7eb', background: '#dbeafe' }}>THD</th>
                  <th style={{ padding: 8, textAlign: 'right', border: '1px solid #e5e7eb', background: '#dbeafe' }}>F (Hz)</th>
                </tr>
              </thead>
              <tbody>
                {dbLoading && mergedDeviceData.length === 0 ? (
                  <tr>
                    <td colSpan={20} style={{ padding: 20, textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <div style={{
                          width: 20,
                          height: 20,
                          border: '3px solid #e5e7eb',
                          borderTop: '3px solid #2563eb',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }}></div>
                        <span style={{ color: '#6b7280' }}>Loading database...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedDBData.length === 0 ? (
                  <tr>
                    <td colSpan={20} style={{ padding: 12, textAlign: 'center' }}>No records found</td>
                  </tr>
                ) : (
                  paginatedDBData.map((device, i) => {
                    const metric = device.latestMetric
                    const deviceData = device as any
                    const statusColor = deviceData.status === 'ON' ? '#10B981' : '#EF4444'
                    return (
                      <tr key={i} style={{ borderTop: '1px solid #f1f5f9' }}>
                        <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>{deviceData.devicename || '-'}</td>
                        <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>{deviceData.ksaveid || '-'}</td>
                        <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>{metric?.location || deviceData.location || '-'}</td>
                        <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            borderRadius: 4,
                            background: statusColor,
                            color: '#fff',
                            fontSize: 12,
                            fontWeight: 600
                          }}>
                            {deviceData.status || '-'}
                          </span>
                        </td>
                        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right', background: '#fffbeb' }}>{metric?.before_L1 != null ? Number(metric.before_L1).toFixed(2) : '-'}</td>
                        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right', background: '#fffbeb' }}>{metric?.before_L2 != null ? Number(metric.before_L2).toFixed(2) : '-'}</td>
                        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right', background: '#fffbeb' }}>{metric?.before_L3 != null ? Number(metric.before_L3).toFixed(2) : '-'}</td>
                        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right', background: '#fffbeb' }}>{metric?.before_kWh != null ? Number(metric.before_kWh).toFixed(3) : '-'}</td>
                        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right', background: '#fffbeb' }}>{metric?.before_PF != null ? Number(metric.before_PF).toFixed(3) : '-'}</td>
                        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right', background: '#fffbeb' }}>{metric?.before_THD != null ? Number(metric.before_THD).toFixed(3) : '-'}</td>
                        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right', background: '#fffbeb' }}>{metric?.before_F != null ? Number(metric.before_F).toFixed(3) : '-'}</td>
                        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right', background: '#eff6ff' }}>{metric?.metrics_L1 != null ? Number(metric.metrics_L1).toFixed(2) : '-'}</td>
                        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right', background: '#eff6ff' }}>{metric?.metrics_L2 != null ? Number(metric.metrics_L2).toFixed(2) : '-'}</td>
                        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right', background: '#eff6ff' }}>{metric?.metrics_L3 != null ? Number(metric.metrics_L3).toFixed(2) : '-'}</td>
                        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right', background: '#eff6ff' }}>{metric?.metrics_kWh != null ? Number(metric.metrics_kWh).toFixed(3) : '-'}</td>
                        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right', background: '#eff6ff' }}>{metric?.metrics_PF != null ? Number(metric.metrics_PF).toFixed(3) : '-'}</td>
                        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right', background: '#eff6ff' }}>{metric?.metrics_THD != null ? Number(metric.metrics_THD).toFixed(3) : '-'}</td>
                        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right', background: '#eff6ff' }}>{metric?.metrics_F != null ? Number(metric.metrics_F).toFixed(3) : '-'}</td>
                        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right', fontWeight: 600, color: metric?.energy_reduction > 0 ? '#059669' : '#6b7280' }}>{metric?.energy_reduction != null ? Number(metric.energy_reduction).toFixed(3) : '-'}</td>
                        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right', fontWeight: 600, color: metric?.co2_reduction > 0 ? '#059669' : '#6b7280' }}>{metric?.co2_reduction != null ? Number(metric.co2_reduction).toFixed(4) : '-'}</td>
                        <td style={{ border: '1px solid #e5e7eb', borderRight: '2px solid #2563eb', borderBottom: '1px solid #e5e7eb', padding: 8 }}>
                          {metric?.timestamp ? new Date(metric.timestamp).toLocaleString() : '-'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section style={{ marginTop: 18 }}>
        <h3>Current readings (from Influx)</h3>
        <div className="controls-right" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ fontSize: 14, color: '#6b7280' }}>
            {loading ? 'Loading...' : lastInfluxUpdate ? `Last updated: ${lastInfluxUpdate.toLocaleTimeString()}` : 'No data'}
          </div>
        </div>

        <div style={{ height: 8 }} />

        {/* Date/time controls placed inside a small inset card for spacing & clarity */}
        <div className="controls-card">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 220, flex: '0 0 240px' }}>
              <label style={{ fontSize: 12, color: '#374151' }}>From</label>
              <input type="datetime-local" className="k-input" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 220, flex: '0 0 240px' }}>
              <label style={{ fontSize: 12, color: '#374151' }}>To</label>
              <input type="datetime-local" className="k-input" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
            </div>
            {/* Search button removed per user request; users can use the lower search input or refresh via range controls */}
          </div>
        </div>

        <div className="search-controls" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select className="k-input narrow" value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)}>
            <option value="all">All devices</option>
            {devicesFromInflux.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <input className="k-input narrow" placeholder="Search (series name / no / device / ksave / location)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <button className="k-btn k-btn-ghost crisp-text" onClick={async (e) => {
            // visual click feedback: add 'clicked' class briefly
            try { (e.currentTarget as HTMLElement).classList.add('clicked') } catch (_) {}
            setTimeout(() => { try { (e.currentTarget as HTMLElement).classList.remove('clicked') } catch (_) {} }, 260)
            setDebouncedQuery(searchQuery.trim());
            // also trigger a fetch that respects the date selectors and range
            try {
              setLoading(true)
              setError(null)
              let url = `/api/influx/currents?range=${encodeURIComponent(selectedRange)}`
              if (startAt && endAt) {
                const startIso = new Date(startAt).toISOString()
                const endIso = new Date(endAt).toISOString()
                url = `/api/influx/currents?start=${encodeURIComponent(startIso)}&stop=${encodeURIComponent(endIso)}`
              }
              const res = await fetch(url)
              const body = await res.json().catch(() => ({}))
              if (!res.ok) {
                setError(body?.error || 'Failed to load currents')
              } else {
                setCurrents(body.rows || body || [])
                setLastInfluxUpdate(new Date())
              }
            } catch (err: any) {
              setError(String(err?.message || err))
            } finally { setLoading(false) }
          }}>Search</button>
        </div>

        <div style={{ marginTop: 12 }} className="k-table-wrapper">
          <table className="k-table">
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th rowSpan={2} style={{ padding: 8, textAlign: 'left', border: '1px solid #e5e7eb' }}>Time</th>
              <th rowSpan={2} style={{ padding: 8, textAlign: 'left', border: '1px solid #e5e7eb' }}>Device</th>
              <th rowSpan={2} style={{ padding: 8, textAlign: 'left', border: '1px solid #e5e7eb' }}>Site</th>
              <th colSpan={10} className="power-group-header" style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb' }}>Power (before)</th>
              <th colSpan={10} className="power-group-header" style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb' }}>Power (metrics)</th>
              <th rowSpan={2} style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb' }}>ER</th>
            </tr>
            <tr>
              {['L1','L2','L3','kWh','P','Q','S','PF','THD','F'].map((c) => (
                <th key={`before-${c}`} style={{ padding: 8, textAlign: 'right', border: '1px solid #e5e7eb' }}>{c}</th>
              ))}
              {['L1','L2','L3','kWh','P','Q','S','PF','THD','F'].map((c) => (
                <th key={`metrics-${c}`} style={{ padding: 8, textAlign: 'right', border: '1px solid #e5e7eb' }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
      
      {/* InfluxDB Pagination Controls */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, padding: '0 8px' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ fontSize: 14, color: '#374151' }}>Items per page:</label>
            <select 
              className="k-input" 
              style={{ width: 80, padding: '4px 8px' }}
              value={itemsPerPageInflux} 
              onChange={(e) => {
                setItemsPerPageInflux(Number(e.target.value))
                setCurrentPageInflux(1)
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span style={{ fontSize: 14, color: '#6b7280' }}>
              Showing {((currentPageInflux - 1) * itemsPerPageInflux) + 1} - {Math.min(currentPageInflux * itemsPerPageInflux, filtered.length)} of {filtered.length}
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: 4 }}>
            <button 
              className="k-btn k-btn-ghost" 
              style={{ padding: '6px 12px', fontSize: 14 }}
              onClick={() => setCurrentPageInflux(Math.max(1, currentPageInflux - 1))}
              disabled={currentPageInflux === 1}
            >
              ← Previous
            </button>
            
            {Array.from({ length: Math.min(5, totalPagesInflux) }, (_, i) => {
              let pageNum
              if (totalPagesInflux <= 5) {
                pageNum = i + 1
              } else if (currentPageInflux <= 3) {
                pageNum = i + 1
              } else if (currentPageInflux >= totalPagesInflux - 2) {
                pageNum = totalPagesInflux - 4 + i
              } else {
                pageNum = currentPageInflux - 2 + i
              }
              
              return (
                <button
                  key={pageNum}
                  className="k-btn"
                  style={{
                    padding: '6px 12px',
                    fontSize: 14,
                    background: currentPageInflux === pageNum ? '#2563eb' : 'transparent',
                    color: currentPageInflux === pageNum ? '#fff' : '#374151'
                  }}
                  onClick={() => setCurrentPageInflux(pageNum)}
                >
                  {pageNum}
                </button>
              )
            })}
            
            <button 
              className="k-btn k-btn-ghost" 
              style={{ padding: '6px 12px', fontSize: 14 }}
              onClick={() => setCurrentPageInflux(Math.min(totalPagesInflux, currentPageInflux + 1))}
              disabled={currentPageInflux === totalPagesInflux}
            >
              Next →
            </button>
          </div>
        </div>
      )}
      </section>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* InfluxDB to MySQL Real-time Sync Component */}
      {/* <InfluxToMysqlSync /> Uncomment if component exists */}
    </div>
  )
}
