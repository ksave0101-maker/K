"use client"

import React, { useEffect, useState, Suspense } from 'react'
import PrintStyles from '../../components/PrintStyles'
import { useSearchParams } from 'next/navigation'

function FollowUpPrintContent() {
  const searchParams = useSearchParams()
  const followUpID = searchParams?.get('followUpID') || ''
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
    if (!followUpID) return
    ;(async () => {
      try {
        const res = await fetch(`/api/follow-ups?followUpID=${encodeURIComponent(followUpID)}`)
        const j = await res.json().catch(() => null)
        if (j && j.success) {
          setDoc(j.followUp || j.rows?.[0] || null)
        }
      } catch (err) {
        console.error('Failed to load follow-up for print', err)
      }
    })()
  }, [followUpID])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('k_system_admin_user')
      if (raw) {
        const u = JSON.parse(raw)
        setLoggedUser(u?.name || u?.fullname || u?.username || String(u?.userId || ''))
      }
    } catch {}
    const key = `print_count:follow-up:${followUpID || 'unknown'}`
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
  }, [followUpID])

  useEffect(() => {
    if (doc && (auto === '1' || auto === 'true')) {
      setTimeout(() => { try { window.print() } catch (e) { console.error(e) } }, 300)
    }
  }, [doc, auto])

  if (!followUpID) return <div style={{ padding: 20 }}>Missing followUpID</div>
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

  const statusColor = (s: string) => {
    if (s === 'completed') return '#16a34a'
    if (s === 'in_progress') return '#d97706'
    if (s === 'cancelled') return '#dc2626'
    if (s === 'open') return '#2563eb'
    return '#6b7280'
  }

  const statusLabel = (s: string) => {
    const map: Record<string, [string, string]> = {
      open: ['Open', 'เปิด'],
      in_progress: ['In Progress', 'กำลังดำเนินการ'],
      pending: ['Pending', 'รอดำเนินการ'],
      completed: ['Completed', 'เสร็จสิ้น'],
      cancelled: ['Cancelled', 'ยกเลิก'],
    }
    const entry = map[s]
    return entry ? L(entry[0], entry[1]) : s
  }

  const targetLabel = (t: string | null) => {
    if (!t) return '-'
    const map: Record<string, [string, string]> = {
      order: ['Purchase Order', 'ใบสั่งซื้อ'],
      quotation: ['Quotation', 'ใบเสนอราคา'],
      invoice: ['Invoice', 'ใบแจ้งหนี้'],
      delivery: ['Installation & Delivery', 'ติดตั้งและจัดส่ง'],
      customer: ['Customer', 'ลูกค้า'],
      product: ['Product', 'สินค้า'],
      other: ['Other', 'อื่นๆ'],
    }
    const entry = map[t]
    return entry ? L(entry[0], entry[1]) : t
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
        .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #2563eb; }
        .company-info { flex: 1; }
        .company-name { font-size: 18pt; font-weight: 700; color: #16a34a; margin-bottom: 4px; }
        .company-name-en { font-size: 11pt; font-weight: 600; color: #333; margin-bottom: 6px; }
        .company-address { font-size: 9pt; color: #666; line-height: 1.5; }
        .doc-title { text-align: right; }
        .doc-title h1 { font-size: 22pt; font-weight: 700; color: #2563eb; margin: 0 0 4px 0; }
        .doc-title h2 { font-size: 14pt; font-weight: 600; color: #666; margin: 0; }
        .info-box { border: 1px solid #ddd; border-radius: 6px; padding: 10px 12px; background: #fafafa; margin-bottom: 16px; }
        .info-box-title { font-weight: 700; font-size: 10pt; color: #2563eb; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #ddd; }
        .info-row { display: flex; margin-bottom: 4px; font-size: 10pt; }
        .info-label { width: 140px; font-weight: 600; color: #555; flex-shrink: 0; }
        .info-value { flex: 1; color: #333; }
        .notes-box { border: 1px solid #ddd; border-radius: 6px; padding: 10px 12px; background: #f0f7ff; margin-bottom: 20px; }
        .notes-box-title { font-weight: 700; font-size: 10pt; color: #2563eb; margin-bottom: 8px; }
        .notes-text { font-size: 10pt; color: #333; white-space: pre-wrap; line-height: 1.7; }
        .status-badge { display: inline-block; padding: 4px 16px; border-radius: 20px; font-size: 10pt; font-weight: 700; border: 2px solid; }
        .signature-section { display: flex; justify-content: space-between; margin-top: 40px; }
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
          style={{ marginRight: 8, padding: '6px 16px', fontSize: 13, borderRadius: 20, border: selectedLang === 'th' ? '2px solid #2563eb' : '1px solid #ccc', background: selectedLang === 'th' ? '#eff6ff' : '#fff', cursor: 'pointer', fontWeight: selectedLang === 'th' ? 600 : 400 }}
        >ไทย</button>
        <button
          onClick={() => { setSelectedLang('en'); window.history.replaceState(null, '', updateQueryStringParameter(window.location.href, 'lang', 'en')) }}
          style={{ marginRight: 8, padding: '6px 16px', fontSize: 13, borderRadius: 20, border: selectedLang === 'en' ? '2px solid #2563eb' : '1px solid #ccc', background: selectedLang === 'en' ? '#eff6ff' : '#fff', cursor: 'pointer', fontWeight: selectedLang === 'en' ? 600 : 400 }}
        >English</button>
        <button
          onClick={() => window.print()}
          style={{ marginLeft: 16, padding: '6px 20px', fontSize: 13, borderRadius: 20, border: '1px solid #2563eb', background: '#2563eb', color: 'white', cursor: 'pointer', fontWeight: 600 }}
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
            <h1>{L('FOLLOW-UP', 'ใบติดตามงาน')}</h1>
            <h2>{L('Follow-up Document', 'เอกสารติดตามงาน')}</h2>
            <div style={{ marginTop: 8 }}>
              <span
                className="status-badge"
                style={{ color: statusColor(doc.status || 'open'), borderColor: statusColor(doc.status || 'open') }}
              >
                {statusLabel(doc.status || 'open')}
              </span>
            </div>
          </div>
        </div>

        <div className="info-box">
          <div className="info-box-title">{L('Follow-up Details', 'รายละเอียดการติดตาม')}</div>
          <div style={{ display: 'flex', gap: 40 }}>
            <div style={{ flex: 1 }}>
              <div className="info-row">
                <span className="info-label">{L('Follow-up ID:', 'รหัสติดตาม:')}</span>
                <span className="info-value" style={{ fontWeight: 700 }}>#{doc.followUpID}</span>
              </div>
              <div className="info-row">
                <span className="info-label">{L('Target Type:', 'ประเภทเป้าหมาย:')}</span>
                <span className="info-value">{targetLabel(doc.target_type)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">{L('Reference ID:', 'รหัสอ้างอิง:')}</span>
                <span className="info-value">{doc.target_id || '-'}</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="info-row">
                <span className="info-label">{L('Follow-up Date:', 'วันที่ติดตาม:')}</span>
                <span className="info-value" style={{ fontWeight: 600 }}>{fmt(doc.follow_up_date)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">{L('Assigned To:', 'มอบหมายให้:')}</span>
                <span className="info-value">{doc.assigned_to || '-'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">{L('Created:', 'วันที่สร้าง:')}</span>
                <span className="info-value">{fmt(doc.created_at)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">{L('Created By:', 'ผู้สร้าง:')}</span>
                <span className="info-value">{doc.created_by || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="notes-box">
          <div className="notes-box-title">{L('Notes / Details', 'บันทึก / รายละเอียด')}</div>
          <div className="notes-text">{doc.notes || '-'}</div>
        </div>

        <div className="signature-section">
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-label">{L('Prepared By', 'ผู้จัดทำ')}</div>
            <div className="signature-sublabel">{L('Staff', 'พนักงาน')}</div>
          </div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-label">{L('Acknowledged By', 'ผู้รับทราบ')}</div>
            <div className="signature-sublabel">{doc.assigned_to || L('Assignee', 'ผู้รับผิดชอบ')}</div>
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

export default function FollowUpPrintPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>}>
      <FollowUpPrintContent />
    </Suspense>
  )
}
