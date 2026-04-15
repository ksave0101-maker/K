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

export default function CreateExpenseBillPage() {
  const router = useRouter()

  const [ebNo, setEbNo] = useState('')
  const [ebDate, setEbDate] = useState(() => new Date().toISOString().split('T')[0])
  const [expenseType, setExpenseType] = useState('operational')
  const [category, setCategory] = useState('office_supplies')
  const [vendorName, setVendorName] = useState('')
  const [vendorInvoiceNo, setVendorInvoiceNo] = useState('')
  const [department, setDepartment] = useState('')
  const [projectCode, setProjectCode] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer')
  const [paymentStatus, setPaymentStatus] = useState('unpaid')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')

  const [items, setItems] = useState<ItemType[]>([{ description: '', quantity: 1, unit_price: 0 }])
  const vatRate = 7
  const [totals, setTotals] = useState({ amount: 0, vat: 0, total: 0 })

  const [loading, setLoading] = useState(false)
  const [refreshingEbNo, setRefreshingEbNo] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [messageBar, setMessageBar] = useState<{ type: 'success' | 'error', text: string } | null>(null)

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
    refreshEbNo()
  }, [])

  useEffect(() => {
    const amount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
    const vat = (amount * vatRate) / 100
    const total = amount + vat
    setTotals({ amount, vat, total })
  }, [items, vatRate])

  async function refreshEbNo() {
    setRefreshingEbNo(true)
    try {
      const res = await fetch('/api/documents/generate-number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'eb' })
      })
      const j = await res.json()
      if (res.ok && j.success && j.docNo) {
        setEbNo(j.docNo)
      } else {
        throw new Error(j.error || 'Failed to generate EB number')
      }
      setEbDate(new Date().toISOString().split('T')[0])
    } catch (err) {
      console.error('Failed to get expense bill number:', err)
      const now = new Date()
      const yyyy = String(now.getFullYear())
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      setEbNo(`EB-${yyyy}${mm}${dd}-00001`)
    } finally {
      setRefreshingEbNo(false)
    }
  }

  function addItem() {
    setItems([...items, { description: '', quantity: 1, unit_price: 0 }])
  }

  function updateItem(i: number, key: keyof ItemType, value: string | number) {
    const copy = [...items]
    const item = { ...copy[i] }
    if (key === 'description') item.description = String(value)
    else if (key === 'quantity') item.quantity = Number(value)
    else item.unit_price = Number(value)
    copy[i] = item
    setItems(copy)
  }

  function removeItem(i: number) {
    if (items.length === 1) return
    setItems(items.filter((_, idx) => idx !== i))
  }

  function validate() {
    const errs: string[] = []

    if (!expenseType) errs.push(L('Expense type is required', 'กรุณาเลือกประเภทค่าใช้จ่าย'))
    if (!category) errs.push(L('Category is required', 'กรุณาเลือกหมวดหมู่'))
    if (!vendorName) errs.push(L('Vendor name is required', 'กรุณาระบุชื่อผู้ขาย'))
    if (!department) errs.push(L('Department is required', 'กรุณาระบุแผนก'))

    if (items.length === 0) errs.push(L('At least 1 item required', 'ต้องมีอย่างน้อย 1 รายการ'))

    items.forEach((item, idx) => {
      if (!item.description) errs.push(L(`Item ${idx + 1} needs description`, `รายการที่ ${idx + 1} ต้องมีคำอธิบาย`))
      if (item.quantity <= 0) errs.push(L(`Item ${idx + 1} quantity must be > 0`, `รายการที่ ${idx + 1} จำนวนต้อง > 0`))
      if (item.unit_price < 0) errs.push(L(`Item ${idx + 1} price cannot be negative`, `รายการที่ ${idx + 1} ราคาต้องไม่ติดลบ`))
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
        ebNo,
        ebDate,
        expense_type: expenseType,
        category,
        vendor_name: vendorName,
        vendor_invoice_no: vendorInvoiceNo || null,
        department,
        project_code: projectCode || null,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price
        })),
        amount: totals.amount,
        vat: totals.vat,
        total_amount: totals.total,
        description,
        notes,
        created_by
      }

      const res = await fetch('/api/expense-bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const j = await res.json()

      if (res.ok && j.success) {
        setMessageBar({ type: 'success', text: L('Expense bill created successfully', 'สร้างบิลค่าใช้จ่ายสำเร็จ') })
        setTimeout(() => router.push('/KR-Thailand/Admin-Login/documents/expense-bills'), 900)
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
    <AdminLayout title="Create Expense Bill" titleTh="สร้างบิลค่าใช้จ่าย">
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
              <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
            {L('Create Expense Bill', 'สร้างบิลค่าใช้จ่าย')}
          </h2>
        </div>

        <div className={styles.cardBody}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('EB No.', 'เลขที่ EB')}</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="text"
                    value={ebNo || L('Auto-generated', 'สร้างอัตโนมัติ')}
                    disabled
                    className={styles.formInput}
                    style={{ background: '#f5f5f5', flex: 1 }}
                  />
                  <button type="button" className={styles.btnOutline} onClick={refreshEbNo} disabled={refreshingEbNo}>
                    {refreshingEbNo ? L('Refreshing...', 'กำลังรีเฟรช...') : L('Refresh', 'รีเฟรช')}
                  </button>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Date', 'วันที่')}</label>
                <input type="date" value={ebDate} readOnly className={styles.formInput} style={{ background: '#f5f5f5' }} />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Expense Type', 'ประเภทค่าใช้จ่าย')} <span style={{ color: '#dc2626' }}>*</span></label>
                <select value={expenseType} onChange={e => setExpenseType(e.target.value)} className={styles.formInput}>
                  <option value="operational">{L('Operational', 'การดำเนินงาน')}</option>
                  <option value="administrative">{L('Administrative', 'บริหาร')}</option>
                  <option value="marketing">{L('Marketing', 'การตลาด')}</option>
                  <option value="maintenance">{L('Maintenance', 'ซ่อมบำรุง')}</option>
                  <option value="utilities">{L('Utilities', 'สาธารณูปโภค')}</option>
                  <option value="other">{L('Other', 'อื่นๆ')}</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Category', 'หมวดหมู่')} <span style={{ color: '#dc2626' }}>*</span></label>
                <select value={category} onChange={e => setCategory(e.target.value)} className={styles.formInput}>
                  <option value="office_supplies">{L('Office Supplies', 'อุปกรณ์สำนักงาน')}</option>
                  <option value="travel">{L('Travel', 'เดินทาง')}</option>
                  <option value="meals">{L('Meals', 'อาหาร')}</option>
                  <option value="utilities">{L('Utilities', 'สาธารณูปโภค')}</option>
                  <option value="rent">{L('Rent', 'ค่าเช่า')}</option>
                  <option value="insurance">{L('Insurance', 'ประกัน')}</option>
                  <option value="professional_fees">{L('Professional Fees', 'ค่าบริการ')}</option>
                  <option value="other">{L('Other', 'อื่นๆ')}</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Vendor Name', 'ชื่อผู้ขาย')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" value={vendorName} onChange={e => setVendorName(e.target.value)} className={styles.formInput} placeholder={L('Enter vendor name', 'กรอกชื่อผู้ขาย')} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Vendor Invoice No.', 'เลขที่ใบแจ้งหนี้ผู้ขาย')}</label>
                <input type="text" value={vendorInvoiceNo} onChange={e => setVendorInvoiceNo(e.target.value)} className={styles.formInput} placeholder={L('Vendor invoice number', 'เลขที่ใบแจ้งหนี้')} />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Department', 'แผนก')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" value={department} onChange={e => setDepartment(e.target.value)} className={styles.formInput} placeholder={L('Department name', 'ชื่อแผนก')} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Project Code', 'รหัสโครงการ')}</label>
                <input type="text" value={projectCode} onChange={e => setProjectCode(e.target.value)} className={styles.formInput} placeholder={L('Project code if applicable', 'รหัสโครงการถ้ามี')} />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Payment Method', 'วิธีชำระเงิน')}</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className={styles.formInput}>
                  <option value="cash">{L('Cash', 'เงินสด')}</option>
                  <option value="bank_transfer">{L('Bank Transfer', 'โอนเงิน')}</option>
                  <option value="cheque">{L('Cheque', 'เช็ค')}</option>
                  <option value="credit_card">{L('Credit Card', 'บัตรเครดิต')}</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Payment Status', 'สถานะการชำระเงิน')}</label>
                <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} className={styles.formInput}>
                  <option value="paid">{L('Paid', 'ชำระแล้ว')}</option>
                  <option value="unpaid">{L('Unpaid', 'ยังไม่ชำระ')}</option>
                  <option value="partial">{L('Partial', 'ชำระบางส่วน')}</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{L('Description', 'คำอธิบาย')}</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className={styles.formInput} rows={2} placeholder={L('Overall description...', 'คำอธิบายโดยรวม...')} />
            </div>

            <h3 style={{ marginTop: 30, marginBottom: 15, fontSize: 16, fontWeight: 600 }}>{L('Expense Items', 'รายการค่าใช้จ่าย')}</h3>

            <div style={{ overflowX: 'auto' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: '45%' }}>{L('Description', 'คำอธิบาย')}</th>
                    <th style={{ width: '15%' }}>{L('Quantity', 'จำนวน')}</th>
                    <th style={{ width: '17%' }}>{L('Unit Price', 'ราคาต่อหน่วย')}</th>
                    <th style={{ width: '18%' }}>{L('Total', 'รวม')}</th>
                    <th style={{ width: '5%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td><input type="text" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} className={styles.formInput} style={{ width: '100%' }} placeholder={L('Item description', 'รายละเอียด')} /></td>
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
                  <span style={{ color: '#0ea5e9' }}>{totals.total.toFixed(2)}</span>
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
