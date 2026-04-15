"use client"

import React from 'react'

export const COMPANY_INFO = {
  name: 'K Energy Save Co., Ltd.',
  nameTh: 'บริษัท เค เอนเนอร์ยี่ เซฟ จำกัด',
  address: '84 Chaloem Phrakiat Rama 9 Soi 34\nNong Bon, Prawet\nBangkok 10250, Thailand',
  addressTh: '84 เฉลิมพระเกียรติ รามคำแหง 9 ซอย 34\nหนองบอน ประเวศ\nกรุงเทพฯ 10250'
}

export default function PrintHeader({ titleEn, titleTh, hideTitle, hideLogo }: { titleEn: string, titleTh?: string, hideTitle?: boolean, hideLogo?: boolean }) {
  const pageLocale = (() => {
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      return l === 'en' ? 'en' : 'th'
    } catch { return 'th' }
  })()

  const paramLang = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('lang') : null
  const renderLangs = paramLang === 'both' ? ['en', 'th'] : [(paramLang === 'en' ? 'en' : paramLang === 'th' ? 'th' : pageLocale)]

  const renderSection = (renderLocale: 'en'|'th') => (
    <div key={renderLocale} style={{ position: 'relative', paddingBottom: 12 }}>
      {!hideLogo && (
        <>
          <div style={{ position: 'absolute', left: 20, top: 0 }}>
            <img src="/k-energy-save-logo.jpg" alt="K Energy Save" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'contain', background: '#fff', padding: 4, border: '1px solid #ddd' }} />
          </div>
          <div style={{ position: 'absolute', left: 150, top: 6 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{renderLocale === 'th' ? COMPANY_INFO.nameTh : COMPANY_INFO.name}</div>
            <div style={{ fontSize: 12, color: '#666', whiteSpace: 'pre-wrap' }}>{renderLocale === 'th' ? COMPANY_INFO.addressTh : COMPANY_INFO.address}</div>
          </div>
        </>
      )}
      {!hideTitle && <h1 style={{ marginTop: 60 }}>{renderLocale === 'th' ? (titleTh || titleEn) : titleEn}</h1>}
    </div>
  )

  return <>{renderLangs.map((l) => renderSection(l as 'en'|'th'))}</>
}
