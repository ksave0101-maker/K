"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

type ApiResult = {
  success?: boolean
  message?: string
  error?: string
  data?: Record<string, unknown>
}

type LiveRecord = {
  record_time: string
  device_id: number
  before_kWh?: number
  metrics_kWh?: number
  before_P?: number
  metrics_P?: number
  energy_reduction?: number
  co2_reduction?: number
}

export default function PG46TestPage() {
  const [deviceId, setDeviceId] = useState('1')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ApiResult | null>(null)
  const [error, setError] = useState('')

  // Real-time data viewer
  const [liveData, setLiveData] = useState<LiveRecord[]>([])
  const [liveLoading, setLiveLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Sample data
  const [data] = useState({
    before_meter_no: 'MTR001',
    metrics_meter_no: 'MTR002',
    before: {
      L1: 220.5,
      L2: 221.0,
      L3: 219.8,
      kWh: 1234.567,
      P: 150.5,
      Q: 50.2,
      S: 158.7,
      PF: 0.95,
      THD: 2.1,
      F: 50.0
    },
    metrics: {
      L1: 220.2,
      L2: 220.8,
      L3: 219.5,
      kWh: 1000.234,
      P: 120.3,
      Q: 40.1,
      S: 126.8,
      PF: 0.95,
      THD: 1.8,
      F: 50.0
    }
  })

  // Fetch latest power records
  const fetchLiveData = async () => {
    setLiveLoading(true)
    try {
      const res = await fetch('/api/pg46/latest-records?limit=10')
      if (res.ok) {
        const data = await res.json()
        setLiveData(data.records || [])
        setLastUpdate(new Date())
      }
    } catch (err) {
      console.error('Failed to fetch live data:', err)
    } finally {
      setLiveLoading(false)
    }
  }

  // Auto-refresh live data
  useEffect(() => {
    fetchLiveData() // Initial fetch

    if (autoRefresh) {
      const interval = setInterval(fetchLiveData, 5000) // Refresh every 5 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const handleSendData = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const payload = {
        device_id: parseInt(deviceId),
        ...data,
        record_time: new Date().toISOString()
      }

      const res = await fetch('/api/pg46/data-receiver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = (await res.json()) as ApiResult

      if (res.ok && result.success) {
        setResult(result)
        fetchLiveData() // Refresh live data after successful send
      } else {
        setError(result.error || 'Failed to send data')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell" style={{ padding: 30, maxWidth: 1200, margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: 30 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 28 }}>📡 PG46 Data Receiver Test</h2>
          <Link href="/admin/AdminKsave" className="k-btn k-btn-ghost">
            ← Back to Admin
          </Link>
        </div>
        <p style={{ color: '#6b7280', fontSize: 14 }}>
          ใช้หน้านี้ทดสอบ API รับข้อมูลเรียลไทม์จาก Progress PG46 RS485 และบันทึกลงตาราง power_records
        </p>
      </div>

      {/* Form */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: 24,
        border: '1px solid #e5e7eb',
        marginBottom: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        
        {/* Device ID */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
            Device ID *
          </label>
          <input
            type="number"
            value={deviceId}
            onChange={e => setDeviceId(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: 14,
              borderRadius: 8,
              border: '1px solid #d1d5db',
              background: '#fff'
            }}
          />
        </div>

        {/* Data Display */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
            Sample Data (JSON)
          </label>
          <textarea
            value={JSON.stringify({ device_id: parseInt(deviceId), ...data }, null, 2)}
            readOnly
            style={{
              width: '100%',
              padding: 12,
              fontSize: 13,
              fontFamily: 'monospace',
              borderRadius: 8,
              border: '1px solid #d1d5db',
              background: '#f9fafb',
              minHeight: 300,
              resize: 'vertical'
            }}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSendData}
          disabled={loading}
          className="k-btn k-btn-primary"
          style={{
            width: '100%',
            padding: '12px 32px',
            fontSize: 16,
            fontWeight: 600
          }}
        >
          {loading ? '⏳ Sending Data...' : '📡 Send Data'}
        </button>

      </div>

      {/* Result */}
      {result && (
        <div style={{
          background: '#d1fae5',
          border: '2px solid #10b981',
          borderRadius: 12,
          padding: 20,
          marginBottom: 20
        }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12, color: '#065f46' }}>
            ✅ Success!
          </div>
          <pre style={{
            background: '#fff',
            padding: 12,
            borderRadius: 8,
            fontSize: 13,
            fontFamily: 'monospace',
            overflow: 'auto',
            margin: 0
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background: '#fee2e2',
          border: '2px solid #ef4444',
          borderRadius: 12,
          padding: 20,
          marginBottom: 20
        }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: '#991b1b' }}>
            ⚠️ Error
          </div>
          <div style={{ fontSize: 14, color: '#991b1b' }}>
            {error}
          </div>
        </div>
      )}

      {/* Live Data Monitor */}
      <div style={{
        background: '#fff',
        border: '2px solid #10b981',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#059669' }}>
              📊 Live Data Monitor
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
              {lastUpdate && `Last updated: ${lastUpdate.toLocaleTimeString()}`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              style={{
                padding: '6px 12px',
                fontSize: 13,
                fontWeight: 600,
                background: autoRefresh ? '#10b981' : '#6b7280',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer'
              }}
            >
              {autoRefresh ? '🔄 Auto-Refresh ON' : '⏸️ Auto-Refresh OFF'}
            </button>
            <button
              onClick={fetchLiveData}
              disabled={liveLoading}
              style={{
                padding: '6px 12px',
                fontSize: 13,
                fontWeight: 600,
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: liveLoading ? 'not-allowed' : 'pointer',
                opacity: liveLoading ? 0.6 : 1
              }}
            >
              {liveLoading ? '⏳ Loading...' : '🔃 Refresh'}
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Time</th>
                <th style={{ padding: 8, textAlign: 'center', fontWeight: 600 }}>Device ID</th>
                <th style={{ padding: 8, textAlign: 'center', fontWeight: 600 }}>Before kWh</th>
                <th style={{ padding: 8, textAlign: 'center', fontWeight: 600 }}>Metrics kWh</th>
                <th style={{ padding: 8, textAlign: 'center', fontWeight: 600 }}>Before P</th>
                <th style={{ padding: 8, textAlign: 'center', fontWeight: 600 }}>Metrics P</th>
                <th style={{ padding: 8, textAlign: 'center', fontWeight: 600 }}>Energy Reduction</th>
                <th style={{ padding: 8, textAlign: 'center', fontWeight: 600 }}>CO2 Reduction</th>
              </tr>
            </thead>
            <tbody>
              {liveLoading && liveData.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>
                    Loading...
                  </td>
                </tr>
              ) : liveData.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>
                    No data received yet
                  </td>
                </tr>
              ) : (
                liveData.map((record: LiveRecord, idx: number) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 8, fontSize: 12 }}>
                      {new Date(record.record_time).toLocaleString()}
                    </td>
                    <td style={{ padding: 8, textAlign: 'center', fontWeight: 600 }}>
                      {record.device_id}
                    </td>
                    <td style={{ padding: 8, textAlign: 'right' }}>
                      {record.before_kWh?.toFixed(3) || '-'}
                    </td>
                    <td style={{ padding: 8, textAlign: 'right' }}>
                      {record.metrics_kWh?.toFixed(3) || '-'}
                    </td>
                    <td style={{ padding: 8, textAlign: 'right' }}>
                      {record.before_P?.toFixed(2) || '-'}
                    </td>
                    <td style={{ padding: 8, textAlign: 'right' }}>
                      {record.metrics_P?.toFixed(2) || '-'}
                    </td>
                    <td style={{ padding: 8, textAlign: 'right', color: '#059669', fontWeight: 600 }}>
                      {record.energy_reduction?.toFixed(3) || '-'}
                    </td>
                    <td style={{ padding: 8, textAlign: 'right', color: '#059669', fontWeight: 600 }}>
                      {record.co2_reduction?.toFixed(4) || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* API Documentation */}
      <div style={{
        background: '#eff6ff',
        border: '2px solid #3b82f6',
        borderRadius: 12,
        padding: 20
      }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12, color: '#1e40af' }}>
          📖 API Documentation for Remote PG46 Devices
        </div>
        <div style={{ fontSize: 14, color: '#1e3a8a', lineHeight: 1.8 }}>
          <p><strong>Endpoint:</strong> <code style={{ background: '#dbeafe', padding: '2px 6px', borderRadius: 4 }}>POST /api/pg46/data-receiver</code></p>
          <p><strong>Latest Records:</strong> <code style={{ background: '#dbeafe', padding: '2px 6px', borderRadius: 4 }}>GET /api/pg46/latest-records?limit=10</code></p>
          <p><strong>Description:</strong> Receive data from Progress PG46 RS485 and save to power_records table</p>
          <p><strong>Required Fields:</strong></p>
          <ul style={{ paddingLeft: 24, marginBottom: 12 }}>
            <li><code>device_id</code> - Device ID (number)</li>
          </ul>
          <p><strong>Optional Fields:</strong></p>
          <ul style={{ paddingLeft: 24, marginBottom: 12 }}>
            <li><code>before</code> - Power data before K-Save installation</li>
            <li><code>metrics</code> - Power data after K-Save installation</li>
            <li><code>record_time</code> - Timestamp (auto if not provided)</li>
          </ul>
          <p><strong>Power Fields:</strong></p>
          <ul style={{ paddingLeft: 24, fontSize: 13 }}>
            <li><code>L1, L2, L3</code> - Voltage (V)</li>
            <li><code>kWh</code> - Energy (kWh)</li>
            <li><code>P</code> - Active Power (kW)</li>
            <li><code>Q</code> - Reactive Power (kVAR)</li>
            <li><code>S</code> - Apparent Power (kVA)</li>
            <li><code>PF</code> - Power Factor (0-1)</li>
            <li><code>THD</code> - Total Harmonic Distortion (%)</li>
            <li><code>F</code> - Frequency (Hz)</li>
          </ul>
        </div>
      </div>

    </div>
  )
}
