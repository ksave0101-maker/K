"use client"

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

type ApplianceItem = {
  name?: string
  power?: number | string
  qty?: number | string
  hours?: number | string
}

type UsageHistoryItem = {
  period?: string
  kwh?: number | string
  peak_kw?: number | string
}

type CalculationData = {
  [key: string]: unknown
  calcID?: string | number
  power_calcuNo?: string | number
  company_name?: string
  customer_name?: string
  status?: string
  created_at?: string
  parameters?: Record<string, unknown> | string | null
  result?: Record<string, unknown> | string | null
  monthly_payment?: number | string
  contracted_capacity?: number | string
  peak_power?: number | string
  device_cost?: number | string
  amortize_months?: number | string
  expected_savings_percent?: number | string
  faucet_method?: string
  total_annual_kwh?: number | string
  total_annual_cost?: number | string
  average_monthly_kwh?: number | string
  average_monthly_cost?: number | string
  roi_years?: number | string
  roi_months?: number | string
  annual_savings_baht?: number | string
  carbon_reduction?: number | string
  monthly_savings_baht?: number | string
  annual_savings_kwh?: number | string
  cumulative_10year_savings?: number | string
  january_kwh?: number | string
}

export default function PowerCalculatorPrintPage() {
  const searchParams = useSearchParams()
  const calcID = searchParams?.get('calcID')
  const autoPrint = searchParams?.get('autoPrint') === '1'

  const paramLangInit = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('lang') : null
  const [selectedLang, setSelectedLang] = useState<'en'|'th'>(() => {
    if (paramLangInit === 'en') return 'en'
    if (paramLangInit === 'th') return 'th'
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      return l === 'en' ? 'en' : 'th'
    } catch { return 'th' }
  })

  const [data, setData] = useState<CalculationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [loggedUser, setLoggedUser] = useState<string | null>(null)
  const [printCount, setPrintCount] = useState<number>(0)
  const [lastPrinted, setLastPrinted] = useState<string | null>(null)

  useEffect(() => {
    if (!calcID) return

    async function load() {
      try {
        const res = await fetch(`/api/power-calculations?calcID=${calcID}`)
        const json = await res.json()
        if (json.success && json.rows && json.rows[0]) {
          setData(json.rows[0])
        }
      } catch (err) {
        console.error('Failed to load calculation', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [calcID])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('k_system_admin_user')
      if (raw) {
        const u = JSON.parse(raw)
        setLoggedUser(u?.name || u?.fullname || u?.username || String(u?.userId || ''))
      }
    } catch {}
    const key = `print_count:power_calc:${calcID || 'unknown'}`
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
  }, [calcID])

  useEffect(() => {
    if (!loading && data && autoPrint) {
      setTimeout(() => {
        window.print()
      }, 500)
    }
  }, [loading, data, autoPrint])

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div>Loading...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div>Calculation not found</div>
      </div>
    )
  }

  const params = data.parameters
    ? (typeof data.parameters === 'string' ? JSON.parse(data.parameters) : data.parameters)
    : {}
  const result = data.result
    ? (typeof data.result === 'string' ? JSON.parse(data.result) : data.result)
    : {}
  const paramsRecord = params as Record<string, unknown>
  const resultRecord = result as Record<string, unknown>

  const voltage = Number(paramsRecord.voltage || 230)
  const current = Number(paramsRecord.current || 0)
  const pf = Number(paramsRecord.pf || 1)
  const phase = String(paramsRecord.phase || 'single')
  const appliances = (paramsRecord.appliances as ApplianceItem[]) || []
  const usageHistory = ((paramsRecord.usage_history || paramsRecord.usageHistory) as UsageHistoryItem[]) || []
  const companyName = String(data.company_name || paramsRecord.companyName || '')
  const customerName = String(data.customer_name || paramsRecord.customerName || '')
  const unitPrice = Number(paramsRecord.unitPrice || 5.0)
  const powerSavingRate = Number(paramsRecord.powerSavingRate || 10)
  const deviceCapacity = Number(paramsRecord.deviceCapacity || 30)
  const productPrice = Number(paramsRecord.productPrice || 0)
  const paymentMonths = Number(paramsRecord.paymentMonths || 60)
  const avgMonthlyUsage = Number(paramsRecord.avgMonthlyUsage || 0)

  const realPower = Number(resultRecord.real || 0)
  const apparentPower = Number(resultRecord.apparent || 0)
  const reactivePower = Number(resultRecord.reactive || 0)

  const estimatedCurrent = phase === 'single'
    ? apparentPower / voltage
    : apparentPower / (Math.sqrt(3) * voltage)

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()
      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')
      return `${day}/${month}/${year} ${hours}:${minutes}`
    } catch {
      return dateStr
    }
  }

  const updateQueryStringParameter = (uri: string, key: string, value: string) => {
    try {
      const url = new URL(uri)
      url.searchParams.set(key, value)
      return url.toString()
    } catch { return uri }
  }

  const L = (en: string, th: string) => selectedLang === 'th' ? th : en

  return (
    <div>
      <head>
        <title>Power Calculator Report - {data.power_calcuNo || data.calcID}</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }

          @page {
            size: A4;
            margin: 12mm 10mm;
          }

          @page {
            @bottom-center {
              content: counter(page) " / " counter(pages);
              font-size: 9pt;
              color: #64748b;
            }
          }

          body {
            font-family: 'Sarabun', 'THSarabunNew', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            font-size: 8.5pt;
            line-height: 1.25;
            color: #1e293b;
            background: white;
            padding: 0;
            margin: 0;
            overflow-x: hidden;
            overflow-y: auto;
            min-height: 100vh;
          }

          .page-container {
            max-width: 210mm;
            width: 100%;
            margin: 0 auto;
            padding: 10mm;
            background: white;
            box-sizing: border-box;
            overflow-x: hidden;
            min-height: 100vh;
            overflow: visible;
          }

          /* Header */
          .report-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
            padding-bottom: 8px;
            border-bottom: 2px solid #3b82f6;
          }

          .company-info {
            flex: 1;
          }

          .company-name {
            font-size: 18pt;
            font-weight: 700;
            color: #3b82f6;
            margin-bottom: 4px;
          }

          .company-name-en {
            font-size: 11pt;
            font-weight: 600;
            color: #333;
            margin-bottom: 6px;
          }

          .company-address {
            font-size: 9pt;
            color: #666;
            line-height: 1.5;
          }

          .doc-title {
            text-align: right;
          }

          .doc-title h1 {
            font-size: 20pt;
            font-weight: 700;
            color: #3b82f6;
            margin: 0 0 4px 0;
          }

          .doc-title h2 {
            font-size: 13pt;
            font-weight: 600;
            color: #666;
            margin: 0;
          }

          /* Document Info */
          .doc-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
            margin-bottom: 10px;
            padding: 8px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            font-size: 9pt;
          }

          .doc-info-item {
            display: flex;
            gap: 6px;
          }

          .doc-info-label {
            font-weight: 600;
            color: #64748b;
            min-width: 80px;
          }

          .doc-info-value {
            color: #1e293b;
          }

          /* Form Sections */
          .form-section {
            margin-bottom: 6px;
            page-break-inside: avoid;
          }

          /* Page 1: Header + Basic + Results + Product */
          .page-break-after-page1 {
            page-break-after: always;
          }

          .page-break-before-page2 {
            page-break-before: always;
          }

          /* Page 2: Additional + Monthly Data */
          .page-break-after-page2 {
            page-break-after: always;
          }

          .page-break-before-page3 {
            page-break-before: always;
          }

          /* Page 3: ROI + Appliances + History */

          .section-header {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
            padding: 4px 8px;
            font-size: 9.5pt;
            font-weight: 600;
            border-radius: 4px 4px 0 0;
            margin-bottom: 0;
          }

          .section-content {
            border: 2px solid #3b82f6;
            border-top: none;
            border-radius: 0 0 4px 4px;
            padding: 6px;
            background: white;
          }

          /* Form Grid */
          .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 10px;
          }

          .form-field {
            display: flex;
            align-items: center;
            padding: 6px 10px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
          }

          .field-label {
            font-weight: 600;
            color: #64748b;
            font-size: 10pt;
            min-width: 120px;
          }

          .field-value {
            color: #1e293b;
            font-weight: 500;
          }

          .form-field-full {
            grid-column: 1 / -1;
          }

          /* Results Cards */
          .results-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin: 12px 0;
            width: 100%;
            max-width: 100%;
          }

          @media print {
            .results-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 8px;
            }
          }

          .result-card {
            padding: 12px;
            text-align: center;
            border-radius: 6px;
            border: 2px solid;
          }

          .result-card.primary {
            background: linear-gradient(135deg, #eff6ff, #dbeafe);
            border-color: #3b82f6;
          }

          .result-card.success {
            background: linear-gradient(135deg, #f0fdf4, #dcfce7);
            border-color: #10b981;
          }

          .result-card.warning {
            background: linear-gradient(135deg, #fefce8, #fef3c7);
            border-color: #f59e0b;
          }

          .result-card.info {
            background: linear-gradient(135deg, #f5f3ff, #ede9fe);
            border-color: #8b5cf6;
          }

          .result-label {
            font-size: 9pt;
            color: #64748b;
            margin-bottom: 4px;
            font-weight: 500;
          }

          .result-value {
            font-size: 18pt;
            font-weight: 700;
            color: #1e293b;
            line-height: 1;
          }

          .result-unit {
            font-size: 9pt;
            color: #64748b;
            margin-top: 2px;
          }

          /* ROI Section */
          .roi-highlight {
            background: linear-gradient(135deg, #fef3c7, #fde68a);
            border: 2px solid #f59e0b;
            border-radius: 6px;
            padding: 12px;
            margin: 10px 0;
          }

          .roi-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .roi-item {
            display: flex;
            justify-content: space-between;
            padding: 6px 10px;
            background: white;
            border-radius: 4px;
          }

          .roi-label {
            font-weight: 600;
            color: #92400e;
          }

          .roi-value {
            font-weight: 700;
            color: #92400e;
          }

          /* Table */
          .data-table {
            width: 100%;
            max-width: 100%;
            border-collapse: collapse;
            font-size: 10pt;
            margin-top: 10px;
            table-layout: fixed;
          }

          .data-table th {
            background: #f1f5f9;
            padding: 6px 8px;
            text-align: left;
            font-weight: 600;
            color: #475569;
            border: 1px solid #cbd5e1;
            overflow-wrap: break-word;
            word-wrap: break-word;
          }

          .data-table td {
            padding: 6px 8px;
            border: 1px solid #e2e8f0;
            color: #1e293b;
            overflow-wrap: break-word;
            word-wrap: break-word;
          }

          .text-right { text-align: right; }
          .text-center { text-align: center; }

          /* Bank Account Information */
          .bank-info {
            margin-top: 20px;
            padding: 12px 16px;
            background: linear-gradient(to bottom, #eff6ff, #ffffff);
            border: 1px solid #93c5fd;
            border-radius: 6px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            page-break-inside: avoid;
          }
          .bank-info-title {
            font-size: 10pt;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          .bank-info-content {
            font-size: 9pt;
            line-height: 1.7;
            color: #1f2937;
          }
          .bank-info-content div {
            margin-bottom: 3px;
          }

          /* Footer */
          .report-footer {
            margin-top: 16px;
            padding-top: 10px;
            border-top: 1px solid #e5e7eb;
            font-size: 8pt;
            color: #9ca3af;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
          }

          .no-print {
            display: block;
            margin-bottom: 15px;
          }

          .edit-button {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 10px 20px;
            background: linear-gradient(135deg, #2563eb, #3b82f6);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 11pt;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
          }

          @media print {
            * {
              box-sizing: border-box;
            }
            html,
            body {
              padding: 0;
              margin: 0;
              background: white;
              overflow: visible !important;
              width: 100%;
              height: auto !important;
            }
            .page-container {
              padding: 0;
              margin: 0;
              max-width: 100%;
              width: 100%;
              min-height: auto !important;
              overflow: visible !important;
            }
            .no-print {
              display: none !important;
            }
            .form-section {
              page-break-inside: auto;
              margin-bottom: 8px;
              max-width: 100%;
              overflow: visible;
            }

            .form-section:first-of-type,
            .form-section:nth-of-type(2) {
              page-break-inside: avoid;
            }

            .form-section:nth-of-type(n+5) {
              page-break-before: auto;
              page-break-inside: auto;
            }
            .form-grid {
              max-width: 100%;
              overflow: visible;
            }
            .results-grid {
              max-width: 100%;
              overflow: visible;
            }
            .report-header {
              border-bottom: 2px solid #3b82f6;
              page-break-after: avoid;
              max-width: 100%;
              margin-bottom: 8px;
            }
            .doc-info {
              page-break-after: avoid;
              max-width: 100%;
              margin-bottom: 8px;
            }
            .section-header {
              background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
              color: white !important;
              page-break-after: avoid;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .section-content {
              border: 2px solid #3b82f6 !important;
              page-break-before: avoid;
              page-break-inside: auto;
              max-width: 100%;
              overflow: visible;
            }

            .form-grid {
              page-break-inside: auto;
            }

            .form-field {
              page-break-inside: avoid;
            }
            .result-card {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .data-table {
              page-break-inside: auto;
              max-width: 100%;
              width: 100%;
              font-size: 8.5pt;
            }
            .data-table thead {
              display: table-header-group;
            }
            .data-table tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            .data-table th,
            .data-table td {
              padding: 4px 6px;
            }
            .report-footer {
              position: static;
              width: 100%;
              text-align: center;
              font-size: 8pt;
              margin-top: 12px;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="page-container">
          {/* Language Switcher & Edit Button (No Print) */}
          <div className="no-print" style={{ textAlign: 'center', padding: '12px', background: '#f0f0f0' }}>
            <button
              onClick={() => { setSelectedLang('th'); window.history.replaceState(null, '', updateQueryStringParameter(window.location.href, 'lang', 'th')) }}
              style={{ marginRight: 8, padding: '6px 16px', fontSize: 13, borderRadius: 20, border: selectedLang === 'th' ? '2px solid #3b82f6' : '1px solid #ccc', background: selectedLang === 'th' ? '#eff6ff' : '#fff', cursor: 'pointer', fontWeight: selectedLang === 'th' ? 600 : 400 }}
            >ไทย</button>
            <button
              onClick={() => { setSelectedLang('en'); window.history.replaceState(null, '', updateQueryStringParameter(window.location.href, 'lang', 'en')) }}
              style={{ marginRight: 8, padding: '6px 16px', fontSize: 13, borderRadius: 20, border: selectedLang === 'en' ? '2px solid #3b82f6' : '1px solid #ccc', background: selectedLang === 'en' ? '#eff6ff' : '#fff', cursor: 'pointer', fontWeight: selectedLang === 'en' ? 600 : 400 }}
            >English</button>
            <button
              onClick={() => window.print()}
              style={{ marginLeft: 16, padding: '6px 20px', fontSize: 13, borderRadius: 20, border: '1px solid #3b82f6', background: '#3b82f6', color: 'white', cursor: 'pointer', fontWeight: 600 }}
            >{L('Print', 'พิมพ์')}</button>
            <a href={`/KR-Thailand/Admin-Login/power-calculator?calcID=${data.calcID}`} className="edit-button" style={{ marginLeft: 16, textDecoration: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              {L('Edit', 'แก้ไขข้อมูล')}
            </a>
          </div>

          {/* Header */}
          <div className="report-header">
            <div className="company-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Image src="/k-energy-save-logo.jpg" alt="Logo" width={80} height={80} style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'contain', background: '#fff', padding: '4px' }} />
                <div>
                  <div className="company-name">{L('K Energy Save', 'เค อีเนอร์ยี่ เซฟ')}</div>
                  <div className="company-name-en">{L('K Energy Save Co., Ltd.', 'บริษัท เค อีเนอร์ยี่ เซฟ จำกัด')}</div>
                </div>
              </div>
              <div className="company-address" style={{ marginTop: '8px' }}>
                84 Chaloem Phrakiat Rama 9 Soi 34, Nong Bon, Prawet, Bangkok 10250<br/>
                Tel: 02-080-8916 | Email: info@kenergy-save.com
              </div>
            </div>
            <div className="doc-title">
              <h1>{L('Power Calculator Report', 'ใบคำนวณกำลังไฟฟ้า')}</h1>
              <h2>{L('Electrical Power Calculation', 'การคำนวณกำลังไฟฟ้า')}</h2>
            </div>
          </div>

          {/* Document Info */}
          <div className="doc-info">
            <div className="doc-info-item">
              <span className="doc-info-label">{L('Document No:', 'เลขที่เอกสาร:')}</span>
              <span className="doc-info-value">{data.power_calcuNo || data.calcID}</span>
            </div>
            <div className="doc-info-item">
              <span className="doc-info-label">{L('Date:', 'วันที่:')}</span>
              <span className="doc-info-value">{formatDate(data.created_at || '')}</span>
            </div>
            <div className="doc-info-item">
              <span className="doc-info-label">{L('Company:', 'ชื่อบริษัท:')}</span>
              <span className="doc-info-value">{companyName || '-'}</span>
            </div>
            <div className="doc-info-item">
              <span className="doc-info-label">{L('Customer:', 'ชื่อลูกค้า:')}</span>
              <span className="doc-info-value">{customerName || '-'}</span>
            </div>
            <div className="doc-info-item">
              <span className="doc-info-label">{L('Status:', 'สถานะ:')}</span>
              <span className="doc-info-value">{data.status === 'draft' ? L('Draft', 'ร่าง') : L('Completed', 'เสร็จสมบูรณ์')}</span>
            </div>
          </div>

          {/* Section 1: Basic Electrical Parameters */}
          <div className="form-section">
            <div className="section-header">{L('📊 Basic Electrical Parameters', '📊 ข้อมูลพื้นฐานด้านไฟฟ้า')}</div>
            <div className="section-content">
              <div className="form-grid">
                <div className="form-field">
                  <span className="field-label">{L('Voltage:', 'แรงดัน (Voltage):')}</span>
                  <span className="field-value">{voltage} V</span>
                </div>
                <div className="form-field">
                  <span className="field-label">{L('Current:', 'กระแส (Current):')}</span>
                  <span className="field-value">{current} A</span>
                </div>
                <div className="form-field">
                  <span className="field-label">{L('Power Factor (PF):', 'Power Factor (PF):')}</span>
                  <span className="field-value">{pf}</span>
                </div>
                <div className="form-field">
                  <span className="field-label">{L('Phase:', 'เฟส (Phase):')}</span>
                  <span className="field-value">{phase === 'single' ? L('Single Phase (1Ø)', 'เฟสเดียว (1Ø)') : L('3 Phase (3Ø)', '3 เฟส (3Ø)')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Calculation Results */}
          <div className="form-section">
            <div className="section-header">{L('⚡ Power Calculation Results', '⚡ ผลการคำนวณกำลังไฟฟ้า')}</div>
            <div className="section-content">
              <div className="results-grid">
                <div className="result-card primary">
                  <div className="result-label">{L('Apparent Power', 'กำลังไฟฟ้าปรากฏ')}</div>
                  <div className="result-value">{apparentPower.toFixed(2)}</div>
                  <div className="result-unit">VA</div>
                </div>
                <div className="result-card success">
                  <div className="result-label">{L('Real Power', 'กำลังไฟฟ้าจริง')}</div>
                  <div className="result-value">{realPower.toFixed(2)}</div>
                  <div className="result-unit">W</div>
                </div>
                <div className="result-card warning">
                  <div className="result-label">{L('Reactive Power', 'กำลังไฟฟ้ารีแอกทีฟ')}</div>
                  <div className="result-value">{reactivePower.toFixed(2)}</div>
                  <div className="result-unit">VAR</div>
                </div>
                <div className="result-card info">
                  <div className="result-label">{L('Est. Current', 'กระแสประมาณ')}</div>
                  <div className="result-value">{estimatedCurrent.toFixed(2)}</div>
                  <div className="result-unit">A</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Product & Energy Info */}
          {(productPrice > 0 || avgMonthlyUsage > 0) && (
            <div className="form-section page-break-after-page1">
              <div className="section-header">{L('💡 Product & Energy Information', '💡 ข้อมูลสินค้าและพลังงาน')}</div>
              <div className="section-content">
                <div className="form-grid">
                  {companyName && (
                    <div className="form-field form-field-full">
                      <span className="field-label">{L('Company Name:', 'ชื่อบริษัท:')}</span>
                      <span className="field-value">{companyName}</span>
                    </div>
                  )}
                  <div className="form-field">
                    <span className="field-label">{L('Product Price:', 'ราคาสินค้า:')}</span>
                    <span className="field-value">{productPrice.toLocaleString()} {L('THB', 'บาท')}</span>
                  </div>
                  <div className="form-field">
                    <span className="field-label">{L('Payment Period:', 'ผ่อนชำระ:')}</span>
                    <span className="field-value">{paymentMonths} {L('months', 'เดือน')}</span>
                  </div>
                  <div className="form-field">
                    <span className="field-label">{L('Payment/Month:', 'ผ่อน/เดือน:')}</span>
                    <span className="field-value">
                      {Number(data.monthly_payment || (paymentMonths > 0 ? productPrice / paymentMonths : 0)).toFixed(2).toLocaleString()} {L('THB', 'บาท')}
                    </span>
                  </div>
                  <div className="form-field">
                    <span className="field-label">{L('Device Capacity:', 'ความจุอุปกรณ์:')}</span>
                    <span className="field-value">{deviceCapacity} kVA</span>
                  </div>
                  <div className="form-field">
                    <span className="field-label">{L('Avg Usage/Month:', 'ใช้ไฟเฉลี่ย/เดือน:')}</span>
                    <span className="field-value">{avgMonthlyUsage.toLocaleString()} kWh</span>
                  </div>
                  <div className="form-field">
                    <span className="field-label">{L('Electricity Rate/Unit:', 'ราคาไฟ/หน่วย:')}</span>
                    <span className="field-value">{unitPrice} {L('THB', 'บาท')}</span>
                  </div>
                  <div className="form-field">
                    <span className="field-label">{L('Saving Rate:', 'อัตราประหยัด:')}</span>
                    <span className="field-value">{powerSavingRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Additional Parameters */}
          {(data.contracted_capacity || data.peak_power || data.device_cost) && (
            <div className="form-section page-break-before-page2">
              <div className="section-header">{L('📋 Additional Information', '📋 ข้อมูลเพิ่มเติม')}</div>
              <div className="section-content">
                <div className="form-grid">
                  {data.contracted_capacity && (
                    <div className="form-field">
                      <span className="field-label">{L('Contracted Capacity:', 'กำลังติดตั้ง:')}</span>
                      <span className="field-value">{Number(data.contracted_capacity).toLocaleString()} kW</span>
                    </div>
                  )}
                  {data.peak_power && (
                    <div className="form-field">
                      <span className="field-label">{L('Peak Power:', 'กำลังไฟสูงสุด:')}</span>
                      <span className="field-value">{Number(data.peak_power).toLocaleString()} kW</span>
                    </div>
                  )}
                  {data.device_cost && (
                    <div className="form-field">
                      <span className="field-label">{L('Installation Cost:', 'ค่าติดตั้ง:')}</span>
                      <span className="field-value">{Number(data.device_cost).toLocaleString()} {L('THB', 'บาท')}</span>
                    </div>
                  )}
                  {data.amortize_months && (
                    <div className="form-field">
                      <span className="field-label">{L('Amortization Period:', 'ระยะเวลาตัดจำหน่าย:')}</span>
                      <span className="field-value">{data.amortize_months} {L('months', 'เดือน')}</span>
                    </div>
                  )}
                  {data.expected_savings_percent && (
                    <div className="form-field">
                      <span className="field-label">{L('Expected Savings %:', '% การประหยัดที่คาดการณ์:')}</span>
                      <span className="field-value">{data.expected_savings_percent}%</span>
                    </div>
                  )}
                  {data.faucet_method && (
                    <div className="form-field">
                      <span className="field-label">{L('Installation Method:', 'วิธีติดตั้ง:')}</span>
                      <span className="field-value">{data.faucet_method}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Monthly Electricity Data */}
          {(data.total_annual_kwh || data.january_kwh) && (
            <div className="form-section page-break-after-page2">
              <div className="section-header">{L('📊 12-Month Electricity Data', '📊 ข้อมูลการใช้ไฟฟ้า 12 เดือน')}</div>
              <div className="section-content">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{L('Month', 'เดือน')}</th>
                      <th className="text-right">kWh</th>
                      <th className="text-right">{L('Cost (THB)', 'ค่าใช้จ่าย (บาท)')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['January', 'มกราคม'], ['February', 'กุมภาพันธ์'], ['March', 'มีนาคม'],
                      ['April', 'เมษายน'], ['May', 'พฤษภาคม'], ['June', 'มิถุนายน'],
                      ['July', 'กรกฎาคม'], ['August', 'สิงหาคม'], ['September', 'กันยายน'],
                      ['October', 'ตุลาคม'], ['November', 'พฤศจิกายน'], ['December', 'ธันวาคม']
                    ]
                      .map((monthPair, idx) => {
                        const monthKeys = ['january', 'february', 'march', 'april', 'may', 'june',
                                          'july', 'august', 'september', 'october', 'november', 'december']
                        const kwh = data[`${monthKeys[idx]}_kwh`]
                        const cost = data[`${monthKeys[idx]}_cost`]

                        if (!kwh && !cost) return null

                        return (
                          <tr key={idx}>
                            <td>{L(monthPair[0], monthPair[1])}</td>
                            <td className="text-right">{kwh ? Number(kwh).toLocaleString() : '-'}</td>
                            <td className="text-right">{cost ? Number(cost).toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</td>
                          </tr>
                        )
                      })
                      .filter(row => row !== null)}
                  </tbody>
                  {data.total_annual_kwh && (
                    <tfoot style={{ fontWeight: 600, background: '#f9fafb' }}>
                      <tr>
                        <td>{L('Annual Total', 'รวมทั้งปี')}</td>
                        <td className="text-right" style={{ color: '#1e40af' }}>
                          {Number(data.total_annual_kwh).toLocaleString()}
                        </td>
                        <td className="text-right" style={{ color: '#10b981' }}>
                          {data.total_annual_cost ? Number(data.total_annual_cost).toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}
                        </td>
                      </tr>
                      {data.average_monthly_kwh && (
                        <tr>
                          <td>{L('Monthly Average', 'เฉลี่ยต่อเดือน')}</td>
                          <td className="text-right" style={{ color: '#64748b' }}>
                            {Number(data.average_monthly_kwh).toLocaleString()}
                          </td>
                          <td className="text-right" style={{ color: '#64748b' }}>
                            {data.average_monthly_cost ? Number(data.average_monthly_cost).toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}
                          </td>
                        </tr>
                      )}
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}

          {/* Section 6: ROI Calculation */}
          {(data.roi_years || productPrice > 0 && avgMonthlyUsage > 0) && (
            <div className="form-section page-break-before-page3">
              <div className="section-header">{L('💰 Return on Investment (ROI)', '💰 การคำนวณผลตอบแทน (ROI)')}</div>
              <div className="section-content">
                <div className="results-grid">
                  {data.roi_years && (
                    <div className="result-card warning">
                      <div className="result-label">{L('Payback Period', 'ระยะเวลาคืนทุน')}</div>
                      <div className="result-value">{Number(data.roi_years).toFixed(2)}</div>
                      <div className="result-unit">{L('years', 'ปี')} ({data.roi_months ? Math.round(Number(data.roi_months)) : '0'} {L('months', 'เดือน')})</div>
                    </div>
                  )}
                  {data.annual_savings_baht && (
                    <div className="result-card success">
                      <div className="result-label">{L('Annual Savings', 'ประหยัดต่อปี')}</div>
                      <div className="result-value" style={{ fontSize: '14pt' }}>
                        {Number(data.annual_savings_baht).toLocaleString(undefined, {maximumFractionDigits: 0})}
                      </div>
                      <div className="result-unit">{L('THB/year', 'บาท/ปี')}</div>
                    </div>
                  )}
                  {data.monthly_payment && (
                    <div className="result-card primary">
                      <div className="result-label">{L('Monthly Payment', 'ผ่อนชำระต่อเดือน')}</div>
                      <div className="result-value" style={{ fontSize: '14pt' }}>
                        {Number(data.monthly_payment).toLocaleString(undefined, {maximumFractionDigits: 0})}
                      </div>
                      <div className="result-unit">{L('THB/month', 'บาท/เดือน')}</div>
                    </div>
                  )}
                  {data.carbon_reduction && (
                    <div className="result-card success">
                      <div className="result-label">{L('CO2 Reduction', 'ลดการปล่อย CO2')}</div>
                      <div className="result-value" style={{ fontSize: '14pt' }}>{Number(data.carbon_reduction).toFixed(2)}</div>
                      <div className="result-unit">{L('tons/year', 'ตัน/ปี')}</div>
                    </div>
                  )}
                </div>
                <div className="form-grid" style={{ marginTop: '10px' }}>
                  {data.monthly_savings_baht && (
                    <div className="form-field">
                      <span className="field-label">{L('Monthly Savings:', 'ประหยัดต่อเดือน:')}</span>
                      <span className="field-value" style={{ color: '#10b981' }}>{Number(data.monthly_savings_baht).toLocaleString()} {L('THB', 'บาท')}</span>
                    </div>
                  )}
                  {data.annual_savings_kwh && (
                    <div className="form-field">
                      <span className="field-label">{L('Annual Savings (kWh):', 'ประหยัดต่อปี (kWh):')}</span>
                      <span className="field-value" style={{ color: '#10b981' }}>{Number(data.annual_savings_kwh).toLocaleString()} kWh</span>
                    </div>
                  )}
                  {data.cumulative_10year_savings && (
                    <div className="form-field form-field-full">
                      <span className="field-label">{L('10-Year Profit:', 'กำไรสะสม 10 ปี:')}</span>
                      <span className="field-value" style={{ color: '#10b981', fontSize: '12pt', fontWeight: 700 }}>
                        {Number(data.cumulative_10year_savings).toLocaleString(undefined, {maximumFractionDigits: 0})} {L('THB', 'บาท')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section 7: Appliances List */}
          {appliances && appliances.length > 0 && (
            <div className="form-section">
              <div className="section-header">{L('🔌 Electrical Appliances', '🔌 รายการอุปกรณ์ไฟฟ้า')}</div>
              <div className="section-content">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{L('Appliance Name', 'ชื่ออุปกรณ์')}</th>
                      <th className="text-right">{L('Power (W)', 'กำลังไฟ (W)')}</th>
                      <th className="text-center">{L('Quantity', 'จำนวน')}</th>
                      <th className="text-center">{L('Hrs/Day', 'ชม./วัน')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appliances.map((app: ApplianceItem, i: number) => (
                      <tr key={i}>
                        <td>{app.name || '-'}</td>
                        <td className="text-right">{(app.power || 0).toLocaleString()}</td>
                        <td className="text-center">{app.qty || 1}</td>
                        <td className="text-center">{app.hours || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 8: Usage History */}
          {usageHistory && usageHistory.length > 0 && (
            <div className="form-section">
              <div className="section-header">{L('📈 Electricity Usage History', '📈 ประวัติการใช้ไฟฟ้า')}</div>
              <div className="section-content">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{L('Period', 'งวด')}</th>
                      <th className="text-right">{L('Usage (kWh)', 'การใช้ไฟ (kWh)')}</th>
                      <th className="text-right">{L('Peak kW', 'Peak kW')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usageHistory.map((usage: UsageHistoryItem, i: number) => (
                      <tr key={i}>
                        <td>{usage.period || '-'}</td>
                        <td className="text-right">{(usage.kwh || 0).toLocaleString()}</td>
                        <td className="text-right">{usage.peak_kw ? Number(usage.peak_kw).toFixed(2) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="report-footer">
            <span>{L('User:', 'ผู้พิมพ์:')} {loggedUser || '-'}</span>
            <span>{L('Printed:', 'พิมพ์เมื่อ:')} {new Date(lastPrinted || new Date()).toLocaleString(selectedLang === 'th' ? 'th-TH' : 'en-US')}</span>
            <span>{L('Print Count:', 'ครั้งที่พิมพ์:')} {printCount + 1}</span>
          </div>
        </div>
      </body>
    </div>
  )
}
