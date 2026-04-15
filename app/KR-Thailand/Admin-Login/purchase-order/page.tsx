"use client"

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'
import styles from '../admin-theme.module.css'
import poStyles from '../purchase-order.module.css'

type POItem = { product_id?: number | null; sku?: string | null; productName: string; quantity: number; unitPrice: number }
type PORecord = {
  orderID: number
  orderNo: string
  customer_name: string
  priceTotal: number
  status: string
  created_at: string
  received_date?: string
}

export default function PurchaseOrderPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('list')

  const [locale, setLocale] = useState<'en'|'th'>(() => {
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      return l === 'th' ? 'th' : 'en'
    } catch { return 'th' }
  })

  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as any).detail
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

  const lang = locale
  const L = (en: string, th: string) => lang === 'th' ? th : en
  const getAuthHeaders = (): Record<string, string> => {
    try {
      const t = localStorage.getItem('k_system_admin_token') || ''
      return t ? { Authorization: `Bearer ${t}` } : {}
    } catch {
      return {}
    }
  }

  // ===== LIST STATE =====
  const [orders, setOrders] = useState<PORecord[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  const loadOrders = async () => {
    setLoadingOrders(true)
    try {
      const res = await fetch('/api/purchase-orders', { headers: getAuthHeaders() })
      const j = await res.json()
      if (j && j.success && Array.isArray(j.orders)) {
        setOrders(j.orders)
      }
    } catch (err) {
      console.error('Failed to load orders:', err)
    } finally {
      setLoadingOrders(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleReceive = async (orderId: number) => {
    if (!confirm(L('Confirm receiving goods for this order?', 'ยืนยันการรับสินค้าสำหรับใบสั่งซื้อนี้?'))) return
    try {
      const headers: any = { 'Content-Type': 'application/json', ...getAuthHeaders() }
      const res = await fetch('/api/purchase-orders', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ orderId, action: 'receive' })
      })
      const j = await res.json()
      if (j && j.success) {
        window.dispatchEvent(new CustomEvent('k-system-toast', { detail: { message: L('Goods received successfully!', 'ยืนยันรับสินค้าเรียบร้อย!'), type: 'success' } }))
        loadOrders()
      } else {
        alert(L('Failed to update status', 'อัปเดตสถานะไม่สำเร็จ'))
      }
    } catch (err) {
      console.error(err)
      alert(L('Network error', 'เกิดข้อผิดพลาด'))
    }
  }

  const handleCancel = async (orderId: number) => {
    if (!confirm(L('Cancel this order?', 'ยกเลิกใบสั่งซื้อนี้?'))) return
    try {
      const headers: any = { 'Content-Type': 'application/json', ...getAuthHeaders() }
      const res = await fetch('/api/purchase-orders', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ orderId, action: 'cancel' })
      })
      const j = await res.json()
      if (j && j.success) {
        window.dispatchEvent(new CustomEvent('k-system-toast', { detail: { message: L('Order cancelled', 'ยกเลิกใบสั่งซื้อแล้ว'), type: 'warning' } }))
        loadOrders()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string; bg: string }> = {
      pending: { label: L('Pending', 'รอดำเนินการ'), color: '#92400e', bg: '#fef3c7' },
      approved: { label: L('Approved', 'อนุมัติแล้ว'), color: '#1e40af', bg: '#dbeafe' },
      processing: { label: L('Processing', 'กำลังดำเนินการ'), color: '#6b21a8', bg: '#f3e8ff' },
      received: { label: L('Received', 'รับสินค้าแล้ว'), color: '#166534', bg: '#dcfce7' },
      completed: { label: L('Completed', 'เสร็จสิ้น'), color: '#166534', bg: '#dcfce7' },
      cancelled: { label: L('Cancelled', 'ยกเลิก'), color: '#991b1b', bg: '#fee2e2' }
    }
    const b = badges[status] || { label: status, color: '#666', bg: '#f5f5f5' }
    return (
      <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, color: b.color, background: b.bg }}>
        {b.label}
      </span>
    )
  }

  // ===== CREATE FORM STATE =====
  const [formData, setFormData] = useState({
    supplierName: '',
    supplierEmail: '',
    supplierPhone: '',
    supplierAddress: '',
    deliveryDate: '',
    notes: ''
  })

  const [items, setItems] = useState<POItem[]>([
    { product_id: null, sku: null, productName: '', quantity: 1, unitPrice: 0 }
  ])

  const [orderNumber, setOrderNumber] = useState<string>('')
  const [orderDate, setOrderDate] = useState<string>(() => {
    const d = new Date()
    return d.toISOString().split('T')[0]
  })

  const [discountPercent, setDiscountPercent] = useState<number>(0)
  const [vatPercent, setVatPercent] = useState<number>(7)

  const [lastSeq, setLastSeq] = useState<number | null>(null)
  const [prefixStr, setPrefixStr] = useState<string>('')

  useEffect(() => {
    regenerateOrderNumber()
  }, [])

  const regenerateOrderNumber = async () => {
    const pad = (n: number, width = 4) => n.toString().padStart(width, '0')
    const now = new Date()
    const dd = now.getDate().toString().padStart(2, '0')
    const mm = (now.getMonth() + 1).toString().padStart(2, '0')
    const yy = now.getFullYear().toString().slice(-2)
    const localFallbackPrefix = `PO-${yy}${mm}${dd}-`
    setPrefixStr(localFallbackPrefix)
    try {
      const res = await fetch('/api/po-seq', { headers: getAuthHeaders() })
      const j = await res.json()
      if (j && j.formatted) {
        setOrderNumber(j.formatted)
        // server returns next numeric value in `next`
        setLastSeq(j.next || null)
      } else {
        const nextSeq = j?.next || 1
        setOrderNumber(`${localFallbackPrefix}${pad(nextSeq)}`)
        setLastSeq(nextSeq)
      }
      setOrderDate(`${now.getFullYear()}-${mm}-${dd}`)
    } catch (_) {
      setOrderNumber(`${localFallbackPrefix}${pad(1)}`)
      setLastSeq(1)
    }
  }

  const handleRefreshClick = async () => {
    const pad = (n: number, width = 4) => n.toString().padStart(width, '0')
    try {
      const res = await fetch('/api/po-seq', { headers: getAuthHeaders() })
      const j = await res.json()
      if (j?.formatted && typeof j.formatted === 'string') {
        // Use server-provided formatted PO if available
        setOrderNumber(j.formatted)
        const m = String(j.formatted).match(/-(\d{4})$/)
        if (m) setLastSeq(Number(m[1]))
        // ensure prefixStr matches the server prefix (e.g. 'PO-YYMMDD-')
        const p = String(j.formatted).replace(/(\d{4})$/, '')
        setPrefixStr(p)
      } else {
        const nextSeq = j?.next || 1
        setLastSeq(nextSeq)
        setOrderNumber(`${prefixStr}${pad(nextSeq)}`)
      }
    } catch (e) {
      // fallback to local increment if server call fails
      const next = (lastSeq || 0) + 1
      setLastSeq(next)
      setOrderNumber(`${prefixStr}${pad(next)}`)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Product search
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number | null>(null)
  const searchTimeout = useRef<number | null>(null)

  function handleItemChange(index: number, field: 'productName' | 'quantity' | 'unitPrice', value: string) {
    setItems(prev => {
      const copy = [...prev]
      const item = { ...copy[index] }
      if (field === 'productName') {
        item.productName = value
        item.product_id = null
        item.sku = null
      } else if (field === 'quantity') {
        item.quantity = Number(value) || 0
      } else if (field === 'unitPrice') {
        item.unitPrice = Number(value) || 0
      }
      copy[index] = item
      return copy
    })

    if (field === 'productName') {
      if (searchTimeout.current) window.clearTimeout(searchTimeout.current)
      setActiveSuggestionIndex(index)
      searchTimeout.current = window.setTimeout(async () => {
        const q = value.trim()
        if (!q) { setSuggestions([]); setActiveSuggestionIndex(null); return }
        try {
          const res = await fetch(`/api/products?q=${encodeURIComponent(q)}`, { headers: getAuthHeaders() })
          const j = await res.json()
          if (j && Array.isArray(j.products)) setSuggestions(j.products)
          else setSuggestions([])
        } catch (_) {
          setSuggestions([])
        }
      }, 300) as unknown as number
    }
  }

  function removeItem(index: number) {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const subtotal = items.reduce((sum, it) => sum + (it.quantity || 0) * (it.unitPrice || 0), 0)
  const discountAmount = subtotal * (discountPercent / 100)
  const afterDiscount = subtotal - discountAmount
  const vatAmount = afterDiscount * (vatPercent / 100)
  const priceTotal = afterDiscount + vatAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      orderNumber,
      orderDate,
      customerId: null,
      customerName: formData.supplierName,
      customerEmail: formData.supplierEmail,
      customerPhone: formData.supplierPhone,
      customerAddress: formData.supplierAddress,
      deliveryDate: formData.deliveryDate || null,
      notes: formData.notes || null,
      paymentTerms: [],
      paymentOther: null,
      items: items.map(it => ({ product_id: it.product_id || null, sku: it.sku || null, product_name: it.productName, quantity: it.quantity, unit_price: it.unitPrice })),
      subtotal,
      discountPercent,
      discountAmount,
      vatPercent,
      vatAmount,
      priceTotal
    }

    try {
      const headers: any = { 'Content-Type': 'application/json', ...getAuthHeaders() }
      const res = await fetch('/api/purchase-orders', { method: 'POST', headers, body: JSON.stringify(payload) })
      const j = await res.json()
      if (j && j.success) {
        window.dispatchEvent(new CustomEvent('k-system-toast', { detail: { message: L('Order saved!', 'บันทึกใบสั่งซื้อแล้ว!'), type: 'success' } }))
        // Navigate to purchase order list page
        router.push('/KR-Thailand/Admin-Login/purchase-order/list')
      } else {
        alert(L('Save failed', 'บันทึกไม่สำเร็จ') + ': ' + (j?.error || ''))
      }
    } catch (err) {
      console.error(err)
      alert(L('Network error', 'เกิดข้อผิดพลาด'))
    }
  }

  const fmtCurrency = (n: number) => n.toLocaleString(lang === 'th' ? 'th-TH' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <AdminLayout title="Purchase Order" titleTh="ใบสั่งซื้อ (Supplier)">
      <div className={poStyles.container}>
        <div className={poStyles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              {L('Supplier Purchase Order', 'ใบสั่งซื้อจาก Supplier')}
            </h2>
            <p className={styles.cardSubtitle}>
              {L('Create purchase orders from suppliers and confirm goods received', 'สร้างใบสั่งซื้อจากซัพพลายเออร์และยืนยันการรับสินค้า')}
            </p>
          </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e5e7eb', marginBottom: 20 }}>
          <button
            onClick={() => setActiveTab('list')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'list' ? '#fff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'list' ? '2px solid #2563eb' : '2px solid transparent',
              marginBottom: -2,
              cursor: 'pointer',
              fontWeight: activeTab === 'list' ? 600 : 400,
              color: activeTab === 'list' ? '#2563eb' : '#666'
            }}
          >
            {L('Order List', 'รายการใบสั่งซื้อ')}
          </button>
          <button
            onClick={() => setActiveTab('create')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'create' ? '#fff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'create' ? '2px solid #2563eb' : '2px solid transparent',
              marginBottom: -2,
              cursor: 'pointer',
              fontWeight: activeTab === 'create' ? 600 : 400,
              color: activeTab === 'create' ? '#2563eb' : '#666'
            }}
          >
            {L('+ Create New Order', '+ สร้างใบสั่งซื้อใหม่')}
          </button>
        </div>

        <div className={styles.cardBody}>
          {/* ===== LIST TAB ===== */}
          {activeTab === 'list' && (
            <div>
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 14, color: '#666' }}>
                  {L('Orders marked as "Received" will be recorded as expenses', 'ใบสั่งซื้อที่ "รับสินค้าแล้ว" จะถูกบันทึกเป็นรายจ่าย')}
                </div>
                <button onClick={loadOrders} className={styles.btnOutline} disabled={loadingOrders}>
                  {loadingOrders ? L('Loading...', 'กำลังโหลด...') : L('Refresh', 'รีเฟรช')}
                </button>
              </div>

              <div className={poStyles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>{L('Order No.', 'เลขที่')}</th>
                      <th>{L('Supplier', 'ซัพพลายเออร์')}</th>
                      <th style={{ textAlign: 'right' }}>{L('Amount', 'ยอดเงิน')}</th>
                      <th style={{ textAlign: 'center' }}>{L('Status', 'สถานะ')}</th>
                      <th>{L('Created', 'สร้างเมื่อ')}</th>
                      <th>{L('Received', 'รับสินค้า')}</th>
                      <th style={{ textAlign: 'center' }}>{L('Actions', 'จัดการ')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.orderID}>
                        <td style={{ fontWeight: 600 }}>{o.orderNo}</td>
                        <td>{o.customer_name || '-'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#dc2626' }}>{fmtCurrency(Number(o.priceTotal || 0))} ฿</td>
                        <td style={{ textAlign: 'center' }}>{getStatusBadge(o.status)}</td>
                        <td style={{ fontSize: 13, color: '#666' }}>{o.created_at ? new Date(o.created_at).toLocaleDateString() : '-'}</td>
                        <td style={{ fontSize: 13, color: '#16a34a' }}>{o.received_date ? new Date(o.received_date).toLocaleDateString() : '-'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                            {o.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleReceive(o.orderID)}
                                  className={`${styles.btn} ${styles.btnSuccess}`}
                                  style={{ padding: '4px 10px', fontSize: 12 }}
                                >
                                  {L('Receive', 'รับสินค้า')}
                                </button>
                                <button
                                  onClick={() => handleCancel(o.orderID)}
                                  className={`${styles.btn} ${styles.btnDanger}`}
                                  style={{ padding: '4px 10px', fontSize: 12 }}
                                >
                                  {L('Cancel', 'ยกเลิก')}
                                </button>
                              </>
                            )}
                            {o.status === 'received' && (
                              <span style={{ color: '#16a34a', fontSize: 12 }}>{L('Recorded as expense', 'บันทึกเป็นรายจ่ายแล้ว')}</span>
                            )}
                            {o.status === 'cancelled' && (
                              <span style={{ color: '#991b1b', fontSize: 12 }}>{L('Cancelled', 'ยกเลิกแล้ว')}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                          {loadingOrders ? L('Loading...', 'กำลังโหลด...') : L('No orders found', 'ไม่พบข้อมูลใบสั่งซื้อ')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== CREATE TAB ===== */}
          {activeTab === 'create' && (
            <form onSubmit={handleSubmit}>
              {/* Order Number & Date */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'flex-end' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Order No.', 'เลขที่ใบสั่งซื้อ')}</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="text" value={orderNumber} readOnly className={styles.formInput} style={{ width: 180 }} />
                    <button type="button" onClick={handleRefreshClick} className={styles.btnOutline}>
                      {L('Refresh', 'รีเฟรช')}
                    </button>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Order Date', 'วันที่สั่งซื้อ')}</label>
                  <input type="date" value={orderDate} readOnly title={L('Fixed to today', 'ตั้งเป็นวันที่ปัจจุบัน')} className={styles.formInput} />
                </div>
              </div>

              {/* Supplier Information */}
              <div className={styles.sectionBox} style={{ marginBottom: 20 }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600 }}>{L('Supplier Information', 'ข้อมูลซัพพลายเออร์')}</h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{L('Supplier Name', 'ชื่อซัพพลายเออร์')} <span style={{ color: '#dc2626' }}>*</span></label>
                    <input type="text" name="supplierName" value={formData.supplierName} onChange={handleChange} required className={styles.formInput} placeholder={L('Company or supplier name', 'ชื่อบริษัทหรือซัพพลายเออร์')} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{L('Email', 'อีเมล')}</label>
                    <input type="email" name="supplierEmail" value={formData.supplierEmail} onChange={handleChange} className={styles.formInput} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{L('Phone', 'โทรศัพท์')}</label>
                    <input type="tel" name="supplierPhone" value={formData.supplierPhone} onChange={handleChange} className={styles.formInput} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{L('Expected Delivery', 'วันที่คาดว่าจะได้รับ')}</label>
                    <input type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleChange} className={styles.formInput} />
                  </div>
                  <div className={`${styles.formGroup} ${styles.formGridFull}`}>
                    <label className={styles.formLabel}>{L('Address', 'ที่อยู่')}</label>
                    <input type="text" name="supplierAddress" value={formData.supplierAddress} onChange={handleChange} className={styles.formInput} placeholder={L('Supplier address', 'ที่อยู่ซัพพลายเออร์')} />
                  </div>
                </div>
              </div>

              {/* Items */}
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600 }}>{L('Order Items', 'รายการสินค้า')}</h3>
                <div className={poStyles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>{L('Product Name', 'ชื่อสินค้า')}</th>
                        <th style={{ width: 100, textAlign: 'center' }}>{L('Qty', 'จำนวน')}</th>
                        <th style={{ width: 140, textAlign: 'right' }}>{L('Unit Price', 'ราคาต่อหน่วย')}</th>
                        <th style={{ width: 140, textAlign: 'right' }}>{L('Total', 'รวม')}</th>
                        <th style={{ width: 80 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it, idx) => (
                        <tr key={idx}>
                          <td style={{ position: 'relative' }}>
                            <input
                              type="text"
                              placeholder={L('Product Name', 'ชื่อสินค้า')}
                              value={it.productName}
                              onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                              onFocus={() => setActiveSuggestionIndex(idx)}
                              className={styles.formInput}
                            />
                            {activeSuggestionIndex === idx && suggestions.length > 0 && (
                              <div className={poStyles.suggestionsDropdown}>
                                {suggestions.map((p: any) => (
                                  <div
                                    key={p.id || p.sku || p.name}
                                    onClick={() => {
                                      setItems(prev => {
                                        const copy = [...prev]
                                        copy[idx] = { ...copy[idx], product_id: p.id || null, sku: p.sku || null, productName: p.name || '', unitPrice: Number(p.price || 0) }
                                        return copy
                                      })
                                      setSuggestions([])
                                      setActiveSuggestionIndex(null)
                                    }}
                                    className={poStyles.suggestionItem}
                                  >
                                    <div className={poStyles.resultItemName}>{p.name}</div>
                                    <div className={poStyles.resultItemMeta}>
                                      {p.sku ? `SKU: ${p.sku}` : ''} {p.price ? ` - ${Number(p.price).toFixed(2)} ฿` : ''}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td>
                            <input
                              type="number"
                              min={1}
                              value={it.quantity}
                              onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                              className={styles.formInput}
                              style={{ textAlign: 'center' }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min={0}
                              step={0.01}
                              value={it.unitPrice}
                              onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                              className={styles.formInput}
                              style={{ textAlign: 'right' }}
                            />
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>
                            {fmtCurrency(it.quantity * it.unitPrice)} ฿
                          </td>
                          <td>
                            <button type="button" onClick={() => removeItem(idx)} className={`${styles.btn} ${styles.btnDanger}`} style={{ padding: '4px 8px' }}>
                              {L('Delete', 'ลบ')}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button type="button" onClick={() => setItems(prev => [...prev, { product_id: null, sku: null, productName: '', quantity: 1, unitPrice: 0 }])} className={styles.btnOutline} style={{ marginTop: 8 }}>
                  + {L('Add Row', 'เพิ่มแถว')}
                </button>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: 20 }}>
                <label className={styles.formLabel}>{L('Notes', 'หมายเหตุ')}</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder={L('Additional notes...', 'หมายเหตุเพิ่มเติม...')}
                  className={styles.formTextarea}
                  rows={3}
                />
              </div>

              {/* Price Summary */}
              <div className={styles.sectionBox} style={{ marginBottom: 20 }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600 }}>{L('Price Summary', 'สรุปราคา')}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{L('Subtotal', 'ราคารวมสินค้า')}</span>
                    <span>{fmtCurrency(subtotal)} ฿</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{L('Discount', 'ส่วนลด')}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="number" min={0} max={100} value={discountPercent} onChange={e => setDiscountPercent(Number(e.target.value) || 0)} className={styles.formInput} style={{ width: 80, textAlign: 'center' }} />
                      <span>%</span>
                      <span style={{ color: '#dc2626', minWidth: 100, textAlign: 'right' }}>-{fmtCurrency(discountAmount)} ฿</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{L('VAT', 'ภาษีมูลค่าเพิ่ม')}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="number" min={0} max={100} value={vatPercent} onChange={e => setVatPercent(Number(e.target.value) || 0)} className={styles.formInput} style={{ width: 80, textAlign: 'center' }} />
                      <span>%</span>
                      <span style={{ color: '#16a34a', minWidth: 100, textAlign: 'right' }}>+{fmtCurrency(vatAmount)} ฿</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '2px solid #2563eb', fontSize: 18, fontWeight: 700 }}>
                    <span>{L('Total Amount', 'ยอดรวมทั้งหมด')}</span>
                    <span style={{ color: '#2563eb' }}>{fmtCurrency(priceTotal)} ฿</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                  </svg>
                  {L('Save Order', 'บันทึกใบสั่งซื้อ')}
                </button>
                <button type="button" onClick={() => setActiveTab('list')} className={`${styles.btn} ${styles.btnSecondary}`}>
                  {L('Cancel', 'ยกเลิก')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      </div>
    </AdminLayout>
  )
}
