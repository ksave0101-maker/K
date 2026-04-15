"use client"

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'
import styles from '../admin-theme.module.css'
import poStyles from '../purchase-order.module.css'

type SOItem = { product_id?: number | null; sku?: string | null; productName: string; quantity: number; unitPrice: number }
type QuotationItem = Record<string, unknown>
type LocaleChangeDetail = string | { locale?: 'en' | 'th' }
type CustomerRecord = {
  cusID?: number | string
  id?: number | string
  fullname?: string
  name?: string
  email?: string
  phone?: string
  tel?: string
  address?: string
}
type ProductRecord = {
  id?: number | string
  sku?: string
  name?: string
  price?: number | string
}
type QuotationRecord = {
  quoteID?: number | string
  quoteNo?: string
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  customer_address?: string
  delivery_date?: string
  vat_percent?: number | string
  discount_percent?: number | string
  notes?: string
  items?: QuotationItem[] | string
  total?: number | string
  total_amount?: number | string
}

export default function SalesOrderPage() {
  const router = useRouter()

  const [locale, setLocale] = useState<'en'|'th'>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      if (l === 'en' || l === 'th') setLocale(l)
    } catch {}
    setMounted(true)

    const handler = (e: Event) => {
      const d = (e as CustomEvent<LocaleChangeDetail>).detail
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

  const lang = mounted ? locale : 'en'
  const L = (en: string, th: string) => lang === 'th' ? th : en
  const getAuthHeaders = (): Record<string, string> => {
    try {
      const t = localStorage.getItem('k_system_admin_token') || ''
      return t ? { Authorization: `Bearer ${t}` } : {}
    } catch {
      return {}
    }
  }

  // ===== FORM STATE =====
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    deliveryDate: '',
    notes: ''
  })

  const [items, setItems] = useState<SOItem[]>([
    { product_id: null, sku: null, productName: '', quantity: 1, unitPrice: 0 }
  ])

  const [orderNumber, setOrderNumber] = useState<string>('')
  const [orderDate, setOrderDate] = useState<string>(() => {
    const d = new Date()
    return d.toISOString().split('T')[0]
  })

  const [discountPercent, setDiscountPercent] = useState<number>(0)
  const [vatPercent, setVatPercent] = useState<number>(7)
  const [customers, setCustomers] = useState<CustomerRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [quoteNo, setQuoteNo] = useState('')
  const [quoteSearchTerm, setQuoteSearchTerm] = useState('')
  const [quoteSearchResults, setQuoteSearchResults] = useState<QuotationRecord[]>([])
  const [showQuoteSearchModal, setShowQuoteSearchModal] = useState(false)
  const [importingQuote, setImportingQuote] = useState(false)

  // Load initial data
  useEffect(() => {
    refreshOrderNumber()
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      const res = await fetch('/api/customers', { headers: getAuthHeaders() })
      const j = await res.json()
      if (j && j.success && Array.isArray(j.customers)) {
        setCustomers(j.customers)
      }
    } catch (err) {
      console.error('Failed to load customers:', err)
    }
  }

  const refreshOrderNumber = async () => {
    try {
      const res = await fetch('/api/sales-order-seq', { headers: getAuthHeaders() })
      const j = await res.json()
      if (j && j.formatted) {
        setOrderNumber(j.formatted)
      } else {
        // Fallback
        const now = new Date()
        const yy = String(now.getFullYear()).slice(-2)
        const mm = String(now.getMonth() + 1).padStart(2, '0')
        const dd = String(now.getDate()).padStart(2, '0')
        setOrderNumber(`SO-${yy}${mm}${dd}-0001`)
      }
      // Update date to today
      setOrderDate(new Date().toISOString().split('T')[0])
    } catch {
      const now = new Date()
      const yy = String(now.getFullYear()).slice(-2)
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      setOrderNumber(`SO-${yy}${mm}${dd}-0001`)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cusId = e.target.value
    if (!cusId) {
      setFormData({ customerName: '', customerEmail: '', customerPhone: '', customerAddress: '', deliveryDate: formData.deliveryDate, notes: formData.notes })
      return
    }
    const cus = customers.find(c => String(c.cusID || c.id) === cusId)
    if (cus) {
      setFormData(prev => ({
        ...prev,
        customerName: cus.fullname || cus.name || '',
        customerEmail: cus.email || '',
        customerPhone: cus.phone || cus.tel || '',
        customerAddress: cus.address || ''
      }))
    }
  }

  // Product search
  const [suggestions, setSuggestions] = useState<ProductRecord[]>([])
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number | null>(null)
  const searchTimeout = useRef<number | null>(null)
  // explicit product picker modal
  const [pickerVisible, setPickerVisible] = useState(false)
  const [pickerProducts, setPickerProducts] = useState<ProductRecord[]>([])
  const [pickerLoading, setPickerLoading] = useState(false)
  const [pickerForIndex, setPickerForIndex] = useState<number | null>(null)

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
        } catch {
          setSuggestions([])
        }
      }, 300) as unknown as number
    }
  }

  function removeItem(index: number) {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const openProductPicker = async (index: number) => {
    setPickerForIndex(index)
    setPickerVisible(true)
    setPickerLoading(true)
    try {
      const res = await fetch('/api/products', { headers: getAuthHeaders() })
      const j = await res.json()
      if (j && Array.isArray(j.products)) setPickerProducts(j.products)
      else setPickerProducts([])
    } catch (e) {
      console.error('Failed to load products for picker', e)
      setPickerProducts([])
    } finally {
      setPickerLoading(false)
    }
  }

  const selectProductFromPicker = (p: ProductRecord) => {
    if (pickerForIndex === null) return
    const idx = pickerForIndex
    setItems(prev => {
      const copy = [...prev]
      copy[idx] = {
        ...copy[idx],
        product_id: p.id ? Number(p.id) : null,
        sku: p.sku || null,
        productName: p.name || '',
        unitPrice: Number(p.price || 0)
      }
      return copy
    })
    setPickerVisible(false)
    setPickerForIndex(null)
  }

  const subtotal = items.reduce((sum, it) => sum + (it.quantity || 0) * (it.unitPrice || 0), 0)
  const discountAmount = subtotal * (discountPercent / 100)
  const afterDiscount = subtotal - discountAmount
  const vatAmount = afterDiscount * (vatPercent / 100)
  const priceTotal = afterDiscount + vatAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.customerName) {
      alert(L('Please enter customer name', 'กรุณากรอกชื่อลูกค้า'))
      return
    }
    setLoading(true)
    const payload = {
      orderNo: orderNumber,
      orderDate,
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      customerAddress: formData.customerAddress,
      deliveryDate: formData.deliveryDate || null,
      notes: formData.notes || null,
      items: items.map(it => ({
        product_id: it.product_id || null,
        sku: it.sku || null,
        product_name: it.productName,
        quantity: it.quantity,
        unit_price: it.unitPrice
      })),
      subtotal,
      discountPercent,
      discountAmount,
      vatPercent,
      vatAmount,
      priceTotal
    }

    try {
      const headers = { 'Content-Type': 'application/json', ...getAuthHeaders() }
      const res = await fetch('/api/sales-orders', { method: 'POST', headers, body: JSON.stringify(payload) })
      const j = await res.json()
      if (j && j.success) {
        window.dispatchEvent(new CustomEvent('k-system-toast', { detail: { message: L('Sales order saved!', 'บันทึกใบสั่งขายแล้ว!'), type: 'success' } }))
        router.push('/KR-Thailand/Admin-Login/sales-order/list')
      } else {
        alert(L('Save failed', 'บันทึกไม่สำเร็จ') + ': ' + (j?.error || ''))
      }
    } catch (err) {
      console.error(err)
      alert(L('Network error', 'เกิดข้อผิดพลาด'))
    } finally {
      setLoading(false)
    }
  }

  const applyQuotationToForm = (quote: QuotationRecord) => {
    const parsedItems = typeof quote.items === 'string'
      ? (() => {
          try {
            return JSON.parse(quote.items) as QuotationItem[]
          } catch {
            return []
          }
        })()
      : (Array.isArray(quote.items) ? quote.items : [])

    const mappedItems: SOItem[] = parsedItems.length > 0
      ? parsedItems.map((it) => ({
          product_id: Number(it.product_id || it.productID || it.id || 0) || null,
          sku: String(it.sku || '') || null,
          productName: String(it.product_name || it.productName || it.description || it.desc || it.sku || ''),
          quantity: Number(it.quantity || it.qty || 1) || 1,
          unitPrice: Number(it.unit_price || it.unitPrice || it.price || it.total_price || 0) || 0
        }))
      : [{ product_id: null, sku: null, productName: '', quantity: 1, unitPrice: 0 }]

    setQuoteNo(String(quote.quoteNo || ''))
    setItems(mappedItems)
    setFormData(prev => ({
      ...prev,
      customerName: quote.customer_name || '',
      customerEmail: quote.customer_email || '',
      customerPhone: quote.customer_phone || '',
      customerAddress: quote.customer_address || '',
      deliveryDate: quote.delivery_date || prev.deliveryDate,
      notes: quote.notes || prev.notes
    }))

    if (quote.vat_percent !== undefined) {
      setVatPercent(Number(quote.vat_percent) || 7)
    }
    if (quote.discount_percent !== undefined) {
      setDiscountPercent(Number(quote.discount_percent) || 0)
    }
  }

  const importQuotationByNo = async () => {
    const selectedQuoteNo = quoteNo.trim()
    if (!selectedQuoteNo) {
      alert(L('Please enter quotation number', 'กรุณากรอกเลขที่ใบเสนอราคา'))
      return
    }

    setImportingQuote(true)
    try {
      const res = await fetch(`/api/quotations?quoteNo=${encodeURIComponent(selectedQuoteNo)}`, { headers: getAuthHeaders() })
      const j = await res.json()
      if (!res.ok || !j.success || !j.quotation) {
        alert(L('Quotation not found', 'ไม่พบใบเสนอราคา'))
        return
      }

      applyQuotationToForm(j.quotation as QuotationRecord)
      window.dispatchEvent(new CustomEvent('k-system-toast', { detail: { message: L('Quotation imported to sales order', 'ดึงข้อมูลใบเสนอราคามาเป็นใบสั่งขายแล้ว'), type: 'success' } }))
    } catch (err) {
      console.error(err)
      alert(L('Failed to fetch quotation', 'เกิดข้อผิดพลาดขณะดึงข้อมูลใบเสนอราคา'))
    } finally {
      setImportingQuote(false)
    }
  }

  const openQuotationSearch = async () => {
    setImportingQuote(true)
    try {
      const res = await fetch('/api/quotations', { headers: getAuthHeaders() })
      const j = await res.json()
      if (!res.ok || !j.success) {
        alert(L('Failed to load quotations', 'โหลดรายการใบเสนอราคาไม่สำเร็จ'))
        return
      }
      setQuoteSearchResults(j.rows || j.quotations || [])
      setShowQuoteSearchModal(true)
    } catch (err) {
      console.error(err)
      alert(L('Failed to load quotations', 'โหลดรายการใบเสนอราคาไม่สำเร็จ'))
    } finally {
      setImportingQuote(false)
    }
  }

  const fmtCurrency = (n: number) => n.toLocaleString(lang === 'th' ? 'th-TH' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <AdminLayout title="Sales Order" titleTh="ใบสั่งขาย">
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            {L('Create Sales Order', 'สร้างใบสั่งขาย')}
          </h2>
          <p className={styles.cardSubtitle}>
            {L('Create sales orders for customers', 'สร้างใบสั่งขายสำหรับลูกค้า')}
          </p>
        </div>

        <div className={styles.cardBody}>
          <form onSubmit={handleSubmit}>
            {/* Order Number & Date */}
            <div className={styles.formRow} style={{ marginBottom: 20 }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Order No.', 'เลขที่ใบสั่งขาย')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={e => setOrderNumber(e.target.value)}
                    className={styles.formInput}
                    placeholder="SO-260124-0001"
                    required
                    style={{ flex: 1 }}
                  />
                  <button type="button" onClick={refreshOrderNumber} className={styles.btnOutline}>
                    {L('Refresh', 'รีเฟรช')}
                  </button>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Date', 'วันที่')}</label>
                <input
                  type="date"
                  value={orderDate}
                  readOnly
                  title={L('Fixed to today', 'ตั้งเป็นวันที่ปัจจุบัน')}
                  className={styles.formInput}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20, padding: 12, background: '#f0f9ff', borderRadius: 8, border: '1px solid #bae6fd' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, color: '#0369a1' }}>{L('Import from Quotation:', 'ดึงข้อมูลจากใบเสนอราคา:')}</span>
                <input
                  value={quoteNo}
                  onChange={e => setQuoteNo(e.target.value)}
                  placeholder={L('Quotation No.', 'เลขที่ใบเสนอราคา')}
                  className={styles.formInput}
                  style={{ maxWidth: 240 }}
                />
                <button type="button" className={styles.btnOutline} onClick={importQuotationByNo} disabled={importingQuote}>
                  {importingQuote ? L('Loading...', 'กำลังดึงข้อมูล...') : L('Import', 'ดึงข้อมูล')}
                </button>
                <button type="button" className={styles.btnOutline} onClick={openQuotationSearch} disabled={importingQuote}>
                  {L('Search quotation', 'ค้นหาใบเสนอราคา')}
                </button>
              </div>
            </div>

            {/* Customer Information */}
            <div className={styles.sectionBox} style={{ marginBottom: 20 }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600 }}>
                {L('Customer Information', 'ข้อมูลลูกค้า')}
              </h3>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Select Customer', 'เลือกลูกค้า')}</label>
                  <select onChange={handleCustomerSelect} className={styles.formSelect}>
                    <option value="">{L('-- Select or enter manually --', '-- เลือกหรือกรอกเอง --')}</option>
                    {customers.map(c => (
                      <option key={c.cusID || c.id} value={c.cusID || c.id}>
                        {c.fullname || c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {L('Customer Name', 'ชื่อลูกค้า')} <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                    className={styles.formInput}
                    placeholder={L('Customer name', 'ชื่อลูกค้า')}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Email', 'อีเมล')}</label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    className={styles.formInput}
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Phone', 'โทรศัพท์')}</label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Expected Delivery', 'วันที่คาดว่าจะจัดส่ง')}</label>
                  <input
                    type="date"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={handleChange}
                    className={styles.formInput}
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup} style={{ flex: 2 }}>
                  <label className={styles.formLabel}>{L('Address', 'ที่อยู่')}</label>
                  <input
                    type="text"
                    name="customerAddress"
                    value={formData.customerAddress}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder={L('Customer address', 'ที่อยู่ลูกค้า')}
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600 }}>
                {L('Order Items', 'รายการสินค้า')}
              </h3>
              <div className={poStyles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ width: 50, textAlign: 'center' }}>#</th>
                      <th>{L('Product Name', 'ชื่อสินค้า')}</th>
                      <th style={{ width: 120, textAlign: 'center' }}>{L('Qty', 'จำนวน')}</th>
                      <th style={{ width: 150, textAlign: 'right' }}>{L('Unit Price', 'ราคาต่อหน่วย')}</th>
                      <th style={{ width: 150, textAlign: 'right' }}>{L('Total', 'รวม')}</th>
                      <th style={{ width: 80, textAlign: 'center' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => (
                      <tr key={idx}>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: '#6b7280' }}>
                          {idx + 1}
                        </td>
                        <td style={{ position: 'relative' }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input
                              type="text"
                              placeholder={L('Product Name', 'ชื่อสินค้า')}
                              value={it.productName}
                              onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                              onFocus={() => setActiveSuggestionIndex(idx)}
                              className={styles.formInput}
                              style={{ flex: 1 }}
                            />
                            <button
                              type="button"
                              onClick={() => openProductPicker(idx)}
                              className={styles.btnOutline}
                              title={L('Search product', 'ค้นหาสินค้า')}
                              style={{ padding: '6px 12px', flexShrink: 0 }}
                            >
                              🔍
                            </button>
                          </div>
                          {activeSuggestionIndex === idx && suggestions.length > 0 && (
                            <div className={poStyles.suggestionsDropdown}>
                              {suggestions.map((p: ProductRecord) => (
                                <div
                                  key={p.id || p.sku || p.name}
                                  onClick={() => {
                                    setItems(prev => {
                                      const copy = [...prev]
                                      copy[idx] = {
                                        ...copy[idx],
                                        product_id: p.id ? Number(p.id) : null,
                                        sku: p.sku || null,
                                        productName: p.name || '',
                                        unitPrice: Number(p.price || 0)
                                      }
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
                        <td style={{ textAlign: 'right', fontWeight: 600, fontSize: 15 }}>
                          {fmtCurrency(it.quantity * it.unitPrice)} ฿
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className={styles.btnOutline}
                            style={{ padding: '6px 12px', color: '#dc2626' }}
                          >
                            {L('Delete', 'ลบ')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                onClick={() => setItems(prev => [...prev, { product_id: null, sku: null, productName: '', quantity: 1, unitPrice: 0 }])}
                className={styles.btnOutline}
                style={{ marginTop: 8 }}
              >
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
                className={styles.formInput}
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Price Summary */}
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, minWidth: 350 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>{L('Subtotal', 'ราคารวมสินค้า')}</span>
                  <span>{fmtCurrency(subtotal)} ฿</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span>{L('Discount', 'ส่วนลด')}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={discountPercent}
                      onChange={e => setDiscountPercent(Number(e.target.value) || 0)}
                      className={styles.formInput}
                      style={{ width: 60, textAlign: 'center' }}
                    />
                    <span>%</span>
                    <span style={{ color: '#dc2626', minWidth: 80, textAlign: 'right' }}>-{fmtCurrency(discountAmount)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span>{L('VAT', 'ภาษีมูลค่าเพิ่ม')}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={vatPercent}
                      onChange={e => setVatPercent(Number(e.target.value) || 0)}
                      className={styles.formInput}
                      style={{ width: 60, textAlign: 'center' }}
                    />
                    <span>%</span>
                    <span style={{ color: '#16a34a', minWidth: 80, textAlign: 'right' }}>+{fmtCurrency(vatAmount)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '2px solid #2563eb', fontSize: 18, fontWeight: 700 }}>
                  <span>{L('Total', 'ยอดรวม')}</span>
                  <span style={{ color: '#2563eb' }}>{fmtCurrency(priceTotal)} ฿</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
              <button
                type="submit"
                disabled={loading}
                className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                </svg>
                {loading ? L('Saving...', 'กำลังบันทึก...') : L('Save Order', 'บันทึกใบสั่งขาย')}
              </button>
              <button
                type="button"
                onClick={() => router.push('/KR-Thailand/Admin-Login/sales-order/list')}
                className={`${styles.btn} ${styles.btnSecondary}`}
              >
                {L('Cancel', 'ยกเลิก')}
              </button>
            </div>
          </form>
          {/* Product picker modal */}
          {pickerVisible && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
              <div style={{ width: 800, maxHeight: '80vh', overflow: 'auto', background: 'white', borderRadius: 8, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontWeight: 700 }}>{L('Select product', 'เลือกสินค้า')}</div>
                  <div>
                    <button className={styles.btnOutline} onClick={() => setPickerVisible(false)}>{L('Close', 'ปิด')}</button>
                  </div>
                </div>
                {pickerLoading ? (
                  <div>{L('Loading...', 'กำลังโหลด...')}</div>
                ) : (
                  <table className={styles.table} style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>{L('Name', 'ชื่อ')}</th>
                        <th>{L('SKU', 'รหัส')}</th>
                        <th style={{ textAlign: 'right' }}>{L('Price', 'ราคา')}</th>
                        <th style={{ width: 120 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {pickerProducts.map(p => (
                        <tr key={p.id || p.sku}>
                          <td>{p.name}</td>
                          <td>{p.sku || '-'}</td>
                          <td style={{ textAlign: 'right' }}>{Number(p.price || 0).toFixed(2)} ฿</td>
                          <td style={{ textAlign: 'center' }}>
                            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => selectProductFromPicker(p)}>{L('Select','เลือก')}</button>
                          </td>
                        </tr>
                      ))}
                      {pickerProducts.length === 0 && (
                        <tr><td colSpan={4} style={{ textAlign: 'center', padding: 20 }}>{L('No products found', 'ไม่พบสินค้า')}</td></tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
          {showQuoteSearchModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300 }}>
              <div style={{ width: '90%', maxWidth: 900, background: '#fff', borderRadius: 8, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700 }}>{L('Select Quotation', 'เลือกใบเสนอราคา')}</div>
                  <button onClick={() => setShowQuoteSearchModal(false)} className={styles.btnOutline}>✕</button>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12, marginBottom: 12 }}>
                  <input
                    value={quoteSearchTerm}
                    onChange={e => setQuoteSearchTerm(e.target.value)}
                    placeholder={L('Search by quote no or customer', 'ค้นหาด้วยเลขที่ใบเสนอราคาหรือชื่อลูกค้า')}
                    className={styles.formInput}
                    style={{ flex: 1 }}
                  />
                </div>
                <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>{L('Quote No.', 'เลขที่ใบเสนอราคา')}</th>
                        <th>{L('Customer', 'ลูกค้า')}</th>
                        <th style={{ textAlign: 'right' }}>{L('Total', 'ยอดรวม')}</th>
                        <th style={{ width: 120 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {quoteSearchResults
                        .filter((q) => {
                          const search = quoteSearchTerm.trim().toLowerCase()
                          if (!search) return true
                          return String(q.quoteNo || '').toLowerCase().includes(search) || String(q.customer_name || '').toLowerCase().includes(search)
                        })
                        .map((q) => (
                          <tr key={String(q.quoteID || q.quoteNo || Math.random())}>
                            <td>{q.quoteNo || '-'}</td>
                            <td>{q.customer_name || '-'}</td>
                            <td style={{ textAlign: 'right' }}>{fmtCurrency(Number(q.total || q.total_amount || 0))} ฿</td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                className={styles.btnOutline}
                                onClick={() => {
                                  applyQuotationToForm(q)
                                  setShowQuoteSearchModal(false)
                                }}
                              >
                                {L('Select', 'เลือก')}
                              </button>
                            </td>
                          </tr>
                        ))}
                      {quoteSearchResults.filter((q) => {
                        const search = quoteSearchTerm.trim().toLowerCase()
                        if (!search) return true
                        return String(q.quoteNo || '').toLowerCase().includes(search) || String(q.customer_name || '').toLowerCase().includes(search)
                      }).length === 0 && (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', padding: 20 }}>
                            {L('No quotations found', 'ไม่พบใบเสนอราคา')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
