"use client"

import React, { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'
import styles from '../admin-theme.module.css'

type Item = {
  desc: string
  qty: number
  unitPrice: number
}

type Customer = {
  name: string
  address: string
  taxId: string
  phone: string
  branch: string
}

const COMPANY_INFO = {
  name: 'K Energy Save Co., Ltd.',
  nameTh: 'บริษัท เค เอนเนอร์ยี่ เซฟ จำกัด',
  address: '84 Chaloem Phrakiat Rama 9 Soi 34\nNong Bon, Prawet\nBangkok 10250, Thailand',
  addressTh: '',
  taxId: '0105568097428',
  phone: '+66 2 080 8916',
  email: 'info@kenergy-save.com',
  branch: 'สาขาประเทศไทย'
}

export default function TaxInvoicePage() {
  const searchParams = useSearchParams()
  const printRef = useRef<HTMLDivElement>(null)
  const [taxInvoiceNo, setTaxInvoiceNo] = useState('')
  const [taxInvoiceCompact, setTaxInvoiceCompact] = useState<string | null>(null)
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().split('T')[0])
  const [customer, setCustomer] = useState<Customer>({ name: '', address: '', taxId: '', phone: '', branch: '' })
  const [items, setItems] = useState<Item[]>([{ desc: '', qty: 1, unitPrice: 0 }])
  const [vatRate] = useState(7)
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedCusId, setSelectedCusId] = useState<string | null>(null)
  const [sourceInvNo, setSourceInvNo] = useState<string | null>(null)
  const [sourceReceiptNo, setSourceReceiptNo] = useState<string | null>(null)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [receipts, setReceipts] = useState<any[] | null>(null)
  const [receiptsLoading, setReceiptsLoading] = useState(false)
  const [receiptsUsed, setReceiptsUsed] = useState<Record<string, boolean>>({})

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

  useEffect(() => {
    // Load customers list
    ;(async () => {
      try {
        const res = await fetch('/api/customers')
        const j = await res.json()
        if (j && j.success && Array.isArray(j.customers)) {
          setCustomers(j.customers)
        }
      } catch (err) {
        console.error('Failed to load customers:', err)
      }
    })()
  }, [])

  const L = (en: string, th: string) => locale === 'th' ? th : en

  // Load initial tax invoice number
  useEffect(() => {
    // If a pre-generated tax-invoice number exists (from list Refresh), use it first
    try {
      const pre = typeof window !== 'undefined' ? (localStorage.getItem('k_system_next_tivNo') || null) : null
      if (pre) {
        setTaxInvoiceNo(pre)
        try { localStorage.removeItem('k_system_next_tivNo') } catch (_) {}
        // set compact to null (server provides compact when using tiv-seq)
        setTaxInvoiceCompact(null)
        // set today's date as invoice date
        setInvoiceDate(new Date().toISOString().split('T')[0])
        return
      }
    } catch (e) { /* ignore */ }
  }, [])

  // Calculate totals
  const subtotal = items.reduce((sum, it) => sum + (it.qty * it.unitPrice), 0)
  const vatAmount = (subtotal * vatRate) / 100
  const grandTotal = subtotal + vatAmount

  // Auto-load invoice and print if requested via query params
  useEffect(() => {
    const invNo = searchParams?.get('invNo')
    const auto = searchParams?.get('autoPrint')
    if (!invNo) return
    ;(async () => {
      try {
        const res = await fetch(`/api/invoices?invNo=${encodeURIComponent(invNo)}`)
        const j = await res.json()
        if (res.ok && j && j.success && j.invoice) {
          const inv = j.invoice
          setTaxInvoiceNo(inv.invNo || '')
          setInvoiceDate(inv.invDate ? (new Date(inv.invDate).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0])
          setCustomer(prev => ({ ...prev, name: inv.customer_name || prev.name }))
          if (inv.items && Array.isArray(inv.items)) {
            setItems(inv.items.map((it: any) => ({ desc: it.description || it.product_name || '', qty: Number(it.quantity || it.qty || 1), unitPrice: Number(it.unit_price || it.unitPrice || it.price || 0) })))
          }
          if (auto === '1' || auto === 'true') {
            // small delay to ensure DOM refs populated
            setTimeout(() => { try { const fn: any = handlePrint; fn() } catch (e) { console.error(e) } }, 300)
          }
        }
      } catch (err) {
        console.error('Failed to load invoice for tax invoice print', err)
      }
    })()
  }, [searchParams])

  // Auto-load tax invoice when opened from list (taxNo query param)
  useEffect(() => {
    const tNo = searchParams?.get('taxNo')
    if (!tNo) return
    ;(async () => {
      try {
        const res = await fetch(`/api/tax-invoices?taxNo=${encodeURIComponent(tNo)}`)
        const j = await res.json()
        if (res.ok && j && j.success && j.taxInvoice) {
          const ti = j.taxInvoice
          setTaxInvoiceNo(ti.taxNo || tNo)
          if (ti.taxDate) {
            try { setInvoiceDate(new Date(ti.taxDate).toISOString().split('T')[0]) } catch { }
          }
          if (ti.customer_name) setCustomer(prev => ({ ...prev, name: ti.customer_name }))
          if (ti.cusID) setSelectedCusId(String(ti.cusID))
          if (ti.items) {
            try {
              const parsed = typeof ti.items === 'string' ? JSON.parse(ti.items) : ti.items
              if (Array.isArray(parsed)) setItems(parsed.map((it: any) => ({ desc: it.desc || it.description || it.product_name || '', qty: Number(it.qty || it.quantity || 1), unitPrice: Number(it.unitPrice || it.unit_price || it.unitPrice || it.price || 0) })))
            } catch (e) { /* ignore */ }
          }
          // populate totals if present
          // allow view-only flow; don't auto-print
        }
      } catch (e) {
        console.error('Failed to load tax invoice by taxNo', e)
      }
    })()
  }, [searchParams])

  function addItem() { setItems([...items, { desc: '', qty: 1, unitPrice: 0 }]) }
  function updateItem(i: number, key: keyof Item, value: any) {
    const copy = [...items]
    if (key === 'desc') {
      copy[i][key] = value
    } else {
      copy[i][key] = Number(value) || 0
    }
    setItems(copy)
  }
  function removeItem(i: number) {
    if (items.length > 1) {
      setItems(items.filter((_, idx) => idx !== i))
    }
  }

  async function refreshTaxInvoiceNo() {
    try {
      // Request server for the next sequential TIV number
      const res = await fetch('/api/tiv-seq')
      const j = await res.json()
      if (res.ok && j && j.success) {
        setTaxInvoiceNo(j.formatted)
        setTaxInvoiceCompact(j.compact)
      } else {
        console.warn('tiv-seq failed, falling back to random')
        const today = new Date()
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const prefix = `TIV-${year}${month}-`
        const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')
        setTaxInvoiceNo(prefix + seq)
        setTaxInvoiceCompact(null)
      }
      // Also update date to today
      setInvoiceDate(new Date().toISOString().split('T')[0])
    } catch (err) {
      console.error('Error generating tax invoice number:', err)
    }
  }

  function handleCustomerSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const cusId = e.target.value
    setSelectedCusId(cusId || null)
    if (!cusId) {
      setCustomer({ name: '', address: '', taxId: '', phone: '', branch: '' })
      return
    }
    const cus = customers.find(c => String(c.cusID || c.id) === cusId)
    if (cus) {
      setCustomer({
        name: cus.fullname || cus.name || '',
        address: cus.address || '',
        taxId: cus.tax_id || cus.taxId || '',
        phone: cus.phone || cus.tel || '',
        branch: cus.branch || ''
      })
    }
  }

  function handlePrint() {
    const printContent = printRef.current
    if (!printContent) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert(L('Please allow popups for printing', 'กรุณาอนุญาต popup สำหรับการพิมพ์'))
      return
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${L('Tax Invoice', 'ใบกำกับภาษี')} - ${taxInvoiceNo}</title>
        <style>
          body { position: relative; }
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Sarabun', sans-serif; font-size: 14px; color: #333; }
          .logo { position: absolute; left: 20px; top: 20px; width: 120px; }
          .tax-invoice { max-width: 210mm; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .header h1 { margin: 0; font-size: 24px; }
          .header h2 { margin: 5px 0; font-size: 18px; color: #666; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .info-box { width: 48%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
          .info-box h3 { margin: 0 0 8px 0; font-size: 14px; color: #666; border-bottom: 1px solid #eee; padding-bottom: 4px; }
          .info-box p { margin: 4px 0; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
          th { background: #f5f5f5; font-weight: 600; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .totals { margin-top: 20px; }
          .totals table { width: 300px; margin-left: auto; }
          .totals td { border: none; padding: 4px 8px; }
          .grand-total { font-size: 16px; font-weight: 700; background: #f0f9ff; }
          .footer { margin-top: 40px; display: flex; justify-content: space-between; }
          .signature-box { width: 200px; text-align: center; }
          .signature-line { border-top: 1px solid #333; margin-top: 60px; padding-top: 8px; }
          @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="logo"><img src="/k-energy-save-logo.jpg" style="width:80px;height:80px;border-radius:8px;object-fit:contain;background:#fff;padding:4px;border:1px solid #ddd" alt="K Energy Save"/></div>
        ${printContent.innerHTML}
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!taxInvoiceNo) {
      alert(L('Please generate Tax Invoice number', 'กรุณาสร้างเลขที่ใบกำกับภาษี'))
      return
    }
    if (!customer.name) {
      alert(L('Please select or enter customer', 'กรุณาเลือกหรือกรอกข้อมูลลูกค้า'))
      return
    }
    setLoading(true)
    ;(async () => {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('k_system_admin_token') || '') : ''
      const createdBy = typeof window !== 'undefined' ? (localStorage.getItem('k_system_admin_user') || 'thailand admin') : 'thailand admin'

      const attemptSave = async () => {
        try {
          const payload: any = {
            taxNo: taxInvoiceNo,
            taxDate: invoiceDate,
            cusID: selectedCusId ? Number(selectedCusId) : null,
            customer_name: customer.name,
            items: items,
            subtotal: Number(subtotal || 0),
            vat: Number(vatAmount || 0),
            total_amount: Number(grandTotal || 0),
            notes: null,
            source_invNo: sourceInvNo,
            source_receiptNo: sourceReceiptNo,
            created_by: createdBy
          }
          const res = await fetch('/api/tax-invoices', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(payload) })
          const j = await res.json().catch(() => null)
          if (!res.ok || !j || !j.success) {
            return { ok: false, res, json: j }
          }
          return { ok: true, res, json: j }
        } catch (err) {
          return { ok: false, res: null, json: null, err }
        }
      }

      try {
        let result = await attemptSave()
        if (!result.ok) {
          const j = result.json
          const errCode = j?.error || null
          if (errCode === 'taxNo_exists') {
            const wantNew = confirm(L('Tax Invoice number already exists. Generate a new number now?', 'เลขที่ใบกำกับภาษีนี้มีอยู่แล้ว ต้องการสร้างเลขใหม่ตอนนี้หรือไม่?'))
            if (wantNew) {
              try {
                await refreshTaxInvoiceNo()
                // retry once
                result = await attemptSave()
              } catch (e) { /* ignore */ }
            }
          }
        }

        if (!result.ok) {
          const j = result.json
          const msg = j?.error || j?.message || (result.res ? result.res.statusText : '') || 'Failed to save'
          alert(L('Failed to save tax invoice: ', 'บันทึกใบกำกับภาษีล้มเหลว: ') + msg)
        } else {
          alert(L('Tax Invoice saved', 'บันทึกใบกำกับภาษีเรียบร้อย'))
          // navigate to list or open created invoice
          try { window.location.href = '/KR-Thailand/Admin-Login/tax-invoice/list' } catch { }
          try { localStorage.removeItem('k_system_next_tivNo') } catch (_) {}
        }
      } catch (err) {
        console.error('Save tax invoice error', err)
        alert(L('Error saving tax invoice', 'เกิดข้อผิดพลาดขณะบันทึก'))
      } finally {
        setLoading(false)
      }
    })()
  }

  const fmtNumber = (n: number) => n.toLocaleString(locale === 'th' ? 'th-TH' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const parseAmount = (v: any) => {
    try {
      if (v === null || v === undefined) return 0
      const s = String(v)
      // remove any non-numeric except dot and minus
      const cleaned = s.replace(/[^0-9.-]+/g, '')
      const n = parseFloat(cleaned)
      return Number.isFinite(n) ? n : 0
    } catch (e) { return 0 }
  }

  return (
    <AdminLayout title="Tax Invoice" titleTh="ใบกำกับภาษี">
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <path d="M9 15h6"/>
              <path d="M9 11h6"/>
            </svg>
            {L('Create Tax Invoice', 'สร้างใบกำกับภาษี')}
          </h2>
          <p className={styles.cardSubtitle}>
            {L('Generate official tax invoice for customers', 'สร้างใบกำกับภาษีอย่างเป็นทางการสำหรับลูกค้า')}
          </p>
        </div>

        <div className={styles.cardBody}>
          <form onSubmit={handleSave}>
            {/* Import from Receipt */}
            <div style={{ marginBottom: 16, padding: 12, background: '#f0f9ff', borderRadius: 8, border: '1px solid #bae6fd' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, color: '#0369a1' }}>{L('Import from Receipt:', 'นำเข้าจากใบเสร็จรับเงิน:')}</span>
                <button type="button" className={styles.btnOutline} onClick={async () => {
                  // open modal and (re)load recent receipts to ensure up-to-date status
                  setShowReceiptModal(true)
                  try {
                    setReceiptsLoading(true)
                    const res = await fetch('/api/receipts?limit=100')
                    const j = await res.json()
                    if (!res.ok || !j.success) {
                      setReceipts([])
                      setReceiptsUsed({})
                    } else {
                      const list = j.receipts || j.list || []
                      // check which receipts already have tax invoices
                      const map: Record<string, boolean> = {}
                      await Promise.all(list.map(async (rr: any) => {
                        const rno = rr.receiptNo || rr.receipt_no || rr.receiptID || rr.id
                        if (!rno) return
                        try {
                          const chk = await fetch(`/api/tax-invoices?source_receiptNo=${encodeURIComponent(rno)}`)
                          const cj = await chk.json().catch(() => null)
                          map[String(rno)] = !!(chk.ok && cj && cj.success && cj.found)
                        } catch (e) { map[String(rno)] = false }
                      }))
                      setReceiptsUsed(map)
                      // show only receipts that are not yet used to create a tax invoice
                      const available = list.filter((rr: any) => {
                        const rno = rr.receiptNo || rr.receipt_no || rr.receiptID || rr.id
                        return !(rno && map[String(rno)])
                      })
                      setReceipts(available)
                    }
                  } catch (e) {
                    console.error('Failed to load receipts', e)
                    setReceipts([])
                  } finally { setReceiptsLoading(false) }
                }}>{L('Import from Receipt', 'นำเข้าจากใบเสร็จ')}</button>
              </div>
            </div>

            {/* Receipt Selection Modal */}
            {showReceiptModal && (
              <div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '90%', maxWidth: 900, background: 'white', borderRadius: 8, padding: 16, boxShadow: '0 6px 24px rgba(0,0,0,0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontWeight: 700 }}>{L('Select Receipt to import', 'เลือกใบเสร็จเพื่อนำเข้า')}</div>
                    <div>
                      <button className={styles.btnOutline} onClick={() => { setShowReceiptModal(false) }}>{L('Close', 'ปิด')}</button>
                    </div>
                  </div>
                  <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
                    <table className={styles.table}>
                      <thead>
                                <tr>
                                  <th>{L('Receipt No', 'เลขที่ใบเสร็จ')}</th>
                                  <th>{L('Date', 'วันที่')}</th>
                                  <th>{L('Invoice No', 'เลขที่ใบแจ้งหนี้')}</th>
                                  <th style={{ textAlign: 'right' }}>{L('Amount', 'จำนวนเงิน')}</th>
                                  <th style={{ textAlign: 'center' }}>{L('Status','สถานะ')}</th>
                                  <th style={{ width: 120 }}>{L('Action', 'การกระทำ')}</th>
                                </tr>
                      </thead>
                      <tbody>
                        {receiptsLoading && (
                          <tr><td colSpan={5} style={{ padding: 20, textAlign: 'center' }}>{L('Loading...', 'กำลังโหลด...')}</td></tr>
                        )}
                        {(!receiptsLoading && Array.isArray(receipts) && receipts.length === 0) && (
                          <tr><td colSpan={5} style={{ padding: 20, textAlign: 'center' }}>{L('No receipts found', 'ไม่พบใบเสร็จ')}</td></tr>
                        )}
                        {Array.isArray(receipts) && receipts.map((r: any) => {
                          const key = r.receiptNo || r.receiptID || r.id || ''
                          const used = !!(key && (receiptsUsed[String(key)] || (sourceReceiptNo && String(sourceReceiptNo) === String(key))))
                          return (
                            <tr key={key || Math.random()}>
                              <td style={{ fontWeight: 600 }}>{r.receiptNo || '-'}</td>
                              <td style={{ fontSize: 13, color: '#666' }}>{r.receiptDate ? new Date(r.receiptDate).toLocaleDateString() : '-'}</td>
                              <td>{r.invNo || r.invoice_no || r.invoiceNo || '-'}</td>
                              <td style={{ textAlign: 'right' }}>{Number(r.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td style={{ textAlign: 'center' }}>
                                {used ? <span style={{ color: '#b91c1c', fontWeight: 700 }}>{L('Already used','ใช้ไปแล้ว')}</span> : <span style={{ color: '#16a34a', fontWeight: 700 }}>{L('Available','ยังไม่ใช้')}</span>}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={async () => {
                                  if (used) return alert(L('This receipt already has a tax invoice', 'ใบเสร็จนี้ออกใบกำกับภาษีแล้ว'))
                                  try {
                                    let receipt = r
                                    if (!r.amount || !r.receiptID) {
                                      const rr = await fetch(`/api/receipts?receiptNo=${encodeURIComponent(r.receiptNo)}`)
                                      const rj = await rr.json()
                                      if (rr.ok && rj && rj.success) receipt = rj.receipt || (rj.receipts && rj.receipts[0]) || receipt
                                    }
                                    // Treat receipt amount as VAT-inclusive (grand total).
                                    // Derive subtotal = amount / (1 + vatRate/100) so VAT is not added on top.
                                    const importedAmount = parseAmount(receipt.amount)
                                    const baseAmount = Math.round((importedAmount / (1 + (vatRate / 100))) * 100) / 100
                                    setItems([
                                      {
                                        desc: L('Payment as per Receipt ', 'ชำระเงินตามใบเสร็จ ') + (receipt.receiptNo || ''),
                                        qty: 1,
                                        unitPrice: baseAmount
                                      }
                                    ])
                                    setSourceReceiptNo(receipt.receiptNo || null)
                                    const invNoFromReceipt = receipt.invNo || receipt.invoice_no || receipt.invoiceNo || null
                                    if (invNoFromReceipt) {
                                      setSourceInvNo(invNoFromReceipt)
                                      try {
                                        const invRes = await fetch(`/api/invoices?invNo=${encodeURIComponent(invNoFromReceipt)}`)
                                        const invJ = await invRes.json()
                                        if (invRes.ok && invJ && invJ.success && invJ.invoice) {
                                          const inv = invJ.invoice
                                          if (inv.cusID) {
                                            const cusRes = await fetch(`/api/customers?id=${encodeURIComponent(inv.cusID)}`)
                                            const cusJ = await cusRes.json()
                                            if (cusRes.ok && cusJ && cusJ.success && cusJ.customer) {
                                              const cu = cusJ.customer
                                              setCustomer({ name: cu.fullname || cu.name || '', address: cu.address || '', taxId: cu.tax_id || '', phone: cu.phone || '', branch: cu.branch || '' })
                                            } else {
                                              setCustomer(prev => ({ ...prev, name: inv.customer_name || prev.name }))
                                            }
                                          } else {
                                            setCustomer(prev => ({ ...prev, name: inv.customer_name || prev.name }))
                                          }
                                        }
                                      } catch (e) { console.error('Failed to load invoice/customer', e) }
                                    }
                                    // mark this receipt as used locally and remove from the shown list
                                    const rkey = receipt.receiptNo || receipt.receiptID || receipt.id || ''
                                    if (rkey) {
                                      setReceiptsUsed(prev => ({ ...(prev || {}), [String(rkey)]: true }))
                                      setReceipts(prev => Array.isArray(prev) ? prev.filter(rr => {
                                        const rrk = rr.receiptNo || rr.receiptID || rr.id || ''
                                        return String(rrk) !== String(rkey)
                                      }) : prev)
                                    }
                                    alert(L('Receipt imported to tax invoice', 'นำเข้าใบเสร็จไปยังใบกำกับภาษีเรียบร้อย'))
                                  } catch (e) {
                                    console.error(e)
                                    alert(L('Failed to import receipt', 'ไม่สามารถนำเข้าใบเสร็จได้'))
                                  } finally {
                                    setShowReceiptModal(false)
                                  }
                                }} disabled={used}>{L('Select', 'เลือก')}</button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Tax Invoice Number & Date */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Tax Invoice No.', 'เลขที่ใบกำกับภาษี')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    value={taxInvoiceNo}
                    readOnly
                    className={styles.formInput}
                    placeholder={L('Generated via Refresh from list', 'ได้จากการรีเฟรชในหน้ารายการ')}
                    required
                    style={{ flex: 1, background: taxInvoiceNo ? undefined : '#fafafa' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginLeft: 8 }}>
                    {!taxInvoiceNo ? (
                      <>
                        <div style={{ color: '#b91c1c', fontSize: 13, marginBottom: 6 }}>
                          {L('Please click Refresh on the Tax Invoice list to generate the number', 'กรุณาคลิกปุ่มรีเฟรชในหน้ารายการใบกำกับภาษีเพื่อสร้างเลขที่')}
                        </div>
                        <button type="button" className={styles.btnOutline} onClick={refreshTaxInvoiceNo} style={{ padding: '6px 10px', fontSize: 13 }}>
                          {L('Generate here', 'สร้างเลขที่ที่นี่')}
                        </button>
                      </>
                    ) : (
                      <div style={{ color: '#16a34a', fontSize: 13 }}>
                        {L('Generated from list Refresh', 'ได้จากการรีเฟรชในหน้ารายการ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Date', 'วันที่')}</label>
                <input
                  type="date"
                  value={invoiceDate}
                  readOnly
                  title={L('Fixed to today', 'ตั้งเป็นวันที่ปัจจุบัน')}
                  className={styles.formInput}
                />
              </div>
            </div>

            {/* Customer Selection */}
            <div style={{ marginTop: 16, padding: 16, background: '#f8fafc', borderRadius: 8 }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600 }}>
                {L('Customer / Buyer Information', 'ข้อมูลลูกค้า / ผู้ซื้อ')}
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
                    {L('Company/Customer Name', 'ชื่อบริษัท/ลูกค้า')} <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    value={customer.name}
                    onChange={e => setCustomer({ ...customer, name: e.target.value })}
                    className={styles.formInput}
                    placeholder={L('Company or customer name', 'ชื่อบริษัทหรือลูกค้า')}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {L('Tax ID', 'เลขประจำตัวผู้เสียภาษี')}
                  </label>
                  <input
                    value={customer.taxId}
                    onChange={e => setCustomer({ ...customer, taxId: e.target.value })}
                    className={styles.formInput}
                    placeholder="0123456789012"
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup} style={{ flex: 2 }}>
                  <label className={styles.formLabel}>{L('Address', 'ที่อยู่')}</label>
                  <input
                    value={customer.address}
                    onChange={e => setCustomer({ ...customer, address: e.target.value })}
                    className={styles.formInput}
                    placeholder={L('Full address', 'ที่อยู่เต็ม')}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Branch', 'สาขา')}</label>
                  <input
                    value={customer.branch}
                    onChange={e => setCustomer({ ...customer, branch: e.target.value })}
                    className={styles.formInput}
                    placeholder={L('Head Office', '')}
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Phone', 'โทรศัพท์')}</label>
                  <input
                    value={customer.phone}
                    onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                    className={styles.formInput}
                    placeholder="02-080-8916"
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div style={{ marginTop: 20 }}>
              <label className={styles.formLabel}>{L('Items / Services', 'รายการสินค้า/บริการ')}</label>
              <table className={styles.table} style={{ marginTop: 8 }}>
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>#</th>
                    <th>{L('Description', 'รายละเอียด')}</th>
                    <th style={{ width: 100 }}>{L('Qty', 'จำนวน')}</th>
                    <th style={{ width: 140 }}>{L('Unit Price', 'ราคาต่อหน่วย')}</th>
                    <th style={{ width: 140 }}>{L('Amount', 'จำนวนเงิน')}</th>
                    <th style={{ width: 80 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={i}>
                      <td style={{ textAlign: 'center' }}>{i + 1}</td>
                      <td>
                        <input
                          value={it.desc}
                          onChange={e => updateItem(i, 'desc', e.target.value)}
                          className={styles.formInput}
                          placeholder={L('Description', 'รายละเอียด')}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={1}
                          value={it.qty}
                          onChange={e => updateItem(i, 'qty', e.target.value)}
                          className={styles.formInput}
                          style={{ textAlign: 'center' }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={it.unitPrice}
                          onChange={e => updateItem(i, 'unitPrice', e.target.value)}
                          className={styles.formInput}
                          style={{ textAlign: 'right' }}
                        />
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {fmtNumber(it.qty * it.unitPrice)} ฿
                      </td>
                      <td>
                        <button type="button" onClick={() => removeItem(i)} className={styles.btnOutline} style={{ padding: '4px 8px' }}>
                          {L('Remove', 'ลบ')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" onClick={addItem} className={styles.btnOutline} style={{ marginTop: 8 }}>
                + {L('Add Item', 'เพิ่มรายการ')}
              </button>
            </div>

            {/* Totals */}
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, minWidth: 300 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>{L('Subtotal', 'ยอดรวมก่อน VAT')}:</span>
                  <span>{fmtNumber(subtotal)} ฿</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: '#666' }}>
                  <span>{L('VAT', 'ภาษีมูลค่าเพิ่ม')} ({vatRate}%):</span>
                  <span>{fmtNumber(vatAmount)} ฿</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, paddingTop: 8, borderTop: '2px solid #e5e7eb' }}>
                  <span>{L('Grand Total', 'ยอดรวมทั้งสิ้น')}:</span>
                  <span style={{ color: '#2563eb' }}>{fmtNumber(grandTotal)} ฿</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
              <button type="submit" disabled={loading || !taxInvoiceNo} className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                </svg>
                {loading ? L('Saving...', 'กำลังบันทึก...') : L('Save', 'บันทึก')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Hidden Print Template */}
      <div style={{ display: 'none' }}>
        <div ref={printRef} className="tax-invoice" style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 20, top: 20 }}>
            <img src="/k-energy-save-logo.jpg" alt="K Energy Save" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'contain', background: '#fff', padding: 4, border: '1px solid #ddd' }} />
          </div>
          <div className="header">
            <h1>{L('TAX INVOICE', 'ใบกำกับภาษี')}</h1>
            <h2>{L('TAX INVOICE / RECEIPT', 'ใบกำกับภาษี / ใบเสร็จรับเงิน')}</h2>
          </div>

          <div className="info-row">
            <div className="info-box">
              <h3>{L('Seller', 'ผู้ขาย')}</h3>
              <p><strong>{locale === 'th' ? COMPANY_INFO.nameTh : COMPANY_INFO.name}</strong></p>
              <p>{locale === 'th' ? COMPANY_INFO.addressTh : COMPANY_INFO.address}</p>
              <p>{L('Tax ID', 'เลขประจำตัวผู้เสียภาษี')}: {COMPANY_INFO.taxId}</p>
              <p>{L('Phone', 'โทร')}: {COMPANY_INFO.phone}</p>
              <p>{L('Branch', 'สาขา')}: {COMPANY_INFO.branch}</p>
            </div>
            <div className="info-box">
              <h3>{L('Buyer', 'ผู้ซื้อ')}</h3>
              <p><strong>{customer.name || '-'}</strong></p>
              <p>{customer.address || '-'}</p>
              <p>{L('Tax ID', 'เลขประจำตัวผู้เสียภาษี')}: {customer.taxId || '-'}</p>
              <p>{L('Phone', 'โทร')}: {customer.phone || '-'}</p>
              <p>{L('Branch', 'สาขา')}: {customer.branch || '-'}</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <strong>{L('Tax Invoice No.', 'เลขที่ใบกำกับภาษี')}:</strong> {taxInvoiceNo}
            </div>
            <div>
              <strong>{L('Date', 'วันที่')}:</strong> {invoiceDate}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th className="text-center" style={{ width: 50 }}>#</th>
                <th>{L('Description', 'รายละเอียด')}</th>
                <th className="text-center" style={{ width: 80 }}>{L('Qty', 'จำนวน')}</th>
                <th className="text-right" style={{ width: 120 }}>{L('Unit Price', 'ราคา/หน่วย')}</th>
                <th className="text-right" style={{ width: 120 }}>{L('Amount', 'จำนวนเงิน')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i}>
                  <td className="text-center">{i + 1}</td>
                  <td>{it.desc || '-'}</td>
                  <td className="text-center">{it.qty}</td>
                  <td className="text-right">{fmtNumber(it.unitPrice)}</td>
                  <td className="text-right">{fmtNumber(it.qty * it.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="totals">
            <table>
              <tbody>
                <tr>
                  <td>{L('Subtotal', 'ยอดรวมก่อน VAT')}</td>
                  <td className="text-right">{fmtNumber(subtotal)} ฿</td>
                </tr>
                <tr>
                  <td>{L('VAT', 'ภาษีมูลค่าเพิ่ม')} ({vatRate}%)</td>
                  <td className="text-right">{fmtNumber(vatAmount)} ฿</td>
                </tr>
                <tr className="grand-total">
                  <td><strong>{L('Grand Total', 'ยอดรวมทั้งสิ้น')}</strong></td>
                  <td className="text-right"><strong>{fmtNumber(grandTotal)} ฿</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="footer">
            <div className="signature-box">
              <div className="signature-line">{L('Authorized Signature', 'ผู้มีอำนาจลงนาม')}</div>
              <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>{L('Seller', 'ผู้ขาย')}</div>
            </div>
            <div className="signature-box">
              <div className="signature-line">{L('Received By', 'ผู้รับเอกสาร')}</div>
              <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>{L('Buyer', 'ผู้ซื้อ')}</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
