"use client"
import React, { useCallback, useEffect, useState } from 'react'
import AccWindow, { useLang } from '../../components/AccWindow'
import SupplierSearch from '../../components/SupplierSearch'

type Row = { id?: number; doc_no?: string; doc_date?: string; supplier_id?: number; supplier_name?: string; subtotal?: number; vat?: number; total?: number; status?: string; note?: string }
const empty: Row = { doc_date: new Date().toISOString().slice(0, 10), supplier_name: '', subtotal: 0, vat: 0, total: 0, status: 'draft', note: '' }
const th: React.CSSProperties = { padding: '8px 14px', background: '#4b5563', color: '#fff', fontSize: 13, fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '7px 14px', borderBottom: '1px solid #e5e7eb', fontSize: 13.5 }
const inp: React.CSSProperties = { width: '100%', padding: '3px 6px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', fontSize: 13, boxSizing: 'border-box' }
const btn = (bg: string, c = '#1f2937'): React.CSSProperties => ({ padding: '7px 18px', background: bg === '#f3f4f6' ? '#f3f4f6' : bg, color: c, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: '"Sarabun","Tahoma",sans-serif', transition: 'all 0.2s' })
const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function CashPurchasePage() {
  const { L } = useLang()
  const [data, setData] = useState<Row[]>([])
  const [form, setForm] = useState<Row>(empty)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [msg, setMsg] = useState('')
  const [supplierDisplay, setSupplierDisplay] = useState('')

  const load = useCallback(async (q = '') => {
    const r = await fetch('/api/accounting/purchase-orders?doc_type=cash' + (q ? '&q=' + encodeURIComponent(q) : ''))
    const d = await r.json()
    if (d.ok) setData(d.data as Row[])
  }, [])
  useEffect(() => { void load('') }, [load])

  const save = async () => {
    setLoading(true); setMsg('')
    const method = form.id ? 'PUT' : 'POST'
    const res = await fetch('/api/accounting/purchase-orders', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, doc_type: 'cash' }) })
    const d = await res.json()
    if (d.ok) { setShowForm(false); setForm(empty); void load(search); setMsg(L('Saved','บันทึกสำเร็จ')) } else setMsg('Error: ' + d.error)
    setLoading(false)
  }
  const del = async (id: number) => { if (!confirm(L('Delete?','ลบ?'))) return; await fetch('/api/accounting/purchase-orders?id=' + id, { method: 'DELETE' }); void load(search) }
  const handleDelete = (id?: number) => { if (typeof id === 'number') void del(id) }

  return (
    <AccWindow title={L('Cash Purchase','ซื้อเงินสด')}>
      <div style={{ padding: 12 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button style={btn('#f3f4f6')} onClick={() => { setForm(empty); setSupplierDisplay(''); setShowForm(true) }}>+ {L('New','เพิ่มใหม่')}</button>
          <input style={{ ...inp, width: 200 }} placeholder={L('Search...','ค้นหา...')} value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && void load(search)} />
          <button style={btn('#f3f4f6')} onClick={() => void load(search)}>{L('Search','ค้นหา')}</button>
          {msg && <span style={{ color: msg.startsWith('Error') ? 'red' : 'green', fontSize: 13 }}>{msg}</span>}
        </div>
        <div style={{ overflowX: 'auto', border: '1px solid #d1d5db', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{[L('Doc No','เลขที่'), L('Date','วันที่'), L('Supplier','ผู้จำหน่าย'), L('Subtotal','ราคา'), L('VAT','VAT'), L('Total','รวม'), L('Status','สถานะ'), ''].map((h, i) => <th key={i} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {data.length === 0 && <tr><td colSpan={8} style={{ ...td, textAlign: 'center', color: '#888', padding: 20 }}>{L('No data','ไม่มีข้อมูล')}</td></tr>}
              {data.map((r, i) => (
                <tr key={r.id} style={{ background: i % 2 ? '#f5f5f5' : '#fff' }}>
                  <td style={td}>{r.doc_no}</td><td style={td}>{r.doc_date?.slice(0,10)}</td><td style={td}>{r.supplier_name}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{fmt(r.subtotal||0)}</td><td style={{ ...td, textAlign: 'right' }}>{fmt(r.vat||0)}</td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{fmt(r.total||0)}</td><td style={{ ...td, textAlign: 'center' }}>{r.status}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>
                    <button style={{ ...btn('#f3f4f6'), marginRight: 3 }} onClick={() => { setForm({ ...r }); setSupplierDisplay(r.supplier_name || ''); setShowForm(true) }}>{L('Edit','แก้ไข')}</button>
                    <button style={btn('#f3f4f6','#dc2626')} onClick={() => handleDelete(r.id)}>{L('Del','ลบ')}</button>
                  </td>
                </tr>))}
            </tbody>
          </table>
        </div>
        {showForm && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', minWidth: 460, maxWidth: 560, width: '95%' }}>
            <div style={{ background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)', padding: '3px 8px', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
              <span>{form.id ? L('Edit','แก้ไข') : L('New Cash Purchase','ซื้อเงินสด')}</span><span style={{ cursor: 'pointer' }} onClick={() => setShowForm(false)}>✕</span>
            </div>
            <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
              <div><div style={{ fontSize: 12, marginBottom: 2 }}>{L('Date','วันที่')}</div><input style={inp} type="date" value={form.doc_date||''} onChange={e => setForm(f => ({ ...f, doc_date: e.target.value }))} /></div>
              <div><div style={{ fontSize: 12, marginBottom: 2 }}>{L('Supplier','ผู้จำหน่าย')}</div>
                <SupplierSearch
                  value={form.supplier_id}
                  displayValue={supplierDisplay || form.supplier_name || ''}
                  onChange={s => {
                    if (s) { setForm(f => ({ ...f, supplier_id: s.id, supplier_name: s.name_th })); setSupplierDisplay(s.name_th) }
                    else { setForm(f => ({ ...f, supplier_id: undefined, supplier_name: '' })); setSupplierDisplay('') }
                  }}
                /></div>
              <div><div style={{ fontSize: 12, marginBottom: 2 }}>{L('Subtotal','ราคาก่อน VAT')}</div><input style={inp} type="number" value={form.subtotal||''} onChange={e => { const sub = +e.target.value||0; const vat = Math.round(sub * 7) / 100; setForm(f => ({ ...f, subtotal: sub, vat, total: sub + vat })) }} /></div>
              <div><div style={{ fontSize: 12, marginBottom: 2 }}>{L('VAT 7%','VAT 7%')}</div><input style={inp} readOnly value={fmt(form.vat||0)} /></div>
              <div><div style={{ fontSize: 12, marginBottom: 2 }}>{L('Total','รวมทั้งสิ้น')}</div><input style={inp} readOnly value={fmt(form.total||0)} /></div>
              <div><div style={{ fontSize: 12, marginBottom: 2 }}>{L('Status','สถานะ')}</div>
                <select style={inp} value={form.status||'draft'} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="draft">{L('Draft','ร่าง')}</option>
                  <option value="approved">{L('Approved','อนุมัติ')}</option>
                  <option value="confirmed">{L('Confirmed/Received','ยืนยันรับสินค้า')}</option>
                  <option value="paid">{L('Paid','ชำระแล้ว')}</option>
                  <option value="completed">{L('Completed','เสร็จสิ้น')}</option>
                </select></div>
              <div style={{ gridColumn: 'span 2' }}><div style={{ fontSize: 12, marginBottom: 2 }}>{L('Note','หมายเหตุ')}</div><textarea style={{ ...inp, height: 50, resize: 'vertical' }} value={form.note||''} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} /></div>
            </div>
            <div style={{ padding: '8px 16px 12px', display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid #999' }}>
              <button style={btn('#f3f4f6')} onClick={() => setShowForm(false)}>{L('Cancel','ยกเลิก')}</button>
              <button style={btn('#f3f4f6','#4b5563')} disabled={loading} onClick={save}>{loading ? '...' : L('Save','บันทึก')}</button>
            </div>
          </div>
        </div>}
      </div>
    </AccWindow>
  )
}
