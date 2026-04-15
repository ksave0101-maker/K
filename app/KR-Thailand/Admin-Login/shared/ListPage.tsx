"use client"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import AdminLayout from '../components/AdminLayout'
import styles from '../admin-theme.module.css'

type Column = { key: string; label: string }

function getAuthHeaders() {
  try {
    const t = localStorage.getItem('k_system_admin_token') || ''
    const headers: Record<string, string> = {}
    if (t) headers.Authorization = `Bearer ${t}`
    return headers
  } catch {
    return {}
  }
}

function StatusCell({ current, apiPath, rowId, onUpdate, rowIdKey, editable = true }: { current: string, apiPath: string, rowId: any, rowIdKey: string, onUpdate?: (val: string, followUp?: any) => void, editable?: boolean }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(current)
  const [code, setCode] = useState('')
  const [saving, setSaving] = useState(false)
  let options: string[] = ['open', 'in_progress', 'done', 'closed']

  if (apiPath.includes('/purchase-orders')) options = ['pending', 'received', 'cancelled']
  else if (apiPath.includes('/contracts')) options = ['active', 'pending', 'expired', 'terminated', 'completed']
  else if (apiPath.includes('/quotations')) options = ['pending', 'accepted', 'rejected']
  else if (apiPath.includes('/sales-orders')) options = ['pending', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled']
  else if (apiPath.includes('/invoices')) options = ['draft', 'issued', 'paid', 'cancelled', 'void']

  if (current && !options.includes(current)) options = [current, ...options]

  const badgeFor = (s: string) => {
    const map: Record<string, { label: string; color: string; bg: string }> = {
      open: { label: 'Open', color: '#92400e', bg: '#fff7ed' },
      in_progress: { label: 'In Progress', color: '#1e40af', bg: '#dbeafe' },
      done: { label: 'Done', color: '#166534', bg: '#dcfce7' },
      closed: { label: 'Closed', color: '#991b1b', bg: '#fee2e2' }
    }
    return map[s] || { label: s, color: '#666', bg: '#f5f5f5' }
  }
  const save = async () => {
    if (code !== '1114') { alert('Invalid confirmation code'); return }
    if (!rowId) return alert('Missing id')
    try {
      setSaving(true)
      const method = 'PATCH'
      const body: any = { status: value }
      try { body[rowIdKey] = rowId } catch (_) { body.id = rowId }
      body.id = rowId
      const resp = await fetch(apiPath, { method, headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, body: JSON.stringify(body) })
      // Read raw text so we can show helpful error messages for non-JSON replies
      let text: string | null = null
      try { text = await resp.text() } catch (_) { text = null }
      let j: any = null
      if (text) {
        try { j = JSON.parse(text) } catch (_) { j = null }
      }
      if (!resp.ok) {
        const msg = j?.error || j?.message || text || resp.statusText || `HTTP ${resp.status}`
        alert('Failed to update status: ' + msg)
        console.error('Status update failed', { status: resp.status, body: text, json: j })
      } else {
        // Success: either empty/204 or JSON { success: true }
        if (j === null || j.success === undefined || j.success) {
          onUpdate && onUpdate(value, j && j.followUp)
          setEditing(false)
          setCode('')
        } else {
          const msg = j?.error || j?.message || text || `HTTP ${resp.status}`
          alert('Failed to update status: ' + msg)
          console.error('Status update returned failure', { status: resp.status, body: text, json: j })
        }
      }
    } catch (err) {
      console.error('status update error', err)
      alert('Error updating status')
    } finally { setSaving(false) }
  }

  if (!editing) {
    const b = badgeFor(current)
    const isDraft = current === 'draft' || current === 'Draft'
    return (
      <td>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, color: b.color, background: b.bg }}>{b.label}</span>
          {editable && !isDraft && <button onClick={() => setEditing(true)} style={{ padding: '6px 8px', borderRadius: 6, background: '#fff', border: '1px solid #e6eef0' }}>Edit</button>}
        </div>
      </td>
    )
  }

  return (
    <td>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <select value={value} onChange={e => setValue(e.target.value)} style={{ padding: '6px 8px', borderRadius: 6 }}>
          {options.map(op => <option key={op} value={op}>{op}</option>)}
        </select>
        <input value={code} onChange={e => setCode(e.target.value)} placeholder="Enter code to save" style={{ padding: '6px 8px', borderRadius: 6, width: 120 }} />
        <button onClick={save} disabled={saving} className={styles.btnPrimary} style={{ padding: '6px 10px' }}>{saving ? 'Saving...' : 'Save'}</button>
        <button onClick={() => { setEditing(false); setCode(''); setValue(current) }} className={styles.btnOutline} style={{ padding: '6px 10px' }}>Cancel</button>
      </div>
    </td>
  )
}

export default function ListPage({ title, apiPath, createPath, columns, link, print, edit, selectable, statusEditable = true, onViewClick }: {
  title: string
  apiPath: string
  createPath?: string
  columns: Column[]
  link?: { columnKey: string; path: string; paramName?: string; idKey?: string }
  , print?: { path: string; paramName?: string; idKey?: string; newTab?: boolean }
  , edit?: { path: string; paramName?: string; idKey?: string }
  , selectable?: boolean
  , statusEditable?: boolean
  , onViewClick?: (id: string | number) => void

}) {
  const [locale, setLocale] = useState<'en'|'th'>('th')

  useEffect(() => {
    // Read locale from localStorage after hydration to avoid hydration mismatch
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      if (l === 'en' || l === 'th') setLocale(l)
    } catch { }
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as any).detail
      const v = typeof d === 'string' ? d : d?.locale
      if (v === 'en' || v === 'th') {
        setLocale(v)
        try {
          localStorage.setItem('locale', v)
          localStorage.setItem('k_system_lang', v)
        } catch { }
      }
    }
    window.addEventListener('k-system-lang', handler)
    window.addEventListener('locale-changed', handler)
    return () => {
      window.removeEventListener('k-system-lang', handler)
      window.removeEventListener('locale-changed', handler)
    }
  }, [])

  const T = (en: string, th: string) => locale === 'th' ? th : en
  const translateLabel = (raw: string) => {
    const r = String(raw || '').toLowerCase()
    if (r.includes('receipt')) return T('Receipt No', 'เลขที่ใบรับเงิน')
    if (r === 'date') return T('Date', 'วันที่')
    if (r.includes('invoice')) return T('Invoice', 'ใบแจ้งหนี้')
    if (r === 'status') return T('Status', 'สถานะ')
    if (r === 'amount') return T('Amount', 'จำนวนเงิน')
    if (r === '+ create' || r === 'create') return T('+ Create', '+ สร้างใหม่')
    return raw
  }
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invoiceHasReceipt, setInvoiceHasReceipt] = useState<Record<string, boolean>>({})

  async function load() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(apiPath, { headers: getAuthHeaders() })
      // Safer JSON parsing: when an HTML error page is returned (starts with '<'), capture text for debugging
      let j: any = null
      try {
        j = await res.json()
      } catch (parseErr) {
        try {
          const text = await res.text()
          console.error('Failed to parse JSON from', apiPath, 'response text:', text)
          setError(`Invalid JSON response from ${apiPath}: ${String(text).slice(0, 200)}`)
        } catch (e) {
          console.error('Failed to read response text for', apiPath, e)
          setError(`Invalid JSON response from ${apiPath}`)
        }
        setRows([])
        return
      }

      if (!res.ok || !j || !j.success) {
        setError(j?.error || j?.message || 'Failed to load')
        setRows([])
      } else {
        let data: any[] = []
        for (const v of Object.values(j)) {
          if (Array.isArray(v)) { data = v; break }
        }
        setRows(data)
      }
    } catch (err: any) { setError(String(err)); setRows([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [apiPath])

  useEffect(() => {
    if (!print) return
    try {
      const p: any = print
      const isInvoiceList = apiPath?.includes('/invoices') || (p?.path && String(p.path).includes('invoice/print'))
      if (!isInvoiceList) return
      const idKey = p?.idKey || p?.paramName || (columns && columns[0]?.key)
      rows.forEach((r: any) => {
        const val = r?.[idKey] ?? r?.[p?.paramName] ?? r?.[columns[0].key]
        if (!val) return
        if (invoiceHasReceipt[val] !== undefined) return
        ;(async () => {
          try {
            const res = await fetch(`/api/receipts?invNo=${encodeURIComponent(String(val))}&limit=1`)
            const j = await res.json().catch(() => null)
            const has = res.ok && j && j.success && Array.isArray(j.receipts) && j.receipts.length > 0
            setInvoiceHasReceipt(prev => ({ ...prev, [val]: !!has }))
          } catch (e) {
            setInvoiceHasReceipt(prev => ({ ...prev, [val]: false }))
          }
        })()
      })
    } catch (e) { /* ignore */ }
  }, [rows, print, apiPath, columns])

  const [modalMessage, setModalMessage] = useState<string | null>(null)

  const handlePrintList = () => {
    // Create print window
    const printWindow = window.open('', '_blank', 'width=1200,height=800')
    if (!printWindow) {
      alert(T('Please allow popups to print', 'กรุณาอนุญาตให้เปิดหน้าต่างใหม่เพื่อพิมพ์'))
      return
    }

    // Calculate totals if there are amount columns
    const amountKeys = columns.filter(c =>
      /amount|total|price|value|cost|subtotal/i.test(c.key)
    ).map(c => c.key)

    let subtotal = 0
    if (amountKeys.length > 0) {
      rows.forEach(r => {
        amountKeys.forEach(key => {
          const val = r?.[key]
          if (typeof val === 'number' && !isNaN(val)) {
            subtotal += val
          } else if (typeof val === 'string') {
            const num = parseFloat(val)
            if (!isNaN(num)) subtotal += num
          }
        })
      })
    }

    const vat = subtotal * 0.07
    const grandTotal = subtotal + vat
    const hasAmounts = subtotal > 0

    // Generate print content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${T(title, title)} - ${T('Report', 'รายงาน')}</title>
        <style>
          @page {
            size: A4;
            margin: 1.8cm 2.5cm 1.8cm 2.5cm;
          }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body {
            width: 100%;
            overflow: hidden !important;
          }
          /* Hide scrollbar */
          ::-webkit-scrollbar {
            display: none;
          }
          html {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          body {
            font-family: 'Sarabun', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 5px;
            font-size: 7px;
            max-width: 155mm;
            margin: 0 auto;
            background: white;
          }
          h1 {
            font-size: 12px;
            font-weight: 700;
            margin-bottom: 2px;
            color: #1e293b;
          }
          .subtitle {
            font-size: 7px;
            color: #64748b;
            margin-bottom: 6px;
          }
          .meta {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
            font-size: 8px;
            color: #475569;
            padding: 4px 6px;
            background: #f8fafc;
            border-radius: 3px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 3px;
            font-size: 6px;
            table-layout: auto;
          }
          th, td {
            padding: 2px 3px;
            text-align: left;
            border: 1px solid #e2e8f0;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          th {
            background: #f1f5f9;
            font-weight: 600;
            color: #1e293b;
            font-size: 6px;
            white-space: nowrap;
          }
          tbody tr:nth-child(even) {
            background: #f8fafc;
          }
          .badge {
            padding: 1px 6px;
            border-radius: 6px;
            font-size: 7px;
            font-weight: 600;
            display: inline-block;
          }
          .summary {
            margin-top: 10px;
            border-top: 2px solid #1e293b;
            padding-top: 8px;
            display: flex;
            justify-content: flex-end;
          }
          .summary-table {
            width: 250px;
            border: none;
          }
          .summary-table td {
            border: none;
            padding: 4px 8px;
            font-size: 9px;
          }
          .summary-table .label {
            text-align: right;
            font-weight: 500;
            color: #475569;
          }
          .summary-table .value {
            text-align: right;
            font-weight: 600;
            color: #1e293b;
          }
          .summary-table .total-row {
            border-top: 2px solid #1e293b;
            background: #f1f5f9;
          }
          .summary-table .total-row td {
            font-size: 11px;
            font-weight: 700;
            color: #0f172a;
            padding-top: 6px;
            padding-bottom: 6px;
          }
          @media print {
            html, body {
              overflow: hidden !important;
              -ms-overflow-style: none !important;
              scrollbar-width: none !important;
            }
            ::-webkit-scrollbar {
              display: none !important;
            }
            body { padding: 0; max-width: 100%; }
            h1 { font-size: 11px; }
            th, td { padding: 2px 3px; font-size: 6px; }
            .meta { padding: 2px 4px; font-size: 6px; }
            .summary-table td { font-size: 7px; }
            .summary-table .total-row td { font-size: 9px; }
          }
        </style>
      </head>
      <body>
        <h1>${T(title, title)}</h1>
        <div class="subtitle">${T('List Report', 'รายงานรายการ')}</div>
        <div class="meta">
          <div>${T('Total Records', 'จำนวนรายการทั้งหมด')}: <strong>${rows.length}</strong></div>
          <div>${T('Printed', 'พิมพ์เมื่อ')}: <strong>${new Date().toLocaleString(locale === 'th' ? 'th-TH' : 'en-US')}</strong></div>
        </div>
        <table>
          <thead>
            <tr>
              ${columns.map(c => `<th>${translateLabel(c.label || c.key)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr>
                ${columns.map(c => {
                  const v = r?.[c.key]

                  // Handle status with badge
                  if (c.key === 'status') {
                    const badgeMap: Record<string, { label: string; color: string; bg: string }> = {
                      open: { label: 'Open', color: '#92400e', bg: '#fff7ed' },
                      in_progress: { label: 'In Progress', color: '#1e40af', bg: '#dbeafe' },
                      done: { label: 'Done', color: '#166534', bg: '#dcfce7' },
                      closed: { label: 'Closed', color: '#991b1b', bg: '#fee2e2' },
                      pending: { label: 'Pending', color: '#92400e', bg: '#fef3c7' },
                      confirmed: { label: 'Confirmed', color: '#1e40af', bg: '#dbeafe' },
                      completed: { label: 'Completed', color: '#166534', bg: '#dcfce7' },
                      cancelled: { label: 'Cancelled', color: '#991b1b', bg: '#fee2e2' }
                    }
                    const badge = badgeMap[v] || { label: v, color: '#666', bg: '#f5f5f5' }
                    return `<td><span class="badge" style="color: ${badge.color}; background: ${badge.bg};">${badge.label}</span></td>`
                  }

                  // Handle numbers
                  if (typeof v === 'number') {
                    const isId = /id$/i.test(c.key)
                    const isAmount = /amount|total|price|value|cost/i.test(c.key)
                    if (isAmount) {
                      return `<td style="text-align: right;">${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>`
                    }
                    return `<td>${isId ? Number(v) : Number(v).toFixed(2)}</td>`
                  }

                  // Handle created_by
                  if (/created_by$/i.test(c.key)) {
                    try {
                      const obj = (typeof v === 'string' && v.length > 0) ? JSON.parse(v) : v
                      const name = obj?.name || obj?.username || obj?.userName || v
                      return `<td>${name ?? '-'}</td>`
                    } catch (_) {
                      return `<td>${String(v ?? '-')}</td>`
                    }
                  }

                  return `<td>${v ?? '-'}</td>`
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>

        ${hasAmounts ? `
        <div class="summary">
          <table class="summary-table">
            <tr>
              <td class="label">${T('Subtotal', 'ยอดรวม')}:</td>
              <td class="value">${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td class="label">${T('VAT 7%', 'ภาษีมูลค่าเพิ่ม 7%')}:</td>
              <td class="value">${vat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            <tr class="total-row">
              <td class="label">${T('Grand Total', 'ยอดรวมทั้งสิ้น')}:</td>
              <td class="value">${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          </table>
        </div>
        ` : ''}
      </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()

    // Auto print after content loaded
    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
    }, 250)
  }

  const handleOpenWithSignatureCheck = async (r: any, c: Column) => {
    try {
      const rowId = r?.receiptID ?? r?.id ?? null
      if (!rowId) {
        // fallback to original link behaviour
        const param = link?.paramName || c.key
        const href = `${link?.path}?${param}=${encodeURIComponent(String(r?.[c.key] ?? ''))}`
        window.location.href = href
        return
      }
      const res = await fetch(`/api/receipts?id=${encodeURIComponent(String(rowId))}`)
      const j = await res.json().catch(() => null)
      if (!res.ok || !j || !j.success || !j.receipt) {
        alert(T('Receipt not found', 'ไม่พบใบเสร็จ'))
        return
      }
      const rec = j.receipt
      const hasSig = Boolean(
        rec?.signature || rec?.signatures || rec?.signed || rec?.received_signature || rec?.verified_signature || rec?.approved_signature || rec?.signed_by || rec?.signature_image || (typeof rec?.notes === 'string' && rec.notes.toLowerCase().includes('signature'))
      )
      if (!hasSig) {
        setModalMessage(T('No signed document yet', 'ยังไม่มีการอนุมัติเซ็นเอกสารใดๆ'))
        setTimeout(() => setModalMessage(null), 6000)
        return
      }
      // open print view
      const p: any = print
      let printPath = String(p?.path || '')
      if (!printPath.includes('/print')) printPath = printPath.replace(/\/$/, '') + '/print'
      const paramName = p?.paramName || p?.idKey || 'receiptID'
      const href = `${printPath}?${paramName}=${encodeURIComponent(String(rowId))}`
      try { window.open(href, '_blank') } catch (e) { window.location.href = href }
    } catch (e) {
      console.error('open with signature check error', e)
      alert(T('Error loading receipt', 'เกิดข้อผิดพลาดขณะเปิดใบเสร็จ'))
    }
  }

  return (
    <>
    <AdminLayout title={locale === 'th' ? (title + '') : title} titleTh={locale === 'th' ? title : title}>
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>{T(title, title)}</h2>
          <p className={styles.cardSubtitle}>{T(title, title)}</p>
        </div>
        <div className={styles.cardBody}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {createPath ? (
              <Link href={createPath}>
                <button className={`${styles.btn} ${styles.btnPrimary}`}>{T('+ Create', '+ สร้างใหม่')}</button>
              </Link>
            ) : <div />}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={async () => {
                // If this list is the invoices list, pre-generate an invoice number
                try {
                  if (apiPath && apiPath.includes('/invoices')) {
                    try {
                      const today = new Date()
                      const d = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
                      const ts = Date.now()
                      const res = await fetch(`/api/invoice-seq?date=${encodeURIComponent(d)}&_t=${ts}`)
                      const j = await res.json().catch(() => null)
                      if (res.ok && j && j.success && j.invNo) {
                        try { localStorage.setItem('k_system_next_invNo', String(j.invNo)) } catch (_) {}
                        alert('Next invoice number generated: ' + j.invNo)
                      }
                    } catch (e) { /* ignore */ }
                  }
                  // Also support tax-invoice sequence when refreshing tax-invoice lists
                  if (apiPath && apiPath.includes('/tax-invoices')) {
                    try {
                      const ts = Date.now()
                      const res2 = await fetch(`/api/tiv-seq?_t=${ts}`)
                      const j2 = await res2.json().catch(() => null)
                      if (res2.ok && j2 && j2.success && j2.formatted) {
                        try { localStorage.setItem('k_system_next_tivNo', String(j2.formatted)) } catch (_) {}
                        alert('Next tax-invoice number generated: ' + j2.formatted)
                      }
                    } catch (e) { /* ignore */ }
                  }
                } finally {
                  load()
                }
                }} className={styles.btnOutline} disabled={loading}>{loading ? (T('Loading...', 'กำลังโหลด...')) : T('Refresh', 'รีเฟรช')}</button>
            </div>
          </div>

          {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {columns.map(c => (
                    <th key={c.key}><span suppressHydrationWarning>{translateLabel(c.label || c.key)}</span></th>
                  ))}
                  {(print || edit || selectable) && <th>{T('Actions', 'การกระทำ')}</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={r?.id ?? r?.[columns[0].key] ?? idx}>
                    {columns.map(c => {
                      // Handle rowNumber column - use index + 1
                      if (c.key === 'rowNumber') {
                        return <td key={c.key}>{idx + 1}</td>
                      }
                      const v = r?.[c.key]
                      if (link && link.columnKey === c.key) {
                        const param = link.paramName || c.key
                        // For receipts, check signatures before opening print view
                        if (apiPath && apiPath.includes('/receipts')) {
                          return <td key={c.key}><button onClick={() => handleOpenWithSignatureCheck(r, c)} style={{ background: 'transparent', border: 'none', color: '#0b5394', textDecoration: 'underline', cursor: 'pointer' }}>{v ?? '-'}</button></td>
                        }
                        const href = `${link.path}?${param}=${encodeURIComponent(String(v ?? ''))}`
                        // For power-calculations, format calcID as YYYYMMDD-XXXX
                        let displayValue = v ?? '-'
                        if (apiPath && apiPath.includes('/power-calculations') && c.key === 'calcID' && r?.created_at) {
                          try {
                            const date = new Date(r.created_at)
                            const year = date.getFullYear()
                            const month = String(date.getMonth() + 1).padStart(2, '0')
                            const day = String(date.getDate()).padStart(2, '0')
                            const calcNum = String(v).padStart(4, '0')
                            displayValue = `${year}${month}${day}-${calcNum}`
                          } catch (e) {
                            displayValue = v ?? '-'
                          }
                        }
                        return (
                          <td key={c.key}>
                            <Link
                              href={href}
                              style={{
                                color: '#0b5394',
                                transition: 'color 0.2s ease',
                                fontWeight: 500
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#3b82f6'
                                e.currentTarget.style.textDecoration = 'underline'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#0b5394'
                                e.currentTarget.style.textDecoration = 'none'
                              }}
                            >
                              {displayValue}
                            </Link>
                          </td>
                        )
                      }
                      if (c.key === 'checklist') {
                        try {
                          const list = Array.isArray(v) ? v : (typeof v === 'string' ? JSON.parse(v) : null)
                          if (Array.isArray(list)) {
                            const texts = list.filter((it: any) => it && (it.ok === true || it.checked === true)).map((it: any) => (it.label_en || it.label || it.label_th || '')).filter(Boolean)
                            return <td key={c.key}>{texts.length ? texts.join(', ') : '-'}</td>
                          }
                        } catch (_) { }
                        return <td key={c.key}>{'-'}</td>
                      }
                      if (c.key === 'photos' || c.key === 'images') {
                        const arr = Array.isArray(v) ? v : []
                        return (
                          <td key={c.key}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              {arr.length === 0 && <span>-</span>}
                              {arr.slice(0, 5).map((img: any) => {
                                const imgUrl = img && img.id ? `/api/pre-installation/image?id=${encodeURIComponent(String(img.id))}` : (img && img.url) || ''
                                if (link && link.columnKey) {
                                  const param = link.paramName || link.columnKey
                                  const rowId = r?.[param] ?? r?.[link.columnKey] ?? r?.id ?? ''
                                  const href = `${link.path}?${param}=${encodeURIComponent(String(rowId))}`
                                  return (
                                    <a key={img.id || imgUrl} href={href}>
                                      <img src={imgUrl} alt={img.filename || 'photo'} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
                                    </a>
                                  )
                                }
                                return (
                                  <a key={img.id || imgUrl} href={imgUrl} target="_blank" rel="noreferrer">
                                    <img src={imgUrl} alt={img.filename || 'photo'} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
                                  </a>
                                )
                              })}
                            </div>
                          </td>
                        )
                      }

                      if (typeof v === 'number') {
                        const isId = /id$/i.test(c.key)
                        return <td key={c.key}>{isId ? Number(v) : Number(v).toFixed(2)}</td>
                      }

                      if (c.key === 'status') {
                        // For receipts, show simple read-only availability (Used / Available)
                        if (apiPath && apiPath.includes('/receipts')) {
                          const used = !!(r && (r.invoice_no || r.invID || r.invoice_no || r.invoice || r.invoiceNo))
                          return <td key={c.key} style={{ fontWeight: 600 }}>{used ? T('Used', 'ถูกใช้งาน') : T('Available', 'ว่าง')}</td>
                        }
                        const rowIdKey = columns[0].key
                        const rowId = r?.[rowIdKey] ?? r?.id
                        const current = (r && (r.status ?? r[c.key])) || 'open'
                        return (
                          <StatusCell key={c.key} current={current} apiPath={apiPath} rowId={rowId} rowIdKey={rowIdKey} editable={statusEditable} onUpdate={(val, followUp) => {
                            setRows((prev: any[]) => prev.map(it => (it && (it[rowIdKey] === rowId || it.id === rowId)) ? { ...it, status: (followUp && followUp.status) || val, ...(followUp || {}) } : it))
                          }} />
                        )
                      }

                      if (c.key === 'items') {
                        try {
                          const list = Array.isArray(v) ? v : (typeof v === 'string' ? JSON.parse(v) : null)
                          if (Array.isArray(list)) {
                            const texts = list.map((it: any) => {
                              const qty = it?.qty ?? it?.quantity ?? ''
                              const desc = it?.desc || it?.description || it?.name || it?.product_name || ''
                              const unit = it?.unitPrice ?? it?.unit_price ?? it?.price
                              let s = ''
                              if (qty !== '') s += qty + '×'
                              s += desc || '-'
                              if (unit !== undefined && unit !== null && unit !== '') s += ` (${Number(unit).toFixed(2)})`
                              return s
                            })
                            return <td key={c.key} style={{ whiteSpace: 'pre-wrap' }}>{texts.join('\n')}</td>
                          }
                        } catch (_) { }
                        return <td key={c.key}>{v ?? '-'}</td>
                      }

                      if (/created_by$/i.test(c.key) || c.key === 'created_by') {
                        try {
                          const obj = (typeof v === 'string' && v.length > 0) ? JSON.parse(v) : v
                          const name = obj?.name || obj?.username || obj?.userName || obj?.user?.name || obj?.user?.username
                          return <td key={c.key}>{name ?? (typeof v === 'string' ? v : JSON.stringify(v) || '-')}</td>
                        } catch (_) {
                          return <td key={c.key}>{String(v ?? '-')}</td>
                        }
                      }

                      // Format date columns (created_at, updated_at, date, etc.)
                      if (typeof v === 'string' && (c.key === 'created_at' || c.key === 'updated_at' || c.key === 'date' || /date/i.test(c.key))) {
                        try {
                          const date = new Date(v)
                          if (!isNaN(date.getTime())) {
                            const day = String(date.getDate()).padStart(2, '0')
                            const month = String(date.getMonth() + 1).padStart(2, '0')
                            const year = date.getFullYear()
                            const hours = String(date.getHours()).padStart(2, '0')
                            const minutes = String(date.getMinutes()).padStart(2, '0')
                            return <td key={c.key}>{`${day}/${month}/${year} ${hours}:${minutes}`}</td>
                          }
                        } catch (_) { }
                      }

                      if (typeof v === 'string' && v.length > 0) {
                        if (/id$/i.test(c.key)) {
                          const n = Number(v)
                          if (!isNaN(n)) return <td key={c.key}>{Number.isInteger(n) ? n : Math.trunc(n)}</td>
                        }
                        return <td key={c.key} style={{ whiteSpace: 'pre-wrap' }}>{v}</td>
                      }
                      return <td key={c.key}>{v ?? '-'}</td>
                    })}
                    {(print || edit || selectable) && (
                      <td>
                        {edit && (() => {
                          const e: any = edit
                          const idKey = e?.idKey || e?.paramName || 'id'
                          const paramName = e?.paramName || idKey
                          const val = r?.[idKey] ?? r?.[paramName] ?? r?.[columns[0].key]
                          if (!val) return null
                          const editPath = String(e.path || '')
                          const href = `${editPath}?${paramName}=${encodeURIComponent(String(val))}`
                          return (
                            <button
                              onClick={() => {
                                if (onViewClick) {
                                  onViewClick(val)
                                } else {
                                  window.location.href = href
                                }
                              }}
                              aria-label="View"
                              title={T('View', 'ดูรายละเอียด')}
                              style={{ padding: 4, width: 40, height: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer' }}
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </svg>
                            </button>
                          )
                        })()}
                        {print && (() => {
                          const p: any = print
                          const idKey = p?.idKey || p?.paramName || 'id'
                          const paramName = p?.paramName || idKey
                          const val = r?.[idKey] ?? r?.[paramName] ?? r?.[columns[0].key]
                          if (!val) return <span>-</span>
                          let printPath = String(p.path || '')
                          if (!printPath.includes('/print')) printPath = printPath.replace(/\/$/, '') + '/print'
                          const baseHref = `${printPath}?${paramName}=${encodeURIComponent(String(val))}`
                          const href = baseHref + `&autoPrint=1`

                          const idKey2 = p?.idKey || p?.paramName || columns[0].key
                          const val2 = r?.[idKey2] ?? r?.[p?.paramName] ?? r?.[columns[0].key]
                          const already = val2 ? (invoiceHasReceipt[val2] || (r && (r.status === 'paid' || r.status === 'Paid'))) : false
                          const isDraft = r && (r.status === 'draft' || r.status === 'Draft')

                          if (already || isDraft) {
                            const disabledTitle = isDraft
                              ? T('Cannot print draft - please complete first', 'ไม่สามารถพิมพ์ร่างได้ - กรุณาทำให้เสร็จก่อน')
                              : T('Invoice already used to create receipt', 'ใบแจ้งหนี้ถูกใช้สร้างใบเสร็จแล้ว')
                            return (
                              <button disabled title={disabledTitle} aria-label="Print disabled" style={{ padding: 4, width: 40, height: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', opacity: 0.4, cursor: 'not-allowed' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                              </button>
                            )
                          }

                            return (
                              <button onClick={() => { try { window.open(href, p?.newTab ? '_blank' : '_self') } catch (e) { window.location.href = href } }} aria-label="Print" title={T('Print', 'พิมพ์')} style={{ padding: 4, width: 40, height: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0b5394" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                              </button>
                          )
                        })()}
                      </td>
                    )}
                    {selectable && (
                      // Render Select button; disable if receipt already used
                      <td>
                        {(() => {
                          const used = Boolean(apiPath && apiPath.includes('/receipts') && !!(r && (r.invoice_no || r.invID || r.invoice || r.invoiceNo)))
                          return (
                            <button
                                onClick={() => {
                                  if (!used) {
                                    window.dispatchEvent(new CustomEvent('k-system-list-select', { detail: r }))
                                  }
                                }}
                              aria-label="Select"
                              title={used ? 'Already used' : 'Select'}
                              disabled={used}
                              style={{ padding: '6px 10px', opacity: used ? 0.5 : 1, cursor: used ? 'not-allowed' : 'pointer' }}
                            >
                              Select
                            </button>
                          )
                        })()}
                      </td>
                    )}
                  </tr>
                ))}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan={columns.length + (print || selectable ? 1 : 0)} style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                      {loading ? 'Loading...' : 'No records found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
    {modalMessage && (
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
        <div style={{ background: 'rgba(255,255,255,0.98)', padding: 24, borderRadius: 8, border: '3px solid #ef4444', color: '#b91c1c', fontWeight: 800, fontSize: 18, textAlign: 'center' }}>
          {modalMessage}
        </div>
      </div>
    )}
    </>
  )
}
