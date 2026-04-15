"use client"

import React, { useEffect, useState, Suspense } from 'react'
import PrintStyles from '../../components/PrintStyles'
import { useSearchParams } from 'next/navigation'

function ReceiptPrintPageContent() {
  const searchParams = useSearchParams()
  const receiptID = searchParams?.get('receiptID') || ''
  const auto = searchParams?.get('autoPrint')
  const [receipt, setReceipt] = useState<any | null>(null)
  const [loggedUser, setLoggedUser] = useState<string | null>(null)
  const [printCount, setPrintCount] = useState<number>(0)
  const [lastPrinted, setLastPrinted] = useState<string | null>(null)
  const [invoiceSource, setInvoiceSource] = useState<any | null>(null)

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
    if (!receiptID) return
    ;(async () => {
      try {
        const res = await fetch(`/api/receipts?receiptID=${encodeURIComponent(receiptID)}`)
        const j = await res.json()
        if (res.ok && j && j.success) setReceipt(j.receipt || j.receipts?.[0] || null)
      } catch (err) {
        console.error('Failed to load receipt for print', err)
      }
    })()
  }, [receiptID])

  useEffect(() => {
    if (!receipt) return
    const invId = receipt.invID || receipt.invoice_id || receipt.invoiceId || null
    const invNo = receipt.invNo || receipt.invoice_no || receipt.invoiceNo || null
    ;(async () => {
      try {
        if (invId) {
          const r = await fetch(`/api/invoices?id=${encodeURIComponent(invId)}`)
          const j = await r.json()
          if (r.ok && j && j.success && j.invoice) {
            const inv = j.invoice
            if (inv.items && typeof inv.items === 'string') {
              try { inv.items = JSON.parse(inv.items) } catch (_) {}
            }
            setInvoiceSource(inv)
            return
          }
        }
        if (invNo) {
          const r2 = await fetch(`/api/invoices?invNo=${encodeURIComponent(invNo)}`)
          const j2 = await r2.json()
          if (r2.ok && j2 && j2.success && j2.invoice) {
            const inv = j2.invoice
            if (inv.items && typeof inv.items === 'string') {
              try { inv.items = JSON.parse(inv.items) } catch (_) {}
            }
            setInvoiceSource(inv)
            return
          }
        }
        setInvoiceSource(null)
      } catch (e) {
        console.error('failed to load invoice for receipt', e)
        setInvoiceSource(null)
      }
    })()
  }, [receipt])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('k_system_admin_user')
      if (raw) {
        const u = JSON.parse(raw)
        setLoggedUser(u?.name || u?.fullname || u?.username || String(u?.userId || ''))
      }
    } catch {}
    const key = `print_count:receipt:${receiptID || 'unknown'}`
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
  }, [receiptID])

  useEffect(() => {
    if (receipt && (auto === '1' || auto === 'true')) {
      setTimeout(() => { try { window.print() } catch (e) { console.error(e) } }, 300)
    }
  }, [receipt, auto])

  if (!receiptID) return <div style={{ padding: 20 }}>Missing receiptID</div>
  if (!receipt) return <div style={{ padding: 20 }}>Loading...</div>

  const updateQueryStringParameter = (uri: string, key: string, value: string) => {
    try {
      const url = new URL(uri)
      url.searchParams.set(key, value)
      return url.toString()
    } catch (e) { return uri }
  }

  const L = (en: string, th: string) => selectedLang === 'th' ? th : en

  // Calculate amounts
  const items = Array.isArray(invoiceSource?.items) ? invoiceSource.items : (Array.isArray(receipt.items) ? receipt.items : [])
  const subtotal = Number(receipt.amount || receipt.invoice_total || invoiceSource?.subtotal || 0)






  const discount = Number(receipt.discount ?? receipt.discount_amount ?? invoiceSource?.discount ?? 0)
  const afterDiscount = subtotal - discount
  const vat = afterDiscount * 0.07
  const grandTotal = afterDiscount + vat

  // Customer info
  const customerName = receipt.customer_name || receipt.cusName || invoiceSource?.customer_name || '-'
  const customerAddress = receipt.customer_address || receipt.cusAddress || invoiceSource?.customer_address || '-'
  const customerPhone = receipt.customer_phone || receipt.cusPhone || invoiceSource?.customer_phone || '-'
  const customerEmail = receipt.customer_email || receipt.cusEmail || invoiceSource?.customer_email || '-'

                
    return (<>
      <style>{`
        .info-box-title { font-weight: 700; font-size: 10pt; color: #0066cc; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #ddd; }
        .info-row { display: flex; margin-bottom: 4px; font-size: 10pt; }
        .info-label { width: 100px; font-weight: 600; color: #555; }
        .info-value { flex: 1; color: #333; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 10pt; }
        .items-table th { background: #0066cc; color: white; padding: 8px 10px; text-align: left; font-weight: 600; }
        .items-table th:nth-child(1) { width: 40px; text-align: center; }
        .items-table th:nth-child(3) { width: 70px; text-align: right; }
        .items-table th:nth-child(4) { width: 100px; text-align: right; }
        .items-table th:nth-child(5) { width: 110px; text-align: right; }
        .items-table td { padding: 8px 10px; border-bottom: 1px solid #eee; }
        .items-table td:nth-child(1) { text-align: center; }
        .items-table td:nth-child(3), .items-table td:nth-child(4), .items-table td:nth-child(5) { text-align: right; }
        .items-table tbody tr:nth-child(even) { background: #f9f9f9; }
        .summary-section { display: flex; justify-content: flex-end; margin-bottom: 20px; }
        .summary-table { width: 280px; font-size: 10pt; }
        .summary-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee; }
        .summary-row.total { font-weight: 700; font-size: 12pt; color: #0066cc; border-top: 2px solid #0066cc; border-bottom: none; padding-top: 10px; margin-top: 4px; }
        .payment-section { border: 1px solid #ddd; border-radius: 6px; padding: 12px; margin-bottom: 20px; background: #f8fafc; }
        .payment-title { font-weight: 700; font-size: 10pt; color: #0066cc; margin-bottom: 10px; }
        .payment-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 10pt; }
        .payment-item { display: flex; }
        .payment-label { font-weight: 600; color: #555; min-width: 120px; }
        .signature-section { display: flex; justify-content: space-between; margin-top: 30px; padding-top: 20px; }
        .signature-box { width: 30%; text-align: center; }
        .signature-line { border-bottom: 1px solid #333; height: 40px; margin-bottom: 8px; }
        .signature-label { font-size: 10pt; font-weight: 600; color: #333; }
        .signature-sublabel { font-size: 9pt; color: #666; }
        .footer-info { position: absolute; bottom: 10mm; left: 15mm; right: 15mm; display: flex; justify-content: space-between; font-size: 8pt; color: #999; border-top: 1px solid #eee; padding-top: 8px; }
        @media print { .no-print { display: none !important } body { margin:0; padding:0 } }
      `}</style>

      {/* Language Toggle */}
      <PrintStyles />
      <div className="no-print" style={{ textAlign: 'center', padding: '12px', background: '#f0f0f0' }}>
        <button
          onClick={() => { setSelectedLang('th'); window.history.replaceState(null, '', updateQueryStringParameter(window.location.href, 'lang', 'th')) }}
          style={{ marginRight: 8, padding: '6px 16px', fontSize: 13, borderRadius: 20, border: selectedLang === 'th' ? '2px solid #e67e22' : '1px solid #ccc', background: selectedLang === 'th' ? '#fff5eb' : '#fff', cursor: 'pointer', fontWeight: selectedLang === 'th' ? 600 : 400 }}
        >ไทย</button>
        <button
          onClick={() => { setSelectedLang('en'); window.history.replaceState(null, '', updateQueryStringParameter(window.location.href, 'lang', 'en')) }}
          style={{ marginRight: 8, padding: '6px 16px', fontSize: 13, borderRadius: 20, border: selectedLang === 'en' ? '2px solid #e67e22' : '1px solid #ccc', background: selectedLang === 'en' ? '#fff5eb' : '#fff', cursor: 'pointer', fontWeight: selectedLang === 'en' ? 600 : 400 }}
        >English</button>
        <button
          onClick={() => window.print()}
          style={{ marginLeft: 16, padding: '6px 20px', fontSize: 13, borderRadius: 20, border: '1px solid #e67e22', background: '#e67e22', color: 'white', cursor: 'pointer', fontWeight: 600 }}
        >{L('Print', 'พิมพ์')}</button>
      </div>

      {/* A4 Page */}
      <div className="a4-page">
        {/* Title centered */}
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <h1 style={{ margin: 0 }}>{L('RECEIPT', 'ใบเสร็จรับเงิน')}</h1>
          <h2 style={{ margin: '6px 0 0 0' }}>{L('Payment Receipt', 'หลักฐานการรับชำระเงิน')}</h2>
        </div>

        {/* Header - company info below the title */}
        <div className="header-row" style={{ alignItems: 'flex-start', marginTop: 6 }}>
          <div className="company-info" style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src="/k-energy-save-logo.jpg" alt="Logo" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'contain', background: '#fff', padding: 4, border: '1px solid #ddd' }} />
              <div>
                <div className="company-name">{L('K Energy Save', 'เค อีเนอร์ยี่ เซฟ')}</div>
                <div className="company-name-en">{L('K Energy Save Co., Ltd.', 'บริษัท เค อีเนอร์ยี่ เซฟ จำกัด')}</div>
              </div>
            </div>
            <div className="company-address" style={{ marginTop: 8 }}>
              84 Chaloem Phrakiat Rama 9 Soi 34, Nong Bon, Prawet, Bangkok 10250<br/>
              Tel: 02-080-8916 | Email: info@kenergy-save.com
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="info-section">
          <div className="info-box">
            <div className="info-box-title">{L('Receipt Information', 'ข้อมูลใบเสร็จ')}</div>
            <div className="info-row">
              <span className="info-label">{L('Receipt No:', 'เลขที่:')}</span>
              <span className="info-value" style={{ fontWeight: 700 }}>{receipt.receiptNo || '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Date:', 'วันที่:')}</span>
              <span className="info-value">{receipt.receiptDate ? new Date(receipt.receiptDate).toLocaleDateString(selectedLang === 'th' ? 'th-TH' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Invoice No:', 'ใบแจ้งหนี้:')}</span>
              <span className="info-value">{invoiceSource?.invNo || receipt.invoice_no || receipt.invNo || '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Contract No:', 'เลขที่สัญญา:')}</span>
              <span className="info-value">{invoiceSource?.contract_no || invoiceSource?.contractNo || receipt.contractNo || receipt.contract_no || '-'}</span>
            </div>
          </div>
          <div className="info-box">
            <div className="info-box-title">{L('Customer Information', 'ข้อมูลลูกค้า')}</div>
            <div className="info-row">
              <span className="info-label">{L('Name:', 'ชื่อ:')}</span>
              <span className="info-value" style={{ fontWeight: 600 }}>{customerName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Address:', 'ที่อยู่:')}</span>
              <span className="info-value">{customerAddress}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Phone:', 'โทรศัพท์:')}</span>
              <span className="info-value">{customerPhone}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Email:', 'อีเมล:')}</span>
              <span className="info-value">{customerEmail}</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="items-table">
          <thead>
            <tr>
              <th>{L('No.', 'ลำดับ')}</th>
              <th>{L('Description', 'รายการ')}</th>
              <th>{L('Qty', 'จำนวน')}</th>
              <th>{L('Unit Price', 'ราคา/หน่วย')}</th>
              <th>{L('Amount', 'จำนวนเงิน')}</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              invoiceSource ? (
                <tr>
                    <td style={{ textAlign: 'center' }}>1</td>
                    <td style={{ padding: 12, textAlign: 'left' }}>{L('Payment for Invoice', 'ชำระเงินสำหรับใบแจ้งหนี้')} {invoiceSource.invNo || ''}</td>
                    <td style={{ textAlign: 'center' }}>1</td>
                    <td style={{ textAlign: 'right' }}>{Number(invoiceSource.total_amount || receipt.amount || 0).toLocaleString(selectedLang === 'th' ? 'th-TH' : 'en-US', { minimumFractionDigits: 2 })}</td>
                    <td style={{ textAlign: 'right' }}>{Number(invoiceSource.total_amount || receipt.amount || 0).toLocaleString(selectedLang === 'th' ? 'th-TH' : 'en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: '#999', padding: 20 }}>
                    {L('Payment received', 'รับชำระเงินแล้ว')}
                  </td>
                </tr>
              )
            ) : items.map((it: any, idx: number) => {
              const qty = Number(it.quantity || it.qty || 1)
              const unitPrice = Number(it.unit_price || it.unitPrice || it.price || 0)
              const amount = Number(it.total_price || it.total || (qty * unitPrice))
              return (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{it.description || it.product_name || it.desc || '-'}</td>
                  <td>{qty}</td>
                  <td>{unitPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                  <td>{amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Summary */}
        <div className="summary-section">
          <div className="summary-table">
            <div className="summary-row">
              <span>{L('Subtotal', 'รวม')}</span>
              <span>{subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</span>
            </div>
            <div className="summary-row">
              <span>{L('Discount', 'ส่วนลด')}</span>
              <span>{discount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</span>
            </div>
            <div className="summary-row">
              <span>{L('VAT 7%', 'ภาษีมูลค่าเพิ่ม 7%')}</span>
              <span>{vat.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</span>
            </div>
            <div className="summary-row total">
              <span>{L('Grand Total', 'ยอดรวมสุทธิ')}</span>
              <span>{grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</span>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="payment-section">
          <div className="payment-title">{L('Payment Details', 'รายละเอียดการชำระเงิน')}</div>
          <div className="payment-grid">
            <div className="payment-item">
              <span className="payment-label">{L('Payment Method:', 'วิธีการชำระ:')}</span>
              <span>{receipt.payment_method || receipt.method || '-'}</span>
            </div>
            <div className="payment-item">
              <span className="payment-label">{L('Amount Paid:', 'จำนวนที่ชำระ:')}</span>
              <span style={{ fontWeight: 700, color: '#0066cc' }}>{Number(receipt.amount || grandTotal).toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</span>
            </div>
            <div className="payment-item">
              <span className="payment-label">{L('Reference:', 'อ้างอิง:')}</span>
              <span>{receipt.notes || receipt.reference || '-'}</span>
            </div>
            <div className="payment-item">
              <span className="payment-label">{L('Status:', 'สถานะ:')}</span>
              <span style={{ color: '#16a34a', fontWeight: 600 }}>{L('Paid', 'ชำระแล้ว')}</span>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="signature-section">
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-label">{L('Received By', 'ผู้รับเงิน')}</div>
            <div className="signature-sublabel">{L('Cashier / Accounts', 'แคชเชียร์ / บัญชี')}</div>
          </div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-label">{L('Verified By', 'ผู้ตรวจสอบ')}</div>
            <div className="signature-sublabel">{L('Branch Manager', 'ผู้จัดการสาขา')}</div>
          </div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-label">{L('Approved By', 'ผู้อนุมัติ')}</div>
            <div className="signature-sublabel">{L('Executive', 'ผู้บริหาร')}</div>
          </div>
        </div>

        {/* Footer */}

        <div style={{ marginTop: 20, padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', marginBottom: 8 }}>
            {L('Bank Account Information', 'ข้อมูลบัญชีธนาคาร')}
          </div>
          <div style={{ fontSize: 9, lineHeight: 1.6, color: '#334155' }}>
            <div><strong>{L('Bank:', 'ธนาคาร:')}</strong> {L('Kasikorn Bank (KBANK)', 'ธนาคารกสิกรไทย')}</div>
            <div><strong>{L('Current Account:', 'บัญชีกระแสรายวัน:')}</strong> 212-1-17253-7</div>
            <div><strong>{L('Savings Account:', 'บัญชีออมทรัพย์:')}</strong> 211-8-78336-3</div>
            <div><strong>{L('Account Name:', 'ชื่อบัญชี:')}</strong> {L('K Energy Save Co., Ltd.', 'บริษัท เค อีเนอร์ยี่ เซฟ จำกัด')}</div>
          </div>
        </div>

        <div className="footer-info">
          <span style={{ opacity: 0.9 }}>{L('User:', 'ผู้พิมพ์:')} {loggedUser || '-'}</span>
          <span style={{ opacity: 0.9 }}>{L('Printed:', 'พิมพ์เมื่อ:')} {new Date(lastPrinted || new Date()).toLocaleString(selectedLang === 'th' ? 'th-TH' : 'en-US')}</span>
          <span className="page-number" style={{ opacity: 0.9 }}></span>
          <span style={{ opacity: 0.9 }}>{L('Print Count:', 'ครั้งที่พิมพ์:')} {printCount + 1}</span>
        </div>
      </div>
    </>
  )
}

export default function ReceiptPrintPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>}>
      <ReceiptPrintPageContent />
    </Suspense>
  )
}
