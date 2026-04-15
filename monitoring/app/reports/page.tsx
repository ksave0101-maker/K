"use client"

import React, { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

type AnyObj = Record<string, any>

function AdminPageContent(): React.ReactElement {
  const router = useRouter()
  const searchParams = useSearchParams()
  const deviceParam = searchParams.get('device')
  const [token, setToken] = useState<string | null>(null)

  // Add print styles
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @media print {
        @page {
          size: A4 landscape;
          margin: 8mm 6mm 8mm 6mm;
        }
        body {
          counter-reset: page 1;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body, html {
          background: white !important;
        }
        .print\\:hidden { display: none !important; }
        .page-shell {
          margin: 0;
          padding: 0;
          width: 100%;
          max-width: none;
          font-family: Arial, sans-serif;
          background: white !important;
          position: relative;
        }
        section {
          position: relative !important;
        }
        .watermark-logo {
          display: block !important;
          position: fixed !important;
          top: 0% !important;
          right: 5% !important;
          width: 160px !important;
          height: 160px !important;
          max-width: none !important;
          opacity: 1 !important;
          z-index: 999 !important;
          pointer-events: none !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
          filter: brightness(1.1) saturate(1.2) !important;
          background: transparent !important;
          padding: 0 !important;
          margin: 0 !important;
          border: none !important;
          box-shadow: none !important;
          outline: none !important;
          mix-blend-mode: multiply !important;
        }
        section > div {
          position: relative !important;
          z-index: 2 !important;
        }
        .print-page-number {
          display: none !important;
        }
        @media print {
          .print-page-number {
            display: block !important;
            position: fixed;
            top: 3mm;
            right: 8mm;
            text-align: right;
            font-size: 11px;
            color: #374151;
            font-family: Arial, sans-serif;
            font-weight: 600;
          }
          .print-page-number::before {
            content: "Page " counter(page);
          }
        }
        header {
          display: block !important;
          margin-bottom: 6px;
          text-align: center;
          page-break-after: avoid;
        }
        h1 {
          display: block !important;
          font-size: 21px !important;
          margin: 0 0 4px 0;
          font-weight: bold;
          line-height: 1.1;
        }
        h3 {
          display: block !important;
          font-size: 10px; 
          margin: 2px 0; 
          font-weight: normal;
          line-height: 1.1;
        }
        section {
          margin: 3px 0;
          page-break-inside: avoid;
        }
        .data-card { 
          box-shadow: none; 
          border: none;
          margin: 0;
          padding: 0;
        }
        .k-table-wrapper {
          overflow: visible;
          width: 100%;
        }
        table.k-table {
          font-size: 9px !important;
          width: 100%;
          border-collapse: collapse;
          margin: 0;
          table-layout: auto;
        }
        .k-table th {
          padding: 3px 5px !important;
          font-size: 10px !important;
          font-weight: bold;
          text-align: center !important;
          border: 0.2px solid #333 !important;
          background: white !important;
          line-height: 1.2;
          white-space: nowrap;
          min-width: 35px;
        }
        .k-table td {
          padding: 2px 4px !important;
          font-size: 9px !important;
          border: 0.1px solid #333 !important;
          text-align: center !important;
          line-height: 1.2;
          white-space: nowrap;
          overflow: visible;
        }
        .k-table td:nth-child(1),
        .k-table td:nth-child(2),
        .k-table td:nth-child(3) {
          text-align: left !important;
          font-size: 8px !important;
          white-space: nowrap;
        }
        .k-table thead th {
          height: auto;
          vertical-align: middle;
          white-space: nowrap;
        }
        .k-table tbody tr {
          height: auto;
          page-break-inside: avoid;
        }
        .k-table tbody tr:nth-child(even) {
          background: white !important;
        }
        .k-table tbody tr:last-child {
          background: white !important;
          font-weight: bold !important;
          border-top: 2px solid #000 !important;
        }
        .k-table tbody tr:last-child td {
          font-size: 9px !important;
          font-weight: bold !important;
          padding: 2px 4px !important;
        }
        .k-table td:last-child {
          background: white !important;
          color: #000 !important;
          font-weight: bold !important;
          white-space: nowrap;
        }
        /* Remove fixed column widths for auto-sizing */
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])
  const [services, setServices] = useState<AnyObj | null>(null)

  const [currents, setCurrents] = useState<AnyObj[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [debouncedQuery, setDebouncedQuery] = useState<string>('')
  const [selectedRange, setSelectedRange] = useState<string>('-1h')
  const [selectedDevice, setSelectedDevice] = useState<string>('all')
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

  useEffect(() => {
    try { setToken(localStorage.getItem('k_system_admin_token')) } catch (_) {}
    // Set device from URL parameter
    if (deviceParam) setSelectedDevice(deviceParam)
  }, [deviceParam])

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
          if (mounted) setCurrents(body.rows || body || [])
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

  const devices = useMemo(() => {
    const s = new Set<string>()
    for (const r of currents) {
      const d = (r.device || r.ksave || r.ksave_id || r.device_id || '')?.toString() || ''
      if (d) s.add(d)
    }
    return Array.from(s).sort()
  }, [currents])

  const filtered = useMemo(() => {
    const q = (debouncedQuery || '').trim().toLowerCase()
    const result = currents.filter((r: AnyObj) => {
      // if a device is selected, filter by exact device/ksave match first
      if (selectedDevice && selectedDevice !== 'all') {
        const rd = (r.device || r.ksave || r.ksave_id || r.device_id || '')?.toString().toUpperCase() || ''
        const selectedUpper = selectedDevice.toUpperCase()
        // Check both exact match and case-insensitive match
        if (rd !== selectedDevice && rd !== selectedUpper) return false
      }
      if (!q) return true
      // otherwise match across common fields: series name/no, measurement/field, device, ksave, location
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

    // Debug log
    console.log('Filter Debug:', {
      selectedDevice,
      totalCurrents: currents.length,
      filteredCount: result.length,
      sampleDevices: currents.slice(0, 3).map(r => ({
        device: r.device,
        ksave: r.ksave
      }))
    })

    return result
  }, [currents, debouncedQuery, selectedDevice])

  const rows = useMemo(() => {
    if (loading) return [<tr key="loading"><td colSpan={24} style={{ padding: 20, textAlign: 'center', fontSize: 16, color: '#6b7280' }}>Loading…</td></tr>]
    if (error) return [<tr key="error"><td colSpan={24} style={{ padding: 20, textAlign: 'center', fontSize: 16, color: '#dc2626', fontWeight: 600 }}>Error: {error}</td></tr>]
    if (!loading && currents.length === 0) return [<tr key="none"><td colSpan={24} style={{ padding: 20, textAlign: 'center', fontSize: 16, color: '#6b7280' }}>No recent metrics</td></tr>]
    if (filtered.length === 0) return [<tr key="nomatch"><td colSpan={24} style={{ padding: 20, textAlign: 'center', fontSize: 16, color: '#6b7280' }}>No matching metrics</td></tr>]

    const trs: React.ReactElement[] = []
    const totals = {
      b_kWh: 0, b_P: 0, b_Q: 0, b_S: 0, b_PF: 0, b_THD: 0, b_F: 0,
      m_kWh: 0, m_P: 0, m_Q: 0, m_S: 0, m_PF: 0, m_THD: 0, m_F: 0,
      totalER: 0,
      count: 0
    }

    filtered.forEach((r: AnyObj, i: number) => {
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

      totals.b_kWh += b_kWh
      totals.b_P += b_P
      totals.b_Q += b_Q
      totals.b_S += b_S
      totals.b_PF += b_PF
      totals.b_THD += b_THD
      totals.b_F += b_F

      totals.m_kWh += m_kWh
      totals.m_P += m_P
      totals.m_Q += m_Q
      totals.m_S += m_S
      totals.m_PF += m_PF
      totals.m_THD += m_THD
      totals.m_F += m_F

      // Calculate ER (Energy Reduction) = Before kWh - After kWh
      const energyReduction = b_kWh - m_kWh
      totals.totalER += energyReduction

      totals.count += 1

      trs.push(
        <tr key={i} style={{ borderTop: '1px solid #f1f5f9' }}>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'left' }}>{r.time ? new Date(r.time).toLocaleString() : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'left' }}>{r.device || r.ksave || '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'left' }}>{r.location || '-'}</td>

          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'center' }}>{Number.isFinite(b_L1) && b_L1 > 0 ? b_L1.toFixed(2) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'center' }}>{Number.isFinite(b_L2) && b_L2 > 0 ? b_L2.toFixed(2) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'center' }}>{Number.isFinite(b_L3) && b_L3 > 0 ? b_L3.toFixed(2) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'center' }}>{Number.isFinite(b_kWh) ? b_kWh.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'center' }}>{Number.isFinite(b_P) ? b_P.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'center' }}>{Number.isFinite(b_Q) ? b_Q.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'center' }}>{Number.isFinite(b_S) ? b_S.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'center' }}>{Number.isFinite(b_PF) ? b_PF.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'center' }}>{Number.isFinite(b_THD) ? b_THD.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'center' }}>{Number.isFinite(b_F) ? b_F.toFixed(3) : '-'}</td>

          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'center' }}>{Number.isFinite(m_L1) && m_L1 > 0 ? m_L1.toFixed(2) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'center' }}>{Number.isFinite(m_L2) && m_L2 > 0 ? m_L2.toFixed(2) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'center' }}>{Number.isFinite(m_L3) && m_L3 > 0 ? m_L3.toFixed(2) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'center' }}>{Number.isFinite(m_kWh) ? m_kWh.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'center' }}>{Number.isFinite(m_P) ? m_P.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'center' }}>{Number.isFinite(m_Q) ? m_Q.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'center' }}>{Number.isFinite(m_S) ? m_S.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'center' }}>{Number.isFinite(m_PF) ? m_PF.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'center' }}>{Number.isFinite(m_THD) ? m_THD.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'center' }}>{Number.isFinite(m_F) ? m_F.toFixed(3) : '-'}</td>

          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'center', fontWeight: 'bold' }}>
            {Number.isFinite(energyReduction) && energyReduction > 0 ?
              `${(energyReduction * 0.5135).toFixed(4)} kgCO₂` : '-'}
          </td>
        </tr>
      )
    })

    // totals row (sums for kWh, P, Q, S; averages for PF, THD, F)
    const cnt = totals.count || 1
    const avg = (v: number) => (cnt ? (v / cnt) : 0)
    trs.push(
      <tr key="totals" style={{ borderTop: '2px solid #000', fontWeight: 700, fontSize: '14px' }}>
        <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center' }}>
          <strong>TOTAL ({cnt})</strong>
        </td>
        <td style={{ border: '1px solid #e5e7eb', padding: 10 }}></td>
        <td style={{ border: '1px solid #e5e7eb', padding: 10 }}></td>

        <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center' }}></td>
        <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center' }}></td>
        <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center' }}></td>
        <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center' }}>
          <strong>{totals.b_kWh.toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center' }}>
          <strong>{totals.b_P.toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center' }}>
          <strong>{totals.b_Q.toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center' }}>
          <strong>{totals.b_S.toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center' }}>
          <strong>{avg(totals.b_PF).toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center' }}>
          <strong>{avg(totals.b_THD).toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center' }}>
          <strong>{avg(totals.b_F).toFixed(3)}</strong>
        </td>

        <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center' }}></td>
        <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center' }}></td>
        <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center' }}></td>
        <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center' }}>
          <strong>{totals.m_kWh.toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center' }}>
          <strong>{totals.m_P.toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center' }}>
          <strong>{totals.m_Q.toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center' }}>
          <strong>{totals.m_S.toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center' }}>
          <strong>{avg(totals.m_PF).toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center' }}>
          <strong>{avg(totals.m_THD).toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center' }}>
          <strong>{avg(totals.m_F).toFixed(3)}</strong>
        </td>

        <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center' }}>
          <strong>{(totals.totalER * 0.5135).toFixed(4)} kgCO₂</strong>
        </td>
      </tr>
    )

    return trs
  }, [filtered, loading, error, currents.length])

  return (
    <div className="page-shell" style={{ position: 'relative' }}>
      {/* Company logo - only visible when printing */}
      <img
        src="/k-energy-save-logo.jpg"
        alt="K Energy Save"
        className="watermark-logo"
        style={{
          position: 'fixed',
          top: '0%',
          right: '5%',
          width: '160px',
          height: '160px',
          opacity: 1,
          zIndex: 999,
          pointerEvents: 'none',
          objectFit: 'contain',
          display: 'none' // Hidden on screen, visible in print
        }}
      />
      {/* Page number footer - only visible when printing */}
      <div className="print-page-number" style={{ display: 'none' }}></div>
      <header style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: '32px' }}>Reports Carbon Credit</h1>
        <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: 8, alignItems: 'center' }} className="print:hidden">
          <button 
            className="k-btn k-btn-secondary crisp-text" 
            onClick={() => window.print()}
            style={{ background: '#10b981', color: 'white' }}
          >
            🖨️ Print Report
          </button>
          <Link href="/sites" className="k-btn k-btn-ghost crisp-text">Back to Sites</Link>

          <button className="k-btn k-btn-primary crisp-text" onClick={handleLogout}>
            {token ? 'Logout' : 'Exit'}
          </button>
        </div>
      </header>

                  <section style={{ marginTop: 18 }}>
        <h3>Company Name: K Energy Save co.,Ltd </h3>
        <h3>Address: 1114,27 Dunchon-daero 457beon-gil, Jungwon-gu, Seongnam-si, Gyeonggi-do, Republic of korea</h3>
         <h3>Date: {new Date().toLocaleString()}</h3> 
      </section>

      <section style={{ marginTop: 18, position: 'relative', zIndex: 1 }}>
        <div style={{ marginTop: 18 }} className="data-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>
              Data Collection Period
              <br />
              <span style={{ fontSize: '12px', color: '#374151', fontWeight: 'normal' }}>
                Period: {startAt && endAt ? 
                  `${new Date(startAt).toLocaleString()} - ${new Date(endAt).toLocaleString()}` : 
                  `Last ${selectedRange.replace('-', '').replace('h', ' hour').replace('d', ' day').replace('m', ' minute')}`
                }
              </span>
            </h3>
            <div className="controls-right" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
             
            </div>
          </div>

          <div style={{ height: 8 }} />

          {/* Date/time controls placed inside a small inset card for spacing & clarity */}
          <div className="controls-card print:hidden">
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

          <div className="search-controls print:hidden" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select className="k-input narrow" value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)}>
              <option value="all">All devices</option>
              {devices.map((d) => (
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
                <th rowSpan={2} style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb' }}>Time</th>
                <th rowSpan={2} style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb' }}>Device</th>
                <th rowSpan={2} style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb' }}>Site</th>
                <th colSpan={10} className="power-group-header" style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb' }}>Power (before)</th>
                <th colSpan={10} className="power-group-header" style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb' }}>Power (metrics)</th>
                <th rowSpan={2} style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb' }}>ER</th>
              </tr>
              <tr>
                <th style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb' }}>L1</th>
                <th style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb' }}>L2</th>
                <th style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb' }}>L3</th>
                {['kWh','P','Q','S','PF','THD','F'].map((c) => (
                  <th key={`before-${c}`} style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb' }}>{c}</th>
                ))}
                <th style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb' }}>L1</th>
                <th style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb' }}>L2</th>
                <th style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb' }}>L3</th>
                {['kWh','P','Q','S','PF','THD','F'].map((c) => (
                  <th key={`metrics-${c}`} style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb' }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </table>
        </div>
        </div>
      </section>
    </div>
  )
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>}>
      <AdminPageContent />
    </Suspense>
  )
}

