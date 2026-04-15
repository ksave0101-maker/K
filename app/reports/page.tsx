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
          color-adjust: exact !important;
        }
        body, html {
          background: white !important;
        }
        .print\\:hidden { display: none !important; }
        .page-shell {
          margin: 0;
          padding: 4mm 3mm !important;
          width: 100%;
          max-width: none;
          font-family: 'Segoe UI', Arial, sans-serif;
          background: white !important;
          position: relative;
        }
        section {
          position: relative !important;
          background: white !important;
          box-shadow: none !important;
          border: none !important;
          padding: 0 !important;
          margin: 1mm 0 !important;
        }
        .watermark-logo {
          display: block !important;
          position: fixed !important;
          top: 3mm !important;
          left: 8mm !important;
          width: 40mm !important;
          height: auto !important;
          max-width: none !important;
          opacity: 1 !important;
          z-index: 1000 !important;
          pointer-events: none !important;
          filter: none !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .page-shell::before {
          content: '' !important;
          display: block !important;
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          width: 500px !important;
          height: 500px !important;
          background-image: url('/k-energy-save-logo.jpg') !important;
          background-size: contain !important;
          background-repeat: no-repeat !important;
          background-position: center !important;
          opacity: 0.05 !important;
          z-index: 1 !important;
          pointer-events: none !important;
          filter: grayscale(100%) brightness(0.4) !important;
          mix-blend-mode: multiply !important;
        }
        section > div {
          position: relative !important;
          z-index: 2 !important;
        }
        .print-page-number {
          display: block !important;
          position: fixed;
          top: 4mm;
          right: 10mm;
          text-align: right;
          font-size: 10px;
          color: #475569;
          font-family: 'Segoe UI', Arial, sans-serif;
          font-weight: 600;
          z-index: 1000;
        }
        .print-page-number::before {
          content: "Page " counter(page);
        }
        header {
          display: block !important;
          margin-bottom: 1mm !important;
          text-align: center;
          page-break-after: avoid;
          padding: 1mm 0 !important;
          border-bottom: 1.5px solid #0284c7 !important;
          background: white !important;
          box-shadow: none !important;
        }
        h1 {
          display: block !important;
          font-size: 16px !important;
          margin: 0 0 1mm 0 !important;
          font-weight: 700 !important;
          line-height: 1.2 !important;
          color: #0f172a !important;
          letter-spacing: -0.3px !important;
        }
        h3 {
          display: block !important;
          font-size: 8px !important;
          margin: 0.3mm 0 !important;
          font-weight: 500 !important;
          line-height: 1.2 !important;
          color: #475569 !important;
        }
        .data-card {
          box-shadow: none !important;
          border: none !important;
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
        }
        .k-table-wrapper {
          overflow: visible !important;
          width: 100% !important;
          background: white !important;
          border: none !important;
          border-radius: 0 !important;
          margin: 2mm 0 !important;
        }
        table.k-table {
          font-size: 6px !important;
          width: 100% !important;
          border-collapse: collapse !important;
          margin: 0 !important;
          table-layout: fixed !important;
          background: white !important;
        }
        .k-table th {
          padding: 1mm 0.5mm !important;
          font-size: 7px !important;
          font-weight: 700 !important;
          text-align: center !important;
          border: 0.5pt solid #1e293b !important;
          background: #f8fafc !important;
          line-height: 1.1 !important;
          white-space: nowrap !important;
          width: auto !important;
          color: #0f172a !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .k-table thead tr:first-child th {
          background: linear-gradient(to bottom, #e0f2fe, #f0f9ff) !important;
          border: 0.5pt solid #0284c7 !important;
          font-weight: 700 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .k-table td {
          padding: 0.8mm 0.5mm !important;
          font-size: 6px !important;
          border: 0.3pt solid #475569 !important;
          text-align: center !important;
          line-height: 1.1 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          color: #1e293b !important;
          background: white !important;
        }
        .k-table td:nth-child(1) {
          text-align: left !important;
          font-size: 5.5px !important;
          white-space: nowrap !important;
          padding-left: 0.8mm !important;
          max-width: 30mm !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
        .k-table td:nth-child(2) {
          text-align: left !important;
          font-size: 6.5px !important;
          font-weight: 600 !important;
          white-space: nowrap !important;
          padding-left: 0.8mm !important;
        }
        .k-table td:nth-child(3) {
          text-align: left !important;
          font-size: 5.5px !important;
          white-space: nowrap !important;
          padding-left: 0.8mm !important;
        }
        .k-table thead th {
          height: auto !important;
          vertical-align: middle !important;
          white-space: nowrap !important;
        }
        .k-table tbody tr {
          height: auto !important;
          page-break-inside: avoid !important;
        }
        .k-table tbody tr:nth-child(even) {
          background: #fafbfc !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .k-table tbody tr:last-child {
          background: linear-gradient(to bottom, #f0f9ff, #ecfdf5) !important;
          font-weight: 700 !important;
          border-top: 1.5pt solid #0284c7 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .k-table tbody tr:last-child td {
          font-size: 7.5px !important;
          font-weight: 700 !important;
          padding: 1.5mm 1mm !important;
          border: 0.5pt solid #0284c7 !important;
          color: #0f172a !important;
        }
        .k-table td:last-child {
          background: #ecfdf5 !important;
          color: #059669 !important;
          font-weight: 700 !important;
          white-space: nowrap !important;
          font-size: 7px !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .power-group-header {
          background: linear-gradient(to bottom, #dbeafe, #f0f9ff) !important;
          border: 0.5pt solid #0284c7 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
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
    router.replace('/admin/adminsystem')
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
        <tr key={i} style={{
          borderTop: '1px solid #f1f5f9',
          transition: 'background 0.2s ease'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
        onMouseOut={(e) => e.currentTarget.style.background = i % 2 === 0 ? 'white' : '#fafbfc'}>
          <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'left', fontSize: 13, color: '#475569' }}>{r.time ? new Date(r.time).toLocaleString() : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'left', fontSize: 14, color: '#0f172a', fontWeight: 600 }}>{r.device || r.ksave || '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'left', fontSize: 13, color: '#475569' }}>{r.location || '-'}</td>

          <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center', fontSize: 13, color: '#64748b' }}>{Number.isFinite(b_L1) && b_L1 > 0 ? b_L1.toFixed(2) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center', fontSize: 13, color: '#64748b' }}>{Number.isFinite(b_L2) && b_L2 > 0 ? b_L2.toFixed(2) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center', fontSize: 13, color: '#64748b' }}>{Number.isFinite(b_L3) && b_L3 > 0 ? b_L3.toFixed(2) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center', fontSize: 13, color: '#0f172a', fontWeight: 600 }}>{Number.isFinite(b_kWh) ? b_kWh.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center', fontSize: 13, color: '#64748b' }}>{Number.isFinite(b_P) ? b_P.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center', fontSize: 13, color: '#64748b' }}>{Number.isFinite(b_Q) ? b_Q.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center', fontSize: 13, color: '#64748b' }}>{Number.isFinite(b_S) ? b_S.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center', fontSize: 13, color: '#64748b' }}>{Number.isFinite(b_PF) ? b_PF.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center', fontSize: 13, color: '#64748b' }}>{Number.isFinite(b_THD) ? b_THD.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center', fontSize: 13, color: '#64748b' }}>{Number.isFinite(b_F) ? b_F.toFixed(3) : '-'}</td>

          <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center', fontSize: 13, color: '#64748b' }}>{Number.isFinite(m_L1) && m_L1 > 0 ? m_L1.toFixed(2) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center', fontSize: 13, color: '#64748b' }}>{Number.isFinite(m_L2) && m_L2 > 0 ? m_L2.toFixed(2) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center', fontSize: 13, color: '#64748b' }}>{Number.isFinite(m_L3) && m_L3 > 0 ? m_L3.toFixed(2) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center', fontSize: 13, color: '#0f172a', fontWeight: 600 }}>{Number.isFinite(m_kWh) ? m_kWh.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center', fontSize: 13, color: '#64748b' }}>{Number.isFinite(m_P) ? m_P.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center', fontSize: 13, color: '#64748b' }}>{Number.isFinite(m_Q) ? m_Q.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center', fontSize: 13, color: '#64748b' }}>{Number.isFinite(m_S) ? m_S.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center', fontSize: 13, color: '#64748b' }}>{Number.isFinite(m_PF) ? m_PF.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center', fontSize: 13, color: '#64748b' }}>{Number.isFinite(m_THD) ? m_THD.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 10, textAlign: 'center', fontSize: 13, color: '#64748b' }}>{Number.isFinite(m_F) ? m_F.toFixed(3) : '-'}</td>

          <td style={{
            border: '1px solid #e5e7eb',
            padding: 10,
            textAlign: 'center',
            fontSize: 13,
            fontWeight: 700,
            color: '#059669',
            background: energyReduction > 0 ? '#f0fdf4' : 'transparent'
          }}>
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
      <tr key="totals" style={{
        borderTop: '3px solid #0284c7',
        fontWeight: 700,
        fontSize: '14px',
        background: 'linear-gradient(135deg, #f0f9ff, #ecfdf5)'
      }}>
        <td style={{
          border: '1px solid #cbd5e1',
          padding: 12,
          textAlign: 'center',
          fontSize: 15,
          fontWeight: 700,
          color: '#0f172a'
        }}>
          <strong>📊 TOTAL ({cnt})</strong>
        </td>
        <td style={{ border: '1px solid #cbd5e1', padding: 12 }}></td>
        <td style={{ border: '1px solid #cbd5e1', padding: 12 }}></td>

        <td style={{ border: '1px solid #cbd5e1', padding: 12, textAlign: 'center' }}></td>
        <td style={{ border: '1px solid #cbd5e1', padding: 12, textAlign: 'center' }}></td>
        <td style={{ border: '1px solid #cbd5e1', padding: 12, textAlign: 'center' }}></td>
        <td style={{ border: '1px solid #cbd5e1', padding: 12, textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#0284c7' }}>
          <strong>{totals.b_kWh.toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #cbd5e1', padding: 12, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>
          <strong>{totals.b_P.toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #cbd5e1', padding: 12, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>
          <strong>{totals.b_Q.toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #cbd5e1', padding: 12, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>
          <strong>{totals.b_S.toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #cbd5e1', padding: 12, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>
          <strong>{avg(totals.b_PF).toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #cbd5e1', padding: 12, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>
          <strong>{avg(totals.b_THD).toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #cbd5e1', padding: 12, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>
          <strong>{avg(totals.b_F).toFixed(3)}</strong>
        </td>

        <td style={{ border: '1px solid #cbd5e1', padding: 12, textAlign: 'center' }}></td>
        <td style={{ border: '1px solid #cbd5e1', padding: 12, textAlign: 'center' }}></td>
        <td style={{ border: '1px solid #cbd5e1', padding: 12, textAlign: 'center' }}></td>
        <td style={{ border: '1px solid #cbd5e1', padding: 12, textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#059669' }}>
          <strong>{totals.m_kWh.toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #cbd5e1', padding: 12, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>
          <strong>{totals.m_P.toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #cbd5e1', padding: 12, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>
          <strong>{totals.m_Q.toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #cbd5e1', padding: 12, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>
          <strong>{totals.m_S.toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #cbd5e1', padding: 12, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>
          <strong>{avg(totals.m_PF).toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #cbd5e1', padding: 12, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>
          <strong>{avg(totals.m_THD).toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #cbd5e1', padding: 12, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>
          <strong>{avg(totals.m_F).toFixed(3)}</strong>
        </td>

        <td style={{
          border: '1px solid #cbd5e1',
          padding: 12,
          textAlign: 'center',
          fontSize: 15,
          fontWeight: 700,
          color: '#059669',
          background: 'linear-gradient(135deg, #d1fae5, #ecfdf5)'
        }}>
          <strong>🌱 {(totals.totalER * 0.5135).toFixed(4)} kgCO₂</strong>
        </td>
      </tr>
    )

    return trs
  }, [filtered, loading, error, currents.length])

  return (
    <div className="page-shell" style={{
      position: 'relative',
      padding: '32px 40px',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
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
      <header style={{
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
        background: 'white',
        padding: '28px 32px',
        borderRadius: 16,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        marginBottom: 24
      }}>
        <h1 style={{
          fontSize: '34px',
          fontWeight: 600,
          margin: 0,
          background: 'linear-gradient(135deg, #0284c7, #059669)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.5px'
        }}>Reports Carbon Credit</h1>
        <div style={{ position: 'absolute', top: '28px', right: '32px', display: 'flex', gap: 12, alignItems: 'center' }} className="print:hidden">
          <button
            className="k-btn k-btn-secondary crisp-text"
            onClick={() => window.print()}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              padding: '12px 20px',
              borderRadius: 10,
              border: 'none',
              fontSize: 15,
              fontWeight: 600,
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            🖨️ Print Report
          </button>
          <Link
            href="/sites"
            className="k-btn k-btn-ghost crisp-text"
            style={{
              padding: '12px 20px',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              background: 'white',
              color: '#0ea5e9',
              border: '2px solid #0ea5e9',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'all 0.2s ease'
            }}
          >Back to Sites</Link>

          <button
            className="k-btn k-btn-primary crisp-text"
            onClick={handleLogout}
            style={{
              padding: '12px 20px',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              border: 'none',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {token ? 'Logout' : 'Exit'}
          </button>
        </div>
      </header>

      <section style={{
        marginTop: 0,
        background: 'white',
        padding: '20px 28px',
        borderRadius: 16,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        marginBottom: 24
      }}>
        <h3 style={{ margin: 0, fontSize: 16, color: '#334155', fontWeight: 600, marginBottom: 8 }}>
          <span style={{ color: '#0284c7' }}>🏢</span> Company Name: zera co.,ltd
        </h3>
        <h3 style={{ margin: 0, fontSize: 14, color: '#475569', fontWeight: 500, marginBottom: 8 }}>
          <span style={{ color: '#059669' }}>📍</span> Address: 1114,27 Dunchon-daero 457beon-gil, Jungwon-gu, Seongnam-si, Gyeonggi-do, Republic of korea
        </h3>
        <h3 style={{ margin: 0, fontSize: 14, color: '#475569', fontWeight: 500 }}>
          <span style={{ color: '#10b981' }}>📅</span> Date: {new Date().toLocaleString()}
        </h3>
      </section>

      <section style={{ marginTop: 0, position: 'relative', zIndex: 1 }}>
        <div style={{
          marginTop: 0,
          background: 'white',
          padding: '24px 28px',
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.8)'
        }} className="data-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 600,
              color: '#0f172a',
              background: 'linear-gradient(135deg, #0284c7, #059669)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              📊 Data Collection Period
              <br />
              <span style={{
                fontSize: '14px',
                color: '#475569',
                fontWeight: 500,
                background: 'none',
                WebkitTextFillColor: '#475569'
              }}>
                Period: {startAt && endAt ?
                  `${new Date(startAt).toLocaleString()} - ${new Date(endAt).toLocaleString()}` :
                  `Last ${selectedRange.replace('-', '').replace('h', ' hour').replace('d', ' day').replace('m', ' minute')}`
                }
              </span>
            </h3>
            <div className="controls-right" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>

            </div>
          </div>

          {/* Date/time controls placed inside a small inset card for spacing & clarity */}
          <div className="controls-card print:hidden" style={{
            background: 'linear-gradient(135deg, #f0f9ff, #f0fdf4)',
            padding: '16px 20px',
            borderRadius: 12,
            border: '1px solid #e0f2fe',
            marginBottom: 16
          }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 220, flex: '0 0 240px' }}>
                <label style={{ fontSize: 13, color: '#475569', fontWeight: 600, marginBottom: 6 }}>📅 From</label>
                <input
                  type="datetime-local"
                  className="k-input"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '2px solid #cbd5e1',
                    fontSize: 14,
                    background: 'white',
                    color: '#334155',
                    fontWeight: 500
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 220, flex: '0 0 240px' }}>
                <label style={{ fontSize: 13, color: '#475569', fontWeight: 600, marginBottom: 6 }}>📅 To</label>
                <input
                  type="datetime-local"
                  className="k-input"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '2px solid #cbd5e1',
                    fontSize: 14,
                    background: 'white',
                    color: '#334155',
                    fontWeight: 500
                  }}
                />
              </div>
              {/* Search button removed per user request; users can use the lower search input or refresh via range controls */}
            </div>
          </div>

          <div className="search-controls print:hidden" style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            background: '#f8fafc',
            padding: '14px 18px',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            marginBottom: 16
          }}>
            <select
              className="k-input narrow"
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                border: '2px solid #cbd5e1',
                fontSize: 15,
                background: 'white',
                color: '#334155',
                fontWeight: 500,
                cursor: 'pointer',
                minWidth: 160
              }}
            >
              <option value="all">All devices</option>
              {devices.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <input
              className="k-input narrow"
              placeholder="🔍 Search (series name / no / device / ksave / location)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                border: '2px solid #cbd5e1',
                fontSize: 14,
                background: 'white',
                color: '#334155',
                fontWeight: 500,
                flex: 1,
                minWidth: 300
              }}
            />
            <button
              className="k-btn k-btn-ghost crisp-text"
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                color: 'white',
                border: 'none',
                boxShadow: '0 4px 14px rgba(14, 165, 233, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              onClick={async (e) => {
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

          <div style={{
            marginTop: 0,
            background: 'white',
            borderRadius: 12,
            overflow: 'hidden',
            border: '1px solid #e2e8f0'
          }} className="k-table-wrapper">
            <table className="k-table">
            <thead style={{
              background: 'linear-gradient(135deg, #f0f9ff, #f0fdf4)',
              borderBottom: '2px solid #e0f2fe'
            }}>
              <tr>
                <th rowSpan={2} style={{ padding: 12, textAlign: 'center', border: '1px solid #cbd5e1', fontWeight: 600, fontSize: 14, color: '#0f172a' }}>Time</th>
                <th rowSpan={2} style={{ padding: 12, textAlign: 'center', border: '1px solid #cbd5e1', fontWeight: 600, fontSize: 14, color: '#0f172a' }}>Device</th>
                <th rowSpan={2} style={{ padding: 12, textAlign: 'center', border: '1px solid #cbd5e1', fontWeight: 600, fontSize: 14, color: '#0f172a' }}>Site</th>
                <th colSpan={10} className="power-group-header" style={{ padding: 12, textAlign: 'center', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: 15, color: '#0284c7', background: 'linear-gradient(135deg, #e0f2fe, #f0f9ff)' }}>⚡ Power (before)</th>
                <th colSpan={10} className="power-group-header" style={{ padding: 12, textAlign: 'center', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: 15, color: '#059669', background: 'linear-gradient(135deg, #d1fae5, #f0fdf4)' }}>⚡ Power (metrics)</th>
                <th rowSpan={2} style={{ padding: 12, textAlign: 'center', border: '1px solid #cbd5e1', fontWeight: 600, fontSize: 14, color: '#0f172a' }}>ER</th>
              </tr>
              <tr>
                <th style={{ padding: 10, textAlign: 'center', border: '1px solid #cbd5e1', fontWeight: 600, fontSize: 13, color: '#475569' }}>L1</th>
                <th style={{ padding: 10, textAlign: 'center', border: '1px solid #cbd5e1', fontWeight: 600, fontSize: 13, color: '#475569' }}>L2</th>
                <th style={{ padding: 10, textAlign: 'center', border: '1px solid #cbd5e1', fontWeight: 600, fontSize: 13, color: '#475569' }}>L3</th>
                {['kWh','P','Q','S','PF','THD','F'].map((c) => (
                  <th key={`before-${c}`} style={{ padding: 10, textAlign: 'center', border: '1px solid #cbd5e1', fontWeight: 600, fontSize: 13, color: '#475569' }}>{c}</th>
                ))}
                <th style={{ padding: 10, textAlign: 'center', border: '1px solid #cbd5e1', fontWeight: 600, fontSize: 13, color: '#475569' }}>L1</th>
                <th style={{ padding: 10, textAlign: 'center', border: '1px solid #cbd5e1', fontWeight: 600, fontSize: 13, color: '#475569' }}>L2</th>
                <th style={{ padding: 10, textAlign: 'center', border: '1px solid #cbd5e1', fontWeight: 600, fontSize: 13, color: '#475569' }}>L3</th>
                {['kWh','P','Q','S','PF','THD','F'].map((c) => (
                  <th key={`metrics-${c}`} style={{ padding: 10, textAlign: 'center', border: '1px solid #cbd5e1', fontWeight: 600, fontSize: 13, color: '#475569' }}>{c}</th>
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

