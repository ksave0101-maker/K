"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../../../components/AdminLayout'
import styles from '../../../admin-theme.module.css'

type ItemType = {
  product_code: string
  product_name: string
  quantity: number
  unit_price: number
}

export default function CreateSupplierInvoicePage() {
  const router = useRouter()

  const [siNo, setSiNo] = useState('')
  const [siDate, setSiDate] = useState(() => new Date().toISOString().split('T')[0])
  const [supplierName, setSupplierName] = useState('')
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState('')
  const [poRef, setPoRef] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')

  const [items, setItems] = useState<ItemType[]>([{ product_code: '', product_name: '', quantity: 1, unit_price: 0 }])
  const [vatRate, setVatRate] = useState(7)
  const [totals, setTotals] = useState({ amount: 0, vat: 0, total: 0 })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [messageBar, setMessageBar] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [locale, setLocale] = useState<'en'|'th'>('th')

  useEffect(() => {
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

  useEffect(() => {
    const amount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
    const vat = (amount * vatRate) / 100
    const total = amount + vat
    setTotals({ amount, vat, total })
  }, [items, vatRate])

  function addItem() {
    setItems([...items, { product_code: '', product_name: '', quantity: 1, unit_price: 0 }])
  }

  function updateItem(i: number, key: keyof ItemType, value: any) {
    const copy = [...items]
    const item = { ...copy[i] }
    if (key === 'quantity') item.quantity = Number(value)
    else if (key === 'unit_price') item.unit_price = Number(value)
    else if (key === 'product_code') item.product_code = String(value)
    else item.product_name = String(value)
    copy[i] = item
    setItems(copy)
  }

  function removeItem(i: number) {
    if (items.length === 1) return
    setItems(items.filter((_, idx) => idx !== i))
  }

  function validate() {
    const errs: string[] = []

    if (!supplierName) errs.push(L('Supplier name is required', 'กรุณาระบุชื่อผู้ขาย'))
    if (!supplierInvoiceNo) errs.push(L('Supplier invoice number is required', 'กรุณาระบุเลขที่ใบแจ้งหนี้ของผู้ขาย'))
    if (dueDate && new Date(dueDate) < new Date(siDate)) {
      errs.push(L('Due date must be >= invoice date', 'วันครบกำหนดต้อง >= วันที่ออกใบแจ้งหนี้'))
    }

    if (items.length === 0) errs.push(L('At least 1 item required', 'ต้องมีอย่างน้อย 1 รายการ'))

    items.forEach((item, idx) => {
      if (!item.product_name) errs.push(L(`Item ${idx + 1} needs product name`, `รายการที่ ${idx + 1} ต้องมีชื่อสินค้า`))
      if (item.quantity <= 0) errs.push(L(`Item ${idx + 1} quantity must be > 0`, `รายการที่ ${idx + 1} จำนวนต้อง > 0`))
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
        siDate,
        supplier_name: supplierName,
        supplier_invoice_no: supplierInvoiceNo,
        po_ref: poRef,
        due_date: dueDate || null,
        items: items.map(item => ({
          product_code: item.product_code,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price
        })),
        amount: totals.amount,
        vat: totals.vat,
        total_amount: totals.total,
        notes,
        created_by
      }

      const res = await fetch('/api/supplier-invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const j = await res.json()

      if (res.ok && j.success) {
        setMessageBar({ type: 'success', text: L('Supplier invoice created successfully', 'สร้างใบแจ้งหนี้ผู้ขายสำเร็จ') })
        setTimeout(() => router.push('/KR-Thailand/Admin-Login/documents/supplier-invoices'), 900)
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
    <AdminLayout title="Create Supplier Invoice" titleTh="สร้างใบแจ้งหนี้ผู้ขาย">
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
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            {L('Create Supplier Invoice', 'สร้างใบแจ้งหนี้ผู้ขาย')}
          </h2>
        </div>

        <div className={styles.cardBody}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('SI No.', 'เลขที่ SI')}</label>
                <input type="text" value={siNo || L('Auto-generated', 'สร้างอัตโนมัติ')} disabled className={styles.formInput} style={{ background: '#f5f5f5' }} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Date', 'วันที่')}</label>
                <input type="date" value={siDate} readOnly className={styles.formInput} style={{ background: '#f5f5f5' }} />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Supplier Name', 'ชื่อผู้ขาย')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" value={supplierName} onChange={e => setSupplierName(e.target.value)} className={styles.formInput} placeholder={L('Enter supplier name', 'กรอกชื่อผู้ขาย')} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Supplier Invoice No.', 'เลขที่ใบแจ้งหนี้ผู้ขาย')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" value={supplierInvoiceNo} onChange={e => setSupplierInvoiceNo(e.target.value)} className={styles.formInput} placeholder={L('Supplier invoice number', 'เลขที่ใบแจ้งหนี้จากผู้ขาย')} />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('PO Reference', 'เลขที่ใบสั่งซื้ออ้างอิง')}</label>
                <input type="text" value={poRef} onChange={e => setPoRef(e.target.value)} className={styles.formInput} placeholder={L('PO number if any', 'เลขที่ใบสั่งซื้อถ้ามี')} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Due Date', 'วันครบกำหนด')}</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={styles.formInput} />
              </div>
            </div>

            <h3 style={{ marginTop: 30, marginBottom: 15, fontSize: 16, fontWeight: 600 }}>{L('Items', 'รายการสินค้า')}</h3>

            <div style={{ overflowX: 'auto' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: '20%' }}>{L('Product Code', 'รหัสสินค้า')}</th>
                    <th style={{ width: '30%' }}>{L('Product Name', 'ชื่อสินค้า')}</th>
                    <th style={{ width: '15%' }}>{L('Quantity', 'จำนวน')}</th>
                    <th style={{ width: '15%' }}>{L('Unit Price', 'ราคาต่อหน่วย')}</th>
                    <th style={{ width: '15%' }}>{L('Total', 'รวม')}</th>
                    <th style={{ width: '5%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td><input type="text" value={item.product_code} onChange={e => updateItem(i, 'product_code', e.target.value)} className={styles.formInput} style={{ width: '100%' }} /></td>
                      <td><input type="text" value={item.product_name} onChange={e => updateItem(i, 'product_name', e.target.value)} className={styles.formInput} style={{ width: '100%' }} /></td>
                      <td><input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} className={styles.formInput} min="0.01" step="0.01" style={{ width: '100%' }} /></td>
                      <td><input type="number" value={item.unit_price} onChange={e => updateItem(i, 'unit_price', e.target.value)} className={styles.formInput} min="0" step="0.01" style={{ width: '100%' }} /></td>
                      <td style={{ textAlign: 'right', padding: '14px 16px' }}>{(item.quantity * item.unit_price).toFixed(2)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button type="button" onClick={() => removeItem(i)} disabled={items.length === 1} className={styles.btnDanger} style={{ padding: '6px 12px', fontSize: '14px' }}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button type="button" onClick={addItem} className={styles.btnSecondary} style={{ marginTop: 10 }}>+ {L('Add Item', 'เพิ่มรายการ')}</button>

            <div style={{ marginTop: 30, padding: 20, background: '#f9fafb', borderRadius: 8 }}>
              <div style={{ maxWidth: 400, marginLeft: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span>{L('Amount', 'ยอดรวม')}:</span>
                  <span style={{ fontWeight: 600 }}>{totals.amount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span>{L('VAT', 'ภาษี')} ({vatRate}%):</span>
                  <span style={{ fontWeight: 600 }}>{totals.vat.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '2px solid #d1d5db', fontSize: 18, fontWeight: 700 }}>
                  <span>{L('Total Amount', 'ยอดรวมทั้งสิ้น')}:</span>
                  <span>{totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginTop: 20 }}>
              <label className={styles.formLabel}>{L('Notes', 'หมายเหตุ')}</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} className={styles.formInput} rows={2} placeholder={L('Additional notes...', 'หมายเหตุเพิ่มเติม...')} />
            </div>

            {errors.length > 0 && (
              <div style={{ padding: '12px 16px', marginBottom: '16px', borderRadius: 8, background: '#fee2e2', border: '1px solid #fca5a5', color: '#7f1d1d' }}>
                {errors.map((err, idx) => (<div key={idx}>• {err}</div>))}
              </div>
            )}

            <div className={styles.formRow} style={{ justifyContent: 'space-between', marginTop: 30 }}>
              <button type="submit" disabled={loading} className={styles.btnPrimary}>
                {loading ? L('Saving...', 'กำลังบันทึก...') : L('Save', 'บันทึก')}
              </button>
              <button type="button" onClick={() => router.back()} className={styles.btnOutline}>{L('Cancel', 'ยกเลิก')}</button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
