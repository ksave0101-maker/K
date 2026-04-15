"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../../../components/AdminLayout'
import styles from '../../../admin-theme.module.css'

type ItemType = {
  product_code: string
  product_name: string
  quantity_ordered: number
  quantity_received: number
  unit: string
  status: string
}

export default function CreateGoodsReceiptPage() {
  const router = useRouter()

  const [grNo, setGrNo] = useState('')
  const [grDate, setGrDate] = useState(() => new Date().toISOString().split('T')[0])
  const [supplierName, setSupplierName] = useState('')
  const [poRef, setPoRef] = useState('')
  const [warehouse, setWarehouse] = useState('')
  const [receiverName, setReceiverName] = useState('')
  const [notes, setNotes] = useState('')

  const [items, setItems] = useState<ItemType[]>([{
    product_code: '',
    product_name: '',
    quantity_ordered: 0,
    quantity_received: 0,
    unit: 'pcs',
    status: 'received'
  }])

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

  function addItem() {
    setItems([...items, { product_code: '', product_name: '', quantity_ordered: 0, quantity_received: 0, unit: 'pcs', status: 'received' }])
  }

  function updateItem(i: number, key: keyof ItemType, value: any) {
    const copy = [...items]
    if (key === 'product_code' || key === 'product_name' || key === 'unit' || key === 'status') {
      copy[i][key] = value
    } else {
      copy[i][key] = Number(value)
    }
    setItems(copy)
  }

  function removeItem(i: number) {
    if (items.length === 1) return
    setItems(items.filter((_, idx) => idx !== i))
  }

  function validate() {
    const errs: string[] = []

    if (!supplierName) errs.push(L('Supplier name is required', 'กรุณาระบุชื่อผู้ขาย'))
    if (!warehouse) errs.push(L('Warehouse is required', 'กรุณาระบุคลังสินค้า'))
    if (!receiverName) errs.push(L('Receiver name is required', 'กรุณาระบุชื่อผู้รับ'))

    if (items.length === 0) errs.push(L('At least 1 item required', 'ต้องมีอย่างน้อย 1 รายการ'))

    items.forEach((item, idx) => {
      if (!item.product_name) errs.push(L(`Item ${idx + 1} needs product name`, `รายการที่ ${idx + 1} ต้องมีชื่อสินค้า`))
      if (item.quantity_received < 0) errs.push(L(`Item ${idx + 1} received quantity cannot be negative`, `รายการที่ ${idx + 1} จำนวนรับไม่สามารถติดลบ`))
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
        grDate,
        supplier_name: supplierName,
        po_ref: poRef || null,
        warehouse,
        receiver_name: receiverName,
        items: items.map(item => ({
          product_code: item.product_code,
          product_name: item.product_name,
          quantity_ordered: item.quantity_ordered,
          quantity_received: item.quantity_received,
          unit: item.unit,
          status: item.status
        })),
        notes,
        created_by
      }

      const res = await fetch('/api/goods-receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const j = await res.json()

      if (res.ok && j.success) {
        setMessageBar({ type: 'success', text: L('Goods receipt created successfully', 'สร้างใบรับสินค้าสำเร็จ') })
        setTimeout(() => router.push('/KR-Thailand/Admin-Login/documents/goods-receipts'), 900)
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
    <AdminLayout title="Create Goods Receipt" titleTh="สร้างใบรับสินค้า">
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
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            {L('Create Goods Receipt', 'สร้างใบรับสินค้า')}
          </h2>
        </div>

        <div className={styles.cardBody}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('GR No.', 'เลขที่ GR')}</label>
                <input type="text" value={grNo || L('Auto-generated', 'สร้างอัตโนมัติ')} disabled className={styles.formInput} style={{ background: '#f5f5f5' }} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Date', 'วันที่')}</label>
                <input type="date" value={grDate} readOnly className={styles.formInput} style={{ background: '#f5f5f5' }} />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Supplier Name', 'ชื่อผู้ขาย')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" value={supplierName} onChange={e => setSupplierName(e.target.value)} className={styles.formInput} placeholder={L('Enter supplier name', 'กรอกชื่อผู้ขาย')} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('PO Reference', 'เลขที่ใบสั่งซื้ออ้างอิง')}</label>
                <input type="text" value={poRef} onChange={e => setPoRef(e.target.value)} className={styles.formInput} placeholder={L('PO number', 'เลขที่ใบสั่งซื้อ')} />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Warehouse', 'คลังสินค้า')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" value={warehouse} onChange={e => setWarehouse(e.target.value)} className={styles.formInput} placeholder={L('Warehouse location', 'สถานที่คลังสินค้า')} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Receiver Name', 'ชื่อผู้รับ')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" value={receiverName} onChange={e => setReceiverName(e.target.value)} className={styles.formInput} placeholder={L('Who received the goods', 'ผู้รับสินค้า')} />
              </div>
            </div>

            <h3 style={{ marginTop: 30, marginBottom: 15, fontSize: 16, fontWeight: 600 }}>{L('Items Received', 'รายการรับสินค้า')}</h3>

            <div style={{ overflowX: 'auto' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: '15%' }}>{L('Product Code', 'รหัสสินค้า')}</th>
                    <th style={{ width: '25%' }}>{L('Product Name', 'ชื่อสินค้า')}</th>
                    <th style={{ width: '12%' }}>{L('Ordered', 'สั่งซื้อ')}</th>
                    <th style={{ width: '12%' }}>{L('Received', 'รับจริง')}</th>
                    <th style={{ width: '10%' }}>{L('Unit', 'หน่วย')}</th>
                    <th style={{ width: '15%' }}>{L('Status', 'สถานะ')}</th>
                    <th style={{ width: '6%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td><input type="text" value={item.product_code} onChange={e => updateItem(i, 'product_code', e.target.value)} className={styles.formInput} style={{ width: '100%' }} /></td>
                      <td><input type="text" value={item.product_name} onChange={e => updateItem(i, 'product_name', e.target.value)} className={styles.formInput} style={{ width: '100%' }} /></td>
                      <td><input type="number" value={item.quantity_ordered} onChange={e => updateItem(i, 'quantity_ordered', e.target.value)} className={styles.formInput} min="0" step="0.01" style={{ width: '100%' }} /></td>
                      <td><input type="number" value={item.quantity_received} onChange={e => updateItem(i, 'quantity_received', e.target.value)} className={styles.formInput} min="0" step="0.01" style={{ width: '100%' }} /></td>
                      <td><input type="text" value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)} className={styles.formInput} style={{ width: '100%' }} /></td>
                      <td>
                        <select value={item.status} onChange={e => updateItem(i, 'status', e.target.value)} className={styles.formInput} style={{ width: '100%' }}>
                          <option value="received">{L('Received', 'รับครบ')}</option>
                          <option value="partial">{L('Partial', 'รับบางส่วน')}</option>
                          <option value="pending">{L('Pending', 'รอรับ')}</option>
                        </select>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button type="button" onClick={() => removeItem(i)} disabled={items.length === 1} className={styles.btnDanger} style={{ padding: '6px 12px', fontSize: '14px' }}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button type="button" onClick={addItem} className={styles.btnSecondary} style={{ marginTop: 10 }}>+ {L('Add Item', 'เพิ่มรายการ')}</button>

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
