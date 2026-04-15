"use client"

import React, { useEffect, useState, Suspense } from 'react'
import PrintStyles from '../../components/PrintStyles'
import { useSearchParams } from 'next/navigation'

function SalesOrderPrintContent() {
  const searchParams = useSearchParams()
  const orderID = searchParams?.get('orderID') || searchParams?.get('id') || ''
  const orderNo = searchParams?.get('orderNo') || ''
  const auto = searchParams?.get('autoPrint')

  const [order, setOrder] = useState<any>(null)
  const [notFound, setNotFound] = useState(false)
  const [loggedUser, setLoggedUser] = useState<string | null>(null)
  const [printCount, setPrintCount] = useState<number>(0)
  const [lastPrinted, setLastPrinted] = useState<string | null>(null)

  const paramLangInit = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('lang') : null
  const [selectedLang, setSelectedLang] = useState<'en' | 'th'>(() => {
    if (paramLangInit === 'en') return 'en'
    if (paramLangInit === 'th') return 'th'
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      return l === 'en' ? 'en' : 'th'
    } catch { return 'th' }
  })

  useEffect(() => {
    const idOrNo = orderID || orderNo
    if (!idOrNo) return
    ;(async () => {
      try {
        const token = localStorage.getItem('k_system_admin_token') || ''
        const headers: Record<string, string> = {}
        if (token) headers['Authorization'] = `Bearer ${token}`

        let res = await fetch(`/api/sales-orders?id=${encodeURIComponent(orderID)}`, { headers })
        let j = await res.json().catch(() => null)
        if (!(res.ok && j?.success && j.order) && orderNo) {
          res = await fetch(`/api/sales-orders?orderNo=${encodeURIComponent(orderNo)}`, { headers })
          j = await res.json().catch(() => null)
        }
        if (j?.success && j.order) {
          setOrder(j.order)
        } else {
          setNotFound(true)
        }
      } catch (err) {
        setNotFound(true)
        console.error('Failed to load sales order for print', err)
      }
    })()
  }, [orderID, orderNo])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('k_system_admin_user')
      if (raw) {
        const u = JSON.parse(raw)
        setLoggedUser(u?.name || u?.fullname || u?.username || String(u?.userId || ''))
      }
    } catch {}
    const key = `print_count:so:${orderID || orderNo || 'unknown'}`
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
  }, [orderID, orderNo])

  useEffect(() => {
    if (order && (auto === '1' || auto === 'true')) {
      setTimeout(() => { try { window.print() } catch (e) { console.error(e) } }, 300)
    }
  }, [order, auto])

  const updateQueryStringParameter = (uri: string, key: string, value: string) => {
    try {
      const url = new URL(uri)
      url.searchParams.set(key, value)
      return url.toString()
    } catch (e) { return uri }
  }

  const L = (en: string, th: string) => selectedLang === 'th' ? th : en

  const fmtDate = (d: string | null) => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString(selectedLang === 'th' ? 'th-TH' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const fmtNum = (n: number | string) =>
    Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const statusLabel: Record<string, { en: string; th: string; color: string }> = {
    pending:    { en: 'Pending',    th: 'รอดำเนินการ', color: '#d97706' },
    confirmed:  { en: 'Confirmed',  th: 'ยืนยันแล้ว',  color: '#0284c7' },
    shipped:    { en: 'Shipped',    th: 'จัดส่งแล้ว',  color: '#7c3aed' },
    delivered:  { en: 'Delivered',  th: 'ส่งมอบแล้ว', color: '#16a34a' },
    cancelled:  { en: 'Cancelled',  th: 'ยกเลิก',      color: '#dc2626' },
    completed:  { en: 'Completed',  th: 'เสร็จสิ้น',   color: '#16a34a' },
  }

  if (!orderID && !orderNo) return <div style={{ padding: 20 }}>Missing orderID or orderNo</div>
  if (notFound) return <div style={{ padding: 40, textAlign: 'center', fontFamily: 'Sarabun, sans-serif', fontSize: 16, color: '#dc2626' }}>ไม่พบข้อมูลใบสั่งขาย (orderID: {orderID})</div>
  if (!order) return <div style={{ padding: 20, textAlign: 'center', fontFamily: 'Sarabun, sans-serif', fontSize: 16 }}>กำลังโหลด...</div>

  const items = Array.isArray(order.items) ? order.items : []
  const subtotal = Number(order.subtotal || 0)
  const discountPct = Number(order.discount_percent || 0)
  const discountAmt = Number(order.discount_amount || 0)
  const vatPct = Number(order.vat_percent || 7)
  const vatAmt = Number(order.vat_amount || 0)
  const grandTotal = Number(order.priceTotal || order.total || 0)

  const st = order.status || 'pending'
  const stInfo = statusLabel[st] || { en: st, th: st, color: '#666' }

  return (
    <>
      <style>{`
        @page { size: A4 portrait; margin: 1.5cm; }
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; overflow: hidden !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          html, body { -ms-overflow-style: none !important; scrollbar-width: none !important; }
          ::-webkit-scrollbar { display: none !important; }
          .a4-page { box-shadow: none !important; margin: 0 !important; padding: 12mm 15mm 25mm 15mm !important; }
        }
        @media screen { body { background: #f5f5f5; overflow-y: auto; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
        html { -ms-overflow-style: none; scrollbar-width: none; }
        img { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .a4-page { width: 100%; max-width: 210mm; min-height: 297mm; margin: 10mm auto; padding: 12mm 15mm 25mm 15mm; background: white; font-family: 'Sarabun', 'Segoe UI', 'Helvetica', sans-serif; font-size: 10pt; line-height: 1.4; color: #1f2937; box-shadow: 0 4px 16px rgba(0,0,0,0.1); position: relative; }
        .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 3px solid #0284c7; }
        .company-info { flex: 1; max-width: 60%; }
        .company-logo-section { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 8px; }
        .company-logo { width: 75px; height: 75px; border-radius: 8px; object-fit: contain; background: #fff; padding: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .company-text { flex: 1; }
        .company-name { font-size: 17pt; font-weight: 700; color: #0284c7; margin-bottom: 2px; line-height: 1.2; }
        .company-name-en { font-size: 10pt; font-weight: 600; color: #4b5563; margin-bottom: 6px; }
        .company-address { font-size: 8.5pt; color: #6b7280; line-height: 1.5; }
        .doc-title { text-align: right; }
        .doc-title h1 { font-size: 24pt; font-weight: 700; color: #0284c7; margin: 0 0 4px 0; letter-spacing: -0.5px; }
        .doc-title h2 { font-size: 12pt; font-weight: 600; color: #6b7280; margin: 0; }
        .info-section { display: flex; gap: 14px; margin-bottom: 14px; }
        .info-box { flex: 1; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px 12px; background: linear-gradient(to bottom, #fafafa, #ffffff); box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .info-box-title { font-weight: 700; font-size: 9.5pt; color: #0284c7; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 2px solid #0284c7; text-transform: uppercase; letter-spacing: 0.3px; }
        .info-row { display: flex; margin-bottom: 4px; font-size: 9pt; line-height: 1.5; }
        .info-label { min-width: 95px; font-weight: 600; color: #4b5563; }
        .info-value { flex: 1; color: #1f2937; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 9pt; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; }
        .items-table thead { background: linear-gradient(to bottom, #0284c7, #0369a1); }
        .items-table th { color: white; padding: 8px 10px; text-align: left; font-weight: 600; text-transform: uppercase; font-size: 8.5pt; letter-spacing: 0.3px; }
        .items-table th:nth-child(1) { width: 40px; text-align: center; }
        .items-table th:nth-child(3) { width: 80px; }
        .items-table th:nth-child(4) { width: 60px; text-align: center; }
        .items-table th:nth-child(5) { width: 110px; text-align: right; }
        .items-table th:nth-child(6) { width: 120px; text-align: right; }
        .items-table td { padding: 8px 10px; border-bottom: 1px solid #f3f4f6; }
        .items-table td:nth-child(1) { text-align: center; font-weight: 600; color: #6b7280; }
        .items-table td:nth-child(4) { text-align: center; }
        .items-table td:nth-child(5), .items-table td:nth-child(6) { text-align: right; }
        .items-table tbody tr:nth-child(even) { background: #fafafa; }
        .summary-section { display: flex; justify-content: flex-end; margin-bottom: 14px; }
        .summary-table { width: 280px; font-size: 9.5pt; border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px 12px; background: #fafafa; }
        .summary-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #e5e7eb; }
        .summary-row:last-child { border-bottom: none; }
        .summary-row.total { font-weight: 700; font-size: 12pt; color: #0284c7; border-top: 2px solid #0284c7; padding-top: 8px; margin-top: 4px; }
        .notes-section { border: 1px solid #dbeafe; border-radius: 6px; padding: 10px 12px; margin-bottom: 14px; background: linear-gradient(to bottom, #eff6ff, #ffffff); }
        .notes-title { font-weight: 700; font-size: 9.5pt; color: #0284c7; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.3px; }
        .payment-section { border: 1px solid #93c5fd; border-radius: 6px; padding: 10px 14px; margin-bottom: 14px; background: linear-gradient(to bottom, #eff6ff, #ffffff); box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .payment-title { font-weight: 700; font-size: 10pt; color: #1e40af; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.3px; }
        .signature-section { display: flex; justify-content: space-between; margin-top: 20px; padding-top: 16px; margin-bottom: 65px; gap: 16px; }
        .signature-box { flex: 1; text-align: center; padding: 8px; border: 1px solid #f3f4f6; border-radius: 6px; background: #fafafa; }
        .signature-line { border-bottom: 2px solid #9ca3af; height: 35px; margin-bottom: 8px; }
        .signature-label { font-size: 9pt; font-weight: 600; color: #1f2937; }
        .signature-sublabel { font-size: 8pt; color: #6b7280; margin-top: 2px; }
        .footer-info { display: flex; justify-content: space-between; font-size: 7.5pt; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 6px; margin-top: 16px; }
        @media print { .footer-info { position: fixed !important; bottom: 8mm !important; left: 12mm !important; right: 12mm !important; margin-top: 0 !important; background: white !important; } }
      `}</style>

      <PrintStyles />
      <div className="no-print" style={{ textAlign: 'center', padding: '12px', background: '#f0f0f0' }}>
        <button
          onClick={() => { setSelectedLang('th'); window.history.replaceState(null, '', updateQueryStringParameter(window.location.href, 'lang', 'th')) }}
          style={{ marginRight: 8, padding: '6px 16px', fontSize: 13, borderRadius: 20, border: selectedLang === 'th' ? '2px solid #0284c7' : '1px solid #ccc', background: selectedLang === 'th' ? '#eff6ff' : '#fff', cursor: 'pointer', fontWeight: selectedLang === 'th' ? 600 : 400 }}
        >ไทย</button>
        <button
          onClick={() => { setSelectedLang('en'); window.history.replaceState(null, '', updateQueryStringParameter(window.location.href, 'lang', 'en')) }}
          style={{ marginRight: 8, padding: '6px 16px', fontSize: 13, borderRadius: 20, border: selectedLang === 'en' ? '2px solid #0284c7' : '1px solid #ccc', background: selectedLang === 'en' ? '#eff6ff' : '#fff', cursor: 'pointer', fontWeight: selectedLang === 'en' ? 600 : 400 }}
        >English</button>
        <button
          onClick={() => window.print()}
          style={{ marginLeft: 16, padding: '6px 20px', fontSize: 13, borderRadius: 20, border: '1px solid #0284c7', background: '#0284c7', color: 'white', cursor: 'pointer', fontWeight: 600 }}
        >{L('Print', 'พิมพ์')}</button>
      </div>

      <div className="a4-page">
        {/* Header */}
        <div className="header-row">
          <div className="company-info">
            <div className="company-logo-section">
              <img src="/k-energy-save-logo.jpg" alt="Logo" className="company-logo" />
              <div className="company-text">
                <div className="company-name">{L('K Energy Save', 'เค อีเนอร์ยี่ เซฟ')}</div>
                <div className="company-name-en">{L('K Energy Save Co., Ltd.', 'บริษัท เค อีเนอร์ยี่ เซฟ จำกัด')}</div>
              </div>
            </div>
            <div className="company-address">
              84 Chaloem Phrakiat Rama 9 Soi 34, Nong Bon, Prawet, Bangkok 10250<br/>
              Tel: 02-080-8916 | Email: info@kenergy-save.com
            </div>
          </div>
          <div className="doc-title">
            <h1>{L('SALES ORDER', 'ใบสั่งขาย')}</h1>
            <h2>{order.orderNo || '-'}</h2>
          </div>
        </div>

        {/* Info Boxes */}
        <div className="info-section">
          <div className="info-box">
            <div className="info-box-title">{L('Order Information', 'ข้อมูลใบสั่งขาย')}</div>
            <div className="info-row">
              <span className="info-label">{L('Order No:', 'เลขที่:')}</span>
              <span className="info-value" style={{ fontWeight: 700 }}>{order.orderNo || '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Order Date:', 'วันที่สั่ง:')}</span>
              <span className="info-value">{fmtDate(order.order_date)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Delivery Date:', 'วันที่ส่ง:')}</span>
              <span className="info-value">{fmtDate(order.delivery_date)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Status:', 'สถานะ:')}</span>
              <span className="info-value" style={{ color: stInfo.color, fontWeight: 600 }}>
                {L(stInfo.en, stInfo.th)}
              </span>
            </div>
          </div>
          <div className="info-box">
            <div className="info-box-title">{L('Customer Information', 'ข้อมูลลูกค้า')}</div>
            <div className="info-row">
              <span className="info-label">{L('Name:', 'ชื่อ:')}</span>
              <span className="info-value" style={{ fontWeight: 600 }}>{order.customer_name || '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Address:', 'ที่อยู่:')}</span>
              <span className="info-value">{order.customer_address || '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Phone:', 'โทรศัพท์:')}</span>
              <span className="info-value">{order.customer_phone || '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Email:', 'อีเมล:')}</span>
              <span className="info-value">{order.customer_email || '-'}</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="items-table">
          <thead>
            <tr>
              <th className="num">{L('No.', 'ลำดับ')}</th>
              <th>{L('Description', 'รายการสินค้า')}</th>
              <th className="sku">SKU</th>
              <th className="qty">{L('Qty', 'จำนวน')}</th>
              <th className="price">{L('Unit Price', 'ราคา/หน่วย')}</th>
              <th className="amount right">{L('Amount', 'จำนวนเงิน')}</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#999', padding: 20 }}>
                  {L('No items', 'ไม่มีรายการ')}
                </td>
              </tr>
            ) : items.map((it: any, idx: number) => {
              const qty = Number(it.quantity || it.qty || 1)
              const unitPrice = Number(it.unit_price || it.unitPrice || 0)
              const amount = Number(it.total_price || it.total || (qty * unitPrice))
              return (
                <tr key={it.itemID || idx}>
                  <td className="num">{idx + 1}</td>
                  <td>{it.product_name || it.description || '-'}</td>
                  <td>{it.sku || '-'}</td>
                  <td className="center">{qty.toLocaleString('th-TH')}</td>
                  <td className="right">{fmtNum(unitPrice)}</td>
                  <td className="right">{fmtNum(amount)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Summary */}
        <div className="summary-section">
          <div className="summary-table">
            <div className="summary-row">
              <span>{L('Subtotal', 'ราคารวม')}</span>
              <span>{fmtNum(subtotal)} ฿</span>
            </div>
            {(discountPct > 0 || discountAmt > 0) && (
              <div className="summary-row">
                <span>{L('Discount', 'ส่วนลด')}{discountPct > 0 ? ` (${discountPct}%)` : ''}</span>
                <span>-{fmtNum(discountAmt || (subtotal * discountPct / 100))} ฿</span>
              </div>
            )}
            <div className="summary-row">
              <span>{L(`VAT ${vatPct}%`, `ภาษีมูลค่าเพิ่ม ${vatPct}%`)}</span>
              <span>{fmtNum(vatAmt)} ฿</span>
            </div>
            <div className="summary-row total">
              <span>{L('Grand Total', 'ยอดรวมสุทธิ')}</span>
              <span>{fmtNum(grandTotal)} ฿</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="notes-section">
            <div className="notes-title">{L('Notes / Remarks', 'หมายเหตุ')}</div>
            <div style={{ fontSize: '10pt', color: '#334155', lineHeight: 1.6 }}>{order.notes}</div>
          </div>
        )}

        {/* Bank Info */}
        <div className="payment-section">
          <div className="payment-title">{L('Bank Account Information', 'ข้อมูลบัญชีธนาคาร')}</div>
          <div style={{ fontSize: '9pt', lineHeight: 1.6, color: '#334155' }}>
            <div><strong>{L('Bank:', 'ธนาคาร:')}</strong> {L('Kasikorn Bank (KBANK)', 'ธนาคารกสิกรไทย')}</div>
            <div><strong>{L('Current Account:', 'บัญชีกระแสรายวัน:')}</strong> 212-1-17253-7</div>
            <div><strong>{L('Savings Account:', 'บัญชีออมทรัพย์:')}</strong> 211-8-78336-3</div>
            <div><strong>{L('Account Name:', 'ชื่อบัญชี:')}</strong> {L('K Energy Save Co., Ltd.', 'บริษัท เค อีเนอร์ยี่ เซฟ จำกัด')}</div>
          </div>
        </div>

        {/* Signatures */}
        <div className="signature-section">
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-label">{L('Sales Representative', 'ผู้จัดทำ')}</div>
            <div className="signature-sublabel">{L('Sales Department', 'ฝ่ายขาย')}</div>
          </div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-label">{L('Approved By', 'ผู้อนุมัติ')}</div>
            <div className="signature-sublabel">{L('Manager', 'ผู้จัดการ')}</div>
          </div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-label">{L('Received By', 'ผู้รับ')}</div>
            <div className="signature-sublabel">{L('Customer', 'ลูกค้า')}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="footer-info">
          <span>{L('Printed by:', 'ผู้พิมพ์:')} {loggedUser || '-'}</span>
          <span>{L('Printed on:', 'พิมพ์เมื่อ:')} {new Date(lastPrinted || new Date()).toLocaleString(selectedLang === 'th' ? 'th-TH' : 'en-US')}</span>
          <span>{L('Print count:', 'ครั้งที่พิมพ์:')} {printCount + 1}</span>
        </div>
      </div>
    </>
  )
}

export default function SalesOrderPrintPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20, textAlign: 'center', fontFamily: 'Sarabun, sans-serif' }}>กำลังโหลด...</div>}>
      <SalesOrderPrintContent />
    </Suspense>
  )
}
