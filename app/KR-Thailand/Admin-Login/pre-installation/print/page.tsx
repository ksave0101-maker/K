"use client"

import React, { useEffect, useState, Suspense } from 'react'
import PrintStyles from '../../components/PrintStyles'
import { useSearchParams } from 'next/navigation'

function PreInstallationPrintPageContent() {
  const searchParams = useSearchParams()
  const formID = searchParams?.get('formID') || searchParams?.get('id') || ''
  const auto = searchParams?.get('autoPrint')
  const [form, setForm] = useState<any | null>(null)
  const [loggedUser, setLoggedUser] = useState<string | null>(null)
  const [printCount, setPrintCount] = useState<number>(0)
  const [lastPrinted, setLastPrinted] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    if (!formID) return
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/pre-installation?id=${encodeURIComponent(formID)}`)
        const j = await res.json()
        if (res.ok && j && j.success) {
          setForm(j.form)
        } else {
          setError(j?.message || 'Not found')
        }
      } catch (err: any) {
        setError(String(err))
      } finally {
        setLoading(false)
      }
    })()
  }, [formID])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('k_system_admin_user')
      if (raw) {
        const u = JSON.parse(raw)
        setLoggedUser(u?.name || u?.fullname || u?.username || String(u?.userId || ''))
      }
    } catch {}
    const key = `print_count:pre_install:${formID || 'unknown'}`
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
  }, [formID])

  useEffect(() => {
    if (form && (auto === '1' || auto === 'true')) {
      setTimeout(() => { try { window.print() } catch (e) { console.error(e) } }, 300)
    }
  }, [form, auto])

  if (!formID) return <div style={{ padding: 20 }}>Missing formID</div>
  if (loading) return <div style={{ padding: 20 }}>Loading...</div>
  if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>
  if (!form) return <div style={{ padding: 20 }}>Form not found</div>

  const updateQueryStringParameter = (uri: string, key: string, value: string) => {
    try {
      const url = new URL(uri)
      url.searchParams.set(key, value)
      return url.toString()
    } catch (e) { return uri }
  }

  const L = (en: string, th: string) => selectedLang === 'th' ? th : en

  const checklist = Array.isArray(form.checklist) ? form.checklist : []
  const photos = Array.isArray(form.photos) ? form.photos : []

  return (
    <>
      <style>{`
        @page { size: A4 portrait; margin: 1.8cm 2.5cm 1.8cm 2.5cm; }
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; overflow: hidden !important; }
          html, body { -ms-overflow-style: none !important; scrollbar-width: none !important; }
          ::-webkit-scrollbar { display: none !important; }
          .a4-page { box-shadow: none !important; } }
        @media screen { body { background: #e5e5e5; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
        html { -ms-overflow-style: none; scrollbar-width: none; }
        .a4-page { width: 100%; max-width: 190mm; min-height: 297mm; margin: 10mm auto; padding: 10mm 12mm; background: white; font-family: 'Sarabun', 'Segoe UI', sans-serif; font-size: 11pt; line-height: 1.4; color: #333; box-shadow: 0 2px 8px rgba(0,0,0,0.15); position: relative; }
        .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #dc2626; }
        .company-info { flex: 1; }
        .company-name { font-size: 18pt; font-weight: 700; color: #dc2626; margin-bottom: 4px; }
        .company-name-en { font-size: 11pt; font-weight: 600; color: #333; margin-bottom: 6px; }
        .company-address { font-size: 9pt; color: #666; line-height: 1.5; }
        .doc-title { text-align: right; }
        .doc-title h1 { font-size: 20pt; font-weight: 700; color: #dc2626; margin: 0 0 4px 0; }
        .doc-title h2 { font-size: 13pt; font-weight: 600; color: #666; margin: 0; }
        .info-section { display: flex; gap: 20px; margin-bottom: 16px; }
        .info-box { flex: 1; border: 1px solid #ddd; border-radius: 6px; padding: 10px 12px; background: #fafafa; }
        .info-box-title { font-weight: 700; font-size: 10pt; color: #dc2626; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #ddd; }
        .info-row { display: flex; margin-bottom: 4px; font-size: 10pt; }
        .info-label { width: 100px; font-weight: 600; color: #555; }
        .info-value { flex: 1; color: #333; }
        .checklist-section { border: 1px solid #ddd; border-radius: 6px; padding: 12px; margin-bottom: 16px; background: #fef2f2; }
        .checklist-title { font-weight: 700; font-size: 10pt; color: #dc2626; margin-bottom: 10px; }
        .checklist-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 10pt; }
        .checklist-item { display: flex; align-items: center; gap: 6px; }
        .notes-section { border: 1px solid #ddd; border-radius: 6px; padding: 12px; margin-bottom: 16px; background: #fff; }
        .notes-title { font-weight: 700; font-size: 10pt; color: #dc2626; margin-bottom: 10px; }
        .photos-section { border: 1px solid #ddd; border-radius: 6px; padding: 12px; margin-bottom: 16px; }
        .photos-title { font-weight: 700; font-size: 10pt; color: #dc2626; margin-bottom: 10px; }
        .photos-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .photo-item { width: 120px; height: 90px; object-fit: cover; border-radius: 6px; border: 1px solid #eee; }
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
            <h1>{L('PRE-INSTALLATION', 'แบบก่อนติดตั้ง')}</h1>
            <h2>{L('Site Survey Report', 'รายงานสำรวจหน้างาน')}</h2>
          </div>
        </div>

        <div className="info-section">
          <div className="info-box">
            <div className="info-box-title">{L('Form Information', 'ข้อมูลแบบฟอร์ม')}</div>
            <div className="info-row">
              <span className="info-label">{L('Form ID:', 'รหัส:')}</span>
              <span className="info-value" style={{ fontWeight: 700 }}>{form.formID || '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Order ID:', 'รหัสคำสั่ง:')}</span>
              <span className="info-value">{form.orderID || '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Customer ID:', 'รหัสลูกค้า:')}</span>
              <span className="info-value">{form.cusID || '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Status:', 'สถานะ:')}</span>
              <span className="info-value" style={{ color: form.status === 'completed' ? '#16a34a' : '#dc2626' }}>{form.status || 'pending'}</span>
            </div>
          </div>
          <div className="info-box">
            <div className="info-box-title">{L('Site Information', 'ข้อมูลหน้างาน')}</div>
            <div className="info-row">
              <span className="info-label">{L('Address:', 'ที่อยู่:')}</span>
              <span className="info-value" style={{ whiteSpace: 'pre-wrap' }}>{form.site_address || '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Created:', 'สร้างเมื่อ:')}</span>
              <span className="info-value">{form.created_at ? new Date(form.created_at).toLocaleDateString(selectedLang === 'th' ? 'th-TH' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Created By:', 'สร้างโดย:')}</span>
              <span className="info-value">{form.created_by || '-'}</span>
            </div>
          </div>
        </div>

        <div className="checklist-section">
          <div className="checklist-title">{L('Pre-Installation Checklist', 'รายการตรวจสอบก่อนติดตั้ง')}</div>
          <div className="checklist-grid">
            {checklist.length === 0 ? (
              <div style={{ color: '#999' }}>-</div>
            ) : checklist.map((item: any, idx: number) => (
              <div key={idx} className="checklist-item">
                <span style={{ color: item.ok || item.checked ? '#16a34a' : '#999' }}>
                  {item.ok || item.checked ? '☑' : '☐'}
                </span>
                <span>{selectedLang === 'th' ? (item.label_th || item.label || item.label_en) : (item.label_en || item.label || item.label_th)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="notes-section">
          <div className="notes-title">{L('Notes / Remarks', 'หมายเหตุ')}</div>
          <div style={{ fontSize: '10pt', whiteSpace: 'pre-wrap', minHeight: 60 }}>{form.notes || '-'}</div>
        </div>

        {photos.length > 0 && (
          <div className="photos-section">
            <div className="photos-title">{L('Site Photos', 'รูปภาพหน้างาน')}</div>
            <div className="photos-grid">
              {photos.map((p: any) => (
                <img
                  key={p.id}
                  src={`/api/pre-installation/image?id=${encodeURIComponent(String(p.id))}`}
                  alt={p.filename || 'photo'}
                  className="photo-item"
                />
              ))}
            </div>
          </div>
        )}

        <div className="signature-section">
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-label">{L('Surveyed By', 'ผู้สำรวจ')}</div>
            <div className="signature-sublabel">{L('Technician', 'ช่างเทคนิค')}</div>
          </div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-label">{L('Approved By', 'ผู้อนุมัติ')}</div>
            <div className="signature-sublabel">{L('Manager', 'ผู้จัดการ')}</div>
          </div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-label">{L('Customer', 'ลูกค้า')}</div>
            <div className="signature-sublabel">{L('Site Owner', 'เจ้าของสถานที่')}</div>
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

export default function PreInstallationPrintPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>}>
      <PreInstallationPrintPageContent />
    </Suspense>
  )
}
