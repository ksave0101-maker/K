"use client"
import React, { useCallback, useEffect, useState } from 'react'
import AccWindow from '../../components/AccWindow'

type Item = { product_id?: number; description: string; qty: number; unit: string; unit_price: number; amount: number }
type Inv = { id?: number; doc_no?: string; doc_date: string; customer_id?: number; customer_name?: string; doc_type: string; status: string; due_date?: string; subtotal: number; discount: number; vat_amount: number; total: number; paid_amount: number; note?: string; items?: Item[] }
type Customer = { id: number; name_th: string }

const emptyItem = (): Item => ({ description: '', qty: 1, unit: 'ชิ้น', unit_price: 0, amount: 0 })
const emptyInv = (): Inv => ({ doc_date: new Date().toISOString().slice(0, 10), doc_type: 'credit', status: 'draft', subtotal: 0, discount: 0, vat_amount: 0, total: 0, paid_amount: 0, items: [emptyItem()] })

const th: React.CSSProperties = { padding: '8px 14px', background: '#4b5563', color: '#fff', fontSize: 13, fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '7px 14px', borderBottom: '1px solid #e5e7eb', fontSize: 13.5 }
const inp: React.CSSProperties = { padding: '7px 12px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', fontSize: 13.5, width: '100%', boxSizing: 'border-box', fontFamily: '"Sarabun","Tahoma",sans-serif', outline: 'none' }
const btn = (bg: string, c = '#1f2937'): React.CSSProperties => ({ padding: '7px 18px', background: bg === '#f3f4f6' ? '#f3f4f6' : bg, color: c, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: '"Sarabun","Tahoma",sans-serif', transition: 'all 0.2s' })

function calcItems(items: Item[], discount: number, vatRate: number) {
  const subtotal = items.reduce((s, i) => s + (i.amount || 0), 0)
  const discounted = subtotal - (discount || 0)
  const vat_amount = Math.round(discounted * vatRate * 100) / 100
  return { subtotal, vat_amount, total: discounted + vat_amount }
}

const docTypeLabel: Record<string, string> = { order: 'ใบสั่งขาย', cash: 'ขายเงินสด', credit: 'ขายเงินเชื่อ', deposit: 'รับมัดจำ', return: 'รับคืน' }
const statusLabel: Record<string, string> = { draft: 'ร่าง', confirmed: 'ยืนยัน', paid: 'ชำระแล้ว', cancelled: 'ยกเลิก' }
const statusColor: Record<string, string> = { draft: '#888', confirmed: '#0055aa', paid: 'green', cancelled: 'red' }

export default function SalesInvoicePage() {
  const [list, setList] = useState<Inv[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [form, setForm] = useState<Inv>(emptyInv())
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [vatRate] = useState(0.07)
  const [msg, setMsg] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const load = useCallback(async () => {
    const r = await fetch('/api/accounting/sales-invoices')
    const d = await r.json(); if (d.ok) setList(d.data as Inv[])
  }, [])

  useEffect(() => {
    void load()
    void fetch('/api/accounting/customers').then(r => r.json()).then(d => { if (d.ok) setCustomers(d.data as Customer[]) })
  }, [load])

  const setItem = (idx: number, field: keyof Item, val: string | number) => {
    setForm(f => {
      const items = [...(f.items || [])]
      const item = { ...items[idx], [field]: val }
      if (field === 'qty' || field === 'unit_price') item.amount = Math.round((item.qty || 0) * (item.unit_price || 0) * 100) / 100
      items[idx] = item
      const { subtotal, vat_amount, total } = calcItems(items, f.discount, vatRate)
      return { ...f, items, subtotal, vat_amount, total }
    })
  }

  const save = async () => {
    setLoading(true); setMsg('')
    const method = form.id ? 'PUT' : 'POST'
    const res = await fetch('/api/accounting/sales-invoices', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const d = await res.json()
    if (d.ok) { setShowForm(false); void load(); setMsg('บันทึกสำเร็จ') } else setMsg('Error: ' + d.error)
    setLoading(false)
  }

  const filteredList = typeFilter ? list.filter((r) => r.doc_type === typeFilter) : list

  return (
    <AccWindow title="ใบกำกับภาษี / ใบขาย">
      <div style={{ padding: 12 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {Object.entries(docTypeLabel).map(([k, v]) => (
            <button key={k} style={{ ...btn(typeFilter === k ? '#4b5563' : '#f3f4f6', typeFilter === k ? '#fff' : '#000'), fontSize: 12 }}
              onClick={() => { setTypeFilter(k === typeFilter ? '' : k); setForm({ ...emptyInv(), doc_type: k }) }}>
              {v}
            </button>
          ))}
          <button style={{ ...btn('#f3f4f6'), marginLeft: 'auto' }} onClick={() => { setForm(emptyInv()); setShowForm(true) }}>+ สร้างเอกสาร</button>
          {msg && <span style={{ fontSize: 13, color: msg.startsWith('Error') ? 'red' : 'green' }}>{msg}</span>}
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid #d1d5db', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['เลขที่','วันที่','ลูกค้า','ประเภท','ยอดรวม','ชำระแล้ว','สถานะ',''].map((h, i) => <th key={i} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {filteredList.length === 0 && <tr><td colSpan={8} style={{ ...td, textAlign: 'center', color: '#888', padding: 20 }}>ไม่มีข้อมูล</td></tr>}
              {filteredList.map((row, i) => (
                <tr key={row.id} style={{ background: i % 2 ? '#f5f5f5' : '#fff' }}>
                  <td style={{ ...td, fontFamily: 'monospace' }}>{row.doc_no}</td>
                  <td style={td}>{row.doc_date ? new Date(row.doc_date).toLocaleDateString('th-TH') : ''}</td>
                  <td style={td}>{row.customer_name}</td>
                  <td style={td}>{docTypeLabel[row.doc_type] || row.doc_type}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{Number(row.total).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{Number(row.paid_amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                  <td style={{ ...td, textAlign: 'center' }}><span style={{ color: statusColor[row.status] }}>{statusLabel[row.status]}</span></td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>
                    <button style={btn('#f3f4f6')} onClick={async () => {
                      const r = await fetch('/api/accounting/sales-invoices?id=' + row.id)
                      const d = await r.json(); if (d.ok) { setForm(d.data as Inv); setShowForm(true) }
                    }}>แก้ไข</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 2000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 30, overflowY: 'auto' }}>
            <div style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, width: '95%', maxWidth: 860, boxShadow: '4px 4px 12px rgba(0,0,0,0.4)', marginBottom: 30 }}>
              <div style={{ background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)', padding: '3px 8px', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                <span>{form.id ? 'แก้ไข ' + form.doc_no : 'สร้างเอกสารใหม่'}</span>
                <span style={{ cursor: 'pointer' }} onClick={() => setShowForm(false)}>✕</span>
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px 12px', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, marginBottom: 2 }}>วันที่</div>
                    <input style={inp} type="date" value={form.doc_date || ''} onChange={e => setForm(f => ({ ...f, doc_date: e.target.value }))} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, marginBottom: 2 }}>กำหนดชำระ</div>
                    <input style={inp} type="date" value={form.due_date || ''} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, marginBottom: 2 }}>ลูกค้า</div>
                    <select style={inp} value={form.customer_id || ''} onChange={e => setForm(f => ({ ...f, customer_id: Number(e.target.value) }))}>
                      <option value="">-- เลือก --</option>
                      {customers.map((c) => <option key={c.id} value={c.id}>{c.name_th}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, marginBottom: 2 }}>ประเภท / สถานะ</div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <select style={inp} value={form.doc_type} onChange={e => setForm(f => ({ ...f, doc_type: e.target.value }))}>
                        {Object.entries(docTypeLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <select style={inp} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                        {Object.entries(statusLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ border: '1px solid #d1d5db', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.08)', marginBottom: 8 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr>{['รายการ','จำนวน','หน่วย','ราคา','จำนวนเงิน',''].map((h, i) => <th key={i} style={{ ...th, fontSize: 12 }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {(form.items || []).map((item, idx) => (
                        <tr key={idx}>
                          <td style={td}><input style={inp} value={item.description} onChange={e => setItem(idx, 'description', e.target.value)} /></td>
                          <td style={{ ...td, width: 80 }}><input style={{ ...inp, textAlign: 'right' }} type="number" value={item.qty} onChange={e => setItem(idx, 'qty', parseFloat(e.target.value) || 0)} /></td>
                          <td style={{ ...td, width: 80 }}><input style={inp} value={item.unit} onChange={e => setItem(idx, 'unit', e.target.value)} /></td>
                          <td style={{ ...td, width: 110 }}><input style={{ ...inp, textAlign: 'right' }} type="number" value={item.unit_price} onChange={e => setItem(idx, 'unit_price', parseFloat(e.target.value) || 0)} /></td>
                          <td style={{ ...td, width: 120, textAlign: 'right' }}>{item.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                          <td style={{ ...td, width: 30 }}><button style={{ ...btn('#f3f4f6', '#cc0000'), padding: '1px 6px' }} onClick={() => setForm(f => { const items = (f.items || []).filter((_, i) => i !== idx); const { subtotal, vat_amount, total } = calcItems(items, f.discount, vatRate); return { ...f, items, subtotal, vat_amount, total } })}>✕</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button style={{ ...btn('#f3f4f6'), marginBottom: 12, fontSize: 12 }} onClick={() => setForm(f => ({ ...f, items: [...(f.items || []), emptyItem()] }))}>+ เพิ่มรายการ</button>

                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, marginBottom: 2 }}>หมายเหตุ</div>
                    <textarea style={{ ...inp, height: 48, resize: 'vertical' }} value={form.note || ''} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
                  </div>
                  <table style={{ borderCollapse: 'collapse', fontSize: 13 }}>
                    {[['ยอดรวม', form.subtotal, false], ['ส่วนลด', form.discount, true], ['VAT 7%', form.vat_amount, false], ['ยอดสุทธิ', form.total, false], ['ชำระแล้ว', form.paid_amount, true]].map(([label, val, editable], i) => (
                      <tr key={i} style={i === 3 ? { fontWeight: 700, background: '#e8e8e0' } : {}}>
                        <td style={{ padding: '2px 16px 2px 8px', textAlign: 'right' }}>{label as string}</td>
                        <td style={{ padding: '2px 8px', minWidth: 110 }}>
                          {editable ? (
                            <input style={{ ...inp, width: 100, textAlign: 'right' }} type="number" value={val as number}
                              onChange={e => {
                                const v = parseFloat(e.target.value) || 0
                                if (label === 'ส่วนลด') { const c = calcItems(form.items || [], v, vatRate); setForm(f => ({ ...f, discount: v, ...c })) }
                                else setForm(f => ({ ...f, paid_amount: v }))
                              }} />
                          ) : <span style={{ float: 'right' }}>{(val as number).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>}
                        </td>
                      </tr>
                    ))}
                  </table>
                </div>
              </div>
              <div style={{ padding: '8px 12px 12px', display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid #999' }}>
                <button style={btn('#f3f4f6')} onClick={() => setShowForm(false)}>ยกเลิก</button>
                <button style={btn('#f3f4f6', '#4b5563')} disabled={loading} onClick={save}>{loading ? 'กำลังบันทึก...' : 'บันทึก'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AccWindow>
  )
}
