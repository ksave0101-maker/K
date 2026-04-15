"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Machine = {
  id: string
  name: string
  status?: string
  power?: string
  ksave?: string
  powerValue?: number
  location?: string
  ipAddress?: string
  beforeMeterNo?: string
  metricsMeterNo?: string
  phone?: string
}
function MachineCard({ m, services, selectedSiteFilter }: { m: Machine; services?: any; selectedSiteFilter?: string }) {
    // Stub for saveDeviceMetrics to prevent TS error
    function saveDeviceMetrics() {
      // TODO: implement saving device metrics if needed
    }
  const [isMounted, setIsMounted] = useState(false)
  const [now, setNow] = useState<Date | null>(null)
  const [devicePower, setDevicePower] = useState<string | null>(null)
  const [devicePowerValue, setDevicePowerValue] = useState<number | null>(null)
  const [deviceKsave, setDeviceKsave] = useState<string | null>(null)
  const [seriesName, setSeriesName] = useState<string | null>(null)
  const [seriesNo, setSeriesNo] = useState<string | null>(null)
  const [localSeriesNo, setLocalSeriesNo] = useState<string | null>(null)
  const [deviceLocation, setDeviceLocation] = useState<string | null>(null)
  const [deviceSecondsAgo, setDeviceSecondsAgo] = useState<number | null>(null)
  const [deviceReportingOk, setDeviceReportingOk] = useState<boolean | null>(null)
  const router = useRouter()

  // Ensure component only renders on client after mount
  useEffect(() => {
    setIsMounted(true)
    setNow(new Date())
  }, [])

  useEffect(() => {
    if (!isMounted) return
    const iv = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(iv)
  }, [isMounted])

  // fetch per-device latest metrics from Influx (best-effort)
  useEffect(() => {
    let mounted = true
    const id = m.ksave || m.id
    if (!id) return
    async function fetchDevice() {
      try {
        const res = await fetch(`/api/influx/device?id=${encodeURIComponent(id)}`)
        if (!res.ok) return
        const body = await res.json()
        if (!mounted) return
        const raw = body.raw || ''
        // if the server already provided parsed fields, use them
        if (body.parsed) {
          if (body.parsed.seriesName) setSeriesName(String(body.parsed.seriesName))
          if (body.parsed.seriesNo) setSeriesNo(String(body.parsed.seriesNo))
          if (body.parsed.location) setDeviceLocation(String(body.parsed.location))
          if (typeof body.parsed.secondsAgo === 'number') setDeviceSecondsAgo(body.parsed.secondsAgo)
          if (typeof body.parsed.ok === 'boolean') setDeviceReportingOk(body.parsed.ok)
        }

        // try to extract a numeric _value from the raw JSON/text as fallback for seriesNo
        const match = String(raw).match(/"_value"\s*:\s*([0-9.+\-eE]+)/)
        if (match) {
          const v = Number(match[1])
          if (!Number.isNaN(v)) {
            setDevicePowerValue(v)
            // keep old devicePower for compatibility but we prefer seriesNo for display
            setDevicePower(`${v} W`)
            if (!seriesNo) setSeriesNo(String(v))
          }
        } else {
          // fallback: look for a number in the text
          const mnum = String(raw).match(/([0-9]+(?:\.[0-9]+)?)/)
          if (mnum) {
            setDevicePower(`${mnum[1]} W`)
            if (!seriesNo) setSeriesNo(String(mnum[1]))
          }
        }

  // try to find a ksave or other name tag in the response as fallback for seriesName
  const mk = String(raw).match(/"ksave"\s*:\s*"([^\"]+)"/i)
  const sMatch = String(raw).match(/"series(?:_name)?"\s*:\s*"([^\"]+)"/i)
  const mMatch = String(raw).match(/"_measurement"\s*:\s*"([^\"]+)"/i)
  if (mk && !seriesName) setSeriesName(mk[1])
  else if (sMatch && !seriesName) setSeriesName(sMatch[1])
  else if (mMatch && !seriesName) setSeriesName(mMatch[1])

  // try to extract a location/site tag for display
  const locMatch = String(raw).match(/"location"\s*:\s*"([^\"]+)"/i)
  const siteMatch = String(raw).match(/"site(?:_name)?"\s*:\s*"([^\"]+)"/i)
  const locTagMatch = String(raw).match(/"loc"\s*:\s*"([^\"]+)"/i)
  if (locMatch && !deviceLocation) setDeviceLocation(locMatch[1])
  else if (siteMatch && !deviceLocation) setDeviceLocation(siteMatch[1])
  else if (locTagMatch && !deviceLocation) setDeviceLocation(locTagMatch[1])
      } catch (e) {
        // ignore
      }
    }
    fetchDevice()
    // no interval to avoid many queries; if you want polling, add an interval here
    return () => { mounted = false }
  }, [m.id, m.ksave])

  // Save metrics to database whenever they change
  useEffect(() => {
    if (seriesName || seriesNo || devicePowerValue || deviceLocation || deviceReportingOk !== null) {
      saveDeviceMetrics()
    }
  }, [seriesName, seriesNo, devicePowerValue, deviceLocation, deviceReportingOk, deviceSecondsAgo])

  // Ensure a stable 10-digit series number per device when Influx doesn't provide one.
  useEffect(() => {
    
    try {
      const idKey = (m.ksave || m.id || '').toString()
      if (!idKey) return
      const storageKey = `seriesNo:${idKey}`
      // If server provided a seriesNo, persist it to localStorage and use it
      if (seriesNo) {
        try { localStorage.setItem(storageKey, seriesNo) } catch (e) {}
        setLocalSeriesNo(seriesNo)
        return
      }
      // otherwise read or generate a stable 10-digit number
      let existing = null
      try { existing = localStorage.getItem(storageKey) } catch (e) { existing = null }
      if (existing) {
        setLocalSeriesNo(existing)
        return
      }
      // generate a 10-digit run number between 1000000000 and 9999999999
      const gen = String(Math.floor(1000000000 + Math.random() * 9000000000))
      try { localStorage.setItem(storageKey, gen) } catch (e) {}
      setLocalSeriesNo(gen)
    } catch (e) {
      // ignore
    }
  }, [m.id, m.ksave, seriesNo])

  return (
    <div className="card crisp-text machine-card" style={{ minWidth: 340, maxWidth: 520, flex: '0 0 auto', marginRight: 12, marginBottom: 12, padding: 16 }}>
      <div className="machine-card-header">
        <div>
          <div className="machine-name">{m.name}</div>
          <div className="machine-sub" title={deviceLocation ? 'Value from InfluxDB' : (m.location ? 'Value from machine metadata' : (selectedSiteFilter && selectedSiteFilter !== 'All' ? 'Site from current filter' : 'No site tag in InfluxDB'))}>
            Site: {deviceLocation ?? m.location ?? (selectedSiteFilter && selectedSiteFilter !== 'All' ? selectedSiteFilter : '—')}
          </div>
          <div className="machine-sub" style={{ marginTop: 6 }}>{isMounted && now ? now.toLocaleString() : '—'}</div>
          <div className="machine-sub">
            IP: {m.ipAddress || (m.ksave ? `${m.ksave.toLowerCase()}.local` : '—')}
          </div>
          <div className="machine-sub">
            Before Meter No: {m.beforeMeterNo ?? '—'}
          </div>
          <div className="machine-sub">
            Metrics Meter No: {m.metricsMeterNo ?? '—'}
          </div>
          <div className="machine-sub">
            Phone: {m.phone ?? '—'}
          </div>
        </div>

        <div className={"status-pill " + (m.status === 'OK' ? 'ok' : (m.status === 'Warning' ? 'warn' : ''))}>
          {m.status === 'OK' ? 'ON' : m.status === 'Warning' ? 'OFF' : ''}
        </div>
      </div>

      <div className="machine-info-row">
        <div className="machine-info">
          <div className="label">K-Save ID:</div>
          <div className="value">{(seriesName ?? m.ksave ?? m.name) ?? ''}</div>
        </div>
        <div className="machine-info">
          <div className="label">Series no:</div>
          <div className="value">{(seriesNo ?? localSeriesNo) ?? ''}</div>
        </div>
      </div>

  <div className="machine-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          className="k-btn k-btn-ghost machine-action-btn"
          style={{ flex: '0 0 auto', padding: '8px 16px', fontSize: 16, width: 'auto', minWidth: 0, whiteSpace: 'nowrap', fontWeight: 600 }}
          onClick={() => {
            const deviceId = (m.ksave || m.id || '').toUpperCase()

            // KSave01 uses Node-RED Dashboard (updated URL)
            if (deviceId === 'KSAVE01') {
              window.open('https://ksave01-nodered.ngrok.app/ui', '_blank')
            } else {
              // Other devices use new monitoring page
              router.push(`/device-monitoring?device=${encodeURIComponent(m.ksave || m.id || '')}`)
            }
          }}
        >
          📊 Monitoring
        </button>
        <button
          className="k-btn k-btn-ghost machine-action-btn small"
          style={{ padding: '6px 10px', fontSize: 16, width: 'auto', minWidth: 0, whiteSpace: 'nowrap' }}
          onClick={() => {
            const deviceId = m.ksave || m.id || ''
            router.push(`/reports?device=${encodeURIComponent(deviceId)}`)
          }}
        >
          Report Carbon
        </button>
        <button
          className="k-btn k-btn-ghost machine-action-btn small"
          style={{ padding: '6px 10px', fontSize: 16, width: 'auto', minWidth: 0, whiteSpace: 'nowrap' }}
          onClick={() => {
            const id = m.ksave || m.id || ''
            // navigate to analytics page and pass device id as query param
            router.push(`/analytics/exprolore?device=${encodeURIComponent(id)}`)
          }}
        >
          Peak Analysis
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 10, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} title={deviceSecondsAgo != null ? `Last point ${deviceSecondsAgo} seconds ago` : (deviceReportingOk === true ? 'Connected' : 'Disconnected')}>
          <div style={{ width: 10, height: 10, borderRadius: 6, background: deviceReportingOk === true ? '#10B981' : '#EF4444' }} />
          <div style={{ fontSize: 16, color: '#374151' }}>Telegraf</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} title={deviceSecondsAgo != null ? `Last point ${deviceSecondsAgo} seconds ago` : (deviceReportingOk === true ? 'Connected' : 'Disconnected')}>
          <div style={{ width: 10, height: 10, borderRadius: 6, background: deviceReportingOk === true ? '#10B981' : '#EF4444' }} />
          <div style={{ fontSize: 16, color: '#374151' }}>Grafana</div>
        </div>
      </div>
    </div>
  )
}

function ServiceCard({ name, status, info }: { name: string; status?: boolean; info?: any }) {
  // show only green (ok) or red (not ok). undefined is treated as not ok (red).
  const color = status ? '#10B981' : '#EF4444'
  const label = status ? 'Connected' : 'Disconnected'
  return (
    <div className="card service-card crisp-text" title={info ? JSON.stringify(info) : undefined} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 8, borderRadius: 8, background: '#fff', border: '1px solid #e5e7eb', position: 'relative' }}>
      <div style={{ fontSize: 14, color: '#374151', fontWeight: 700 }}>{name}</div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 6, background: color, color: '#fff', fontSize: 14 }}>{label}</div>
    </div>
  )
}

export default function SitesPage() {
  const router = useRouter()
  const [machines, setMachines] = useState<Machine[]>([])
  const [user, setUser] = useState<string | null>(null)
  const [services, setServices] = useState<any | null>(null)
  const [locationsFromInflux, setLocationsFromInflux] = useState<string[] | null>(null)
  const [devicesData, setDevicesData] = useState<any[]>([])

  // Fetch devices with IP addresses from database (real-time polling every 3 seconds)
  useEffect(() => {
    let mounted = true
    async function fetchDevices() {
      try {
        const res = await fetch('/api/devices')
        if (!res.ok) return
        const body = await res.json()
        if (mounted && body.devices) {
          setDevicesData(body.devices)
        }
      } catch (e) {
        console.error('Failed to fetch devices:', e)
      }
    }
    fetchDevices()
    const interval = setInterval(fetchDevices, 3000) // Poll every 3 seconds for real-time updates
    return () => { 
      mounted = false
      clearInterval(interval)
    }
  }, [])

  // poll service status every 5s
  useEffect(() => {
    let mounted = true
    async function fetchStatus() {
      try {
        const res = await fetch('/api/status')
        if (!res.ok) return
        const body = await res.json()
        if (mounted) setServices(body.services)
      } catch (_) {}
    }
    fetchStatus()
    const iv = setInterval(fetchStatus, 5000)
    return () => {
      mounted = false
      clearInterval(iv)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    async function fetchTags() {
      try {
        const res = await fetch('/api/influx/tags')
        if (!res.ok) return
        const body = await res.json()
        if (!mounted) return
        if (body && Array.isArray(body.locations)) setLocationsFromInflux(body.locations)
      } catch (e) {
        // ignore
      }
    }
    fetchTags()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (devicesData.length === 0) return
    
    // Load machines from database with real-time data
    const machines = devicesData.map(device => {
      // Map database status: ON -> OK, OFF -> Warning
      const status = device.status === 'ON' ? 'OK' : device.status === 'OFF' ? 'Warning' : 'OK'
      
      return {
        id: device.deviceName,
        name: device.deviceName,
        status: status,
        ksave: device.ksaveID,
        location: device.location,
        ipAddress: device.ipAddress,
        beforeMeterNo: device.beforeMeterNo,
        metricsMeterNo: device.metricsMeterNo,
        phone: device.phone
      }
    })
    
    setMachines(machines)
    try {
      const u = localStorage.getItem('k_system_user')
      setUser(u)
    } catch (_) {}
  }, [devicesData])

  function handleOpenAllBefore() {
    router.push('/monitor/Compare-Monitoring')
  }

  // filters and sorting
  const [locationFilter, setLocationFilter] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [sortMode, setSortMode] = useState<string>('efficiency_desc')

  const locations = Array.from(new Set(machines.map((m) => m.location || 'Unknown')))

  function getFilteredSortedMachines() {
    let out = machines.slice()
    if (locationFilter !== 'All') {
      out = out.filter((m) => (m.location || 'Unknown') === locationFilter)
    }
    if (statusFilter !== 'All') {
      if (statusFilter === 'ON') {
        out = out.filter((m) => (m.status || '') === 'OK')
      } else if (statusFilter === 'OFF') {
        out = out.filter((m) => (m.status || '') === 'Warning')
      } else {
        out = out.filter((m) => (m.status || '') === statusFilter)
      }
    }

    if (sortMode === 'efficiency_desc') {
      // most efficient (lowest powerValue) to least
      out.sort((a, b) => (a.powerValue ?? 0) - (b.powerValue ?? 0))
    } else if (sortMode === 'power_asc') {
      out.sort((a, b) => (a.powerValue ?? 0) - (b.powerValue ?? 0))
    } else if (sortMode === 'power_desc') {
      out.sort((a, b) => (b.powerValue ?? 0) - (a.powerValue ?? 0))
    } else if (sortMode === 'id_asc') {
      // sort by numeric part of device id (e.g., Ksave01 -> 1)
      const extractNumber = (id?: string) => {
        if (!id) return 0
        const m = id.match(/\d+/)
        return m ? parseInt(m[0], 10) : 0
      }
      out.sort((a, b) => extractNumber(a.id) - extractNumber(b.id))
    }
    return out
  }

  return (
    <div className="page-shell" style={{ padding: 20, background: '#f3f4f6', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <h2 style={{ margin: 0 }}>K System Energy - Monitoring</h2>
          <div style={{ fontSize: 15, color: '#6b7280' }}>Devices and monitoring overview</div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8, marginLeft: 12 }}>
            <ServiceCard name="InfluxDB" status={services?.influx?.ok} info={services?.influx?.info} />
            <ServiceCard name="Grafana" status={services?.grafana?.ok} info={services?.grafana?.info} />
            <ServiceCard name="Telegraf" status={services?.telegraf?.ok} />
            <ServiceCard name="MQTT" status={services?.mqtt?.ok} />
          </div>
          <button
            className="k-btn k-btn-primary crisp-text"
            onClick={handleOpenAllBefore}
            style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: 8,
              border: 0,
              fontSize: 18,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
            }}
          >
            📊 Compare Monitoring
          </button>

        </div>
      </header>

      <section style={{ marginBottom: 12 }}>
        <div style={{ marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
          <label style={{ fontSize: 17 }}>Site:</label>
          <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} style={{ padding: 10, borderRadius: 6, fontSize: 17 }}>
            <option value="All">All</option>
            {(locationsFromInflux && locationsFromInflux.length > 0 ? locationsFromInflux : locations).map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          <label style={{ fontSize: 17 }}>Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: 10, borderRadius: 6, fontSize: 17 }}>
            <option value="All">All</option>
            <option value="ON">ON</option>
            <option value="OFF">OFF</option>
          </select>

          <label style={{ fontSize: 17 }}>Sort:</label>
          <select value={sortMode} onChange={(e) => setSortMode(e.target.value)} style={{ padding: 10, borderRadius: 6, fontSize: 17 }}>
            <option value="efficiency_desc">Efficiency: High → Low</option>
            <option value="power_asc">Power: Low → High</option>
            <option value="power_desc">Power: High → Low</option>
            <option value="id_asc">Device no: Low → High</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {getFilteredSortedMachines().map((m) => (
            <MachineCard key={m.id} m={m} services={services} selectedSiteFilter={locationFilter} />
          ))}
        </div>
      </section>
    </div>
  )
}
