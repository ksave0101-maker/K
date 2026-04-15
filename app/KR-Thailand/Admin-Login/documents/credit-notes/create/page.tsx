"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../../../components/AdminLayout'
import styles from '../../../admin-theme.module.css'

type ItemType = {
  description: string
  quantity: number
  unit_price: number
}

type LocaleChangeDetail = string | { locale?: 'en' | 'th' }
type SourceTaxInvoice = {
  taxID?: number | string
  invID?: number | string
  taxNo?: string
  taxDate?: string
  customer_name?: string
  items?: Array<Record<string, unknown>>
  subtotal?: number | string
  vat?: number | string
  total_amount?: number | string
}

export default function CreateCreditNotePage() {
  const router = useRouter()

  // Document fields
  const [cnNo, setCnNo] = useState('')
  const [cnDate, setCnDate] = useState(() => new Date().toISOString().split('T')[0])
  const [customerName, setCustomerName] = useState('')
  const [invoiceRef, setInvoiceRef] = useState('')
  const [notes, setNotes] = useState('')
  const [sourceTaxInvoice, setSourceTaxInvoice] = useState<SourceTaxInvoice | null>(null)

  // Items
  const [items, setItems] = useState<ItemType[]>([{ description: '', quantity: 1, unit_price: 0 }])

  // Calculations
  const [discount, setDiscount] = useState(0)
  const vatRate = 7
  const [totals, setTotals] = useState({ subtotal: 0, vat: 0, total: 0 })

  const [loading, setLoading] = useState(false)
  const [refreshingCnNo, setRefreshingCnNo] = useState(false)
  const [loadingSourceTaxInvoice, setLoadingSourceTaxInvoice] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [messageBar, setMessageBar] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Locale
  const [locale, setLocale] = useState<'en'|'th'>('th')

  useEffect(() => {
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      if (l === 'en' || l === 'th') setLocale(l as 'en'|'th')
    } catch {}

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

  const L = (en: string, th: string) => locale === 'th' ? th : en

  useEffect(() => {
    refreshCnNo()
  }, [])

  // Auto-calculate totals
  useEffect(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
    const afterDiscount = Math.max(0, subtotal - discount)
    const vat = (afterDiscount * vatRate) / 100
    const total = afterDiscount + vat
    setTotals({ subtotal, vat, total })
  }, [items, discount, vatRate])

  async function loadSourceTaxInvoice() {
    const taxNo = invoiceRef.trim()
    if (!taxNo) {
      setMessageBar({ type: 'error', text: L('Please enter tax invoice number first', 'กรุณากรอกเลขที่ใบกำกับภาษีก่อน') })
      return
    }

    setLoadingSourceTaxInvoice(true)
    try {
      const res = await fetch(`/api/tax-invoices?taxNo=${encodeURIComponent(taxNo)}`)
      const j = await res.json()

      if (!(res.ok && j.success && j.taxInvoice)) {
        throw new Error(j.error || 'Tax invoice not found')
      }

      const taxInvoice = j.taxInvoice as SourceTaxInvoice
      const parsedItems = typeof taxInvoice.items === 'string'
        ? (() => {
            try {
              return JSON.parse(taxInvoice.items) as Array<Record<string, unknown>>
            } catch {
              return []
            }
          })()
        : (Array.isArray(taxInvoice.items) ? taxInvoice.items : [])

      const mappedItems = parsedItems
        .map((item) => {
          const quantity = Number(item.quantity || item.qty || 1)
          const totalPrice = Number(item.total_price || item.total || 0)
          const unitPrice = Number(
            item.unit_price ||
            item.unitPrice ||
            item.price ||
            (quantity > 0 && totalPrice > 0 ? totalPrice / quantity : 0)
          )
          const description = String(item.description || item.desc || item.product_name || item.name || '').trim()

          return {
            description: description || L('Credit adjustment', 'รายการลดหนี้'),
            quantity: quantity > 0 ? quantity : 1,
            unit_price: unitPrice > 0 ? unitPrice : totalPrice
          }
        })
        .filter((item) => item.description || item.quantity > 0 || item.unit_price > 0)

      const nextItems = mappedItems.length > 0
        ? mappedItems
        : [{ description: `${L('Credit adjustment from tax invoice', 'รายการลดหนี้จากใบกำกับภาษี')} ${taxInvoice.taxNo || taxNo}`, quantity: 1, unit_price: Number(taxInvoice.total_amount || 0) }]

      setSourceTaxInvoice({ ...taxInvoice, items: parsedItems })
      setInvoiceRef(String(taxInvoice.taxNo || taxNo))
      setCustomerName(String(taxInvoice.customer_name || ''))
      setItems(nextItems)
      setDiscount(0)
      setMessageBar({ type: 'success', text: L('Tax invoice data loaded successfully', 'ดึงข้อมูลใบกำกับภาษีเรียบร้อย') })
    } catch (err) {
      console.error('Failed to load tax invoice:', err)
      setSourceTaxInvoice(null)
      setMessageBar({ type: 'error', text: L('Unable to load tax invoice data', 'ไม่สามารถดึงข้อมูลใบกำกับภาษีได้') })
    } finally {
      setLoadingSourceTaxInvoice(false)
    }
  }

  async function refreshCnNo() {
    setRefreshingCnNo(true)
    try {
      const res = await fetch('/api/documents/generate-number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'cn' })
      })
      const j = await res.json()
      if (res.ok && j.success && j.docNo) {
        setCnNo(j.docNo)
      } else {
        throw new Error(j.error || 'Failed to generate credit note number')
      }
      setCnDate(new Date().toISOString().split('T')[0])
    } catch (err) {
      console.error('Failed to get credit note number:', err)
      const now = new Date()
      const yyyy = String(now.getFullYear())
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      setCnNo(`CN-${yyyy}${mm}${dd}-00001`)
    } finally {
      setRefreshingCnNo(false)
    }
  }

  function validate() {
    const errs: string[] = []

    if (!customerName) errs.push(L('Customer name is required', 'กรุณาระบุชื่อลูกค้า'))
    if (!invoiceRef) errs.push(L('Invoice reference is required', 'กรุณาระบุเลขที่ใบแจ้งหนี้อ้างอิง'))
    if (!sourceTaxInvoice) errs.push(L('Please load the original tax invoice first', 'กรุณาดึงข้อมูลใบกำกับภาษีเดิมก่อน'))

    if (items.length === 0) {
      errs.push(L('At least 1 item required', 'ต้องมีอย่างน้อย 1 รายการ'))
    }

    items.forEach((item, idx) => {
      if (!item.description) {
        errs.push(L(`Item ${idx + 1} needs description`, `รายการที่ ${idx + 1} ต้องมีคำอธิบาย`))
      }
      if (item.quantity <= 0) {
        errs.push(L(`Item ${idx + 1} quantity must be > 0`, `รายการที่ ${idx + 1} จำนวนต้อง > 0`))
      }
    })

    setErrors(errs)
    return errs.length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const user = JSON.parse(localStorage.getItem('k_system_admin_user') || '{}')
      const created_by = user?.username || user?.name || 'system'

      const payload = {
        cnNo,
        cnDate,
        invID: sourceTaxInvoice?.invID || null,
        invNo: invoiceRef,
        customer_name: customerName,
        invoice_ref: invoiceRef,
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price
        })),
        subtotal: totals.subtotal,
        discount,
        vat: totals.vat,
        total_amount: totals.total,
        notes,
        created_by
      }

      const res = await fetch('/api/credit-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const j = await res.json()

      if (res.ok && j.success) {
        setMessageBar({ type: 'success', text: L('Credit note created successfully', 'สร้างใบลดหนี้สำเร็จ') })
        setTimeout(() => router.push('/KR-Thailand/Admin-Login/documents/credit-notes'), 900)
      } else {
        setMessageBar({ type: 'error', text: L('Failed: ', 'ล้มเหลว: ') + (j.error || 'Unknown error') })
      }
    } catch (err) {
      console.error(err)
      setMessageBar({ type: 'error', text: L('Error occurred', 'เกิดข้อผิดพลาด') })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout title="Create Credit Note" titleTh="สร้างใบลดหนี้">
      {messageBar && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '16px',
          borderRadius: 8,
          color: messageBar.type === 'error' ? '#7f1d1d' : '#064e3b',
          background: messageBar.type === 'error' ? '#fee2e2' : '#ecfdf5',
          border: messageBar.type === 'error' ? '1px solid #fca5a5' : '1px solid #86efac'
        }}>
          {messageBar.text}
        </div>
      )}

      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6"/>
              <path d="M9 13h6"/>
              <path d="M9 17h6"/>
            </svg>
            {L('Create Credit Note', 'สร้างใบลดหนี้')}
          </h2>
          <p className={styles.cardSubtitle}>
            {L('Issue credit note to customer', 'ออกใบลดหนี้ให้ลูกค้า')}
          </p>
        </div>

        <div className={styles.cardBody}>
          <form onSubmit={handleSubmit}>
            {/* Document Info */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Credit Note No.', 'เลขที่ใบลดหนี้')}</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="text"
                    value={cnNo || L('Auto-generated', 'สร้างอัตโนมัติ')}
                    disabled
                    className={styles.formInput}
                    style={{ background: '#f5f5f5', flex: 1 }}
                  />
                  <button type="button" className={styles.btnOutline} onClick={refreshCnNo} disabled={refreshingCnNo}>
                    {refreshingCnNo ? L('Refreshing...', 'กำลังรีเฟรช...') : L('Refresh', 'รีเฟรช')}
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Date', 'วันที่')}</label>
                <input
                  type="date"
                  value={cnDate}
                  readOnly
                  className={styles.formInput}
                  style={{ background: '#f5f5f5' }}
                />
              </div>
            </div>

            {/* Customer Info */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Customer Name', 'ชื่อลูกค้า')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className={styles.formInput}
                  placeholder={L('Enter customer name', 'กรอกชื่อลูกค้า')}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Original Tax Invoice No.', 'เลขที่ใบกำกับภาษีเดิม')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="text"
                    value={invoiceRef}
                    onChange={e => setInvoiceRef(e.target.value)}
                    className={styles.formInput}
                    placeholder={L('Enter tax invoice number', 'กรอกเลขที่ใบกำกับภาษีเดิม')}
                    style={{ flex: 1 }}
                  />
                  <button type="button" className={styles.btnOutline} onClick={loadSourceTaxInvoice} disabled={loadingSourceTaxInvoice}>
                    {loadingSourceTaxInvoice ? L('Loading...', 'กำลังดึงข้อมูล...') : L('Load', 'ดึงข้อมูล')}
                  </button>
                </div>
              </div>
            </div>

            {sourceTaxInvoice && (
              <div style={{ marginBottom: 20, padding: 14, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10 }}>
                <div style={{ fontWeight: 700, color: '#1d4ed8', marginBottom: 8 }}>
                  {L('Loaded original tax invoice', 'ข้อมูลใบกำกับภาษีเดิมที่ดึงมา')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, fontSize: 14 }}>
                  <div><strong>{L('Tax Invoice No.', 'เลขที่ใบกำกับภาษี')}:</strong> {sourceTaxInvoice.taxNo || '-'}</div>
                  <div><strong>{L('Date', 'วันที่')}:</strong> {sourceTaxInvoice.taxDate ? new Date(sourceTaxInvoice.taxDate).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US') : '-'}</div>
                  <div><strong>{L('Customer', 'ลูกค้า')}:</strong> {sourceTaxInvoice.customer_name || '-'}</div>
                  <div><strong>{L('Original Tax Invoice Total Amount', 'รวมมูลค่าใบกำกับภาษีเดิม')}:</strong> {Number(sourceTaxInvoice.total_amount || 0).toFixed(2)}</div>
                </div>
              </div>
            )}

            {/* Calculation Summary */}
            <div style={{ marginTop: 30, padding: 20, background: '#f9fafb', borderRadius: 8 }}>
              <div style={{ maxWidth: 400, marginLeft: 'auto' }}>
                {sourceTaxInvoice && (
                  <>
                    {items.length > 0 && (
                      <div style={{ marginBottom: 14, padding: 12, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8 }}>
                        <div style={{ fontWeight: 700, color: '#1d4ed8', marginBottom: 10 }}>
                          {L('Imported items summary', 'รายการที่ดึงมาจากใบกำกับภาษีเดิม')}
                        </div>
                        <div style={{ display: 'grid', gap: 8 }}>
                          {items.map((item, index) => (
                            <div key={`${item.description}-${index}`} style={{ paddingBottom: 8, borderBottom: index < items.length - 1 ? '1px solid #dbeafe' : 'none' }}>
                              <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
                                {index + 1}. {item.description}
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#334155' }}>
                                <span>{L('Qty', 'จำนวน')} {item.quantity.toFixed(2)} x {L('Unit', 'หน่วยละ')} {item.unit_price.toFixed(2)}</span>
                                <span style={{ fontWeight: 700 }}>{(item.quantity * item.unit_price).toFixed(2)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 10,
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: '#dbeafe',
                      color: '#1e3a8a',
                      fontWeight: 800
                    }}>
                      <span>{L('Original Tax Invoice Total Amount', 'รวมมูลค่าใบกำกับภาษีเดิม')}:</span>
                      <span>{Number(sourceTaxInvoice.total_amount || 0).toFixed(2)}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, color: '#1d4ed8' }}>
                      <span>{L('Original Tax Invoice Subtotal', 'ยอดรวมใบกำกับภาษีเดิม')}:</span>
                      <span style={{ fontWeight: 700 }}>{Number(sourceTaxInvoice.subtotal || 0).toFixed(2)}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, color: '#1d4ed8' }}>
                      <span>{L('Original Tax Invoice VAT', 'ภาษีใบกำกับภาษีเดิม')} ({vatRate}%):</span>
                      <span style={{ fontWeight: 700 }}>{Number(sourceTaxInvoice.vat || 0).toFixed(2)}</span>
                    </div>
                  </>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span>{L('Subtotal', 'ยอดรวม')}:</span>
                  <span style={{ fontWeight: 600 }}>{totals.subtotal.toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span>{L('Discount', 'ส่วนลด')}:</span>
                  <input
                    type="number"
                    value={discount}
                    onChange={e => setDiscount(Number(e.target.value))}
                    className={styles.formInput}
                    min="0"
                    step="0.01"
                    style={{ width: 150, textAlign: 'right' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span>{L('VAT', 'ภาษีมูลค่าเพิ่ม')} ({vatRate}%):</span>
                  <span style={{ fontWeight: 600 }}>{totals.vat.toFixed(2)}</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: 10,
                  borderTop: '2px solid #d1d5db',
                  fontSize: 18,
                  fontWeight: 700
                }}>
                  <span>{L('Total Amount', 'ยอดรวมทั้งสิ้น')}:</span>
                  <span>{totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginTop: 20 }}>
              <label className={styles.formLabel}>{L('Notes', 'หมายเหตุ')}</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className={styles.formInput}
                rows={2}
                placeholder={L('Additional notes...', 'หมายเหตุเพิ่มเติม...')}
              />
            </div>

            {errors.length > 0 && (
              <div style={{
                padding: '12px 16px',
                marginBottom: '16px',
                borderRadius: 8,
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                color: '#7f1d1d'
              }}>
                {errors.map((err, idx) => (
                  <div key={idx}>• {err}</div>
                ))}
              </div>
            )}

            <div className={styles.formRow} style={{ justifyContent: 'space-between', marginTop: 30 }}>
              <button type="submit" disabled={loading} className={styles.btnPrimary}>
                {loading ? L('Saving...', 'กำลังบันทึก...') : L('Save', 'บันทึก')}
              </button>
              <button type="button" onClick={() => router.back()} className={styles.btnOutline}>
                {L('Cancel', 'ยกเลิก')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
