"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../../../components/AdminLayout'
import styles from '../../../admin-theme.module.css'

type ItemType = {
  product_code: string
  product_name: string
  description: string
  quantity: number
  unit: string
  unit_price: number
  total_price: number
  hs_code: string
  country_of_origin: string
}

export default function CreateImportPage() {
  const router = useRouter()

  const [impNo, setImpNo] = useState('')
  const [impDate, setImpDate] = useState(() => new Date().toISOString().split('T')[0])
  const [supplierName, setSupplierName] = useState('')
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState('')
  const [warehouse, setWarehouse] = useState('')
  const [receiverName, setReceiverName] = useState('')
  const [transportMethod, setTransportMethod] = useState('sea')
  const [customsDeclarationNo, setCustomsDeclarationNo] = useState('')
  const [currency, setCurrency] = useState('THB')
  const [exchangeRate, setExchangeRate] = useState(1.0)
  const [notes, setNotes] = useState('')

  const [items, setItems] = useState<ItemType[]>([{
    product_code: '',
    product_name: '',
    description: '',
    quantity: 1,
    unit: 'pcs',
    unit_price: 0,
    total_price: 0,
    hs_code: '',
    country_of_origin: ''
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

  // Auto-calculate total price when quantity or unit price changes
  useEffect(() => {
    const updated = items.map(item => ({
      ...item,
      total_price: item.quantity * item.unit_price
    }))
    if (JSON.stringify(updated) !== JSON.stringify(items)) {
      setItems(updated)
    }
  }, [items.map(i => `${i.quantity}-${i.unit_price}`).join(',')])

  function addItem() {
    setItems([...items, {
      product_code: '',
      product_name: '',
      description: '',
      quantity: 1,
      unit: 'pcs',
      unit_price: 0,
      total_price: 0,
      hs_code: '',
      country_of_origin: ''
    }])
  }

  function updateItem(i: number, key: keyof ItemType, value: any) {
    const copy = [...items]
    if (key === 'quantity' || key === 'unit_price' || key === 'total_price') {
      copy[i][key] = Number(value)
    } else {
      copy[i][key] = value
    }
    setItems(copy)
  }

  function removeItem(i: number) {
    if (items.length === 1) return
    setItems(items.filter((_, idx) => idx !== i))
  }

  const totals = {
    quantity: items.reduce((sum, item) => sum + item.quantity, 0),
    amount: items.reduce((sum, item) => sum + item.total_price, 0)
  }

  function validate() {
    const errs: string[] = []

    if (!supplierName) errs.push(L('Supplier name is required', 'กรุณาระบุชื่อผู้ขาย'))
    if (!warehouse) errs.push(L('Warehouse is required', 'กรุณาระบุคลังสินค้า'))

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
        impDate,
        supplier_name: supplierName,
        supplier_invoice_no: supplierInvoiceNo || null,
        warehouse,
        receiver_name: receiverName || null,
        transport_method: transportMethod,
        customs_declaration_no: customsDeclarationNo || null,
        currency,
        exchange_rate: exchangeRate,
        notes,
        items: items.map(item => ({
          product_code: item.product_code || null,
          product_name: item.product_name,
          description: item.description || null,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          total_price: item.total_price,
          hs_code: item.hs_code || null,
          country_of_origin: item.country_of_origin || null
        })),
        created_by
      }

      const res = await fetch('/api/imports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const j = await res.json()

      if (res.ok && j.success) {
        setMessageBar({ type: 'success', text: L('Import created successfully', 'สร้างใบนำเข้าสำเร็จ') })
        setTimeout(() => router.push('/KR-Thailand/Admin-Login/documents/imports'), 900)
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
    <AdminLayout title="Create Import" titleTh="สร้างใบนำเข้า">
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
          <h2 className={styles.cardTitle}>{L('Create Import Document', 'สร้างใบนำเข้า')}</h2>
        </div>

        <div className={styles.cardBody}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Import No.', 'เลขที่นำเข้า')}</label>
                <input type="text" value={impNo || L('Auto-generated', 'สร้างอัตโนมัติ')} disabled className={styles.formInput} style={{ background: '#f5f5f5' }} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Date', 'วันที่')}</label>
                <input type="date" value={impDate} onChange={e => setImpDate(e.target.value)} className={styles.formInput} />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Supplier Name', 'ชื่อผู้ขาย')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" value={supplierName} onChange={e => setSupplierName(e.target.value)} className={styles.formInput} placeholder={L('Supplier name', 'ชื่อผู้ขาย')} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Supplier Invoice No.', 'เลขที่ใบแจ้งหนี้ผู้ขาย')}</label>
                <input type="text" value={supplierInvoiceNo} onChange={e => setSupplierInvoiceNo(e.target.value)} className={styles.formInput} />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Warehouse', 'คลังสินค้า')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" value={warehouse} onChange={e => setWarehouse(e.target.value)} className={styles.formInput} placeholder={L('Destination warehouse', 'คลังปลายทาง')} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Receiver Name', 'ชื่อผู้รับ')}</label>
                <input type="text" value={receiverName} onChange={e => setReceiverName(e.target.value)} className={styles.formInput} />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Transport Method', 'วิธีการขนส่ง')}</label>
                <select value={transportMethod} onChange={e => setTransportMethod(e.target.value)} className={styles.formInput}>
                  <option value="sea">{L('By Sea', 'ทางเรือ')}</option>
                  <option value="air">{L('By Air', 'ทางอากาศ')}</option>
                  <option value="land">{L('By Land', 'ทางบก')}</option>
                  <option value="rail">{L('By Rail', 'ทางรถไฟ')}</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Customs Declaration No.', 'เลขที่ใบขนสินค้า')}</label>
                <input type="text" value={customsDeclarationNo} onChange={e => setCustomsDeclarationNo(e.target.value)} className={styles.formInput} />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Currency', 'สกุลเงิน')}</label>
                <select value={currency} onChange={e => setCurrency(e.target.value)} className={styles.formInput}>
                  <option value="THB">THB - บาท</option>
                  <option value="USD">USD - ดอลลาร์</option>
                  <option value="EUR">EUR - ยูโร</option>
                  <option value="CNY">CNY - หยวน</option>
                  <option value="JPY">JPY - เยน</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Exchange Rate', 'อัตราแลกเปลี่ยน')}</label>
                <input type="number" value={exchangeRate} onChange={e => setExchangeRate(Number(e.target.value))} className={styles.formInput} step="0.0001" />
              </div>
            </div>

            <h3 style={{ marginTop: 30, marginBottom: 15, fontSize: 16, fontWeight: 600 }}>{L('Import Items', 'รายการสินค้านำเข้า')}</h3>

            <div style={{ overflowX: 'auto' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: '10%' }}>{L('Code', 'รหัส')}</th>
                    <th style={{ width: '15%' }}>{L('Product', 'สินค้า')}</th>
                    <th style={{ width: '15%' }}>{L('Description', 'รายละเอียด')}</th>
                    <th style={{ width: '8%' }}>{L('Qty', 'จำนวน')}</th>
                    <th style={{ width: '8%' }}>{L('Unit', 'หน่วย')}</th>
                    <th style={{ width: '10%' }}>{L('Price', 'ราคา')}</th>
                    <th style={{ width: '10%' }}>{L('Total', 'รวม')}</th>
                    <th style={{ width: '10%' }}>{L('HS Code', 'HS Code')}</th>
                    <th style={{ width: '10%' }}>{L('Origin', 'ประเทศ')}</th>
                    <th style={{ width: '4%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td><input type="text" value={item.product_code} onChange={e => updateItem(i, 'product_code', e.target.value)} className={styles.formInput} style={{ width: '100%' }} /></td>
                      <td><input type="text" value={item.product_name} onChange={e => updateItem(i, 'product_name', e.target.value)} className={styles.formInput} style={{ width: '100%' }} /></td>
                      <td><input type="text" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} className={styles.formInput} style={{ width: '100%' }} /></td>
                      <td><input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} className={styles.formInput} min="0.01" step="0.01" style={{ width: '100%' }} /></td>
                      <td><input type="text" value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)} className={styles.formInput} style={{ width: '100%' }} /></td>
                      <td><input type="number" value={item.unit_price} onChange={e => updateItem(i, 'unit_price', e.target.value)} className={styles.formInput} min="0" step="0.01" style={{ width: '100%' }} /></td>
                      <td><input type="number" value={item.total_price} readOnly className={styles.formInput} style={{ width: '100%', background: '#f5f5f5' }} /></td>
                      <td><input type="text" value={item.hs_code} onChange={e => updateItem(i, 'hs_code', e.target.value)} className={styles.formInput} style={{ width: '100%' }} /></td>
                      <td><input type="text" value={item.country_of_origin} onChange={e => updateItem(i, 'country_of_origin', e.target.value)} className={styles.formInput} style={{ width: '100%' }} /></td>
                      <td style={{ textAlign: 'center' }}>
                        <button type="button" onClick={() => removeItem(i)} disabled={items.length === 1} className={styles.btnDanger} style={{ padding: '6px 12px' }}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button type="button" onClick={addItem} className={styles.btnSecondary} style={{ marginTop: 10 }}>+ {L('Add Item', 'เพิ่มรายการ')}</button>

            <div style={{ textAlign: 'right', marginTop: 20, padding: '16px', background: '#f9fafb', borderRadius: 8 }}>
              <div style={{ fontSize: 15, marginBottom: 8 }}>{L('Total Quantity', 'จำนวนรวม')}: <strong>{totals.quantity.toLocaleString()}</strong></div>
              <div style={{ fontSize: 18, fontWeight: 'bold' }}>{L('Total Amount', 'มูลค่ารวม')}: <strong>{totals.amount.toLocaleString()} {currency}</strong></div>
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
