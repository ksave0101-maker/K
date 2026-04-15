"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../../../components/AdminLayout'
import styles from '../../../admin-theme.module.css'

export default function CreateStockCardPage() {
  const router = useRouter()

  // Document fields
  const [scNo, setScNo] = useState('')
  const [scDate, setScDate] = useState(() => new Date().toISOString().split('T')[0])
  const [productCode, setProductCode] = useState('')
  const [productName, setProductName] = useState('')
  const [productId, setProductId] = useState<number | null>(null)
  const [transactionType, setTransactionType] = useState<'in' | 'out' | 'adjustment'>('in')
  const [quantityIn, setQuantityIn] = useState('')
  const [quantityOut, setQuantityOut] = useState('')
  const [balance, setBalance] = useState('')
  const [unit, setUnit] = useState('pcs')
  const [referenceNo, setReferenceNo] = useState('')
  const [notes, setNotes] = useState('')

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [messageBar, setMessageBar] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Locale
  const [locale, setLocale] = useState<'en'|'th'>('th')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      if (l === 'en' || l === 'th') setLocale(l as 'en'|'th')
    } catch {}

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

  const L = (en: string, th: string) => locale === 'th' ? th : en

  function validate() {
    const errs: string[] = []

    if (!productCode || !productName) {
      errs.push(L('Product is required', 'กรุณาระบุสินค้า'))
    }

    if (!transactionType) {
      errs.push(L('Transaction type is required', 'กรุณาเลือกประเภททรานแซคชั่น'))
    }

    const qtyIn = parseFloat(quantityIn || '0')
    const qtyOut = parseFloat(quantityOut || '0')

    if (qtyIn <= 0 && qtyOut <= 0) {
      errs.push(L('Either Quantity In or Quantity Out must be greater than 0', 'ต้องระบุจำนวนรับเข้า หรือจำนวนจ่ายออก มากกว่า 0'))
    }

    if (qtyIn > 0 && qtyOut > 0) {
      errs.push(L('Cannot have both Quantity In and Quantity Out', 'ไม่สามารถระบุทั้งจำนวนรับเข้าและจ่ายออกพร้อมกัน'))
    }

    if (!balance || parseFloat(balance) < 0) {
      errs.push(L('Balance must be >= 0', 'ยอดคงเหลือต้อง >= 0'))
    }

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
        scDate,
        product_id: productId,
        product_code: productCode,
        product_name: productName,
        transaction_type: transactionType,
        quantity_in: parseFloat(quantityIn || '0'),
        quantity_out: parseFloat(quantityOut || '0'),
        balance: parseFloat(balance || '0'),
        unit,
        reference_no: referenceNo,
        notes,
        created_by
      }

      const res = await fetch('/api/stock-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const j = await res.json()

      if (res.ok && j.success) {
        setMessageBar({ type: 'success', text: L('Stock card created successfully', 'สร้างการ์ดสินค้าสำเร็จ') })
        setTimeout(() => router.push('/KR-Thailand/Admin-Login/documents/stock-cards'), 900)
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
    <AdminLayout title="Create Stock Card" titleTh="สร้างการ์ดสินค้า">
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
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            {L('Create Stock Card', 'สร้างการ์ดสินค้า')}
          </h2>
          <p className={styles.cardSubtitle}>
            {L('Record stock transaction', 'บันทึกการเคลื่อนไหวสินค้า')}
          </p>
        </div>

        <div className={styles.cardBody}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Stock Card No.', 'เลขที่การ์ด')}</label>
                <input
                  type="text"
                  value={scNo || L('Auto-generated', 'สร้างอัตโนมัติ')}
                  disabled
                  className={styles.formInput}
                  style={{ background: '#f5f5f5' }}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Date', 'วันที่')}</label>
                <input
                  type="date"
                  value={scDate}
                  readOnly
                  className={styles.formInput}
                  style={{ background: '#f5f5f5' }}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Product Code', 'รหัสสินค้า')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={productCode}
                  onChange={e => setProductCode(e.target.value)}
                  className={styles.formInput}
                  placeholder={L('Enter product code', 'กรอกรหัสสินค้า')}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Product Name', 'ชื่อสินค้า')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                  className={styles.formInput}
                  placeholder={L('Enter product name', 'กรอกชื่อสินค้า')}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Transaction Type', 'ประเภททรานแซคชั่น')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  value={transactionType}
                  onChange={e => setTransactionType(e.target.value as 'in' | 'out' | 'adjustment')}
                  className={styles.formInput}
                >
                  <option value="in">{L('Stock In', 'รับเข้า')}</option>
                  <option value="out">{L('Stock Out', 'จ่ายออก')}</option>
                  <option value="adjustment">{L('Adjustment', 'ปรับปรุง')}</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Reference No.', 'เลขที่อ้างอิง')}</label>
                <input
                  type="text"
                  value={referenceNo}
                  onChange={e => setReferenceNo(e.target.value)}
                  className={styles.formInput}
                  placeholder={L('GR, Delivery note, etc.', 'เลขที่ GR, Delivery note, ฯลฯ')}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Quantity In', 'จำนวนรับเข้า')}
                </label>
                <input
                  type="number"
                  value={quantityIn}
                  onChange={e => setQuantityIn(e.target.value)}
                  className={styles.formInput}
                  placeholder="0"
                  step="0.01"
                  min="0"
                  disabled={transactionType === 'out'}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Quantity Out', 'จำนวนจ่ายออก')}
                </label>
                <input
                  type="number"
                  value={quantityOut}
                  onChange={e => setQuantityOut(e.target.value)}
                  className={styles.formInput}
                  placeholder="0"
                  step="0.01"
                  min="0"
                  disabled={transactionType === 'in'}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Balance', 'ยอดคงเหลือ')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="number"
                  value={balance}
                  onChange={e => setBalance(e.target.value)}
                  className={styles.formInput}
                  placeholder="0"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Unit', 'หน่วย')}</label>
                <input
                  type="text"
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  className={styles.formInput}
                  placeholder="pcs, kg, etc."
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{L('Notes', 'หมายเหตุ')}</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className={styles.formInput}
                rows={3}
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
