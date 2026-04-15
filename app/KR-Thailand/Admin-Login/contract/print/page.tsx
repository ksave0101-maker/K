"use client"

import React, { useEffect, useState, Suspense } from 'react'
import PrintStyles from '../../components/PrintStyles'
import { useSearchParams } from 'next/navigation'

function ContractPrintPageContent() {
  const searchParams = useSearchParams()
  const contractID = searchParams?.get('contractID') || ''
  const [contract, setContract] = useState<any | null>(null)
  const [selectedLang, setSelectedLang] = useState<'en'|'th'>(() => {
    try {
      const l = typeof window !== 'undefined' ? (localStorage.getItem('locale') || localStorage.getItem('k_system_lang')) : null
      return l === 'en' ? 'en' : 'th'
    } catch { return 'th' }
  })

  useEffect(() => {
    if (!contractID) return
    ;(async () => {
      try {
        const res = await fetch(`/api/contracts?contractID=${encodeURIComponent(contractID)}`)
        const j = await res.json().catch(() => null)
        if (j && j.success) {
          const c = j.contract || (Array.isArray(j.contracts) && j.contracts[0]) || null
          setContract(c)
        }
      } catch (e) {
        console.error('Failed to load contract for print', e)
      }
    })()
  }, [contractID])

  useEffect(() => {
    if (contract) {
      setTimeout(() => { try { window.print() } catch (e) { console.error(e) } }, 300)
    }
  }, [contract])

  if (!contractID) return <div style={{ padding: 20 }}>Missing contractID</div>
  if (!contract) return <div style={{ padding: 20 }}>Loading...</div>

  const L = (en: string, th: string) => selectedLang === 'th' ? th : en

  const customerName = contract.customerName || contract.customer_name || '-'
  const siteName = contract.site_name || contract.siteName || '-'
  const contractNo = contract.contractNo || contract.contract_no || '-'
  const contractDate = contract.contractDate || contract.contract_date || ''

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
        .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #7c3aed; }
        .company-info { flex: 1; }
        .company-name { font-size: 18pt; font-weight: 700; color: #7c3aed; margin-bottom: 4px; }
        .company-name-en { font-size: 11pt; font-weight: 600; color: #333; margin-bottom: 6px; }
        .company-address { font-size: 9pt; color: #666; line-height: 1.5; }
        .doc-title { text-align: right; }
        .doc-title h1 { font-size: 20pt; font-weight: 700; color: #7c3aed; margin: 0 0 4px 0; }
        .doc-title h2 { font-size: 12pt; font-weight: 600; color: #666; margin: 0; }
        .content-section { margin-top: 12px; }
        .info-row { display: flex; gap: 12px; margin-bottom: 6px; }
        .info-label { width: 140px; font-weight: 700; color: #555; }
        .info-value { color: #333; }
        .terms { margin-top: 18px; border: 1px solid #eee; padding: 12px; border-radius: 6px; background: #fafafa; }
        .signature { display:flex; justify-content: space-between; margin-top: 36px; }
        .sig-box { width: 30%; text-align: center; }
        .sig-line { border-bottom: 1px solid #333; height: 40px; margin-bottom: 8px; }
        .footer { font-size: 9pt; color: #777; border-top: 1px solid #eee; padding-top: 8px; display:flex; justify-content:space-between; margin-top: 16px; }
        @media print { .footer { position: fixed !important; bottom: 8mm !important; left: 12mm !important; right: 12mm !important; margin-top: 0 !important; background: white !important; } }
      `}</style>

      <PrintStyles />
      <div className="no-print" style={{ textAlign: 'center', padding: '12px', background: '#f0f0f0' }}>
        <button
          onClick={() => {
            try {
              setSelectedLang('th')
              const u = new URL(window.location.href)
              u.searchParams.set('lang', 'th')
              window.history.replaceState(null, '', u.toString())
            } catch (e) { console.error(e) }
          }}
          style={{ marginRight: 8, padding: '6px 16px', fontSize: 13, borderRadius: 20, border: selectedLang === 'th' ? '2px solid #e67e22' : '1px solid #ccc', background: selectedLang === 'th' ? '#fff5eb' : '#fff', cursor: 'pointer', fontWeight: selectedLang === 'th' ? 600 : 400 }}
        >ไทย</button>
        <button
          onClick={() => {
            try {
              setSelectedLang('en')
              const u = new URL(window.location.href)
              u.searchParams.set('lang', 'en')
              window.history.replaceState(null, '', u.toString())
            } catch (e) { console.error(e) }
          }}
          style={{ marginRight: 8, padding: '6px 16px', fontSize: 13, borderRadius: 20, border: selectedLang === 'en' ? '2px solid #e67e22' : '1px solid #ccc', background: selectedLang === 'en' ? '#fff5eb' : '#fff', cursor: 'pointer', fontWeight: selectedLang === 'en' ? 600 : 400 }}
        >English</button>
        <button onClick={() => window.print()} style={{ marginLeft: 16, padding: '6px 20px', fontSize: 13, borderRadius: 20, border: '1px solid #e67e22', background: '#e67e22', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>{L('Print','พิมพ์')}</button>
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
              84 Chaloem Phrakiat Rama 9 Soi 34, Nong Bon, Prawet, Bangkok 10250<br/>Tel: 02-080-8916 | Email: info@kenergy-save.com
            </div>
          </div>
          <div className="doc-title">
            <h1>{L('SALES CONTRACT','สัญญาซื้อขาย')}</h1>
            <h2>{contractNo}</h2>
          </div>
        </div>

        <div className="content-section">
          <div className="info-row"><div className="info-label">{L('Customer','ลูกค้า')}</div><div className="info-value">{customerName}</div></div>
          <div className="info-row"><div className="info-label">{L('Site','สถานที่')}</div><div className="info-value">{siteName}</div></div>
          <div className="info-row"><div className="info-label">{L('Contract Date','วันที่ทำสัญญา')}</div><div className="info-value">{contractDate ? new Date(contractDate).toLocaleDateString(selectedLang==='th'?'th-TH':'en-US') : '-'}</div></div>

          <div className="terms">
            <div dangerouslySetInnerHTML={{ __html: (contract.contractContent || contract.contract_content || '').replace(/\n/g, '<br/>') }} />
          </div>

          <div className="signature">
            <div className="sig-box">
              <div className="sig-line"></div>
              <div>{L('Seller','ผู้ขาย')}</div>
            </div>
            <div className="sig-box">
              <div className="sig-line"></div>
              <div>{L('Customer','ผู้ซื้อ')}</div>
            </div>
            <div className="sig-box">
              <div className="sig-line"></div>
              <div>{L('Witness / Executive','พยาน / ผู้บริหาร')}</div>
            </div>
          </div>

        </div>

        <div className="footer">
          <div>{L('Created by','จัดทำโดย')}: {localStorage.getItem ? (localStorage.getItem('k_system_admin_user') ? JSON.parse(localStorage.getItem('k_system_admin_user')||'{}').name : '') : ''}</div>
          <div>{L('Printed on','พิมพ์วันที่')}: {new Date().toLocaleString(selectedLang==='th'?'th-TH':'en-US')}</div>
        </div>
      </div>
    </>
  )
}

export default function ContractPrintPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>}>
      <ContractPrintPageContent />
    </Suspense>
  )
}
