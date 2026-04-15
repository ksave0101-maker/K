"use client"

import React, { useEffect, useState, Suspense } from 'react'
import PrintStyles from '../../components/PrintStyles'
import { useSearchParams } from 'next/navigation'

function StockTransferPrintContent() {
  const searchParams = useSearchParams()
  const stID = searchParams?.get('stID') || ''
  const stNo = searchParams?.get('stNo') || ''
  const auto = searchParams?.get('autoPrint')
  const [doc, setDoc] = useState<any | null>(null)
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
    const idOrNo = stID || stNo
    if (!idOrNo) return
    ;(async () => {
      try {
        let res = await fetch(`/api/stock-transfers?stID=${encodeURIComponent(stID)}`)
        let j = await res.json().catch(() => null)
        if (!(res.ok && j && j.success && j.stockTransfer)) {
          res = await fetch(`/api/stock-transfers?stNo=${encodeURIComponent(stNo || stID)}`)
          j = await res.json().catch(() => null)
        }
        if (j && j.success) {
          const q = j.stockTransfer || j.stockTransfers?.[0] || null
          if (q && q.items && typeof q.items === 'string') {
            try { q.items = JSON.parse(q.items) } catch (_) {}
          }
          setDoc(q)
        }
      } catch (err) {
        console.error('Failed to load stock transfer for print', err)
      }
    })()
  }, [stID, stNo])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('k_system_admin_user')
      if (raw) {
        const u = JSON.parse(raw)
        setLoggedUser(u?.name || u?.fullname || u?.username || String(u?.userId || ''))
      }
    } catch {}
    const key = `print_count:stock-transfer:${stID || stNo || 'unknown'}`
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
  }, [stID, stNo])

  useEffect(() => {
    if (doc && (auto === '1' || auto === 'true')) {
      setTimeout(() => { try { window.print() } catch (e) { console.error(e) } }, 300)
    }
  }, [doc, auto])

  if (!stID && !stNo) return <div style={{ padding: 20 }}>Missing stID or stNo</div>
  if (!doc) return <div style={{ padding: 20 }}>Loading...</div>

  const updateQueryStringParameter = (uri: string, key: string, value: string) => {
    try {
      const url = new URL(uri)
      url.searchParams.set(key, value)
      return url.toString()
    } catch (e) { return uri }
  }

  const L = (en: string, th: string) => selectedLang === 'th' ? th : en

  const items = Array.isArray(doc.items) ? doc.items : []
  const subtotal = items.reduce((s: number, it: any) => {
    const qty = Number(it.quantity || 0)
    const price = Number(it.unit_price || it.unitPrice || 0)
    return s + (qty * price)
  }, 0)
  const discount = Number(doc.discount || 0)
  const afterDiscount = subtotal - discount
  const vat = (afterDiscount * 7) / 100
  const grandTotal = afterDiscount + vat

  const fromLocation = doc.from_location || doc.source || '-'
  const toLocation = doc.to_location || doc.destination || '-'
  const transferBy = doc.transfer_by || doc.transferredBy || '-'
  const notes = doc.notes || doc.remark || '-'

  return (
    <>
      <style>{`
        @page { size: A4 portrait; margin: 1.8cm 2.5cm 1.8cm 2.5cm; }
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; overflow: hidden !important; }
          html, body { -ms-overflow-style: none !important; scrollbar-width: none !important; }
          ::-webkit-scrollbar { display: none !important; }
          .a4-page { box-shadow: none !important; }
        }
        @media screen { body { background: #e5e5e5; overflow-y: auto; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
        html { -ms-overflow-style: none; scrollbar-width: none; }
        .a4-page { width: 100%; max-width: 190mm; min-height: 297mm; margin: 10mm auto; padding: 10mm 12mm; background: white; font-family: 'Sarabun', 'Segoe UI', sans-serif; font-size: 11pt; line-height: 1.4; color: #333; box-shadow: 0 2px 8px rgba(0,0,0,0.15); position: relative; }
        .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #16a34a; }
        .company-info { flex: 1; }
        .company-name { font-size: 18pt; font-weight: 700; color: #16a34a; margin-bottom: 4px; }
        .company-name-en { font-size: 11pt; font-weight: 600; color: #333; margin-bottom: 6px; }
        .company-address { font-size: 9pt; color: #666; line-height: 1.5; }
        .doc-title { text-align: right; }
        .doc-title h1 { font-size: 22pt; font-weight: 700; color: #8b5cf6; margin: 0 0 4px 0; }
        .doc-title h2 { font-size: 14pt; font-weight: 600; color: #666; margin: 0; }
        .info-section { display: flex; gap: 20px; margin-bottom: 16px; }
        .info-box { flex: 1; border: 1px solid #ddd; border-radius: 6px; padding: 10px 12px; background: #fafafa; }
        .info-box-title { font-weight: 700; font-size: 10pt; color: #16a34a; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #ddd; }
        .info-row { display: flex; margin-bottom: 4px; font-size: 10pt; }
        .info-label { width: 100px; font-weight: 600; color: #555; }
        .info-value { flex: 1; color: #333; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 10pt; }
        .items-table th { background: #8b5cf6; color: white; padding: 8px 10px; text-align: left; font-weight: 600; }
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
        .summary-row.total { font-weight: 700; font-size: 12pt; color: #8b5cf6; border-top: 2px solid #8b5cf6; border-bottom: none; padding-top: 10px; margin-top: 4px; }
        .signature-section { display: flex; justify-content: space-between; margin-top: 30px; padding-top: 20px; }
        .signature-box { width: 30%; text-align: center; }
        .signature-line { border-bottom: 1px solid #333; height: 40px; margin-bottom: 8px; }
        .signature-label { font-size: 10pt; font-weight: 600; color: #333; }
        .signature-sublabel { font-size: 9pt; color: #666; }
        .footer-info { position: absolute; bottom: 10mm; left: 15mm; right: 15mm; display: flex; justify-content: space-between; font-size: 8pt; color: #999; border-top: 1px solid #eee; padding-top: 8px; }
      `}</style>


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

      <div className="a4-page">
        <div className="header-row">
          <div className="company-info">
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
          <div className="doc-title">
            <h1>{L('STOCK TRANSFER', 'ใบโอนสินค้า')}</h1>
            <h2>{L('Transfer Document', 'เอกสารโอนย้าย')}</h2>
          </div>
        </div>

        <div className="info-section">
          <div className="info-box">
            <div className="info-box-title">{L('Transfer Information', 'ข้อมูลการโอน')}</div>
            <div className="info-row">
              <span className="info-label">{L('Transfer No:', 'เลขที่:')}</span>
              <span className="info-value" style={{ fontWeight: 700 }}>{doc.stNo || doc.st_no || '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Date:', 'วันที่:')}</span>
              <span className="info-value">{doc.stDate || doc.date ? new Date(doc.stDate || doc.date).toLocaleDateString(selectedLang === 'th' ? 'th-TH' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Transfer By:', 'ผู้โอน:')}</span>
              <span className="info-value">{transferBy}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Status:', 'สถานะ:')}</span>
              <span className="info-value" style={{ color: doc.status === 'completed' ? '#16a34a' : '#666' }}>{doc.status || 'pending'}</span>
            </div>
          </div>
          <div className="info-box">
            <div className="info-box-title">{L('Location Details', 'รายละเอียดสถานที่')}</div>
            <div className="info-row">
              <span className="info-label">{L('From:', 'จาก:')}</span>
              <span className="info-value" style={{ fontWeight: 600 }}>{fromLocation}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('To:', 'ไปยัง:')}</span>
              <span className="info-value" style={{ fontWeight: 600 }}>{toLocation}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Notes:', 'หมายเหตุ:')}</span>
              <span className="info-value">{notes}</span>
            </div>
          </div>
        </div>

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
              <tr><td colSpan={5} style={{ textAlign: 'center', color: '#999', padding: 20 }}>-</td></tr>
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

        <div className="signature-section">
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-label">{L('Sent By', 'ผู้ส่ง')}</div>
            <div className="signature-sublabel">{L('Source Location', 'สถานที่ต้นทาง')}</div>
          </div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-label">{L('Received By', 'ผู้รับ')}</div>
            <div className="signature-sublabel">{L('Destination', 'สถานที่ปลายทาง')}</div>
          </div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-label">{L('Approved By', 'ผู้อนุมัติ')}</div>
            <div className="signature-sublabel">{L('Manager', 'ผู้จัดการ')}</div>
          </div>
        </div>

        <div className="footer-info">
          <span>{L('User:', 'ผู้พิมพ์:')} {loggedUser || '-'}</span>
          <span>{L('Printed:', 'พิมพ์เมื่อ:')} {new Date(lastPrinted || new Date()).toLocaleString(selectedLang === 'th' ? 'th-TH' : 'en-US')}</span>
          <span>{L('Print Count:', 'ครั้งที่พิมพ์:')} {printCount + 1}</span>
        </div>
      </div>
    </>
  )
}

export default function StockTransferPrintPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>}>
      <StockTransferPrintContent />
    </Suspense>
  )
}
