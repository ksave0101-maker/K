"use client"

import React, { useEffect, useMemo, useState } from 'react'

type CurrentRow = {
  time: string
  device?: string
  p?: number
  q?: number
  s?: number
  // allow other fields
  [k: string]: any
}

function detectPeaks(values: { t: string; v: number }[], windowSize = 3) {
  // Simple local-maximum + threshold detector
  // returns array of {time, value, score}
  if (!values || values.length === 0) return []
  const nums = values.map((x) => x.v)
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length
  const variance = nums.reduce((a, b) => a + (b - mean) ** 2, 0) / nums.length
  const std = Math.sqrt(variance)
  const thresh = mean + std * 0.9 // moderately above average

  const peaks: { time: string; value: number; score: number }[] = []
  for (let i = 1; i < values.length - 1; i++) {
    const v = values[i].v
    if (v > values[i - 1].v && v > values[i + 1].v && v >= thresh) {
      const score = (v - mean) / (std || 1)
      peaks.push({ time: values[i].t, value: v, score })
    }
  }
  // if none found, fallback to top-N
  if (peaks.length === 0) {
    const top = [...values].sort((a, b) => b.v - a.v).slice(0, Math.min(5, values.length))
    top.forEach((t) => peaks.push({ time: t.t, value: t.v, score: (t.v - mean) / (std || 1) }))
  }
  return peaks
}

export default function AnaAIPage(): React.ReactElement {
  const [device, setDevice] = useState<string>('')
  const [range, setRange] = useState<string>('-1h')
  const [rows, setRows] = useState<CurrentRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [peaks, setPeaks] = useState<{ time: string; value: number; score: number }[]>([])
  const [summary, setSummary] = useState<string>('')
  const [analyzing, setAnalyzing] = useState<boolean>(false)
  const [lastAnalysis, setLastAnalysis] = useState<number | null>(null)
  const [realtime, setRealtime] = useState<boolean>(false)
  const [intervalMs, setIntervalMs] = useState<number>(5000)
  const [lastUpdate, setLastUpdate] = useState<number | null>(null)

  useEffect(() => {
    let mounted = true
    let iv: ReturnType<typeof setInterval> | null = null

    const fetchCurrents = async () => {
      setLoading(true)
      setError(null)
      try {
        let url = `/api/influx/currents?range=${encodeURIComponent(range)}`
        if (device) url += `&device=${encodeURIComponent(device)}`
        const res = await fetch(url)
        const b = await res.json().catch(() => ({}))
        if (!res.ok) {
          if (mounted) {
            setError(b?.error || 'Failed to fetch currents')
            setRows([])
          }
        } else {
          if (mounted) {
            setRows(b.rows || b || [])
            setLastUpdate(Date.now())
          }
        }
      } catch (e: any) {
        if (mounted) setError(String(e))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    // initial fetch
    fetchCurrents()

    if (realtime) {
      iv = setInterval(fetchCurrents, Math.max(1000, intervalMs))
    }

    return () => { mounted = false; if (iv) clearInterval(iv) }
  }, [device, range, realtime, intervalMs])

  const series = useMemo(() => {
    // pick p if available, else s, else q
    return rows
      .map((r) => ({ t: r.time || r._time || r.ts || r.timestamp || String(new Date()), v: Number(r.p ?? r.P ?? r.s ?? r.S ?? r.q ?? r.Q ?? 0) }))
      .filter((x) => Number.isFinite(x.v))
  }, [rows])

  const runAnalysis = () => {
    // protect against concurrent runs
    if (analyzing) return
    setAnalyzing(true)
    try {
      const detected = detectPeaks(series, 3)
      setPeaks(detected)
      // generate a simple 'AI' style textual summary using heuristics
      if (detected.length === 0) {
        setSummary('No significant peaks detected in the selected period.')
      } else {
        const top = [...detected].sort((a, b) => b.value - a.value)[0]
        const avg = series.reduce((s, x) => s + x.v, 0) / (series.length || 1)
        const msg = `Detected ${detected.length} peak(s). Highest peak at ${new Date(top.time).toLocaleString()} with value ${top.value.toFixed(3)} (≈ ${(top.value / (avg || 1)).toFixed(2)}× average). Peaks: ${detected.map(p => `${new Date(p.time).toLocaleTimeString()}:${p.value.toFixed(2)}`).join('; ')}`
        setSummary(msg)
      }
      setLastAnalysis(Date.now())
    } finally {
      setAnalyzing(false)
    }
  }

  // Auto-run analysis whenever series updates in realtime mode (debounced)
  useEffect(() => {
    if (!realtime) return
    // short debounce to avoid spamming analysis on every tick
    const id = setTimeout(() => {
      runAnalysis()
    }, 800)
    return () => clearTimeout(id)
  }, [series, realtime])

  return (
    <main className="p-4" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '60px 40px',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        maxWidth: '600px',
        width: '100%'
      }}>
        <div style={{
          fontSize: '72px',
          marginBottom: '20px',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          ⏳
        </div>

        <h1 style={{
          fontSize: '36px',
          fontWeight: 700,
          color: '#374151',
          marginBottom: '16px',
          letterSpacing: '-0.5px'
        }}>
          Awaiting Analysis
        </h1>

        <p style={{
          fontSize: '18px',
          color: '#6b7280',
          marginBottom: '24px',
          lineHeight: '1.6'
        }}>
          The AI Peak Analysis feature is currently under development.<br/>
          Please check back soon for advanced analytics capabilities.
        </p>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 24px',
          background: '#f3f4f6',
          borderRadius: '12px',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#fbbf24',
            animation: 'blink 1.5s ease-in-out infinite'
          }}></div>
          <span>Status: Pending Development</span>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
          }
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}</style>
      </div>
    </main>
  )
}
