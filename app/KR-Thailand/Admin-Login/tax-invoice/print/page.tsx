"use client"

import React, { useEffect, useState, Suspense } from 'react'
import PrintStyles from '../../components/PrintStyles'
import { useSearchParams } from 'next/navigation'

function TaxInvoicePrintPageContent() {
  const searchParams = useSearchParams()
  const taxNo = searchParams?.get('taxNo') || ''
  const auto = searchParams?.get('autoPrint')
  const [taxInvoice, setTaxInvoice] = useState<any | null>(null)
  const [loggedUser, setLoggedUser] = useState<string | null>(null)
  const [printCount, setPrintCount] = useState<number>(0)
  const [lastPrinted, setLastPrinted] = useState<string | null>(null)

  const paramLangInit = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('lang') : null
  const [selectedLang, setSelectedLang] = useState<'en'|'th'>(() => {
    if (paramLangInit === 'en') return 'en'
    if (paramLangInit === 'th') return 'th'
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      return l === 'en' ? 'en' : 'th'
    } catch { return 'th' }
  })

  useEffect(() => {
    if (!taxNo) return
    ;(async () => {
      try {
        const res = await fetch(`/api/tax-invoices?taxNo=${encodeURIComponent(taxNo)}`)
        const j = await res.json()
        if (res.ok && j && j.success && j.taxInvoice) {
          const ti = j.taxInvoice
          if (ti.items && typeof ti.items === 'string') {
            try { ti.items = JSON.parse(ti.items) } catch (_) {}
          }
          setTaxInvoice(ti)
        }
      } catch (err) { console.error('Failed to load tax invoice for print', err) }
    })()
  }, [taxNo])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('k_system_admin_user')
      if (raw) {
        const u = JSON.parse(raw)
        setLoggedUser(u?.name || u?.fullname || u?.username || String(u?.userId || ''))
      }
    } catch {}
    const key = `print_count:taxinvoice:${taxNo || 'unknown'}`
    setPrintCount(parseInt(localStorage.getItem(key) || '0', 10) || 0)
    setLastPrinted(localStorage.getItem(key + ':last') || null)
    const onAfter = () => {
      try {
        const newCnt = (parseInt(localStorage.getItem(key) || '0', 10) || 0) + 1
        const ts = new Date().toISOString()
        localStorage.setItem(key, String(newCnt))
        localStorage.setItem(key + ':last', ts)
        setPrintCount(newCnt)
        setLastPrinted(ts)
      } catch (e) { console.error('print count update error', e) }
    }
    ;(window as any).onafterprint = onAfter
    return () => { try { (window as any).onafterprint = null } catch (_) {} }
  }, [taxNo])

  useEffect(() => {
    if (taxInvoice && (auto === '1' || auto === 'true')) {
      setTimeout(() => { try { window.print() } catch (e) { console.error(e) } }, 300)
    }
  }, [taxInvoice, auto])

  if (!taxNo) return <div style={{ padding: 20 }}>Missing taxNo</div>
  if (!taxInvoice) return <div style={{ padding: 20 }}>Loading...</div>

  const L = (en: string, th: string) => selectedLang === 'th' ? th : en

  const items = Array.isArray(taxInvoice.items) ? taxInvoice.items : []
  const subtotal = Number(taxInvoice.subtotal || 0)
  const vat = Number(taxInvoice.vat || ((subtotal * 7) / 100))
  const grandTotal = Number(taxInvoice.total_amount || (subtotal + vat))

  const customerName = taxInvoice.customer_name || taxInvoice.cusName || '-'
  const customerAddress = taxInvoice.customer_address || taxInvoice.cusAddress || '-'

  const fmtNumber = (n: number) => n.toLocaleString(selectedLang === 'th' ? 'th-TH' : 'en-US', { minimumFractionDigits: 2 })

  return (
    <>
      <style>{`
        @page { size: A4 portrait; margin: 1.8cm 2.5cm 1.8cm 2.5cm; }
        @media print { .no-print { display: none !important } body { margin:0; padding:0 } .footer-print { position: fixed !important; bottom: 8mm !important; left: 12mm !important; right: 12mm !important; margin-top: 0 !important; background: white !important; } }
        body { font-family: 'Sarabun', 'Segoe UI', sans-serif; color: #333; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        img { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        table th { background: #e67e22; color: #fff; }
        .totals .grand { background: #fff5eb; }
      `}</style>
      <PrintStyles />
      <div style={{ padding: 12, textAlign: 'center' }} className="no-print">
        <button onClick={() => { setSelectedLang('th'); window.history.replaceState(null, '', new URL(window.location.href).toString()) }} style={{ marginRight: 8, padding: '6px 16px', borderRadius: 20, border: '1px solid #e67e22', background: '#fff', fontWeight: 600 }}>{L('ไทย','ไทย')}</button>
        <button onClick={() => { setSelectedLang('en'); window.history.replaceState(null, '', new URL(window.location.href).toString()) }} style={{ marginRight: 8, padding: '6px 16px', borderRadius: 20, border: '1px solid #e67e22', background: '#fff', fontWeight: 600 }}>{L('English','English')}</button>
        <button onClick={() => window.print()} style={{ marginLeft: 12, padding: '6px 20px', fontSize: 13, borderRadius: 20, border: '1px solid #e67e22', background: '#e67e22', color: 'white', cursor: 'pointer', fontWeight: 600 }}>{L('Print','พิมพ์')}</button>
      </div>

      <div style={{ width: '210mm', minHeight: '297mm', margin: '10mm auto', padding: '12mm 15mm', background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <img src="/k-energy-save-logo.jpg" alt="Logo" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'contain', background: '#fff', padding: 4, border: '1px solid #ddd' }} />
            <div style={{ fontWeight: 700, marginTop: 6 }}>K Energy Save Co., Ltd.</div>
            <div style={{ color: '#666', marginTop: 4 }}>84 Chaloem Phrakiat Rama 9 Soi 34, Nong Bon, Prawet, Bangkok 10250</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ margin: 0, color: '#e67e22' }}>{L('TAX INVOICE','ใบกำกับภาษี')}</h1>
            <div style={{ marginTop: 8, fontWeight: 700 }}>{L('Tax Invoice No.', 'เลขที่ใบกำกับภาษี')}: {taxInvoice.taxNo || taxNo}</div>
            <div style={{ marginTop: 4 }}>{L('Date', 'วันที่')}: {taxInvoice.taxDate ? new Date(taxInvoice.taxDate).toLocaleDateString(selectedLang === 'th' ? 'th-TH' : 'en-US') : ''}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
          <div style={{ flex: 1, border: '1px solid #ddd', padding: 8 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{L('Seller','ผู้ขาย')}</div>
            <div>K Energy Save Co., Ltd.</div>
            <div style={{ color: '#666', marginTop: 6 }}>{L('Tax ID', 'เลขประจำตัวผู้เสียภาษี')}: 0105568097428</div>
          </div>
          <div style={{ flex: 1, border: '1px solid #ddd', padding: 8 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{L('Buyer','ผู้ซื้อ')}</div>
            <div style={{ fontWeight: 600 }}>{customerName}</div>
            <div style={{ color: '#666', marginTop: 6 }}>{customerAddress}</div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: 8, width: 50, textAlign: 'center' }}>{L('No.', 'ลำดับ')}</th>
              <th style={{ border: '1px solid #ddd', padding: 8 }}>{L('Description', 'รายการ')}</th>
              <th style={{ border: '1px solid #ddd', padding: 8, width: 80, textAlign: 'center' }}>{L('Qty','จำนวน')}</th>
              <th style={{ border: '1px solid #ddd', padding: 8, width: 120, textAlign: 'right' }}>{L('Unit Price','ราคา/หน่วย')}</th>
              <th style={{ border: '1px solid #ddd', padding: 8, width: 120, textAlign: 'right' }}>{L('Amount','จำนวนเงิน')}</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 20, textAlign: 'center', color: '#999' }}>-</td></tr>
            ) : items.map((it: any, idx: number) => {
              const qty = Number(it.qty || it.quantity || 1)
              const unitPrice = Number(it.unitPrice || it.unit_price || it.price || 0)
              const amount = Number(it.total_price || it.total || (qty * unitPrice))
              return (
                <tr key={idx}>
                  <td style={{ border: '1px solid #ddd', padding: 8, textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ border: '1px solid #ddd', padding: 8 }}>{it.desc || it.description || it.product_name || '-'}</td>
                  <td style={{ border: '1px solid #ddd', padding: 8, textAlign: 'center' }}>{qty}</td>
                  <td style={{ border: '1px solid #ddd', padding: 8, textAlign: 'right' }}>{fmtNumber(unitPrice)}</td>
                  <td style={{ border: '1px solid #ddd', padding: 8, textAlign: 'right' }}>{fmtNumber(amount)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <div style={{ width: 320 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><span>{L('Subtotal','รวม')}</span><span style={{ textAlign: 'right' }}>{fmtNumber(subtotal)} ฿</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><span>{L(`VAT 7%`, `ภาษีมูลค่าเพิ่ม 7%`)}</span><span style={{ textAlign: 'right' }}>{fmtNumber(vat)} ฿</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontWeight: 700, fontSize: 16, marginTop: 6 }}><span>{L('Grand Total','ยอดรวมสุทธิ')}</span><span style={{ textAlign: 'right', color: '#e67e22' }}>{fmtNumber(grandTotal)} ฿</span></div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40 }}>
          <div style={{ width: 220, textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #333', height: 40 }}></div>
            <div style={{ marginTop: 6 }}>{L('Authorized Signature','ผู้มีอำนาจลงนาม')}</div>
          </div>
          <div style={{ width: 220, textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #333', height: 40 }}></div>
            <div style={{ marginTop: 6 }}>{L('Received By','ผู้รับเอกสาร')}</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#999', borderTop: '1px solid #eee', paddingTop: 6, marginTop: 12 }} className="footer-print">
          <span>{L('Printed by', 'ผู้พิมพ์')}: {loggedUser || '-'}</span>
          <span>{L('Printed at', 'พิมพ์เมื่อ')}: {new Date(lastPrinted || new Date()).toLocaleString(selectedLang === 'th' ? 'th-TH' : 'en-US')}</span>
          <span>{L('Print count', 'ครั้งที่พิมพ์')}: {printCount + 1}</span>
        </div>
      </div>
    </>
  )
}

export default function TaxInvoicePrintPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>}>
      <TaxInvoicePrintPageContent />
    </Suspense>
  )
}
