"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../../../components/AdminLayout'
import styles from '../../../admin-theme.module.css'

type ItemType = {
  description: string
  invoice_ref: string
  amount: number
}

export default function CreatePaymentVoucherPage() {
  const router = useRouter()

  const [pvNo, setPvNo] = useState('')
  const [pvDate, setPvDate] = useState(() => new Date().toISOString().split('T')[0])
  const [payeeName, setPayeeName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer')
  const [bankName, setBankName] = useState('')
  const [referenceNo, setReferenceNo] = useState('')
  const [notes, setNotes] = useState('')

  const [items, setItems] = useState<ItemType[]>([{ description: '', invoice_ref: '', amount: 0 }])
  const [totalAmount, setTotalAmount] = useState(0)

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
    const total = items.reduce((sum, item) => sum + item.amount, 0)
    setTotalAmount(total)
  }, [items])

  function addItem() {
    setItems([...items, { description: '', invoice_ref: '', amount: 0 }])
  }

  function updateItem(i: number, key: keyof ItemType, value: any) {
    const copy = [...items]
    const item = { ...copy[i] }
    if (key === 'amount') item.amount = Number(value)
    else if (key === 'invoice_ref') item.invoice_ref = String(value)
    else item.description = String(value)
    copy[i] = item
    setItems(copy)
  }

  function removeItem(i: number) {
    if (items.length === 1) return
    setItems(items.filter((_, idx) => idx !== i))
  }

  function validate() {
    const errs: string[] = []

    if (!payeeName) errs.push(L('Payee name is required', 'กรุณาระบุชื่อผู้รับเงิน'))
    if (!paymentMethod) errs.push(L('Payment method is required', 'กรุณาเลือกวิธีชำระเงิน'))

    if (items.length === 0) errs.push(L('At least 1 item required', 'ต้องมีอย่างน้อย 1 รายการ'))

    items.forEach((item, idx) => {
      if (!item.description) errs.push(L(`Item ${idx + 1} needs description`, `รายการที่ ${idx + 1} ต้องมีคำอธิบาย`))
      if (item.amount <= 0) errs.push(L(`Item ${idx + 1} amount must be > 0`, `รายการที่ ${idx + 1} จำนวนเงินต้อง > 0`))
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
        pvDate,
        payee_name: payeeName,
        payment_method: paymentMethod,
        bank_name: bankName || null,
        reference_no: referenceNo || null,
        items: items.map(item => ({
          description: item.description,
          invoice_ref: item.invoice_ref,
          amount: item.amount
        })),
        total_amount: totalAmount,
        notes,
        created_by
      }

      const res = await fetch('/api/payment-vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const j = await res.json()

      if (res.ok && j.success) {
        setMessageBar({ type: 'success', text: L('Payment voucher created successfully', 'สร้างใบชำระเงินสำเร็จ') })
        setTimeout(() => router.push('/KR-Thailand/Admin-Login/documents/payment-vouchers'), 900)
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
    <AdminLayout title="Create Payment Voucher" titleTh="สร้างใบชำระเงิน">
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
            {L('Create Payment Voucher', 'สร้างใบชำระเงิน')}
          </h2>
        </div>

        <div className={styles.cardBody}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('PV No.', 'เลขที่ PV')}</label>
                <input type="text" value={pvNo || L('Auto-generated', 'สร้างอัตโนมัติ')} disabled className={styles.formInput} style={{ background: '#f5f5f5' }} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Date', 'วันที่')}</label>
                <input type="date" value={pvDate} readOnly className={styles.formInput} style={{ background: '#f5f5f5' }} />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Payee Name', 'ชื่อผู้รับเงิน')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" value={payeeName} onChange={e => setPayeeName(e.target.value)} className={styles.formInput} placeholder={L('Enter payee name', 'กรอกชื่อผู้รับเงิน')} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Payment Method', 'วิธีชำระเงิน')} <span style={{ color: '#dc2626' }}>*</span></label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className={styles.formInput}>
                  <option value="cash">{L('Cash', 'เงินสด')}</option>
                  <option value="bank_transfer">{L('Bank Transfer', 'โอนเงิน')}</option>
                  <option value="cheque">{L('Cheque', 'เช็ค')}</option>
                  <option value="credit_card">{L('Credit Card', 'บัตรเครดิต')}</option>
                </select>
              </div>
            </div>

            {(paymentMethod === 'bank_transfer' || paymentMethod === 'cheque') && (
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Bank Name', 'ชื่อธนาคาร')}</label>
                  <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} className={styles.formInput} placeholder={L('Bank name', 'ชื่อธนาคาร')} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Reference No.', 'เลขที่อ้างอิง')}</label>
                  <input type="text" value={referenceNo} onChange={e => setReferenceNo(e.target.value)} className={styles.formInput} placeholder={L('Transfer ref / Cheque no.', 'เลขที่โอน / เลขที่เช็ค')} />
                </div>
              </div>
            )}

            <h3 style={{ marginTop: 30, marginBottom: 15, fontSize: 16, fontWeight: 600 }}>{L('Payment Items', 'รายการชำระเงิน')}</h3>

            <div style={{ overflowX: 'auto' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: '45%' }}>{L('Description', 'คำอธิบาย')}</th>
                    <th style={{ width: '25%' }}>{L('Invoice Ref', 'เลขที่ใบแจ้งหนี้')}</th>
                    <th style={{ width: '25%' }}>{L('Amount', 'จำนวนเงิน')}</th>
                    <th style={{ width: '5%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td><input type="text" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} className={styles.formInput} style={{ width: '100%' }} placeholder={L('What is being paid', 'สิ่งที่ชำระเงิน')} /></td>
                      <td><input type="text" value={item.invoice_ref} onChange={e => updateItem(i, 'invoice_ref', e.target.value)} className={styles.formInput} style={{ width: '100%' }} placeholder={L('Invoice number', 'เลขที่ใบแจ้งหนี้')} /></td>
                      <td><input type="number" value={item.amount} onChange={e => updateItem(i, 'amount', e.target.value)} className={styles.formInput} min="0" step="0.01" style={{ width: '100%' }} /></td>
                      <td style={{ textAlign: 'center' }}>
                        <button type="button" onClick={() => removeItem(i)} disabled={items.length === 1} className={styles.btnDanger} style={{ padding: '6px 12px', fontSize: '14px' }}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button type="button" onClick={addItem} className={styles.btnSecondary} style={{ marginTop: 10 }}>+ {L('Add Item', 'เพิ่มรายการ')}</button>

            <div style={{ marginTop: 20, padding: 15, background: '#f9fafb', borderRadius: 8, textAlign: 'right' }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>
                {L('Total Amount', 'ยอดรวมทั้งสิ้น')}: <span style={{ color: '#0ea5e9' }}>{totalAmount.toFixed(2)}</span>
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
