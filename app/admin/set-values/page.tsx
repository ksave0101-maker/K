"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SetValuesPage() {
  const router = useRouter()
  const [device, setDevice] = useState('')
  const [location, setLocation] = useState('')
  const [ipAddress, setIpAddress] = useState('')
  const [beforeMeterNo, setBeforeMeterNo] = useState('')
  const [metricsMeterNo, setMetricsMeterNo] = useState('')
  const [selectedAt, setSelectedAt] = useState('')

  const [power_before_L1_N, setPower_before_L1_N] = useState('')
  const [power_before_L2_N, setPower_before_L2_N] = useState('')
  const [power_before_L3_N, setPower_before_L3_N] = useState('')
  const [b_kWh, setB_kWh] = useState('')
  const [b_P, setB_P] = useState('')
  const [b_Q, setB_Q] = useState('')
  const [b_S, setB_S] = useState('')
  const [b_PF, setB_PF] = useState('')
  const [b_THD, setB_THD] = useState('')
  const [b_F, setB_F] = useState('')

  const [power_metrics_L1_N, setPower_metrics_L1_N] = useState('')
  const [power_metrics_L2_N, setPower_metrics_L2_N] = useState('')
  const [power_metrics_L3_N, setPower_metrics_L3_N] = useState('')
  const [m_kWh, setM_kWh] = useState('')
  const [m_P, setM_P] = useState('')
  const [m_Q, setM_Q] = useState('')
  const [m_S, setM_S] = useState('')
  const [m_PF, setM_PF] = useState('')
  const [m_THD, setM_THD] = useState('')
  const [m_F, setM_F] = useState('')

  const [editingId, setEditingId] = useState<number | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [foundRows, setFoundRows] = useState<any[] | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [savedRecords, setSavedRecords] = useState<any[]>([])
  const [inlineEditingId, setInlineEditingId] = useState<number | null>(null)
  const [inlineEdits, setInlineEdits] = useState<Record<number, any>>({})
  const [loadingRecords, setLoadingRecords] = useState(false)
  const [writeToken, setWriteToken] = useState('')

  // Auto-load records on mount
  useEffect(() => {
    loadSavedRecords()
  }, [])

  function loadRecordForEdit(record: any) {
    if (!record) return
    setDevice(record.device || record.ksave_id || '')
    setLocation(record.location || '')
    setIpAddress(record.ipAddress || record.ip_address || '')
    setBeforeMeterNo(record.beforeMeterNo || record.before_meter_no || '')
    setMetricsMeterNo(record.metricsMeterNo || record.metrics_meter_no || '')
    setSelectedAt(record.measurement_time ? new Date(record.measurement_time).toISOString().slice(0,16) : '')
    setPower_before_L1_N(record.before_l1 != null ? String(record.before_l1) : '')
    setPower_before_L2_N(record.before_l2 != null ? String(record.before_l2) : '')
    setPower_before_L3_N(record.before_l3 != null ? String(record.before_l3) : '')
    setB_kWh(record.before_kwh != null ? String(record.before_kwh) : '')
    setB_P(record.before_p != null ? String(record.before_p) : '')
    setB_Q(record.before_q != null ? String(record.before_q) : '')
    setB_S(record.before_s != null ? String(record.before_s) : '')
    setB_PF(record.before_pf != null ? String(record.before_pf) : '')
    setB_THD(record.before_thd != null ? String(record.before_thd) : '')
    setB_F(record.before_f != null ? String(record.before_f) : '')
    setPower_metrics_L1_N(record.metrics_l1 != null ? String(record.metrics_l1) : '')
    setPower_metrics_L2_N(record.metrics_l2 != null ? String(record.metrics_l2) : '')
    setPower_metrics_L3_N(record.metrics_l3 != null ? String(record.metrics_l3) : '')
    setM_kWh(record.metrics_kwh != null ? String(record.metrics_kwh) : '')
    setM_P(record.metrics_p != null ? String(record.metrics_p) : '')
    setM_Q(record.metrics_q != null ? String(record.metrics_q) : '')
    setM_S(record.metrics_s != null ? String(record.metrics_s) : '')
    setM_PF(record.metrics_pf != null ? String(record.metrics_pf) : '')
    setM_THD(record.metrics_thd != null ? String(record.metrics_thd) : '')
    setM_F(record.metrics_f != null ? String(record.metrics_f) : '')
    setEditingId(record.id ?? null)
    setResult('✏️ Loaded record for editing')
  }

  async function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const payload = {
        time: selectedAt || undefined,
        device: device || undefined,
        location: location || undefined,
        ipAddress: ipAddress || undefined,
        power_before: {
          L1_N: power_before_L1_N ? Number(power_before_L1_N) : undefined,
          L2_N: power_before_L2_N ? Number(power_before_L2_N) : undefined,
          L3_N: power_before_L3_N ? Number(power_before_L3_N) : undefined,
          kWh: b_kWh ? Number(b_kWh) : undefined,
          P: b_P ? Number(b_P) : undefined,
          Q: b_Q ? Number(b_Q) : undefined,
          S: b_S ? Number(b_S) : undefined,
          PF: b_PF ? Number(b_PF) : undefined,
          THD: b_THD ? Number(b_THD) : undefined,
          F: b_F ? Number(b_F) : undefined,
        },
        power_metrics: {
          L1_N: power_metrics_L1_N ? Number(power_metrics_L1_N) : undefined,
          L2_N: power_metrics_L2_N ? Number(power_metrics_L2_N) : undefined,
          L3_N: power_metrics_L3_N ? Number(power_metrics_L3_N) : undefined,
          kWh: m_kWh ? Number(m_kWh) : undefined,
          P: m_P ? Number(m_P) : undefined,
          Q: m_Q ? Number(m_Q) : undefined,
          S: m_S ? Number(m_S) : undefined,
          PF: m_PF ? Number(m_PF) : undefined,
          THD: m_THD ? Number(m_THD) : undefined,
          F: m_F ? Number(m_F) : undefined,
        }
      }

      // send to existing write endpoint (assumes it accepts this JSON shape)
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (writeToken) headers['x-write-token'] = writeToken

      // Save to PostgreSQL database FIRST
      const pgPayload: any = {
        device,
        ksaveID: device,
        location,
        ipAddress,
        beforeMeterNo,
        metricsMeterNo,
        time: selectedAt || new Date().toISOString(),
        power_before: payload.power_before,
        power_metrics: payload.power_metrics
      }

      if (editingId != null) pgPayload.id = editingId

      const pgRes = await fetch('/api/power-values', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pgPayload)
      })

      const pgBody = await pgRes.json()

      if (!pgRes.ok) {
        setResult(`PostgreSQL save failed: ${pgBody?.error || pgRes.status}`)
        return
      }

      // Try to save to InfluxDB (optional)
      let influxSaved = false
      try {
        const res = await fetch('/api/influx/write', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          influxSaved = true
        }
      } catch (influxErr) {
        console.warn('InfluxDB write failed (non-critical):', influxErr)
      }

      if (pgBody.ok) {
        setResult(`✅ Saved to PostgreSQL successfully${influxSaved ? ' (and InfluxDB)' : ' (InfluxDB failed)'}`)
        // clear inputs on successful save
        setDevice('')
        setLocation('')
        setIpAddress('')
        setBeforeMeterNo('')
        setMetricsMeterNo('')
        setSelectedAt('')
        setPower_before_L1_N('')
        setPower_before_L2_N('')
        setPower_before_L3_N('')
        setB_kWh('')
        setB_P('')
        setB_Q('')
        setB_S('')
        setB_PF('')
        setB_THD('')
        setB_F('')
        setPower_metrics_L1_N('')
        setPower_metrics_L2_N('')
        setPower_metrics_L3_N('')
        setM_kWh('')
        setM_P('')
        setM_Q('')
        setM_S('')
        setM_PF('')
        setM_THD('')
        setM_F('')
        setEditingId(null)
      }
    } catch (err: any) {
      setResult(String(err?.message || err))
    } finally {
      setLoading(false)
    }
  }

  async function handleFindAt() {
    if (!selectedAt) return setResult('Please choose date/time')
    setLoading(true)
    setFoundRows(null)
    setResult(null)
    try {
      const iso = new Date(selectedAt).toISOString()
      const res = await fetch(`/api/influx/currents?at=${encodeURIComponent(iso)}`)
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        setResult(body?.error || 'Failed to fetch readings')
      } else {
        setFoundRows(body.rows || [])
        if ((body.rows || []).length === 0) setResult('No readings found around selected time')
      }
    } catch (err: any) {
      setResult(String(err?.message || err))
    } finally {
      setLoading(false)
    }
  }

  function startInlineEdit(record: any) {
    const id = record.id
    setInlineEditingId(id)
    setInlineEdits(prev => ({
      ...prev,
      [id]: {
        device: record.device || record.ksave_id || '',
        location: record.location || '',
        ipAddress: record.ipAddress || record.ip_address || '',
        beforeMeterNo: record.beforeMeterNo || record.before_meter_no || '',
        metricsMeterNo: record.metricsMeterNo || record.metrics_meter_no || '',
        time: record.measurement_time || record.time || '',
        power_before: {
          L1_N: record.before_l1 ?? record.before_l1 ?? null,
          L2_N: record.before_l2 ?? null,
          L3_N: record.before_l3 ?? null,
          kWh: record.before_kwh ?? null,
          P: record.before_p ?? null,
          Q: record.before_q ?? null,
          S: record.before_s ?? null,
          PF: record.before_pf ?? null,
          THD: record.before_thd ?? null,
          F: record.before_f ?? null,
        },
        power_metrics: {
          L1_N: record.metrics_l1 ?? null,
          L2_N: record.metrics_l2 ?? null,
          L3_N: record.metrics_l3 ?? null,
          kWh: record.metrics_kwh ?? null,
          P: record.metrics_p ?? null,
          Q: record.metrics_q ?? null,
          S: record.metrics_s ?? null,
          PF: record.metrics_pf ?? null,
          THD: record.metrics_thd ?? null,
          F: record.metrics_f ?? null,
        }
      }
    }))
  }

  function handleInlineChange(id: number, path: string, value: any) {
    setInlineEdits(prev => {
      const r = { ...(prev[id] || {}) }
      if (path.startsWith('power_before.') || path.startsWith('power_metrics.')) {
        const [parent, key] = path.split('.')
        r[parent] = { ...(r[parent] || {}) }
        r[parent][key] = value
      } else {
        r[path] = value
      }
      return { ...prev, [id]: r }
    })
  }

  async function saveInlineEdit(id: number) {
    const edits = inlineEdits[id]
    if (!edits) return
    setLoading(true)
    setResult(null)
    try {
      const pgPayload: any = {
        id,
        device: edits.device,
        ksaveID: edits.device,
        location: edits.location,
        ipAddress: edits.ipAddress,
        beforeMeterNo: edits.beforeMeterNo,
        metricsMeterNo: edits.metricsMeterNo,
        time: edits.time || new Date().toISOString(),
        power_before: edits.power_before,
        power_metrics: edits.power_metrics
      }

      const res = await fetch('/api/power-values', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pgPayload)
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok || !body.ok) {
        setResult(`Save failed: ${body?.error || res.status}`)
        return
      }

      // update savedRecords locally
      setSavedRecords(prev => prev.map(r => r.id === id ? ({ ...r, ...normalizeSavedRecordFromEdits(edits) }) : r))
      setInlineEditingId(null)
      setInlineEdits(prev => { const n = { ...prev }; delete n[id]; return n })
      setResult('✅ Row saved')
    } catch (err: any) {
      setResult(String(err?.message || err))
    } finally {
      setLoading(false)
    }
  }

  function normalizeSavedRecordFromEdits(edits: any) {
    return {
      device: edits.device,
      location: edits.location,
      ipAddress: edits.ipAddress,
      before_p: edits.power_before?.P ?? null,
      before_q: edits.power_before?.Q ?? null,
      before_s: edits.power_before?.S ?? null,
      before_kwh: edits.power_before?.kWh ?? null,
      before_l1: edits.power_before?.L1_N ?? null,
      before_l2: edits.power_before?.L2_N ?? null,
      before_l3: edits.power_before?.L3_N ?? null,
      metrics_p: edits.power_metrics?.P ?? null,
      metrics_q: edits.power_metrics?.Q ?? null,
      metrics_s: edits.power_metrics?.S ?? null,
      metrics_kwh: edits.power_metrics?.kWh ?? null,
      metrics_l1: edits.power_metrics?.L1_N ?? null,
      metrics_l2: edits.power_metrics?.L2_N ?? null,
      metrics_l3: edits.power_metrics?.L3_N ?? null,
      before_meter_no: edits.beforeMeterNo ?? null,
      metrics_meter_no: edits.metricsMeterNo ?? null,
      measurement_time: edits.time ?? null
    }
  }

  function applyFoundRow(r: any) {
    if (!r) return
    setDevice(r.device || r.ksave || '')
    setLocation(r.location || '')
    setIpAddress(r.ipAddress || '')
    setBeforeMeterNo(r.beforeMeterNo || '')
    setMetricsMeterNo(r.metricsMeterNo || '')
    // heuristics: map field to a metric input
    const f = (r.field || '').toString().toLowerCase()
    if (f.includes('p')) setM_P(String(r.value ?? ''))
    else if (f.includes('q')) setM_Q(String(r.value ?? ''))
    else if (f.includes('kwh')) setM_kWh(String(r.value ?? ''))
    else setM_P(String(r.value ?? ''))
  }

  async function handleSearch() {
    if (!searchQuery || searchQuery.trim() === '') {
      setSearchResults([])
      setResult('Please enter search text')
      return
    }
    setResult('Searching...')
    setLoadingRecords(true)
    try {
      const res = await fetch(`/api/power-values?q=${encodeURIComponent(searchQuery)}&limit=25`)
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        setResult(body?.error || 'Search failed')
        setSearchResults([])
        setSavedRecords([])
      } else {
        // API returns data in body.data
        const results = body.data || body.rows || body || []
        setSearchResults(results)
        setSavedRecords(results) // Also update saved records table
        setResult(results.length > 0 ? `✅ Found ${results.length} records` : 'No records found')
      }
    } catch (err: any) {
      setResult(String(err?.message || err))
      setSearchResults([])
      setSavedRecords([])
    } finally {
      setLoadingRecords(false)
    }
  }

  async function deleteRecord(id: number) {
    if (!confirm('Are you sure you want to delete this record?')) return

    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`/api/power-values?id=${id}`, { method: 'DELETE' })
      const body = await res.json().catch(() => ({}))

      if (!res.ok || !body.ok) {
        setResult(`❌ Delete failed: ${body?.error || res.status}`)
        return
      }

      // Remove from local state
      setSavedRecords(prev => prev.filter(r => r.id !== id))
      setResult('✅ Record deleted successfully')
    } catch (err: any) {
      setResult(`❌ Delete error: ${err?.message || err}`)
    } finally {
      setLoading(false)
    }
  }

  async function loadSavedRecords() {
    setLoadingRecords(true)
    setResult(null)
    try {
      // Use q parameter for searching, or get all records
      const params = device ? `q=${encodeURIComponent(device)}` : 'q=Ksave'
      const res = await fetch(`/api/power-values?${params}&limit=200`)
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        setResult(body?.error || 'Failed to load saved records')
        setSavedRecords([])
      } else {
        const records = body.data || body.rows || body || []
        setSavedRecords(records)
        setResult(records.length > 0 ? `✅ Loaded ${records.length} records` : 'No records found')
      }
    } catch (err: any) {
      setResult(String(err?.message || err))
      setSavedRecords([])
    } finally {
      setLoadingRecords(false)
    }
  }

  return (
    <div className="page-shell">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>Set values</h2>
          <div style={{ fontSize: 13, color: '#6b7280' }}>Save Power Before and Power Metrics for a device</div>
        </div>
        <div>
          <button className="k-btn" onClick={() => router.push('/admin')} style={{ padding: '8px 12px', borderRadius: 6 }}>Back</button>
        </div>
      </header>

      <main style={{ marginTop: 18 }}>
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, alignItems: 'center' }}>
                <input className="k-input" type="datetime-local" value={selectedAt} onChange={(e) => setSelectedAt(e.target.value)} />
              <button className="k-btn k-btn-ghost" type="button" onClick={handleFindAt}>Find readings</button>
              {foundRows && foundRows.length > 0 && (
                <div style={{ marginLeft: 8 }}>
                  <small>Found {foundRows.length} readings — click to apply:</small>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6, overflowX: 'auto' }}>
                    {foundRows.map((r, idx) => (
                      <div key={idx} onClick={() => applyFoundRow(r)} className="found-row" style={{ cursor: 'pointer' }}>
                        <div className="found-row-time">{new Date(r.time).toLocaleString()}</div>
                        <div className="found-row-device">{r.device || r.ksave}</div>
                        <div className="found-row-field">{r.field}: {r.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Search KSave */}
              <div style={{ gridColumn: '1 / -1', marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                <input className="k-input" placeholder="Search KSave No. or partial" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ flex: 1 }} />
                <button className="k-btn" type="button" onClick={() => { setResult(null); handleSearch() }} disabled={loadingRecords}>{loadingRecords ? 'Searching…' : 'Search'}</button>
                <button className="k-btn k-btn-ghost" type="button" onClick={() => { setSearchQuery(''); setSearchResults([]) }}>Clear</button>
              </div>
              {searchResults.length > 0 && (
                <div style={{ gridColumn: '1 / -1', marginTop: 8, background: '#fff', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>Search results — click to load for edit:</div>
                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
                    {searchResults.map((r: any, idx: number) => (
                      <div key={r.id || idx} onClick={() => loadRecordForEdit(r)} style={{ cursor: 'pointer', padding: 8, borderRadius: 6, background: '#f9fafb', minWidth: 220 }}>
                        <div style={{ fontWeight: 700 }}>{r.device || r.ksave_id}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{r.location || '—'}</div>
                        <div style={{ fontSize: 12, color: '#374151', marginTop: 6 }}>{new Date(r.measurement_time).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="form-row">
              <label>KSave No.</label>
              <input value={device} onChange={e => setDevice(e.target.value)} className="k-input large" placeholder="KSAVE01" />
            </div>
            <div className="form-row">
              <label>Machine/Series No. (device)</label>
              <input value={device} onChange={e => setDevice(e.target.value)} className="k-input large" placeholder="Ksave01" />
            </div>
            <div className="form-row">
              <label>Power Before Meter No.</label>
              <input value={beforeMeterNo} onChange={e => setBeforeMeterNo(e.target.value)} className="k-input large" placeholder="12345678" />
            </div>
            <div className="form-row">
              <label>Power Metrics Meter No.</label>
              <input value={metricsMeterNo} onChange={e => setMetricsMeterNo(e.target.value)} className="k-input large" placeholder="87654321" />
            </div>
            <div className="form-row">
              <label>Location / Site</label>
              <input value={location} onChange={e => setLocation(e.target.value)} className="k-input" />
            </div>
            <div className="form-row">
              <label>IP Address</label>
              <input value={ipAddress} onChange={e => setIpAddress(e.target.value)} className="k-input" placeholder="192.168.x.x" />
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: 6 }}>
              <h4 className="power-section-heading">Power Before</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                <input className="k-input" placeholder="L1-N" value={power_before_L1_N} onChange={e => setPower_before_L1_N(e.target.value)} />
                <input className="k-input" placeholder="L2-N" value={power_before_L2_N} onChange={e => setPower_before_L2_N(e.target.value)} />
                <input className="k-input" placeholder="L3-N" value={power_before_L3_N} onChange={e => setPower_before_L3_N(e.target.value)} />
                <input className="k-input" placeholder="kWh" value={b_kWh} onChange={e => setB_kWh(e.target.value)} />
                <input className="k-input" placeholder="P" value={b_P} onChange={e => setB_P(e.target.value)} />
                <input className="k-input" placeholder="Q" value={b_Q} onChange={e => setB_Q(e.target.value)} />
                <input className="k-input" placeholder="S" value={b_S} onChange={e => setB_S(e.target.value)} />
                <input className="k-input" placeholder="PF" value={b_PF} onChange={e => setB_PF(e.target.value)} />
                <input className="k-input" placeholder="THD" value={b_THD} onChange={e => setB_THD(e.target.value)} />
                <input className="k-input" placeholder="F" value={b_F} onChange={e => setB_F(e.target.value)} />
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: 6 }}>
              <h4 className="power-section-heading">Power Metrics</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                <input className="k-input" placeholder="L1-N" value={power_metrics_L1_N} onChange={e => setPower_metrics_L1_N(e.target.value)} />
                <input className="k-input" placeholder="L2-N" value={power_metrics_L2_N} onChange={e => setPower_metrics_L2_N(e.target.value)} />
                <input className="k-input" placeholder="L3-N" value={power_metrics_L3_N} onChange={e => setPower_metrics_L3_N(e.target.value)} />
                <input className="k-input" placeholder="kWh" value={m_kWh} onChange={e => setM_kWh(e.target.value)} />
                <input className="k-input" placeholder="P" value={m_P} onChange={e => setM_P(e.target.value)} />
                <input className="k-input" placeholder="Q" value={m_Q} onChange={e => setM_Q(e.target.value)} />
                <input className="k-input" placeholder="S" value={m_S} onChange={e => setM_S(e.target.value)} />
                <input className="k-input" placeholder="PF" value={m_PF} onChange={e => setM_PF(e.target.value)} />
                <input className="k-input" placeholder="THD" value={m_THD} onChange={e => setM_THD(e.target.value)} />
                <input className="k-input" placeholder="F" value={m_F} onChange={e => setM_F(e.target.value)} />
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="k-btn k-btn-primary" type="submit" disabled={loading} style={{ padding: '8px 12px', borderRadius: 6, background: '#2563eb', color: '#fff' }}>{loading ? 'Saving…' : 'SAVE'}</button>
              <button className="k-btn" type="button" onClick={() => { /* reset */ setDevice(''); setLocation(''); setIpAddress(''); setBeforeMeterNo(''); setMetricsMeterNo(''); setB_kWh(''); setB_P(''); setB_Q(''); setB_S(''); setB_PF(''); setB_THD(''); setB_F(''); setM_kWh(''); setM_P(''); setM_Q(''); setM_S(''); setM_PF(''); setM_THD(''); setM_F(''); setResult(null); setSavedRecords([]); setEditingId(null) }} style={{ padding: '8px 12px', borderRadius: 6 }}>Reset</button>
              {result && <div style={{ marginLeft: 8 }}>{result}</div>}
            </div>
            {/* Preview of edited details */}
            <div style={{ gridColumn: '1 / -1', marginTop: 12, background: '#111827', color: '#f8fafc', padding: 12, borderRadius: 8, fontSize: 13 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Edited Details (preview)</div>
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontSize: 13 }}>
{JSON.stringify({
  time: selectedAt || undefined,
  device: device || undefined,
  location: location || undefined,
  ipAddress: ipAddress || undefined,
  power_before: {
    L1_N: power_before_L1_N || undefined,
    L2_N: power_before_L2_N || undefined,
    L3_N: power_before_L3_N || undefined,
    kWh: b_kWh || undefined,
    P: b_P || undefined,
    Q: b_Q || undefined,
    S: b_S || undefined,
    PF: b_PF || undefined,
    THD: b_THD || undefined,
    F: b_F || undefined,
  },
  power_metrics: {
    L1_N: power_metrics_L1_N || undefined,
    L2_N: power_metrics_L2_N || undefined,
    L3_N: power_metrics_L3_N || undefined,
    kWh: m_kWh || undefined,
    P: m_P || undefined,
    Q: m_Q || undefined,
    S: m_S || undefined,
    PF: m_PF || undefined,
    THD: m_THD || undefined,
    F: m_F || undefined,
  }
}, null, 2)}
              </pre>
            </div>
          </div>
        </form>

        {/* Saved Records History */}
        <div style={{ marginTop: 32, background: 'white', padding: 20, borderRadius: 8, border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
              Saved Records {device ? `for ${device}` : ''} ({savedRecords.length})
            </h3>
              <button
                onClick={loadSavedRecords}
                disabled={loadingRecords}
                className="k-btn k-btn-ghost"
                style={{ fontSize: 13, padding: '6px 12px' }}
              >
                {loadingRecords ? 'Loading...' : '🔄 Refresh'}
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f9fafb' }}>
                    <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 600 }}>Time</th>
                    <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 600 }}>KSave</th>
                    <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 600 }}>Location</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>Before L1</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>Before L2</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>Before L3</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>Before kWh</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>Before P</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>Before Q</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>Before S</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>Before PF</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>Before THD</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>Before F</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>Metrics L1</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>Metrics L2</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>Metrics L3</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>Metrics kWh</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>Metrics P</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>Metrics Q</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>Metrics S</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>Metrics PF</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>Metrics THD</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>Metrics F</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 600 }}>ER</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 600 }}>Created</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 600 }}>Updated</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 600 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {savedRecords.map((record, idx) => (
                    <tr
                      key={record.id || idx}
                      style={{
                        borderBottom: '1px solid #f3f4f6',
                        background: idx % 2 === 0 ? 'white' : '#f9fafb'
                      }}
                    >
                      <td style={{ padding: '10px 8px', color: '#374151', fontFamily: 'monospace', fontSize: 12 }}>
                        {inlineEditingId === record.id ? (
                          <input
                            className="k-input"
                            type="datetime-local"
                            value={(inlineEdits[record.id]?.time ? new Date(inlineEdits[record.id].time).toISOString().slice(0,16) : '')}
                            onChange={(e) => handleInlineChange(record.id, 'time', e.target.value)}
                            style={{ width: 220 }}
                          />
                        ) : (
                          new Date(record.measurement_time).toLocaleString()
                        )}
                      </td>
                      <td style={{ padding: '10px 8px', color: '#1f2937', fontWeight: 600 }}>
                        {inlineEditingId === record.id ? (
                          <input className="k-input" value={inlineEdits[record.id]?.device ?? record.device ?? record.ksave_id ?? ''} onChange={(e) => handleInlineChange(record.id, 'device', e.target.value)} style={{ width: 100 }} />
                        ) : (
                          record.device || record.ksave_id || '—'
                        )}
                      </td>
                      <td style={{ padding: '10px 8px', color: '#6b7280' }}>
                        {inlineEditingId === record.id ? (
                          <input className="k-input" value={inlineEdits[record.id]?.location ?? record.location ?? ''} onChange={(e) => handleInlineChange(record.id, 'location', e.target.value)} />
                        ) : (
                          record.location || '—'
                        )}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: '#374151' }}>
                        {inlineEditingId === record.id ? (
                          <input className="k-input" type="number" value={inlineEdits[record.id]?.power_before?.L1_N ?? record.before_l1 ?? ''} onChange={(e) => handleInlineChange(record.id, 'power_before.L1_N', e.target.value ? Number(e.target.value) : null)} />
                        ) : (
                          record.before_l1 != null ? Number(record.before_l1).toFixed(2) : '—'
                        )}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: '#374151' }}>
                        {inlineEditingId === record.id ? (
                          <input className="k-input" type="number" value={inlineEdits[record.id]?.power_before?.L2_N ?? record.before_l2 ?? ''} onChange={(e) => handleInlineChange(record.id, 'power_before.L2_N', e.target.value ? Number(e.target.value) : null)} />
                        ) : (
                          record.before_l2 != null ? Number(record.before_l2).toFixed(2) : '—'
                        )}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: '#374151' }}>
                        {inlineEditingId === record.id ? (
                          <input className="k-input" type="number" value={inlineEdits[record.id]?.power_before?.L3_N ?? record.before_l3 ?? ''} onChange={(e) => handleInlineChange(record.id, 'power_before.L3_N', e.target.value ? Number(e.target.value) : null)} />
                        ) : (
                          record.before_l3 != null ? Number(record.before_l3).toFixed(2) : '—'
                        )}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: '#374151' }}>
                        {inlineEditingId === record.id ? (
                          <input className="k-input" type="number" value={inlineEdits[record.id]?.power_before?.kWh ?? record.before_kwh ?? ''} onChange={(e) => handleInlineChange(record.id, 'power_before.kWh', e.target.value ? Number(e.target.value) : null)} />
                        ) : (
                          record.before_kwh != null ? Number(record.before_kwh).toFixed(2) : '—'
                        )}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: '#374151' }}>
                        {inlineEditingId === record.id ? (
                          <input className="k-input" type="number" value={inlineEdits[record.id]?.power_before?.P ?? record.before_p ?? ''} onChange={(e) => handleInlineChange(record.id, 'power_before.P', e.target.value ? Number(e.target.value) : null)} />
                        ) : (
                          record.before_p != null ? Number(record.before_p).toFixed(2) : '—'
                        )}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: '#374151' }}>
                        {inlineEditingId === record.id ? (
                          <input className="k-input" type="number" value={inlineEdits[record.id]?.power_before?.Q ?? record.before_q ?? ''} onChange={(e) => handleInlineChange(record.id, 'power_before.Q', e.target.value ? Number(e.target.value) : null)} />
                        ) : (
                          record.before_q != null ? Number(record.before_q).toFixed(2) : '—'
                        )}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: '#374151' }}>
                        {inlineEditingId === record.id ? (
                          <input className="k-input" type="number" value={inlineEdits[record.id]?.power_before?.S ?? record.before_s ?? ''} onChange={(e) => handleInlineChange(record.id, 'power_before.S', e.target.value ? Number(e.target.value) : null)} />
                        ) : (
                          record.before_s != null ? Number(record.before_s).toFixed(2) : '—'
                        )}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: '#374151' }}>
                        {inlineEditingId === record.id ? (
                          <input className="k-input" type="number" value={inlineEdits[record.id]?.power_before?.PF ?? record.before_pf ?? ''} onChange={(e) => handleInlineChange(record.id, 'power_before.PF', e.target.value ? Number(e.target.value) : null)} />
                        ) : (
                          record.before_pf != null ? Number(record.before_pf).toFixed(3) : '—'
                        )}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: '#374151' }}>
                        {inlineEditingId === record.id ? (
                          <input className="k-input" type="number" value={inlineEdits[record.id]?.power_before?.THD ?? record.before_thd ?? ''} onChange={(e) => handleInlineChange(record.id, 'power_before.THD', e.target.value ? Number(e.target.value) : null)} />
                        ) : (
                          record.before_thd != null ? Number(record.before_thd).toFixed(2) : '—'
                        )}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: '#374151' }}>
                        {inlineEditingId === record.id ? (
                          <input className="k-input" type="number" value={inlineEdits[record.id]?.power_before?.F ?? record.before_f ?? ''} onChange={(e) => handleInlineChange(record.id, 'power_before.F', e.target.value ? Number(e.target.value) : null)} />
                        ) : (
                          record.before_f != null ? Number(record.before_f).toFixed(2) : '—'
                        )}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: '#2563eb' }}>
                        {inlineEditingId === record.id ? (
                          <input className="k-input" type="number" value={inlineEdits[record.id]?.power_metrics?.L1_N ?? record.metrics_l1 ?? ''} onChange={(e) => handleInlineChange(record.id, 'power_metrics.L1_N', e.target.value ? Number(e.target.value) : null)} />
                        ) : (
                          record.metrics_l1 != null ? Number(record.metrics_l1).toFixed(2) : '—'
                        )}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: '#2563eb' }}>
                        {inlineEditingId === record.id ? (
                          <input className="k-input" type="number" value={inlineEdits[record.id]?.power_metrics?.L2_N ?? record.metrics_l2 ?? ''} onChange={(e) => handleInlineChange(record.id, 'power_metrics.L2_N', e.target.value ? Number(e.target.value) : null)} />
                        ) : (
                          record.metrics_l2 != null ? Number(record.metrics_l2).toFixed(2) : '—'
                        )}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: '#2563eb' }}>
                        {inlineEditingId === record.id ? (
                          <input className="k-input" type="number" value={inlineEdits[record.id]?.power_metrics?.L3_N ?? record.metrics_l3 ?? ''} onChange={(e) => handleInlineChange(record.id, 'power_metrics.L3_N', e.target.value ? Number(e.target.value) : null)} />
                        ) : (
                          record.metrics_l3 != null ? Number(record.metrics_l3).toFixed(2) : '—'
                        )}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: '#2563eb' }}>
                        {inlineEditingId === record.id ? (
                          <input className="k-input" type="number" value={inlineEdits[record.id]?.power_metrics?.kWh ?? record.metrics_kwh ?? ''} onChange={(e) => handleInlineChange(record.id, 'power_metrics.kWh', e.target.value ? Number(e.target.value) : null)} />
                        ) : (
                          record.metrics_kwh != null ? Number(record.metrics_kwh).toFixed(3) : '—'
                        )}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: '#2563eb', fontWeight: 600 }}>
                        {inlineEditingId === record.id ? (
                          <input className="k-input" type="number" value={inlineEdits[record.id]?.power_metrics?.P ?? record.metrics_p ?? ''} onChange={(e) => handleInlineChange(record.id, 'power_metrics.P', e.target.value ? Number(e.target.value) : null)} />
                        ) : (
                          record.metrics_p != null ? Number(record.metrics_p).toFixed(2) : '—'
                        )}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: '#2563eb', fontWeight: 600 }}>
                        {inlineEditingId === record.id ? (
                          <input className="k-input" type="number" value={inlineEdits[record.id]?.power_metrics?.Q ?? record.metrics_q ?? ''} onChange={(e) => handleInlineChange(record.id, 'power_metrics.Q', e.target.value ? Number(e.target.value) : null)} />
                        ) : (
                          record.metrics_q != null ? Number(record.metrics_q).toFixed(2) : '—'
                        )}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: '#2563eb', fontWeight: 600 }}>
                        {inlineEditingId === record.id ? (
                          <input className="k-input" type="number" value={inlineEdits[record.id]?.power_metrics?.S ?? record.metrics_s ?? ''} onChange={(e) => handleInlineChange(record.id, 'power_metrics.S', e.target.value ? Number(e.target.value) : null)} />
                        ) : (
                          record.metrics_s != null ? Number(record.metrics_s).toFixed(2) : '—'
                        )}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: '#2563eb' }}>
                        {inlineEditingId === record.id ? (
                          <input className="k-input" type="number" value={inlineEdits[record.id]?.power_metrics?.PF ?? record.metrics_pf ?? ''} onChange={(e) => handleInlineChange(record.id, 'power_metrics.PF', e.target.value ? Number(e.target.value) : null)} />
                        ) : (
                          record.metrics_pf != null ? Number(record.metrics_pf).toFixed(3) : '—'
                        )}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: '#2563eb' }}>
                        {inlineEditingId === record.id ? (
                          <input className="k-input" type="number" value={inlineEdits[record.id]?.power_metrics?.THD ?? record.metrics_thd ?? ''} onChange={(e) => handleInlineChange(record.id, 'power_metrics.THD', e.target.value ? Number(e.target.value) : null)} />
                        ) : (
                          record.metrics_thd != null ? Number(record.metrics_thd).toFixed(2) : '—'
                        )}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: '#2563eb' }}>
                        {inlineEditingId === record.id ? (
                          <input className="k-input" type="number" value={inlineEdits[record.id]?.power_metrics?.F ?? record.metrics_f ?? ''} onChange={(e) => handleInlineChange(record.id, 'power_metrics.F', e.target.value ? Number(e.target.value) : null)} />
                        ) : (
                          record.metrics_f != null ? Number(record.metrics_f).toFixed(2) : '—'
                        )}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center', color: '#059669', fontWeight: 700 }}>
                        {record.er != null ? Number(record.er).toFixed(2) : '—'}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center', color: '#6b7280', fontSize: 11 }}>
                        {record.created_at ? new Date(record.created_at).toLocaleString() : '—'}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center', color: '#6b7280', fontSize: 11 }}>
                        {record.updated_at ? new Date(record.updated_at).toLocaleString() : '—'}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        {inlineEditingId === record.id ? (
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                            <button
                              onClick={() => saveInlineEdit(record.id)}
                              className="k-btn k-btn-primary"
                              style={{ fontSize: 12, padding: '4px 8px' }}
                            >
                              💾 Save
                            </button>
                            <button
                              onClick={() => { setInlineEditingId(null); setInlineEdits(prev => { const n = { ...prev }; delete n[record.id]; return n }) }}
                              className="k-btn k-btn-ghost"
                              style={{ fontSize: 12, padding: '4px 8px' }}
                            >
                              ✖️ Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                            <button
                              onClick={() => loadRecordForEdit(record)}
                              className="k-btn k-btn-ghost"
                              style={{ fontSize: 12, padding: '4px 8px' }}
                              title="Load record into form for editing"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => startInlineEdit(record)}
                              className="k-btn"
                              style={{ fontSize: 12, padding: '4px 8px' }}
                              title="Edit inline in table"
                            >
                              🟦 Inline
                            </button>
                            <button
                              onClick={() => deleteRecord(record.id)}
                              className="k-btn"
                              style={{ fontSize: 12, padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none' }}
                              title="Delete this record"
                              disabled={loading}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        {/* Inline edit helpers (render inputs inside table row when editing) */}
      </main>
    </div>
  )
}
