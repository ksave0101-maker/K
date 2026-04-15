"use client"

import React, { useEffect, useState, Suspense } from 'react'
import PrintStyles from '../../components/PrintStyles'
import { useSearchParams } from 'next/navigation'

function QuotationPrintContent() {
  const searchParams = useSearchParams()
  const quoteID = searchParams?.get('quoteID') || ''
  const quoteNo = searchParams?.get('quoteNo') || ''
  const auto = searchParams?.get('autoPrint')
  const [quote, setQuote] = useState<any | null>(null)
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
    const idOrNo = quoteID || quoteNo
    if (!idOrNo) return
    ;(async () => {
      try {
        let res = await fetch(`/api/quotations?quoteID=${encodeURIComponent(quoteID)}`)
        let j = await res.json().catch(() => null)
        if (!(res.ok && j && j.success && j.quotation)) {
          res = await fetch(`/api/quotations?quoteNo=${encodeURIComponent(quoteNo || quoteID)}`)
          j = await res.json().catch(() => null)
        }
        if (j && j.success) {
          const q = j.quotation || j.quotations?.[0] || null
          if (q && q.items && typeof q.items === 'string') {
            try { q.items = JSON.parse(q.items) } catch (_) {}
          }
          setQuote(q)
        }
      } catch (err) {
        console.error('Failed to load quotation for print', err)
      }
    })()
  }, [quoteID, quoteNo])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('k_system_admin_user')
      if (raw) {
        const u = JSON.parse(raw)
        setLoggedUser(u?.name || u?.fullname || u?.username || String(u?.userId || ''))
      }
    } catch {}
    const key = `print_count:quotation:${quoteID || quoteNo || 'unknown'}`
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
  }, [quoteID, quoteNo])

  useEffect(() => {
    if (quote && (auto === '1' || auto === 'true')) {
      setTimeout(() => { try { window.print() } catch (e) { console.error(e) } }, 300)
    }
  }, [quote, auto])

  if (!quoteID && !quoteNo) return <div style={{ padding: 20 }}>Missing quoteID or quoteNo</div>
  if (!quote) return <div style={{ padding: 20 }}>Loading...</div>

  const updateQueryStringParameter = (uri: string, key: string, value: string) => {
    try {
      const url = new URL(uri)
      url.searchParams.set(key, value)
      return url.toString()
    } catch (e) { return uri }
  }

  const L = (en: string, th: string) => selectedLang === 'th' ? th : en

  // Basic Thai character to romanization mapping
  const romanizeThai = (text: string): string => {
    // Common Thai name patterns and words (process these first)
    const commonWords: Record<string, string> = {
      'ไถ่': 'Thai',
      'ไทย': 'Thai',
      'ไท': 'Thai',
    }

    // Check for common words first
    let result = text
    Object.entries(commonWords).forEach(([thai, roman]) => {
      result = result.replace(new RegExp(thai, 'g'), roman)
    })

    const thaiToRoman: Record<string, string> = {
      // Consonants
      'ก': 'k', 'ข': 'kh', 'ฃ': 'kh', 'ค': 'kh', 'ฅ': 'kh', 'ฆ': 'kh',
      'ง': 'ng', 'จ': 'j', 'ฉ': 'ch', 'ช': 'ch', 'ซ': 's', 'ฌ': 'ch',
      'ญ': 'y', 'ฎ': 'd', 'ฏ': 't', 'ฐ': 'th', 'ฑ': 'th', 'ฒ': 'th',
      'ณ': 'n', 'ด': 'd', 'ต': 't', 'ถ': 'th', 'ท': 'th', 'ธ': 'th',
      'น': 'n', 'บ': 'b', 'ป': 'p', 'ผ': 'ph', 'ฝ': 'f', 'พ': 'ph',
      'ฟ': 'f', 'ภ': 'ph', 'ม': 'm', 'ย': 'y', 'ร': 'r', 'ล': 'l',
      'ว': 'w', 'ศ': 's', 'ษ': 's', 'ส': 's', 'ห': 'h', 'ฬ': 'l',
      'อ': '', 'ฮ': 'h',
      // Vowels
      'ะ': 'a', 'ั': 'a', 'า': 'a', 'ำ': 'am', 'ิ': 'i', 'ี': 'i',
      'ึ': 'ue', 'ื': 'ue', 'ุ': 'u', 'ู': 'u', 'เ': 'e', 'แ': 'ae',
      'โ': 'o', 'ใ': 'ai', 'ไ': 'ai', 'ๅ': '', 'ๆ': '',
      // Tone marks and diacritics
      '่': '', '้': '', '๊': '', '๋': '', '็': '', '์': '', 'ํ': '',
      'ฯ': '', 'ฺ': '', '฿': 'baht',
      // Special characters
      ' ': ' ', '.': '.', ',': ',', '-': '-', '/': '/'
    }

    // Romanize remaining Thai characters
    let romanized = ''
    for (let i = 0; i < result.length; i++) {
      const char = result[i]
      if (thaiToRoman[char] !== undefined) {
        romanized += thaiToRoman[char]
      } else if (char.match(/[a-zA-Z0-9]/)) {
        // Keep English characters and numbers as-is
        romanized += char
      } else {
        romanized += char
      }
    }
    return romanized
  }

  // Transliterate Thai text to English (business terms and common words)
  const transliterateText = (text: string): string => {
    if (!text) return ''
    if (selectedLang === 'th') return text

    let result = text

    // Business entity terms
    const businessTerms: Record<string, string> = {
      'บริษัท': '',
      'จำกัด': 'Co., Ltd.',
      'มหาชน': 'Public Co., Ltd.',
      'ห้างหุ้นส่วนจำกัด': 'Limited Partnership',
      'ห้างหุ้นส่วนสามัญ': 'Ordinary Partnership',

      // Common business words
      'อินดัสเทรียล': 'Industrial',
      'เทรดดิ้ง': 'Trading',
      'เทคโนโลยี': 'Technology',
      'เอ็นเตอร์ไพรส์': 'Enterprise',
      'โฮลดิ้ง': 'Holding',
      'กรุ๊ป': 'Group',
      'อินเตอร์เนชั่นแนล': 'International',
      'เซอร์วิส': 'Service',
      'โซลูชั่น': 'Solution',
      'ซัพพลาย': 'Supply',
      'แมนูแฟคเจอริ่ง': 'Manufacturing',

      // Titles
      'คุณ': 'K.',
      'นาย': 'Mr.',
      'นาง': 'Mrs.',
      'นางสาว': 'Ms.',
      'ดร.': 'Dr.',
      'ผศ.': 'Asst. Prof.',
      'รศ.': 'Assoc. Prof.',
      'ศ.': 'Prof.',

      // Common Thai words
      'ไทย': 'Thai',
      'กรุงเทพ': 'Bangkok',
      'สยาม': 'Siam',
      'เกษตร': 'Kaset'
    }

    // Replace business terms
    Object.entries(businessTerms).forEach(([thai, english]) => {
      result = result.replace(new RegExp(thai, 'g'), english)
    })

    // Romanize remaining Thai characters
    result = romanizeThai(result)

    // Clean up extra spaces
    result = result.replace(/\s+/g, ' ').trim()

    // Capitalize first letter of each word
    result = result.split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')

    return result
  }

  // Format address based on selected language
  const formatAddress = (address: string): string => {
    if (!address) return '-'
    if (selectedLang === 'en') {
      // Replace Thai prefixes and transliterate place names
      let formatted = address
      formatted = formatted.replace(/หมู่\s*/g, 'Moo ')
      formatted = formatted.replace(/ต\./g, 'T.')
      formatted = formatted.replace(/อ\./g, 'A.')
      formatted = formatted.replace(/จ\./g, '')

      // Try to transliterate known place names
      Object.entries({
        'ดอนทราย': 'Don Sai',
        'โพธาราม': 'Photharam',
        'ราชบุรี': 'Ratchaburi',
        'กรุงเทพ': 'Bangkok',
        'กรุงเทพมหานคร': 'Bangkok',
        'เชียงใหม่': 'Chiang Mai',
        'ภูเก็ต': 'Phuket',
        'พัทยา': 'Pattaya',
        'สมุทรปราการ': 'Samut Prakan',
        'นนทบุรี': 'Nonthaburi',
        'ปทุมธานี': 'Pathum Thani',
        'ชลบุรี': 'Chonburi',
        'ระยอง': 'Rayong',
        'นครราชสีมา': 'Nakhon Ratchasima',
        'ขอนแก่น': 'Khon Kaen',
        'อุบลราชธานี': 'Ubon Ratchathani',
        'อุดรธานี': 'Udon Thani',
        'สงขลา': 'Songkhla',
        'นครศรีธรรมราช': 'Nakhon Si Thammarat',
        'สุราษฎร์ธานี': 'Surat Thani'
      }).forEach(([thai, english]) => {
        formatted = formatted.replace(new RegExp(thai, 'g'), english)
      })

      return formatted.trim()
    }
    return address
  }

  const items = Array.isArray(quote.items) ? quote.items : []
  const subtotal = Number(quote.subtotal || 0)
  const discount = Number(quote.discount || 0)
  const afterDiscount = subtotal - discount
  const vat = Number(quote.vat || ((afterDiscount * 7) / 100))
  const grandTotal = Number(quote.total || quote.total_amount || (afterDiscount + vat))

  const customerName = transliterateText(quote.customer_name || quote.customer || '-')
  const customerCompany = transliterateText(quote.customer_company || quote.company || '')
  const customerAddress = formatAddress(quote.customer_address || quote.address || '-')
  const customerPhone = quote.customer_phone || quote.phone || '-'
  const customerEmail = quote.customer_email || quote.email || '-'
  const customerTaxId = quote.customer_tax_id || quote.tax_id || ''

  // Imported from reference
  const importedPreInstall = quote.imported_pre_install_no || ''
  const importedPowerCalc = quote.imported_power_calc_no || ''
  const importedFrom = importedPreInstall
    ? L('Pre-installation: ', 'ก่อนติดตั้ง: ') + importedPreInstall
    : importedPowerCalc
    ? L('Power Calculator: ', 'คำนวณพลังงาน: ') + importedPowerCalc
    : ''

  return (
    <>
      <style>{`
        @page { size: A4 portrait; margin: 1.5cm; }
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; overflow: hidden !important; }
          html, body { -ms-overflow-style: none !important; scrollbar-width: none !important; }
          ::-webkit-scrollbar { display: none !important; }
          .a4-page { box-shadow: none !important; margin: 0 !important; padding: 12mm 15mm 25mm 15mm !important; }
        }
        @media screen { body { background: #f5f5f5; overflow-y: auto; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
        html { -ms-overflow-style: none; scrollbar-width: none; }

        .a4-page {
          width: 100%; max-width: 210mm; min-height: 297mm;
          margin: 10mm auto; padding: 12mm 15mm 25mm 15mm;
          background: white;
          font-family: 'Sarabun', 'Segoe UI', 'Helvetica', sans-serif;
          font-size: 10pt; line-height: 1.4; color: #1f2937;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
          position: relative;
        }

        /* Header Section */
        .header-row {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 16px; padding-bottom: 12px;
          border-bottom: 3px solid #16a34a;
        }
        .company-info { flex: 1; max-width: 60%; }
        .company-logo-section { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 8px; }
        .company-logo {
          width: 75px; height: 75px;
          border-radius: 8px;
          object-fit: contain;
          background: #fff;
          padding: 6px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .company-text { flex: 1; }
        .company-name { font-size: 17pt; font-weight: 700; color: #16a34a; margin-bottom: 2px; line-height: 1.2; }
        .company-name-en { font-size: 10pt; font-weight: 600; color: #4b5563; margin-bottom: 6px; }
        .company-address { font-size: 8.5pt; color: #6b7280; line-height: 1.5; }

        .doc-title { text-align: right; }
        .doc-title h1 {
          font-size: 24pt; font-weight: 700;
          color: #16a34a;
          margin: 0 0 4px 0;
          letter-spacing: -0.5px;
        }
        .doc-title h2 {
          font-size: 12pt; font-weight: 600;
          color: #6b7280;
          margin: 0;
        }

        /* Info Boxes */
        .info-section {
          display: flex; gap: 14px;
          margin-bottom: 14px;
        }
        .info-box {
          flex: 1;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 10px 12px;
          background: linear-gradient(to bottom, #fafafa, #ffffff);
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .info-box-title {
          font-weight: 700; font-size: 9.5pt;
          color: #16a34a;
          margin-bottom: 8px; padding-bottom: 4px;
          border-bottom: 2px solid #16a34a;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .info-row {
          display: flex;
          margin-bottom: 4px;
          font-size: 9pt;
          line-height: 1.5;
        }
        .info-label {
          min-width: 95px;
          font-weight: 600;
          color: #4b5563;
        }
        .info-value {
          flex: 1;
          color: #1f2937;
        }

        /* Items Table */
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 12px;
          font-size: 9pt;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          overflow: hidden;
        }
        .items-table thead {
          background: linear-gradient(to bottom, #16a34a, #15803d);
        }
        .items-table th {
          color: white;
          padding: 8px 10px;
          text-align: left;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 8.5pt;
          letter-spacing: 0.3px;
        }
        .items-table th:nth-child(1) { width: 40px; text-align: center; }
        .items-table th:nth-child(3) { width: 70px; text-align: right; }
        .items-table th:nth-child(4) { width: 100px; text-align: right; }
        .items-table th:nth-child(5) { width: 110px; text-align: right; }
        .items-table td {
          padding: 8px 10px;
          border-bottom: 1px solid #f3f4f6;
        }
        .items-table td:nth-child(1) { text-align: center; font-weight: 600; color: #6b7280; }
        .items-table td:nth-child(3),
        .items-table td:nth-child(4),
        .items-table td:nth-child(5) { text-align: right; }
        .items-table tbody tr:hover { background: #f9fafb; }
        .items-table tbody tr:nth-child(even) { background: #fafafa; }

        /* Summary Section */
        .summary-section {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 14px;
        }
        .summary-table {
          width: 280px;
          font-size: 9.5pt;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 8px 12px;
          background: #fafafa;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .summary-row:last-child { border-bottom: none; }
        .summary-row.total {
          font-weight: 700;
          font-size: 12pt;
          color: #16a34a;
          border-top: 2px solid #16a34a;
          padding-top: 8px;
          margin-top: 4px;
        }

        /* Terms Section */
        .terms-section {
          border: 1px solid #d1fae5;
          border-radius: 6px;
          padding: 10px 12px;
          margin-bottom: 14px;
          background: linear-gradient(to bottom, #f0fdf4, #ffffff);
        }
        .terms-title {
          font-weight: 700;
          font-size: 9.5pt;
          color: #16a34a;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .terms-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          font-size: 8.5pt;
        }
        .terms-item { display: flex; line-height: 1.5; }
        .terms-label {
          font-weight: 600;
          color: #4b5563;
          min-width: 110px;
        }

        /* Signature Section */
        .signature-section {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
          padding-top: 16px;
          margin-bottom: 65px;
          gap: 16px;
        }
        .signature-box {
          flex: 1;
          text-align: center;
          padding: 8px;
          border: 1px solid #f3f4f6;
          border-radius: 6px;
          background: #fafafa;
        }
        .signature-line {
          border-bottom: 2px solid #9ca3af;
          height: 35px;
          margin-bottom: 8px;
        }
        .signature-label {
          font-size: 9pt;
          font-weight: 600;
          color: #1f2937;
        }
        .signature-sublabel {
          font-size: 8pt;
          color: #6b7280;
          margin-top: 2px;
        }

        /* Bank Info */
        .bank-info {
          position: absolute;
          bottom: 24mm;
          left: 15mm;
          right: 15mm;
          padding: 10px 14px;
          background: linear-gradient(to bottom, #eff6ff, #ffffff);
          border: 1px solid #93c5fd;
          border-radius: 6px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .bank-info-title {
          font-size: 10pt;
          font-weight: 700;
          color: #1e40af;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .bank-info-content {
          font-size: 9pt;
          line-height: 1.6;
          color: #1f2937;
        }

        /* Footer */
        .footer-info {
          display: flex;
          justify-content: space-between;
          font-size: 7.5pt;
          color: #9ca3af;
          border-top: 1px solid #e5e7eb;
          padding-top: 6px;
          margin-top: 16px;
        }
        @media print {
          .footer-info {
            position: fixed !important;
            bottom: 8mm !important;
            left: 12mm !important;
            right: 12mm !important;
            margin-top: 0 !important;
            background: white !important;
          }
        }
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
            <div className="company-logo-section">
              <img src="/k-energy-save-logo.jpg" alt="Logo" className="company-logo" />
              <div className="company-text">
                <div className="company-name">{L('K Energy Save', 'เค อีเนอร์ยี่ เซฟ')}</div>
                <div className="company-name-en">{L('K Energy Save Co., Ltd.', 'บริษัท เค อีเนอร์ยี่ เซฟ จำกัด')}</div>
              </div>
            </div>
            <div className="company-address">
              84 Chaloem Phrakiat Rama 9 Soi 34, Nong Bon, Prawet, Bangkok 10250<br/>
              {L('Tel:', 'โทร:')} 02-080-8916 | {L('Email:', 'อีเมล:')} info@kenergy-save.com
            </div>
          </div>
          <div className="doc-title">
            <h1>{L('QUOTATION', 'ใบเสนอราคา')}</h1>
            <h2>{L('Price Quotation', 'เอกสารเสนอราคา')}</h2>
          </div>
        </div>

        <div className="info-section">
          <div className="info-box">
            <div className="info-box-title">{L('Quotation Information', 'ข้อมูลใบเสนอราคา')}</div>
            <div className="info-row">
              <span className="info-label">{L('Quote No:', 'เลขที่:')}</span>
              <span className="info-value" style={{ fontWeight: 700 }}>{quote.quoteNo || quote.quote_no || '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Date:', 'วันที่:')}</span>
              <span className="info-value">{quote.quoteDate || quote.date ? new Date(quote.quoteDate || quote.date).toLocaleDateString(selectedLang === 'th' ? 'th-TH' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Valid Until:', 'ใช้ได้ถึง:')}</span>
              <span className="info-value">{quote.validUntil || quote.valid_until ? new Date(quote.validUntil || quote.valid_until).toLocaleDateString(selectedLang === 'th' ? 'th-TH' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : L('30 days', '30 วัน')}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Status:', 'สถานะ:')}</span>
              <span className="info-value" style={{ color: quote.status === 'accepted' ? '#16a34a' : '#666' }}>
                {quote.status === 'accepted' ? L('Accepted', 'ยอมรับ') :
                 quote.status === 'rejected' ? L('Rejected', 'ปฏิเสธ') :
                 quote.status === 'pending' ? L('Pending', 'รอดำเนินการ') :
                 quote.status || L('Pending', 'รอดำเนินการ')}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Imported from:', 'นำเข้าจาก:')}</span>
              <span className="info-value" style={{ fontSize: '0.9em', color: importedFrom ? '#0369a1' : '#999' }}>
                {importedFrom || '-'}
              </span>
            </div>
          </div>
          <div className="info-box">
            <div className="info-box-title">{L('Customer Information', 'ข้อมูลลูกค้า')}</div>
            <div className="info-row">
              <span className="info-label">{L('Name:', 'ชื่อ:')}</span>
              <span className="info-value" style={{ fontWeight: 600 }}>{customerName}</span>
            </div>
            {customerCompany && (
              <div className="info-row">
                <span className="info-label">{L('Company:', 'บริษัท:')}</span>
                <span className="info-value" style={{ fontWeight: 600 }}>{customerCompany}</span>
              </div>
            )}
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
            <div className="info-row">
              <span className="info-label">{L('Tax ID:', 'เลขผู้เสียภาษี:')}</span>
              <span className="info-value">{customerTaxId || '-'}</span>
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

        <div className="terms-section">
          <div className="terms-title">{L('Terms & Conditions', 'เงื่อนไข')}</div>
          <div className="terms-grid">
            <div className="terms-item">
              <span className="terms-label">{L('Validity:', 'ระยะเวลา:')}</span>
              <span>{quote.validity || L('30 days from quotation date', '30 วันนับจากวันเสนอราคา')}</span>
            </div>
            <div className="terms-item">
              <span className="terms-label">{L('Payment:', 'การชำระเงิน:')}</span>
              <span>{quote.payment_terms || L('As per agreement', 'ตามข้อตกลง')}</span>
            </div>
            <div className="terms-item">
              <span className="terms-label">{L('Delivery:', 'การส่งมอบ:')}</span>
              <span>{quote.delivery_terms || L('To be confirmed', 'แจ้งภายหลัง')}</span>
            </div>
            <div className="terms-item">
              <span className="terms-label">{L('Warranty:', 'การรับประกัน:')}</span>
              <span>{quote.warranty || L('1 year', '1 ปี')}</span>
            </div>
          </div>
        </div>

        <div className="signature-section">
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-label">{L('Prepared By', 'ผู้จัดทำ')}</div>
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

        <div className="bank-info">
          <div className="bank-info-title">
            {L('Bank Account Information', 'ข้อมูลบัญชีธนาคาร')}
          </div>
          <div className="bank-info-content">
            <div><strong>{L('Bank:', 'ธนาคาร:')}</strong> {L('Kasikorn Bank (KBANK)', 'ธนาคารกสิกรไทย')}</div>
            <div><strong>{L('Current Account:', 'บัญชีกระแสรายวัน:')}</strong> 212-1-17253-7</div>
            <div><strong>{L('Savings Account:', 'บัญชีออมทรัพย์:')}</strong> 211-8-78336-3</div>
            <div><strong>{L('Account Name:', 'ชื่อบัญชี:')}</strong> {L('K Energy Save Co., Ltd.', 'บริษัท เค อีเนอร์ยี่ เซฟ จำกัด')}</div>
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

export default function QuotationPrintPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>}>
      <QuotationPrintContent />
    </Suspense>
  )
}
