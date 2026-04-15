"use client"

import React, { useEffect, useState, useCallback } from 'react'
import AdminLayout from '../components/AdminLayout'

type TestRecord = {
  testID: number; testNo: string; cusID: number | null; quoteNo: string | null; customerName: string
  phone: string; email: string; address: string; productName: string
  productDetail: string; installDate: string; startDate: string; endDate: string
  status: string; testResult: string; powerBefore: number | null; powerAfter: number | null
  savingPercent: number | null; customerFeedback: string; rating: number | null
  notes: string; assignedTo: string; convertedToInstall: number; created_at: string
}

type Quotation = {
  quoteID: number; quoteNo: string; customer_name: string; customer_phone: string
  customer_email: string; cusID: number | null; items: string; subtotal: number
  total: number; status: string; quoteDate: string
}

const emptyForm = {
  cusID: '', customerName: '', phone: '', email: '', address: '',
  productName: '', productDetail: '', installDate: '', startDate: '', endDate: '',
  status: 'pending', testResult: '', powerBefore: '', powerAfter: '',
  customerFeedback: '', rating: '', notes: '', assignedTo: '', quoteNo: ''
}

const statusMap: Record<string, { en: string; th: string; color: string; bg: string }> = {
  pending:   { en: 'Pending',   th: 'รอดำเนินการ',       color: '#92400e', bg: '#fef3c7' },
  testing:   { en: 'Testing',   th: 'กำลังทดสอบ',        color: '#1e40af', bg: '#dbeafe' },
  completed: { en: 'Completed', th: 'เสร็จสิ้น',         color: '#065f46', bg: '#d1fae5' },
  cancelled: { en: 'Cancelled', th: 'ยกเลิก',            color: '#991b1b', bg: '#fee2e2' },
  converted: { en: 'Converted', th: 'ติดตั้งจริงแล้ว',    color: '#5b21b6', bg: '#ede9fe' },
}

export default function CustomerTestingPage() {
  const [lang, setLang] = useState<'en' | 'th'>('th')
  const [records, setRecords] = useState<TestRecord[]>([])
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editID, setEditID] = useState<number | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [expandedID, setExpandedID] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [quoteSearch, setQuoteSearch] = useState('')

  const L = (en: string, th: string) => lang === 'th' ? th : en

  useEffect(() => {
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      if (l === 'en' || l === 'th') setLang(l)
    } catch (_) {}
    const handler = (e: any) => {
      const v = e.detail?.locale || e.detail
      if (v === 'en' || v === 'th') setLang(v)
    }
    window.addEventListener('locale-changed', handler)
    window.addEventListener('k-system-lang', handler)
    return () => { window.removeEventListener('locale-changed', handler); window.removeEventListener('k-system-lang', handler) }
  }, [])

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/customer-testing')
      const j = await res.json()
      if (j.ok) setRecords(j.data || [])
    } catch (_) {}
    setLoading(false)
  }, [])

  const fetchQuotations = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/mysql-proxy', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'SELECT quoteID, quoteNo, cusID, customer_name, customer_phone, customer_email, items, subtotal, total, status, quoteDate FROM quotations ORDER BY quoteID DESC' })
      })
      const j = await res.json()
      if (j.data) setQuotations(j.data)
    } catch (_) {}
  }, [])

  useEffect(() => { fetchRecords(); fetchQuotations() }, [fetchRecords, fetchQuotations])

  const handleQuotationSelect = (quoteID: string) => {
    const q = quotations.find(qt => String(qt.quoteID) === quoteID)
    if (!q) return
    let productNames = ''
    let productDetails = ''
    try {
      const items = typeof q.items === 'string' ? JSON.parse(q.items) : q.items
      if (Array.isArray(items)) {
        productNames = items.map((i: any) => i.product_name || i.description || '').filter(Boolean).join(', ')
        productDetails = items.map((i: any) => `${i.product_name || i.description} x${i.quantity} = ${Number(i.unit_price || 0).toLocaleString()}`).join('\n')
      }
    } catch (_) {}
    setForm(f => ({
      ...f,
      cusID: q.cusID ? String(q.cusID) : '',
      customerName: q.customer_name || '',
      phone: q.customer_phone || '',
      email: q.customer_email || '',
      productName: productNames,
      productDetail: productDetails + (q.total ? `\n${L('Total', 'รวม')}: ${Number(q.total).toLocaleString()} ${L('THB', 'บาท')}` : ''),
      quoteNo: q.quoteNo || ''
    }))
  }

  const openNew = () => { setEditID(null); setForm({ ...emptyForm }); setShowForm(true) }

  const openEdit = (rec: TestRecord) => {
    setEditID(rec.testID)
    setForm({
      cusID: rec.cusID ? String(rec.cusID) : '', customerName: rec.customerName || '',
      phone: rec.phone || '', email: rec.email || '', address: rec.address || '',
      productName: rec.productName || '', productDetail: rec.productDetail || '',
      installDate: rec.installDate ? rec.installDate.split('T')[0] : '',
      startDate: rec.startDate ? rec.startDate.split('T')[0] : '',
      endDate: rec.endDate ? rec.endDate.split('T')[0] : '',
      status: rec.status || 'pending', testResult: rec.testResult || '',
      powerBefore: rec.powerBefore != null ? String(rec.powerBefore) : '',
      powerAfter: rec.powerAfter != null ? String(rec.powerAfter) : '',
      customerFeedback: rec.customerFeedback || '',
      rating: rec.rating != null ? String(rec.rating) : '',
      notes: rec.notes || '', assignedTo: rec.assignedTo || '', quoteNo: ''
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.customerName) { alert(L('Please enter customer name', 'กรุณากรอกชื่อลูกค้า')); return }
    setSaving(true)
    try {
      const payload: any = { ...form }
      if (payload.cusID) payload.cusID = parseInt(payload.cusID)
      if (payload.powerBefore) payload.powerBefore = parseFloat(payload.powerBefore)
      if (payload.powerAfter) payload.powerAfter = parseFloat(payload.powerAfter)
      if (payload.rating) payload.rating = parseInt(payload.rating)
      if (editID) {
        payload.testID = editID
        await fetch('/api/customer-testing', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      } else {
        await fetch('/api/customer-testing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      }
      setShowForm(false); fetchRecords()
    } catch (_) { alert('Error saving') }
    setSaving(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm(L('Delete this record?', 'ต้องการลบรายการนี้?'))) return
    await fetch(`/api/customer-testing?id=${id}`, { method: 'DELETE' })
    fetchRecords()
  }

  const daysLeft = (endDate: string) => {
    if (!endDate) return null
    return Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000)
  }

  const filtered = (filterStatus === 'all' ? records : records.filter(r => r.status === filterStatus))
    .filter(r => !search || r.testNo.toLowerCase().includes(search.toLowerCase()) || r.customerName.toLowerCase().includes(search.toLowerCase()) || (r.productName || '').toLowerCase().includes(search.toLowerCase()))

  const counts = { total: records.length, pending: 0, testing: 0, completed: 0, cancelled: 0, converted: 0 }
  records.forEach(r => { if (counts[r.status as keyof typeof counts] !== undefined) (counts as any)[r.status]++ })

  const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', transition: 'border-color 0.2s', background: '#fff' }
  const lbl: React.CSSProperties = { fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6, color: '#374151' }

  return (
    <AdminLayout title="Customer Testing" titleTh="ทดสอบลูกค้า">

      {/* Hero Header */}
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 16, padding: '28px 32px', marginBottom: 24, color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>
              {L('Customer Testing', 'ทดสอบการใช้งานลูกค้า')}
            </h2>
            <p style={{ margin: '6px 0 0', fontSize: 14, opacity: 0.9 }}>
              {L('Trial installation before actual setup - 1 month free testing period', 'ทดลองติดตั้งก่อนติดตั้งจริง - ทดสอบฟรี 1 เดือน')}
            </p>
          </div>
          <button onClick={openNew} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 10,
            border: '2px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)',
            color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(4px)',
            transition: 'all 0.2s'
          }}
          onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
          onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {L('New Testing', 'เพิ่มการทดสอบ')}
          </button>
        </div>

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginTop: 20 }}>
          {[
            { key: 'total', label: L('Total', 'ทั้งหมด'), count: counts.total, icon: '📋' },
            { key: 'pending', label: L('Pending', 'รอ'), count: counts.pending, icon: '⏳' },
            { key: 'testing', label: L('Testing', 'ทดสอบ'), count: counts.testing, icon: '🔬' },
            { key: 'completed', label: L('Done', 'เสร็จ'), count: counts.completed, icon: '✅' },
            { key: 'converted', label: L('Installed', 'ติดตั้ง'), count: counts.converted, icon: '🏠' },
          ].map(s => (
            <div key={s.key} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '12px 16px', textAlign: 'center', backdropFilter: 'blur(4px)' }}>
              <div style={{ fontSize: 20 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{s.count}</div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['all', 'pending', 'testing', 'completed', 'cancelled', 'converted'] as const).map(s => {
            const active = filterStatus === s
            const st = statusMap[s]
            return (
              <button key={s} onClick={() => setFilterStatus(s)} style={{
                padding: '7px 16px', borderRadius: 20, border: active ? 'none' : '1px solid #e2e8f0',
                cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                background: active ? (s === 'all' ? '#1e293b' : st?.bg || '#1e293b') : '#fff',
                color: active ? (s === 'all' ? '#fff' : st?.color || '#fff') : '#64748b'
              }}>
                {s === 'all' ? L('All', 'ทั้งหมด') : L(st?.en || s, st?.th || s)}
                <span style={{ marginLeft: 4, opacity: 0.7 }}>({s === 'all' ? counts.total : counts[s as keyof typeof counts] || 0})</span>
              </button>
            )
          })}
        </div>
        <div style={{ position: 'relative', minWidth: 220 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={L('Search...', 'ค้นหา...')}
            style={{ ...inp, paddingLeft: 34, borderRadius: 20, fontSize: 13 }} />
        </div>
      </div>

      {/* Records List - Card Style */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
          <div style={{ width: 40, height: 40, border: '4px solid #e2e8f0', borderTopColor: '#667eea', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          {L('Loading...', 'กำลังโหลด...')}
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', background: '#f8fafc', borderRadius: 16 }}>
          <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }}>🔬</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{L('No records found', 'ไม่พบรายการ')}</div>
          <div style={{ fontSize: 13 }}>{L('Create your first customer testing', 'สร้างรายการทดสอบลูกค้าแรกของคุณ')}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(rec => {
            const dl = daysLeft(rec.endDate)
            const st = statusMap[rec.status] || statusMap.pending
            const isExpanded = expandedID === rec.testID
            const progress = rec.startDate && rec.endDate
              ? Math.min(100, Math.max(0, ((Date.now() - new Date(rec.startDate).getTime()) / (new Date(rec.endDate).getTime() - new Date(rec.startDate).getTime())) * 100))
              : 0
            return (
              <div key={rec.testID} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', transition: 'box-shadow 0.2s', boxShadow: isExpanded ? '0 4px 20px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.04)' }}>
                {/* Main Row */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', gap: 16, cursor: 'pointer', flexWrap: 'wrap' }}
                  onClick={() => setExpandedID(isExpanded ? null : rec.testID)}>

                  {/* Test No Badge */}
                  <div style={{ minWidth: 110 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#4f46e5', letterSpacing: '-0.02em' }}>{rec.testNo}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                      {rec.created_at ? new Date(rec.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) : ''}
                    </div>
                  </div>

                  {/* Customer */}
                  <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {rec.customerName}
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{rec.phone || rec.email || '-'}</div>
                  </div>

                  {/* Product */}
                  <div style={{ flex: '1 1 150px', minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {rec.productName || '-'}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ width: 100, minWidth: 80 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginBottom: 3 }}>
                      <span>{rec.startDate ? new Date(rec.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : '-'}</span>
                      <span>{dl !== null ? (dl <= 0 ? L('Expired', 'หมด') : `${dl}d`) : '-'}</span>
                    </div>
                    <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        width: `${progress}%`, height: '100%', borderRadius: 3, transition: 'width 0.3s',
                        background: dl !== null && dl <= 0 ? '#ef4444' : dl !== null && dl <= 7 ? '#f59e0b' : '#10b981'
                      }} />
                    </div>
                  </div>

                  {/* Saving */}
                  <div style={{ width: 70, textAlign: 'center' }}>
                    {rec.savingPercent != null ? (
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#059669' }}>{rec.savingPercent}%</span>
                    ) : <span style={{ fontSize: 13, color: '#cbd5e1' }}>-</span>}
                  </div>

                  {/* Status */}
                  <span style={{
                    padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                    background: st.bg, color: st.color, whiteSpace: 'nowrap'
                  }}>
                    {L(st.en, st.th)}
                  </span>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => openEdit(rec)} title={L('Edit', 'แก้ไข')} style={{
                      width: 34, height: 34, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                    }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button onClick={() => handleDelete(rec.testID)} title={L('Delete', 'ลบ')} style={{
                      width: 34, height: 34, borderRadius: 8, border: '1px solid #fecaca', background: '#fff',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                    }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>

                  {/* Expand Arrow */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"
                    style={{ transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #f1f5f9', background: '#fafbfc', padding: '20px 24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
                      {[
                        { icon: '📍', label: L('Address', 'ที่อยู่'), value: rec.address },
                        { icon: '📦', label: L('Product Detail', 'รายละเอียดสินค้า'), value: rec.productDetail },
                        { icon: '📅', label: L('Install Date', 'วันติดตั้ง'), value: rec.installDate ? new Date(rec.installDate).toLocaleDateString('th-TH') : null },
                        { icon: '⚡', label: L('Power Before', 'ค่าไฟก่อน'), value: rec.powerBefore != null ? `${rec.powerBefore.toLocaleString()} ${L('THB', 'บาท')}` : null },
                        { icon: '💡', label: L('Power After', 'ค่าไฟหลัง'), value: rec.powerAfter != null ? `${rec.powerAfter.toLocaleString()} ${L('THB', 'บาท')}` : null },
                        { icon: '👤', label: L('Assigned To', 'ผู้รับผิดชอบ'), value: rec.assignedTo },
                        { icon: '📝', label: L('Test Result', 'ผลทดสอบ'), value: rec.testResult },
                        { icon: '💬', label: L('Feedback', 'ความเห็น'), value: rec.customerFeedback },
                        { icon: '📌', label: L('Notes', 'หมายเหตุ'), value: rec.notes },
                      ].filter(d => d.value).map((d, i) => (
                        <div key={i}>
                          <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>{d.icon} {d.label}</div>
                          <div style={{ fontSize: 14, color: '#334155', whiteSpace: 'pre-line' }}>{d.value}</div>
                        </div>
                      ))}
                      {rec.rating && (
                        <div>
                          <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>⭐ {L('Rating', 'คะแนน')}</div>
                          <div style={{ fontSize: 20, letterSpacing: 2 }}>
                            {'★'.repeat(rec.rating)}{'☆'.repeat(5 - rec.rating)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ====== Form Modal ====== */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 760, width: '100%', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>

            {/* Modal Header */}
            <div style={{ padding: '24px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1e293b' }}>
                  {editID ? L('Edit Testing', 'แก้ไขรายการทดสอบ') : L('New Customer Testing', 'เพิ่มการทดสอบใหม่')}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#94a3b8' }}>
                  {editID ? L('Update testing record details', 'อัปเดตข้อมูลรายการทดสอบ') : L('Select from quotation to auto-fill customer data', 'เลือกจากใบเสนอราคาเพื่อกรอกข้อมูลอัตโนมัติ')}
                </p>
              </div>
              <button onClick={() => setShowForm(false)} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer', fontSize: 18, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            <div style={{ padding: '20px 28px 28px' }}>

              {/* Quotation Search & Select */}
              {!editID && (
                <div style={{ background: 'linear-gradient(135deg, #eff6ff, #eef2ff)', borderRadius: 12, padding: 20, marginBottom: 20, border: '1px solid #c7d2fe' }}>
                  <label style={{ ...lbl, color: '#4338ca', fontSize: 14 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: 6 }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>
                    </svg>
                    {L('Search Quotation', 'ค้นหาใบเสนอราคา')}
                  </label>

                  {/* Search Input */}
                  <div style={{ position: 'relative', marginBottom: 10 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
                      <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                    </svg>
                    <input
                      value={quoteSearch}
                      onChange={e => setQuoteSearch(e.target.value)}
                      placeholder={L('Search by quote no, customer name, phone...', 'ค้นหาเลขที่ใบเสนอราคา, ชื่อลูกค้า, เบอร์โทร...')}
                      style={{ ...inp, paddingLeft: 36, borderColor: '#a5b4fc', fontWeight: 500 }}
                    />
                  </div>

                  {/* Quotation List - show only unlinked */}
                  {(() => {
                    const usedQuoteNos = new Set(records.map(r => r.quoteNo).filter(Boolean))
                    const qs = quoteSearch.toLowerCase().trim()
                    const availableQuotes = quotations.filter(q => {
                      if (usedQuoteNos.has(q.quoteNo)) return false
                      if (!qs) return true
                      return (q.quoteNo || '').toLowerCase().includes(qs)
                        || (q.customer_name || '').toLowerCase().includes(qs)
                        || (q.customer_phone || '').toLowerCase().includes(qs)
                        || (q.customer_email || '').toLowerCase().includes(qs)
                    })
                    return (
                      <div style={{ maxHeight: 220, overflowY: 'auto', borderRadius: 8, border: '1px solid #c7d2fe', background: '#fff' }}>
                        {availableQuotes.length === 0 ? (
                          <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                            {quotations.length === 0
                              ? L('No quotations found', 'ไม่พบใบเสนอราคา')
                              : L('All quotations already have testing records', 'ใบเสนอราคาทั้งหมดมีรายการทดสอบแล้ว')}
                          </div>
                        ) : (
                          availableQuotes.map(q => {
                            const isSelected = form.quoteNo === q.quoteNo
                            let totalStr = ''
                            try { totalStr = Number(q.total || 0).toLocaleString() } catch (_) {}
                            return (
                              <div key={q.quoteID} onClick={() => handleQuotationSelect(String(q.quoteID))}
                                style={{
                                  padding: '12px 16px', cursor: 'pointer', transition: 'all 0.15s',
                                  borderBottom: '1px solid #eef2ff', display: 'flex', alignItems: 'center', gap: 12,
                                  background: isSelected ? '#eef2ff' : '#fff',
                                  borderLeft: isSelected ? '3px solid #4338ca' : '3px solid transparent'
                                }}
                                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f8faff' }}
                                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = '#fff' }}
                              >
                                <div style={{ width: 36, height: 36, borderRadius: 8, background: isSelected ? '#4338ca' : '#eef2ff', color: isSelected ? '#fff' : '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                                  {isSelected ? '✓' : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                                  )}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontWeight: 700, color: '#4338ca', fontSize: 13 }}>{q.quoteNo}</span>
                                    <span style={{ fontSize: 12, color: '#059669', fontWeight: 600, whiteSpace: 'nowrap' }}>{totalStr} {L('THB', 'บาท')}</span>
                                  </div>
                                  <div style={{ fontSize: 13, color: '#334155', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {q.customer_name} {q.customer_phone ? `(${q.customer_phone})` : ''}
                                  </div>
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    )
                  })()}

                  {form.quoteNo && (
                    <div style={{ marginTop: 10, fontSize: 13, color: '#4338ca', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#4338ca', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>✓</span>
                      {L('Linked to', 'เชื่อมจาก')} {form.quoteNo}
                      <button onClick={() => { setForm(f => ({ ...f, quoteNo: '', cusID: '', customerName: '', phone: '', email: '', productName: '', productDetail: '' })); setQuoteSearch('') }}
                        style={{ marginLeft: 8, padding: '2px 10px', borderRadius: 6, border: '1px solid #c7d2fe', background: '#fff', cursor: 'pointer', fontSize: 12, color: '#6366f1' }}>
                        {L('Clear', 'ล้าง')}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Customer Info */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👤</span>
                  {L('Customer Information', 'ข้อมูลลูกค้า')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={lbl}>{L('Customer Name', 'ชื่อลูกค้า')} <span style={{ color: '#ef4444' }}>*</span></label>
                    <input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} style={inp} placeholder={L('Full name', 'ชื่อ-นามสกุล')} />
                  </div>
                  <div>
                    <label style={lbl}>{L('Phone', 'โทรศัพท์')}</label>
                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>{L('Email', 'อีเมล')}</label>
                    <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inp} type="email" />
                  </div>
                  <div>
                    <label style={lbl}>{L('Assigned To', 'ผู้รับผิดชอบ')}</label>
                    <input value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} style={inp} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={lbl}>{L('Installation Address', 'ที่อยู่ติดตั้งทดสอบ')}</label>
                    <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} style={{ ...inp, minHeight: 60, resize: 'vertical' }} />
                  </div>
                </div>
              </div>

              {/* Product & Schedule */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📦</span>
                  {L('Product & Schedule', 'สินค้าและกำหนดการ')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={lbl}>{L('Product Name', 'ชื่อสินค้า')}</label>
                    <input value={form.productName} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>{L('Status', 'สถานะ')}</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={inp}>
                      {Object.entries(statusMap).map(([k, v]) => (
                        <option key={k} value={k}>{L(v.en, v.th)}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={lbl}>{L('Product Detail', 'รายละเอียดสินค้า')}</label>
                    <textarea value={form.productDetail} onChange={e => setForm(f => ({ ...f, productDetail: e.target.value }))} style={{ ...inp, minHeight: 70, resize: 'vertical' }} />
                  </div>
                  <div>
                    <label style={lbl}>{L('Install Date', 'วันติดตั้ง')}</label>
                    <input type="date" value={form.installDate} onChange={e => setForm(f => ({ ...f, installDate: e.target.value }))} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>{L('Start Date', 'วันเริ่มทดสอบ')}</label>
                    <input type="date" value={form.startDate} onChange={e => {
                      const sd = e.target.value
                      const ed = sd ? new Date(new Date(sd).setMonth(new Date(sd).getMonth() + 1)).toISOString().split('T')[0] : ''
                      setForm(f => ({ ...f, startDate: sd, endDate: ed }))
                    }} style={inp} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={lbl}>{L('End Date', 'วันสิ้นสุด')} <span style={{ fontWeight: 400, color: '#94a3b8' }}>({L('auto +1 month', 'อัตโนมัติ +1 เดือน')})</span></label>
                    <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} style={{ ...inp, maxWidth: 300 }} />
                  </div>
                </div>
              </div>

              {/* Test Results */}
              {editID && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 28, height: 28, borderRadius: 8, background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📊</span>
                    {L('Test Results', 'ผลการทดสอบ')}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={lbl}>{L('Power Before (THB)', 'ค่าไฟก่อน (บาท)')}</label>
                      <input type="number" value={form.powerBefore} onChange={e => setForm(f => ({ ...f, powerBefore: e.target.value }))} style={inp} placeholder="0.00" />
                    </div>
                    <div>
                      <label style={lbl}>{L('Power After (THB)', 'ค่าไฟหลัง (บาท)')}</label>
                      <input type="number" value={form.powerAfter} onChange={e => setForm(f => ({ ...f, powerAfter: e.target.value }))} style={inp} placeholder="0.00" />
                    </div>
                    {form.powerBefore && form.powerAfter && parseFloat(form.powerBefore) > 0 && (
                      <div style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                        <span style={{ fontSize: 18, fontWeight: 800, color: '#065f46' }}>
                          {L('Saving', 'ประหยัด')}: {((parseFloat(form.powerBefore) - parseFloat(form.powerAfter)) / parseFloat(form.powerBefore) * 100).toFixed(1)}%
                        </span>
                        <span style={{ marginLeft: 12, fontSize: 14, color: '#047857' }}>
                          ({(parseFloat(form.powerBefore) - parseFloat(form.powerAfter)).toLocaleString()} {L('THB', 'บาท')})
                        </span>
                      </div>
                    )}
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={lbl}>{L('Test Result', 'ผลการทดสอบ')}</label>
                      <textarea value={form.testResult} onChange={e => setForm(f => ({ ...f, testResult: e.target.value }))} style={{ ...inp, minHeight: 60, resize: 'vertical' }} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={lbl}>{L('Customer Feedback', 'ความคิดเห็นลูกค้า')}</label>
                      <textarea value={form.customerFeedback} onChange={e => setForm(f => ({ ...f, customerFeedback: e.target.value }))} style={{ ...inp, minHeight: 60, resize: 'vertical' }} />
                    </div>
                    <div>
                      <label style={lbl}>{L('Rating', 'คะแนน')}</label>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {[1, 2, 3, 4, 5].map(n => (
                          <button key={n} type="button" onClick={() => setForm(f => ({ ...f, rating: String(n) }))}
                            style={{ width: 40, height: 40, fontSize: 22, background: parseInt(form.rating || '0') >= n ? '#fef3c7' : '#f8fafc', border: parseInt(form.rating || '0') >= n ? '2px solid #f59e0b' : '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', color: parseInt(form.rating || '0') >= n ? '#f59e0b' : '#d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div style={{ marginBottom: 24 }}>
                <label style={lbl}>{L('Notes', 'หมายเหตุ')}</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ ...inp, minHeight: 60, resize: 'vertical' }} />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
                <button onClick={() => setShowForm(false)} style={{ padding: '11px 28px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#475569' }}>
                  {L('Cancel', 'ยกเลิก')}
                </button>
                <button onClick={handleSave} disabled={saving} style={{
                  padding: '11px 28px', borderRadius: 10, border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: 700, fontSize: 14, color: '#fff',
                  background: saving ? '#94a3b8' : 'linear-gradient(135deg, #667eea, #764ba2)',
                  boxShadow: saving ? 'none' : '0 4px 12px rgba(102,126,234,0.4)'
                }}>
                  {saving ? L('Saving...', 'กำลังบันทึก...') : editID ? L('Update', 'อัปเดต') : L('Create Testing', 'สร้างรายการทดสอบ')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
