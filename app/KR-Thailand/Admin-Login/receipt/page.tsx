"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'
import CreatedBy from '../components/CreatedBy'
import styles from '../admin-theme.module.css'

type ReceiptRecord = {
  date: string
  method: string
  amount: number
  reference: string
  invoice_no?: string
  invNo?: string
}

export default function ReceiptPage() {
  const router = useRouter()
  const [receiptNo, setReceiptNo] = useState('')
  const [receiptDate, setReceiptDate] = useState(() => new Date().toISOString().split('T')[0])
  const [records, setRecords] = useState<ReceiptRecord[]>([{ date: '', method: 'Cash', amount: 0, reference: '' }])
  const [invNo, setInvNo] = useState('')
  const [invoiceInfo, setInvoiceInfo] = useState<{ invID: number; invNo: string; total_amount: number; status: string } | null>(null)
  const [invoicePaidAmount, setInvoicePaidAmount] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [savedReceipts, setSavedReceipts] = useState<any[] | null>(null)
  const [showReceiptModal, setShowReceiptModal] = useState(false)

  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [invoices, setInvoices] = useState<any[] | null>(null)
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const [invoiceLoading, setInvoiceLoading] = useState(false)

  useEffect(() => {
    if (!showReceiptModal) return
    const t = setTimeout(() => { setShowReceiptModal(false); setSavedReceipts(null) }, 8000)
    return () => clearTimeout(t)
  }, [showReceiptModal])

  async function openInvoiceSearch() {
    setShowInvoiceModal(true)
    if (invoices !== null) return
    try {
      setInvoiceLoading(true)
      const res = await fetch('/api/invoices?limit=50')
      const j = await res.json()
      if (res.ok && j && j.success) {
        const data = j.invoices || j.list || (Array.isArray(j) ? j : [])
        setInvoices(Array.isArray(data) ? data : [])
      } else {
        setInvoices([])
      }
    } catch (e) { console.error('Failed to fetch invoices', e); setInvoices([]) }
    finally { setInvoiceLoading(false) }
  }

  function closeInvoiceSearch() { setShowInvoiceModal(false); setInvoiceSearch('') }

  async function selectInvoice(inv: any) {
    const invNo = inv.invNo || inv.inv_id || inv.invoice_no || inv.invNo
    if (!invNo) return
    try {
      // Fetch invoice details explicitly
      const invRes = await fetch(`/api/invoices?invNo=${encodeURIComponent(String(invNo))}`)
      const invJson = await invRes.json()
      if (!invRes.ok || !invJson || !invJson.success || !invJson.invoice) {
        alert(L('Invoice not found', 'ไม่พบใบแจ้งหนี้'))
        setInvoiceInfo(null)
        return
      }
      const invoice = invJson.invoice

      // Fetch existing receipts/payments for this invoice to compute remaining amount
      const payRes = await fetch(`/api/receipts?invNo=${encodeURIComponent(String(invNo))}&limit=100`)
      const payJson = await payRes.json()
      const receiptsList = (payJson && payJson.success && Array.isArray(payJson.receipts)) ? payJson.receipts : []

      const invoiceAmount = Number(invoice.total_amount || invoice.amount || 0)
      const paidAmount = receiptsList.reduce((sum: number, r: any) => sum + Number(r.amount || 0), 0)
      const remaining = Math.max(0, invoiceAmount - paidAmount)

      setInvoiceInfo({ invID: invoice.invID, invNo: invoice.invNo, total_amount: invoiceAmount, status: invoice.status })
      setInvoicePaidAmount(paidAmount)
      setInvNo(String(invNo))
      const today = new Date().toISOString().split('T')[0]
      setRecords([{
        date: today,
        method: 'Bank Transfer',
        amount: remaining,
        reference: '',
        invoice_no: invNo
      }])
      alert(L('Invoice imported. Remaining amount: ', 'นำเข้าใบแจ้งหนี้แล้ว ยอดค้างชำระ: ') + remaining.toFixed(2) + ' ฿')
    } catch (err) { console.error(err); alert(L('Server error while fetching invoice', 'เกิดข้อผิดพลาดขณะดึงข้อมูล')) }
    finally { closeInvoiceSearch() }
  }

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

  const L = (en: string, th: string) => locale === 'th' ? th : en

  // Load initial receipt number
  useEffect(() => {
    refreshReceiptNo()
  }, [])

  const refreshReceiptNo = async () => {
    try {
      const res = await fetch('/api/receipt-seq')
      const j = await res.json()
      if (j && j.success && j.formatted) {
        setReceiptNo(j.formatted)
      }
      // Also update date to today
      const today = new Date().toISOString().split('T')[0]
      setReceiptDate(today)
      // Update first record date if empty
      setRecords(prev => {
        if (prev.length > 0 && !prev[0].date) {
          const copy = [...prev]
          copy[0] = { ...copy[0], date: today }
          return copy
        }
        return prev
      })
    } catch (err) {
      console.error('Failed to get receipt number:', err)
      // Fallback to local generation
      const now = new Date()
      const yy = String(now.getFullYear()).slice(-2)
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      setReceiptNo(`RC-${yy}${mm}${dd}-0001`)
    }
  }

  function addRow() { setRecords([...records, { date: '', method: 'Cash', amount: 0, reference: '' }]) }
  function update(i: number, key: keyof ReceiptRecord, value: string | number) {
    const c = [...records]
    const record = { ...c[i] }
    if (key === 'amount') record.amount = Number(value)
    else if (key === 'invoice_no') record.invoice_no = String(value)
    else if (key === 'invNo') record.invNo = String(value)
    else if (key === 'date') record.date = String(value)
    else if (key === 'method') record.method = String(value)
    else record.reference = String(value)
    c[i] = record
    setRecords(c)
  }
  function removeRow(i: number) {
    setRecords(records.filter((_, idx) => idx !== i))
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!receiptNo) {
      alert(L('Please enter receipt number', 'กรุณาใส่เลขที่ใบรับเงิน'))
      return
    }
    setLoading(true);
    ;(async () => {
      try {
        const createdBy = (typeof window !== 'undefined' && (localStorage?.k_system_admin_user || localStorage?.getItem?.('k_system_admin_user'))) || 'thailand admin'
        // compute outstanding after this submission when linked to an invoice
        const invoiceTotal = invoiceInfo ? Number(invoiceInfo.total_amount || 0) : 0
        const paidSoFar = Number(invoicePaidAmount || 0)
        const currentSubmissionTotal = totalAmount
        const outstandingAfter = invoiceInfo ? Math.max(0, invoiceTotal - paidSoFar - currentSubmissionTotal) : 0
        const outstandingNote = outstandingAfter > 0 ? (L('Outstanding after payment: ', 'ยอดคงเหลือหลังการชำระ: ') + outstandingAfter.toFixed(2) + ' ฿') : ''

        const payload = {
          invNo: invNo || null,
          receiptNo,
          receiptDate,
          receipts: records.map((r) => {
            const baseRef = r.reference || ''
            const refWithOutstanding = outstandingNote ? (baseRef ? baseRef + ' | ' + outstandingNote : outstandingNote) : baseRef
            return {
              receiptNo,
              date: r.date || receiptDate,
              method: r.method,
              amount: r.amount,
              reference: refWithOutstanding,
              amount_out: outstandingAfter
            }
          }),
          created_by: createdBy
        }
        const res = await fetch('/api/receipts', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        })
        const j = await res.json()
        if (res.ok && j && j.success) {
          // After successful save, show list page
          router.push('/KR-Thailand/Admin-Login/receipt/list')
        } else {
          alert(L('Save failed:','บันทึกไม่สำเร็จ:') + ' ' + (j && j.error ? j.error : res.statusText))
        }
      } catch (err) {
        console.error(err)
        alert(L('Server error while saving receipts', 'เกิดข้อผิดพลาดขณะบันทึก'))
      } finally {
        setLoading(false)
      }
    })()
  }

  const totalAmount = records.reduce((sum, r) => sum + Number(r.amount || 0), 0)

  const paymentMethods = [
    { value: 'Cash', label: L('Cash', 'เงินสด') },
    { value: 'Bank Transfer', label: L('Bank Transfer', 'โอนเงิน') },
    { value: 'Credit Card', label: L('Credit Card', 'บัตรเครดิต') },
    { value: 'Check', label: L('Check', 'เช็ค') }
  ]

  return (
    <AdminLayout title="Receipt" titleTh="ใบรับเงิน">
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/>
              <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
              <path d="M12 17.5v-11"/>
            </svg>
            {L('Payment Receipt', 'ใบรับเงิน')}
          </h2>
          <p className={styles.cardSubtitle}>
            {L('Record payment transactions', 'บันทึกรายการรับชำระเงิน')}
          </p>
        </div>

        <div className={styles.cardBody}>
          <CreatedBy />
          <form onSubmit={handleSave}>
            {/* Receipt Number & Date */}
            <div className={styles.formRow} style={{ marginBottom: 16 }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Receipt No.', 'เลขที่ใบรับเงิน')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    value={receiptNo}
                    onChange={e => setReceiptNo(e.target.value)}
                    className={styles.formInput}
                    placeholder="RC-260124-0001"
                    required
                    style={{ flex: 1 }}
                  />
                  <button type="button" className={styles.btnOutline} onClick={refreshReceiptNo}>
                    {L('Refresh', 'รีเฟรช')}
                  </button>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Date', 'วันที่')}</label>
                <input
                  type="date"
                  value={receiptDate}
                  readOnly
                  title={L('Fixed to today', 'ตั้งเป็นวันที่ปัจจุบัน')}
                  className={styles.formInput}
                />
              </div>
            </div>

            {/* Import from Invoice */}
            <div style={{ marginBottom: 16, padding: 12, background: '#f0f9ff', borderRadius: 8, border: '1px solid #bae6fd' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, color: '#0369a1' }}>{L('Import from Invoice:', 'นำเข้าจากใบแจ้งหนี้:')}</span>
                <input value={invNo} onChange={e => setInvNo(e.target.value)} placeholder={L('Invoice No.', 'เลขที่ใบแจ้งหนี้')} className={styles.formInput} style={{ maxWidth: 200 }} />
                <button type="button" onClick={async () => {
                  if (!invNo) return alert(L('Enter invoice number', 'กรอกเลขที่ใบแจ้งหนี้'))
                  try {
                    const res = await fetch(`/api/receipts?invNo=${encodeURIComponent(invNo)}&limit=1`)
                    const j = await res.json()
                    if (res.ok && j && j.success) {
                      if (j.invoice) {
                        setInvoiceInfo(j.invoice)
                        // Auto-fill payment record with invoice amount
                        const today = new Date().toISOString().split('T')[0]
                        const invoiceAmount = Number(j.invoice.total_amount) || 0
                        // Calculate remaining amount if there are existing receipts
                        const paidAmount = (j.receipts || []).reduce((sum: number, r: any) => sum + Number(r.amount || 0), 0)
                        const remaining = Math.max(0, invoiceAmount - paidAmount)
                        setRecords([{
                          date: today,
                          method: 'Bank Transfer',
                          amount: remaining,
                          reference: '',
                          invoice_no: invNo
                        }])
                        setInvoicePaidAmount(paidAmount)
                        alert(L('Invoice imported. Remaining amount: ', 'นำเข้าใบแจ้งหนี้แล้ว ยอดค้างชำระ: ') + remaining.toFixed(2) + ' ฿')
                      } else if (j.receipts && j.receipts.length > 0) {
                        setInvoiceInfo({ invID: j.receipts[0].invID, invNo: j.receipts[0].invoice_no, total_amount: j.receipts[0].invoice_total, status: j.receipts[0].invoice_status })
                      } else {
                        setInvoiceInfo(null)
                      }
                    } else {
                      setInvoiceInfo(null)
                      alert(L('Invoice not found', 'ไม่พบใบแจ้งหนี้'))
                    }
                  } catch (err) {
                    console.error(err)
                    alert(L('Server error while fetching invoice', 'เกิดข้อผิดพลาดขณะดึงข้อมูล'))
                  }
                }} className={styles.btnOutline} style={{ padding: '8px 12px' }}>
                  {L('Import Invoice', 'นำเข้าใบแจ้งหนี้')}
                </button>
                <button type="button" onClick={() => openInvoiceSearch()} className={`${styles.btn} ${styles.btnPrimary}`} style={{ padding: '8px 12px', marginLeft: 8 }}>
                  {L('Search Invoice', 'ค้นหาใบแจ้งหนี้')}
                </button>
              </div>
            </div>
            {invoiceInfo && (
              <div style={{ marginBottom: 12, padding: '8px 12px', background: '#f8fafc', borderRadius: 6 }}>
                <div><strong>{L('Invoice', 'ใบแจ้งหนี้')}:</strong> {invoiceInfo.invNo}</div>
                <div><strong>{L('Total', 'ยอดรวม')}:</strong> {Number(invoiceInfo.total_amount || 0).toFixed(2)} ฿</div>
                <div><strong>{L('Status', 'สถานะ')}:</strong> {invoiceInfo.status}</div>
                <div style={{ marginTop: 6 }}>
                  <div><strong>{L('Paid so far', 'ยอดที่จ่ายแล้ว')}:</strong> {Number(invoicePaidAmount || 0).toFixed(2)} ฿</div>
                  <div><strong>{L('Remaining after this payment', 'ยอดคงเหลือหลังการชำระนี้')}:</strong> {Math.max(0, (Number(invoiceInfo.total_amount || 0) - Number(invoicePaidAmount || 0) - records.reduce((s, r) => s + Number(r.amount || 0), 0))).toFixed(2)} ฿</div>
                </div>
              </div>
            )}
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: '160px' }}>{L('Date', 'วันที่')}</th>
                  <th style={{ width: '160px' }}>{L('Invoice No.', 'เลขที่ใบแจ้งหนี้')}</th>
                  <th style={{ width: '160px' }}>{L('Payment Method', 'ช่องทางชำระ')}</th>
                  <th style={{ width: '160px' }}>{L('Amount', 'จำนวนเงิน')}</th>
                  <th>{L('Reference', 'อ้างอิง / หมายเหตุ')}</th>
                  <th style={{ width: '80px' }}></th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={i}>
                    <td>
                      <input
                        type="date"
                        value={r.date}
                        onChange={e => update(i, 'date', e.target.value)}
                        className={styles.formInput}
                      />
                    </td>
                    <td>
                      <input
                        value={r.invoice_no || r.invNo || invNo || (invoiceInfo && invoiceInfo.invNo) || ''}
                        onChange={e => update(i, 'invoice_no', e.target.value)}
                        placeholder={L('Invoice No.', 'เลขที่ใบแจ้งหนี้')}
                        className={styles.formInput}
                      />
                    </td>
                    <td>
                      <select
                        value={r.method}
                        onChange={e => update(i, 'method', e.target.value)}
                        className={styles.formSelect}
                      >
                        {paymentMethods.map(m => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        value={r.amount}
                        onChange={e => update(i, 'amount', e.target.value)}
                        className={styles.formInput}
                        style={{ textAlign: 'right' }}
                      />
                    </td>
                    <td>
                      <input
                        placeholder={L('Reference / Note', 'อ้างอิง / หมายเหตุ')}
                        value={r.reference}
                        onChange={e => update(i, 'reference', e.target.value)}
                        className={styles.formInput}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => removeRow(i)}
                        className={styles.btnOutline}
                        style={{ padding: '4px 8px' }}
                      >
                        {L('Remove', 'ลบ')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <button type="button" onClick={addRow} className={styles.btnOutline}>
                + {L('Add Record', 'เพิ่มบันทึก')}
              </button>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', minWidth: '200px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 700 }}>
                  <span>{L('Total', 'รวม')}:</span>
                  <span style={{ color: '#255899' }}>{totalAmount.toFixed(2)} ฿</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', marginTop: '20px' }}>
              <button type="submit" disabled={loading} className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                </svg>
                {loading ? L('Saving...', 'กำลังบันทึก...') : L('Save Receipt', 'บันทึกใบรับเงิน')}
              </button>
              <button type="button" onClick={() => router.back()} className={`${styles.btn} ${styles.btnSecondary}`}>
                {L('Cancel', 'ยกเลิก')}
              </button>
            </div>
          </form>
        </div>
      </div>
      {showInvoiceModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ width: '90%', maxWidth: 900, background: '#fff', borderRadius: 8, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontWeight: 700 }}>{L('Select Invoice', 'เลือกใบแจ้งหนี้')}</div>
              <div>
                <input placeholder={L('Search by invoice no or customer', 'ค้นหาโดยเลขที่หรือชื่อลูกค้า')} value={invoiceSearch} onChange={e => setInvoiceSearch(e.target.value)} style={{ padding: 8, width: 320, border: '1px solid #e5e7eb', borderRadius: 6 }} />
                <button onClick={closeInvoiceSearch} style={{ marginLeft: 8, padding: '6px 10px' }}>✕</button>
              </div>
            </div>
            <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
              {invoiceLoading && <div>Loading…</div>}
              {!invoiceLoading && invoices && invoices.length === 0 && <div style={{ color: '#666' }}>{L('No invoices found', 'ไม่พบใบแจ้งหนี้')}</div>}
              {!invoiceLoading && invoices && invoices.length > 0 && (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ borderBottom: '1px solid #eee', padding: 8 }}>{L('Invoice No', 'เลขที่')}</th>
                      <th style={{ borderBottom: '1px solid #eee', padding: 8 }}>{L('Date', 'วันที่')}</th>
                      <th style={{ borderBottom: '1px solid #eee', padding: 8 }}>{L('Customer', 'ลูกค้า')}</th>
                      <th style={{ borderBottom: '1px solid #eee', padding: 8, textAlign: 'right' }}>{L('Total', 'ยอดรวม')}</th>
                      <th style={{ borderBottom: '1px solid #eee', padding: 8 }}>{L('', '')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.filter(inv => {
                      if (!invoiceSearch) return true
                      const s = invoiceSearch.toLowerCase()
                      const invNo = String(inv.invNo || inv.inv_id || inv.invoice_no || '')
                      const cust = String(inv.customer_name || inv.cusName || inv.customer || '')
                      return invNo.toLowerCase().includes(s) || cust.toLowerCase().includes(s)
                    }).map((inv: any) => (
                      <tr key={inv.invNo || inv.inv_id || inv.invoice_no}>
                        <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>{inv.invNo || inv.invoice_no || inv.inv_id}</td>
                        <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>{inv.invoice_date || inv.invDate || '-'}</td>
                        <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>{inv.customer_name || inv.customer || '-'}</td>
                        <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6', textAlign: 'right' }}>{Number(inv.total_amount || inv.amount || 0).toFixed(2)}</td>
                        <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}><button onClick={() => selectInvoice(inv)} className={styles.btn}>Select</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
      {showReceiptModal && savedReceipts && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
          <div style={{ minWidth: 280, maxWidth: '96vw', background: '#fff', padding: 12, borderRadius: 10, boxShadow: '0 6px 18px rgba(0,0,0,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700 }}>{L('Receipt saved', 'บันทึกใบรับเงินแล้ว')}</div>
              <button onClick={() => { setShowReceiptModal(false); setSavedReceipts(null) }} style={{ background: 'transparent', border: 'none', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ marginTop: 8 }}>
              {savedReceipts.map((r: any) => (
                <div key={r.receiptID} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderTop: '1px solid #f1f5f9' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0b5394' }}>{r.receiptNo}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{new Date(r.receiptDate).toLocaleString()}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <a href={`/KR-Thailand/Admin-Login/receipt/print?receiptID=${r.receiptID}`} target="_blank" rel="noreferrer">
                      <button className={styles.btnOutline} aria-label={L('Print', 'พิมพ์')} title={L('Print', 'พิมพ์')} style={{ padding: 4, width: 40, height: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0b5394" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                      </button>
                    </a>
                    <button onClick={() => { navigator.clipboard?.writeText(r.receiptNo); }} className={styles.btnOutline} style={{ padding: '6px 10px' }}>{L('Copy', 'คัดลอก')}</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <a href="/KR-Thailand/Admin-Login/receipt/list"><button className={`${styles.btn} ${styles.btnSecondary}`}>{L('View All', 'ดูทั้งหมด')}</button></a>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
