"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'
import CreatedBy from '../components/CreatedBy'
import styles from '../admin-theme.module.css'

type InvoiceItem = {
  desc?: string
  qty?: number
  price?: number
  quantity?: number
  Qty?: number
  unit_price?: number
  unitPrice?: number
  unitprice?: number
  total_price?: number
  total?: number
  totalPrice?: number
}

type LocaleChangeDetail = {
  locale?: 'en' | 'th'
}

type SalesOrderItem = {
  product_name?: string
  description?: string
  sku?: string
  quantity?: number | string
  unit_price?: number | string
  total_price?: number | string
}

type SalesOrderSummary = {
  orderID: number
  orderNo?: string
  customer_name?: string
  customer_phone?: string
  subtotal?: number | string
  total_amount?: number | string
  priceTotal?: number | string
  vat_percent?: number | string
}

type SalesOrderDetail = SalesOrderSummary & {
  items?: SalesOrderItem[]
}

export default function InvoicePage() {
  const [invoiceNo, setInvoiceNo] = useState(() => {
    try { return localStorage.getItem('k_system_next_invNo') || '' } catch { return '' }
  })
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().split('T')[0])
  const [customer, setCustomer] = useState({ name: '', phone: '' })
  const [items, setItems] = useState<InvoiceItem[]>([{ desc: '', qty: 1, price: 0 }])
  const [taxRate, setTaxRate] = useState(7)
  const [totals, setTotals] = useState({ subtotal: 0, tax: 0, total: 0 })
  const [loading, setLoading] = useState(false)
  const [paymentTerms, setPaymentTerms] = useState({ cash: false, bankTransfer: false, credit30: false, check: false, other: false })
  const [paymentOtherText, setPaymentOtherText] = useState('')
  const [paymentBank, setPaymentBank] = useState<string | null>(null)
  const bankAccounts = [
    { id: 'bank-a', bank: 'Bank A', account: '123-456-7890', name: 'Company Ltd.' },
    { id: 'bank-b', bank: 'Bank B', account: '987-654-3210', name: 'Company Ltd.' }
  ]
  const [salesOrderNo, setSalesOrderNo] = useState('')
  const [salesOrderSearchResults, setSalesOrderSearchResults] = useState<SalesOrderSummary[] | null>(null)
  const [showSalesOrderSearchModal, setShowSalesOrderSearchModal] = useState(false)
  const [salesOrderSearchTerm, setSalesOrderSearchTerm] = useState('')

  const [locale, setLocale] = useState<'en'|'th'>(() => {
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      return l === 'th' ? 'th' : 'en'
    } catch { return 'th' }
  })

  const router = useRouter()

  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent<LocaleChangeDetail | string>).detail
      const v = typeof d === 'string' ? d : d?.locale
      if (v === 'en' || v === 'th') setLocale(v)
    }
    window.addEventListener('k-system-lang', handler)
    window.addEventListener('locale-changed', handler)
    return () => {
      window.removeEventListener('k-system-lang', handler)
      window.removeEventListener('locale-changed', handler)
    }
  }, [])

  const L = (en: string, th: string) => locale === 'th' ? th : en

  // Load initial invoice number
  useEffect(() => {
    refreshInvoiceNo()
  }, [])

  const refreshInvoiceNo = async () => {
    try {
      const today = new Date()
      const d = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
      // Add timestamp to prevent caching
      const ts = Date.now()
      const res = await fetch(`/api/invoice-seq?date=${encodeURIComponent(d)}&_t=${ts}`)
      const j = await res.json()
      if (res.ok && j && j.success) {
        setInvoiceNo(j.invNo)
        console.log('Invoice seq:', j)
      }
      // Also update date to today
      setInvoiceDate(d)
    } catch (err) {
      console.error('Failed to get invoice number:', err)
    }
  }

  useEffect(() => {
    const parseNumber = (v: unknown) => {
      const n = Number(v)
      return Number.isFinite(n) ? n : null
    }

    const subtotal = items.reduce((s, it) => {
      const qty = parseNumber(it.qty ?? it.quantity ?? it.Qty) ?? 0
      const unit = parseNumber(it.price ?? it.unit_price ?? it.unitPrice ?? it.unitprice) ?? 0
      const totalField = it.total_price ?? it.total ?? it.totalPrice ?? it.total_price
      const parsedTotal = parseNumber(totalField)
      const lineTotal = parsedTotal !== null ? parsedTotal : qty * unit
      return s + lineTotal
    }, 0)
    const tax = (subtotal * Number(taxRate || 0)) / 100
    const total = subtotal + tax
    setTotals({ subtotal, tax, total })
  }, [items, taxRate])

  function addItem() { setItems([...items, { desc: '', qty: 1, price: 0 }]) }
  function updateItem(i: number, key: 'desc' | 'qty' | 'price', value: string) {
    const copy = [...items]
    if (key === 'desc') {
      copy[i].desc = value
    } else if (key === 'qty') {
      copy[i].qty = Number(value)
    } else {
      copy[i].price = Number(value)
    }
    setItems(copy)
  }
  function removeItem(i: number) {
    setItems(items.filter((_, idx) => idx !== i))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!invoiceNo) return alert(L('Please enter invoice number', 'กรุณาใส่เลขที่ใบแจ้งหนี้'))
    // require at least one payment term
    if (!Object.values(paymentTerms).some(v => v)) return alert(L('Please select a payment term before saving', 'กรุณาเลือกเงื่อนไขการชำระก่อนบันทึก'))
    setLoading(true);
    (async () => {
      // determine current user from localStorage (set at login)
      let createdBy: string | null = null
      try {
        const rawUser = localStorage.getItem('k_system_admin_user')
        if (rawUser) {
          const u = JSON.parse(rawUser)
          createdBy = u.fullname || u.name || u.username || u.userId || null
        }
      } catch {}

      const payload = {
        invNo: invoiceNo,
        invDate: invoiceDate,
        cusID: null,
        customer_name: customer.name || null,
        subtotal: Number(totals.subtotal) || 0,
        discount: 0,
        vat: Number(taxRate) || 0,
        total_amount: Number(totals.total) || 0,
        notes: paymentOtherText || null,
        items,
        paymentTerms: Object.keys(paymentTerms).filter(k => paymentTerms[k as keyof typeof paymentTerms]),
        created_by: createdBy,
        payment_bank: paymentBank || null
      }
      try {
        const res = await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        const j = await res.json()
        if (res.ok && j && j.success) {
          alert(L('Invoice saved', 'บันทึกใบแจ้งหนี้แล้ว'))
          try { localStorage.removeItem('k_system_next_invNo') } catch {}
          try {
            router.push('/KR-Thailand/Admin-Login/invoice/list')
          } catch {}
        } else {
          alert(L('Failed to save invoice', 'บันทึกใบแจ้งหนี้ไม่สำเร็จ') + (j?.error ? ': ' + j.error : ''))
        }
      } catch (err) {
        console.error(err)
        alert(L('Error saving invoice', 'เกิดข้อผิดพลาดขณะบันทึกใบแจ้งหนี้'))
      } finally {
        setLoading(false)
      }
    })()
  }

  return (
    <AdminLayout title="Invoice" titleTh="ใบแจ้งหนี้">
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            {L('Create Invoice', 'สร้างใบแจ้งหนี้')}
          </h2>
          <p className={styles.cardSubtitle}>
            {L('Generate invoice for customer', 'สร้างใบแจ้งหนี้สำหรับลูกค้า')}
          </p>
        </div>

        <div className={styles.cardBody}>
          <CreatedBy />
          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Invoice No.', 'เลขที่ใบแจ้งหนี้')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    value={invoiceNo}
                    onChange={e => setInvoiceNo(e.target.value)}
                    className={styles.formInput}
                    placeholder={L('INV-001', 'INV-001')}
                    required
                    style={{ flex: 1 }}
                  />
                  <button type="button" className={styles.btnOutline} onClick={refreshInvoiceNo}>
                    {L('Refresh', 'รีเฟรช')}
                  </button>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Date', 'วันที่')}</label>
                <input
                  type="date"
                  value={invoiceDate}
                  readOnly
                  title={L('Fixed to today', 'ตั้งเป็นวันที่ปัจจุบัน')}
                  className={styles.formInput}
                />
              </div>
            </div>
            {showSalesOrderSearchModal && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                <div style={{ width: '90%', maxWidth: 900, background: '#fff', borderRadius: 8, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700 }}>{L('Select Sales Order', 'เลือกใบสั่งขาย')}</div>
                    <button type="button" onClick={() => { setShowSalesOrderSearchModal(false); setSalesOrderSearchResults(null) }} className={styles.btnOutline}>✕</button>
                  </div>
                  <div style={{ marginTop: 12, maxHeight: '60vh', overflow: 'auto' }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input value={salesOrderSearchTerm} onChange={e => setSalesOrderSearchTerm(e.target.value)} placeholder={L('Search by sales order no or customer','ค้นหาด้วยเลขที่ใบสั่งขายหรือชื่อลูกค้า')} className={styles.formInput} style={{ flex: 1 }} />
                      <button type="button" className={styles.btnOutline} onClick={async () => {
                        try {
                          const q = salesOrderSearchTerm || ''
                          const res = await fetch(`/api/sales-orders?q=${encodeURIComponent(q)}`)
                          const j = await res.json()
                          if (!res.ok || !j.success) {
                            alert(L('No sales orders found','ไม่พบใบสั่งขาย'))
                            return
                          }
                          setSalesOrderSearchResults(j.orders || [])
                        } catch (err) {
                          console.error(err)
                          alert(L('Search failed','ค้นหาไม่สำเร็จ'))
                        }
                      }}>{L('Search','ค้นหา')}</button>
                    </div>
                    {(salesOrderSearchResults && salesOrderSearchResults.length > 0) ? (
                      <table className={styles.table}>
                        <thead>
                          <tr><th>{L('Sales Order No.', 'เลขที่ใบสั่งขาย')}</th><th>{L('Customer', 'ลูกค้า')}</th><th>{L('Total', 'ยอดรวม')}</th><th></th></tr>
                        </thead>
                        <tbody>
                          {salesOrderSearchResults.map((order: SalesOrderSummary) => (
                            <tr key={order.orderID}>
                              <td>{order.orderNo}</td>
                              <td>{order.customer_name}</td>
                              <td style={{ textAlign: 'right' }}>{Number(order.priceTotal || order.total_amount || order.subtotal || 0).toFixed(2)} ฿</td>
                              <td>
                                <button type="button" className={styles.btnOutline} onClick={async () => {
                                  try {
                                    const res = await fetch(`/api/sales-orders?orderNo=${encodeURIComponent(order.orderNo || '')}`)
                                    const j = await res.json()
                                    if (!res.ok || !j.success || !j.order) {
                                      alert(L('Sales order not found', 'ไม่พบใบสั่งขาย'))
                                      return
                                    }
                                    const selectedOrder = j.order as SalesOrderDetail
                                    const mapped = (selectedOrder.items || []).map((it: SalesOrderItem) => ({
                                      desc: it.product_name || it.description || it.sku || '',
                                      qty: Number(it.quantity) || 1,
                                      price: Number(it.unit_price) || Number(it.total_price) || 0
                                    }))
                                    if (mapped.length === 0) {
                                      alert(L('Selected sales order has no items', 'ใบสั่งขายที่เลือกไม่มีรายการ'))
                                      return
                                    }
                                    setItems(mapped)
                                    setCustomer({ name: selectedOrder.customer_name || '', phone: selectedOrder.customer_phone || '' })
                                    if (selectedOrder.vat_percent !== undefined) setTaxRate(Number(selectedOrder.vat_percent) || 7)
                                    setSalesOrderNo(selectedOrder.orderNo || '')
                                    setShowSalesOrderSearchModal(false)
                                    setSalesOrderSearchResults(null)
                                  } catch (err) {
                                    console.error(err)
                                    alert(L('Failed to fetch sales order', 'เกิดข้อผิดพลาดขณะดึงข้อมูลใบสั่งขาย'))
                                  }
                                }}>
                                  {L('Select', 'เลือก')}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div>{L('No sales orders found', 'ไม่พบใบสั่งขาย')}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Customer Name', 'ชื่อลูกค้า')}</label>
                <input
                  placeholder={L('Customer name', 'ชื่อลูกค้า')}
                  value={customer.name}
                  onChange={e => setCustomer({ ...customer, name: e.target.value })}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Phone', 'โทรศัพท์')}</label>
                <input
                  placeholder={L('Phone number', 'เบอร์โทรศัพท์')}
                  value={customer.phone}
                  onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                  className={styles.formInput}
                />
              </div>
            </div>

            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
              <label className={styles.formLabel}>{L('Items', 'รายการ')}</label>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ marginBottom: 8, padding: 12, background: '#f0f9ff', borderRadius: 8, border: '1px solid #bae6fd' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, color: '#0369a1' }}>{L('Import from Sales Order:', 'นำเข้าจากใบสั่งขาย:')}</span>
                    <input value={salesOrderNo} onChange={e => setSalesOrderNo(e.target.value)} placeholder={L('Sales Order No.', 'เลขที่ใบสั่งขาย')} className={styles.formInput} style={{ maxWidth: 220 }} />
                    <button type="button" className={styles.btnOutline} onClick={async () => {
                      if (!salesOrderNo) { alert(L('Please enter sales order number', 'กรุณาใส่เลขที่ใบสั่งขาย')); return }
                      try {
                        const res = await fetch(`/api/sales-orders?orderNo=${encodeURIComponent(salesOrderNo)}`)
                        const j = await res.json()
                        if (!res.ok || !j.success) {
                          alert(L('Sales order not found', 'ไม่พบใบสั่งขาย'))
                          return
                        }
                        const order = j.order as SalesOrderDetail | undefined
                        const mapped = (order?.items || []).map((it: SalesOrderItem) => ({
                          desc: it.product_name || it.description || it.sku || '',
                          qty: Number(it.quantity) || 1,
                          price: Number(it.unit_price) || Number(it.total_price) || 0
                        }))
                        if (mapped.length === 0) {
                          alert(L('Selected sales order has no items', 'ใบสั่งขายที่เลือกไม่มีรายการ'))
                          return
                        }
                        setItems(mapped)
                        setCustomer({ name: order?.customer_name || '', phone: order?.customer_phone || '' })
                        if (order?.vat_percent !== undefined) {
                          setTaxRate(Number(order.vat_percent) || 7)
                        }
                      } catch (err) {
                        console.error(err)
                        alert(L('Failed to fetch sales order', 'เกิดข้อผิดพลาดขณะดึงข้อมูลใบสั่งขาย'))
                      }
                    }}>{L('Import', 'นำเข้า')}</button>
                    <button type="button" className={styles.btnOutline} onClick={async () => {
                      try {
                        const res = await fetch(`/api/sales-orders`)
                        const j = await res.json()
                        if (!res.ok || !j.success) {
                          alert(L('No sales orders found','ไม่พบใบสั่งขาย'))
                          return
                        }
                        setSalesOrderSearchResults(j.orders || [])
                        setShowSalesOrderSearchModal(true)
                      } catch (err) {
                        console.error(err)
                        alert(L('Failed to load sales orders','โหลดรายการใบสั่งขายไม่สำเร็จ'))
                      }
                    }}>{L('Search sales order to select', 'ค้นหาใบสั่งขายเพื่อเลือก')}</button>
                  </div>
                </div>
              </div>

              <table className={styles.table} style={{ marginTop: '8px' }}>
                <thead>
                  <tr>
                    <th>{L('Description', 'รายละเอียด')}</th>
                    <th style={{ width: '100px' }}>{L('Qty', 'จำนวน')}</th>
                    <th style={{ width: '140px' }}>{L('Price', 'ราคา')}</th>
                    <th style={{ width: '140px' }}>{L('Total', 'รวม')}</th>
                    <th style={{ width: '80px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={i}>
                      <td>
                        <input
                          placeholder={L('Description', 'รายละเอียด')}
                          value={it.desc}
                          onChange={e => updateItem(i, 'desc', e.target.value)}
                          className={styles.formInput}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={1}
                          value={it.qty}
                          onChange={e => updateItem(i, 'qty', e.target.value)}
                          className={styles.formInput}
                          style={{ textAlign: 'center' }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          value={it.price}
                          onChange={e => updateItem(i, 'price', e.target.value)}
                          className={styles.formInput}
                          style={{ textAlign: 'right' }}
                        />
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {(Number(it.qty || 0) * Number(it.price || 0)).toFixed(2)} ฿
                      </td>
                      <td>
                        <button type="button" onClick={() => removeItem(i)} className={styles.btnOutline} style={{ padding: '4px 8px' }}>
                          {L('Remove', 'ลบ')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" onClick={addItem} className={styles.btnOutline} style={{ marginTop: '8px' }}>
                + {L('Add Item', 'เพิ่มรายการ')}
              </button>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>VAT (%)</label>
                <input
                  type="number"
                  min={0}
                  value={taxRate}
                  onChange={e => setTaxRate(Number(e.target.value))}
                  className={styles.formInput}
                  style={{ width: '100px' }}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Payment Terms', 'เงื่อนไขการชำระ')}</label>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" checked={paymentTerms.cash} onChange={() => setPaymentTerms(prev => ({ ...prev, cash: !prev.cash }))} />
                    <span>{L('Cash', 'เงินสด')}</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" checked={paymentTerms.bankTransfer} onChange={() => setPaymentTerms(prev => ({ ...prev, bankTransfer: !prev.bankTransfer }))} />
                    <span>{L('Bank Transfer', 'โอนเงิน')}</span>
                  </label>
                  {paymentTerms.bankTransfer && (
                    <div style={{ marginTop: 8, padding: 8, background: '#fff7ed', borderRadius: 6, border: '1px solid #ffedd5' }}>
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>{L('Select bank account for transfer', 'เลือกบัญชีสำหรับโอนเงิน')}</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {bankAccounts.map(b => (
                          <label key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input type="radio" name="paymentBank" value={b.id} checked={paymentBank === b.id} onChange={() => setPaymentBank(b.id)} />
                            <div>
                              <div style={{ fontWeight: 700 }}>{b.bank} — {b.account}</div>
                              <div style={{ fontSize: 12, color: '#555' }}>{b.name}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" checked={paymentTerms.credit30} onChange={() => setPaymentTerms(prev => ({ ...prev, credit30: !prev.credit30 }))} />
                    <span>{L('Credit 30 days', 'เครดิต 30 วัน')}</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" checked={paymentTerms.check} onChange={() => setPaymentTerms(prev => ({ ...prev, check: !prev.check }))} />
                    <span>{L('Check', 'เช็ค')}</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" checked={paymentTerms.other} onChange={() => setPaymentTerms(prev => ({ ...prev, other: !prev.other }))} />
                    <span>{L('Other', 'อื่นๆ')}</span>
                  </label>
                </div>
                {paymentTerms.other && (
                  <div style={{ marginTop: '8px' }}>
                    <input value={paymentOtherText} onChange={e => setPaymentOtherText(e.target.value)} className={styles.formInput} placeholder={L('Describe other terms...', 'อธิบายเงื่อนไขอื่นๆ...')} />
                  </div>
                )}
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', minWidth: '260px' }}>
                <div style={{ fontWeight: 700, marginBottom: '8px' }}>{L('Summary', 'สรุป')}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>{L('Subtotal', 'ยอดรวมย่อย')}:</span>
                  <span>{totals.subtotal.toFixed(2)} ฿</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>{L('Tax', 'ภาษี')}:</span>
                  <span>{totals.tax.toFixed(2)} ฿</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 800, marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                  <span>{L('Total', 'รวม')}:</span>
                  <span style={{ color: '#255899' }}>{totals.total.toFixed(2)} ฿</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', justifyContent: 'flex-start', alignItems: 'center' }}>
              <button type="submit" disabled={loading} className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minWidth: 180 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                </svg>
                {loading ? L('Saving...', 'กำลังบันทึก...') : L('Save Invoice', 'บันทึกใบแจ้งหนี้')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
