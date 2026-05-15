"use client"

import React, { useEffect, useState, Suspense } from 'react'
import PrintStyles from '../../components/PrintStyles'
import { useSearchParams } from 'next/navigation'

function WarrantyPrintContent() {
  const searchParams = useSearchParams()
  const wcNo = searchParams?.get('wcNo') || ''
  const wtID = searchParams?.get('wtID') || ''
  const auto = searchParams?.get('autoPrint')
  const [doc, setDoc] = useState<any | null>(null)
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
    const idOrNo = wtID || wcNo
    if (!idOrNo) return
    ;(async () => {
      try {
        let res = await fetch(`/api/warranties?wtID=${encodeURIComponent(wtID)}`)
        let j = await res.json().catch(() => null)
        if (!(res.ok && j && j.success && j.warranty)) {
          res = await fetch(`/api/warranties?wtNo=${encodeURIComponent(wcNo || wtID)}`)
          j = await res.json().catch(() => null)
        }
        if (j && j.success) {
          setDoc(j.warranty || j.rows?.[0] || null)
        }
      } catch (err) {
        console.error('Failed to load warranty for print', err)
      }
    })()
  }, [wtID, wcNo])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('k_system_admin_user')
      if (raw) {
        const u = JSON.parse(raw)
        setLoggedUser(u?.name || u?.fullname || u?.username || String(u?.userId || ''))
      }
    } catch {}
    const key = `print_count:warranty:${wtID || wcNo || 'unknown'}`
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
  }, [wtID, wcNo])

  useEffect(() => {
    if (doc && (auto === '1' || auto === 'true')) {
      setTimeout(() => { try { window.print() } catch (e) { console.error(e) } }, 300)
    }
  }, [doc, auto])

  if (!wtID && !wcNo) return <div style={{ padding: 20 }}>Missing wtID or wcNo</div>
  if (!doc) return <div style={{ padding: 20 }}>Loading...</div>

  const updateQueryStringParameter = (uri: string, key: string, value: string) => {
    try {
      const url = new URL(uri)
      url.searchParams.set(key, value)
      return url.toString()
    } catch { return uri }
  }

  const L = (en: string, th: string) => selectedLang === 'th' ? th : en

  const fmt = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-'
    try {
      return new Date(dateStr).toLocaleDateString(selectedLang === 'th' ? 'th-TH' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    } catch { return dateStr }
  }

  const claims: any[] = Array.isArray(doc.claims) ? doc.claims : []

  const statusColor = (s: string) => {
    if (s === 'active') return '#16a34a'
    if (s === 'expired') return '#dc2626'
    if (s === 'void') return '#6b7280'
    return '#d97706'
  }

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
        .doc-title h1 { font-size: 22pt; font-weight: 700; color: #16a34a; margin: 0 0 4px 0; }
        .doc-title h2 { font-size: 14pt; font-weight: 600; color: #666; margin: 0; }
        .info-section { display: flex; gap: 20px; margin-bottom: 16px; }
        .info-box { flex: 1; border: 1px solid #ddd; border-radius: 6px; padding: 10px 12px; background: #fafafa; }
        .info-box-title { font-weight: 700; font-size: 10pt; color: #16a34a; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #ddd; }
        .info-row { display: flex; margin-bottom: 4px; font-size: 10pt; }
        .info-label { width: 130px; font-weight: 600; color: #555; flex-shrink: 0; }
        .info-value { flex: 1; color: #333; }
        .coverage-box { border: 1px solid #ddd; border-radius: 6px; padding: 10px 12px; background: #f0fdf4; margin-bottom: 16px; }
        .coverage-box-title { font-weight: 700; font-size: 10pt; color: #16a34a; margin-bottom: 6px; }
        .coverage-text { font-size: 10pt; color: #333; white-space: pre-wrap; line-height: 1.6; }
        .claims-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 9.5pt; }
        .claims-table th { background: #16a34a; color: white; padding: 7px 10px; text-align: left; font-weight: 600; }
        .claims-table td { padding: 7px 10px; border-bottom: 1px solid #eee; }
        .claims-table tbody tr:nth-child(even) { background: #f9f9f9; }
        .warranty-badge { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 10pt; font-weight: 700; border: 2px solid; }
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
          style={{ marginRight: 8, padding: '6px 16px', fontSize: 13, borderRadius: 20, border: selectedLang === 'th' ? '2px solid #16a34a' : '1px solid #ccc', background: selectedLang === 'th' ? '#f0fdf4' : '#fff', cursor: 'pointer', fontWeight: selectedLang === 'th' ? 600 : 400 }}
        >ไทย</button>
        <button
          onClick={() => { setSelectedLang('en'); window.history.replaceState(null, '', updateQueryStringParameter(window.location.href, 'lang', 'en')) }}
          style={{ marginRight: 8, padding: '6px 16px', fontSize: 13, borderRadius: 20, border: selectedLang === 'en' ? '2px solid #16a34a' : '1px solid #ccc', background: selectedLang === 'en' ? '#f0fdf4' : '#fff', cursor: 'pointer', fontWeight: selectedLang === 'en' ? 600 : 400 }}
        >English</button>
        <button
          onClick={() => window.print()}
          style={{ marginLeft: 16, padding: '6px 20px', fontSize: 13, borderRadius: 20, border: '1px solid #16a34a', background: '#16a34a', color: 'white', cursor: 'pointer', fontWeight: 600 }}
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
              84 Chaloem Phrakiat Rama 9 Soi 34, Nong Bon, Prawet, Bangkok 10250<br />
              Tel: 02-080-8916 | Email: info@kenergy-save.com
            </div>
          </div>
          <div className="doc-title">
            <h1>{L('WARRANTY', 'ใบรับประกัน')}</h1>
            <h2>{L('Warranty Certificate', 'ใบรับประกันสินค้า')}</h2>
            <div style={{ marginTop: 8 }}>
              <span
                className="warranty-badge"
                style={{ color: statusColor(doc.status || 'active'), borderColor: statusColor(doc.status || 'active') }}
              >
                {L(
                  (doc.status || 'active').charAt(0).toUpperCase() + (doc.status || 'active').slice(1),
                  doc.status === 'active' ? 'ใช้งานอยู่' : doc.status === 'expired' ? 'หมดอายุ' : doc.status === 'void' ? 'ยกเลิก' : 'รอดำเนินการ'
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="info-section">
          <div className="info-box">
            <div className="info-box-title">{L('Warranty Information', 'ข้อมูลใบรับประกัน')}</div>
            <div className="info-row">
              <span className="info-label">{L('WT No:', 'เลขที่ประกัน:')}</span>
              <span className="info-value" style={{ fontWeight: 700 }}>{doc.wtNo || '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Date:', 'วันที่:')}</span>
              <span className="info-value">{fmt(doc.wtDate)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Contract No:', 'เลขที่สัญญา:')}</span>
              <span className="info-value">{doc.contract_no || '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Warranty Type:', 'ประเภทประกัน:')}</span>
              <span className="info-value">{doc.warranty_type || '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Period:', 'ระยะเวลา:')}</span>
              <span className="info-value">{doc.warranty_period ? `${doc.warranty_period} ${L('months', 'เดือน')}` : '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Start Date:', 'วันเริ่มประกัน:')}</span>
              <span className="info-value">{fmt(doc.warranty_start_date)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('End Date:', 'วันสิ้นสุดประกัน:')}</span>
              <span className="info-value" style={{ fontWeight: 600, color: '#dc2626' }}>{fmt(doc.warranty_end_date)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
            <div className="info-box">
              <div className="info-box-title">{L('Customer Information', 'ข้อมูลลูกค้า')}</div>
              <div className="info-row">
                <span className="info-label">{L('Name:', 'ชื่อ:')}</span>
                <span className="info-value" style={{ fontWeight: 600 }}>{doc.customer_name || '-'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">{L('Phone:', 'โทรศัพท์:')}</span>
                <span className="info-value">{doc.customer_phone || '-'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">{L('Email:', 'อีเมล:')}</span>
                <span className="info-value">{doc.customer_email || '-'}</span>
              </div>
            </div>

            <div className="info-box">
              <div className="info-box-title">{L('Product Information', 'ข้อมูลสินค้า')}</div>
              <div className="info-row">
                <span className="info-label">{L('Product:', 'สินค้า:')}</span>
                <span className="info-value" style={{ fontWeight: 600 }}>{doc.product_name || '-'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">{L('Serial No:', 'ซีเรียล:')}</span>
                <span className="info-value">{doc.serial_number || '-'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">{L('Purchase Date:', 'วันที่ซื้อ:')}</span>
                <span className="info-value">{fmt(doc.purchase_date)}</span>
              </div>
            </div>
          </div>
        </div>

        {doc.coverage_details && (
          <div className="coverage-box">
            <div className="coverage-box-title">{L('Coverage Details', 'รายละเอียดการรับประกัน')}</div>
            <div className="coverage-text">{doc.coverage_details}</div>
          </div>
        )}

        {doc.notes && (
          <div style={{ border: '1px solid #fde68a', borderRadius: 6, padding: '10px 12px', background: '#fffbeb', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: '10pt', color: '#d97706', marginBottom: 6 }}>{L('Notes', 'หมายเหตุ')}</div>
            <div style={{ fontSize: '10pt', color: '#333' }}>{doc.notes}</div>
          </div>
        )}

        {claims.length > 0 && (
          <>
            <div style={{ fontWeight: 700, fontSize: '11pt', color: '#16a34a', marginBottom: 8 }}>
              {L('Warranty Claims', 'ประวัติการเคลม')} ({claims.length})
            </div>
            <table className="claims-table">
              <thead>
                <tr>
                  <th>{L('No.', 'ลำดับ')}</th>
                  <th>{L('Claim No.', 'เลขที่เคลม')}</th>
                  <th>{L('Date', 'วันที่')}</th>
                  <th>{L('Issue', 'ปัญหา')}</th>
                  <th>{L('Status', 'สถานะ')}</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((c: any, idx: number) => (
                  <tr key={idx}>
                    <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                    <td>{c.wcNo || c.wc_no || '-'}</td>
                    <td>{fmt(c.claim_date || c.wcDate)}</td>
                    <td>{c.issue_description || c.description || '-'}</td>
                    <td>{c.status || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <div className="signature-section">
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-label">{L('Prepared By', 'ผู้จัดทำ')}</div>
            <div className="signature-sublabel">{L('Sales / Service', 'ฝ่ายขาย / บริการ')}</div>
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

        <div className="footer-info">
          <span>{L('User:', 'ผู้พิมพ์:')} {loggedUser || '-'}</span>
          <span>{L('Printed:', 'พิมพ์เมื่อ:')} {new Date(lastPrinted || new Date()).toLocaleString(selectedLang === 'th' ? 'th-TH' : 'en-US')}</span>
          <span>{L('Print Count:', 'ครั้งที่พิมพ์:')} {printCount + 1}</span>
        </div>
      </div>
    </>
  )
}

export default function WarrantyPrintPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>}>
      <WarrantyPrintContent />
    </Suspense>
  )
}
