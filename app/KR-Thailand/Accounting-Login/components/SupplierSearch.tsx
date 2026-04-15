"use client"
import React, { useState, useRef, useEffect, useCallback } from 'react'

type Supplier = { id: number; code: string; name_th: string; name_en?: string; tax_id?: string; phone?: string }

type Props = {
  value?: number
  displayValue?: string
  onChange: (supplier: Supplier | null) => void
  style?: React.CSSProperties
}

export default function SupplierSearch({ value, displayValue, onChange, style }: Props) {
  const [query, setQuery] = useState(displayValue || '')
  const [results, setResults] = useState<Supplier[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const wrapRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync display when parent value changes
  useEffect(() => { setQuery(displayValue || '') }, [displayValue])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const r = await fetch(`/api/accounting/suppliers?q=${encodeURIComponent(q)}`)
      const d = await r.json()
      if (d.ok) setResults(d.data || [])
    } catch (_) {}
    setLoading(false)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setQuery(q)
    setOpen(true)
    setHighlight(-1)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => search(q), 250)
    // Clear current selection if user is editing
    if (value) onChange(null)
  }

  const select = (s: Supplier) => {
    setQuery(s.name_th)
    setOpen(false)
    onChange(s)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => Math.min(h + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)) }
    else if (e.key === 'Enter' && highlight >= 0) { e.preventDefault(); select(results[highlight]) }
    else if (e.key === 'Escape') setOpen(false)
  }

  const handleFocus = () => {
    if (query.trim()) { search(query); setOpen(true) }
  }

  const inputStyle: React.CSSProperties = {
    padding: '7px 12px',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    background: '#fff',
    fontSize: 13.5,
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: '"Sarabun","Tahoma",sans-serif',
    outline: 'none',
    ...style,
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        style={inputStyle}
        value={query}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder="พิมพ์ชื่อ, รหัส หรือเลขภาษี..."
      />
      {loading && (
        <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#9ca3af' }}>...</div>
      )}
      {open && results.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: '#fff',
          border: '1px solid #d1d5db',
          borderRadius: '0 0 8px 8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          zIndex: 3000,
          maxHeight: 240,
          overflowY: 'auto',
        }}>
          {results.map((s, i) => (
            <div
              key={s.id}
              onClick={() => select(s)}
              onMouseEnter={() => setHighlight(i)}
              style={{
                padding: '8px 14px',
                cursor: 'pointer',
                background: highlight === i ? '#f0f1f3' : '#fff',
                borderBottom: i < results.length - 1 ? '1px solid #f3f4f6' : 'none',
                transition: 'background 0.1s',
              }}
            >
              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1f2937' }}>{s.name_th}</div>
              <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 1 }}>
                {s.code}{s.tax_id ? ` · Tax: ${s.tax_id}` : ''}{s.phone ? ` · ${s.phone}` : ''}
              </div>
            </div>
          ))}
        </div>
      )}
      {open && query.trim() && !loading && results.length === 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: '#fff',
          border: '1px solid #d1d5db',
          borderRadius: '0 0 8px 8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          zIndex: 3000,
          padding: '12px 14px',
          fontSize: 13,
          color: '#9ca3af',
        }}>
          ไม่พบข้อมูลผู้จำหน่าย
        </div>
      )}
    </div>
  )
}
