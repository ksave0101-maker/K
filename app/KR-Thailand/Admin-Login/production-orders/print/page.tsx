"use client"

import React, { useEffect, useState } from 'react'
import PrintStyles from '../../components/PrintStyles'

export default function ProductionOrderPrintPage() {
  const [poID, setPoID] = useState('')
  const [poNo, setPoNo] = useState('')
  const [reportNo, setReportNo] = useState('')
  const [branchKeyFromQuery, setBranchKeyFromQuery] = useState('')
  const [auto, setAuto] = useState('')
  const [langFromQuery, setLangFromQuery] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [doc, setDoc] = useState<any | null>(null)
  const [salesOrder, setSalesOrder] = useState<any | null>(null)
  const [customerDetail, setCustomerDetail] = useState<any | null>(null)
  const [loggedUser, setLoggedUser] = useState<string | null>(null)
  const [printCount, setPrintCount] = useState<number>(0)
  const [lastPrinted, setLastPrinted] = useState<string | null>(null)
  const [branchManagerFromRole, setBranchManagerFromRole] = useState<string | null>(null)

  const [selectedLang, setSelectedLang] = useState<'en'|'th'|'ko'>('en')

  useEffect(() => {
    setHydrated(true)
    try {
      const params = new URLSearchParams(window.location.search)
      setPoID(params.get('poID') || params.get('pdoID') || '')
      setPoNo(params.get('poNo') || params.get('pdoNo') || '')
      setReportNo(params.get('reportNo') || '')
      setBranchKeyFromQuery(params.get('branchKey') || '')
      setAuto(params.get('autoPrint') || '')
      setLangFromQuery(params.get('lang'))
    } catch {
      // Ignore malformed query string
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (langFromQuery === 'en' || langFromQuery === 'th' || langFromQuery === 'ko') {
      setSelectedLang(langFromQuery)
      return
    }
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      if (l === 'ko') {
        setSelectedLang('ko')
      } else if (l === 'en') {
        setSelectedLang('en')
      } else {
        setSelectedLang('th')
      }
    } catch {
      setSelectedLang('en')
    }
  }, [hydrated, langFromQuery])

  useEffect(() => {
    const idOrNo = poID || poNo
    if (!idOrNo) return
    ;(async () => {
      try {
        let q: any | null = null

        if (branchKeyFromQuery) {
          let res = await fetch(`/api/korea/production-orders?id=${encodeURIComponent(poID || poNo)}&branchKey=${encodeURIComponent(branchKeyFromQuery)}`)
          let j = await res.json().catch(() => null)
          if (res.ok && j) {
            q = j
          } else {
            res = await fetch(`/api/korea/production-orders?branchKey=${encodeURIComponent(branchKeyFromQuery)}&search=${encodeURIComponent(poNo || poID)}`)
            j = await res.json().catch(() => null)
            if (res.ok && Array.isArray(j)) {
              q = j.find((row: any) => String(row.orderNumber || row.pdoNo || row.poNo || '') === String(poNo || poID)) || j[0] || null
            }
          }
        }

        if (!q) {
          let res = await fetch(`/api/production-orders?id=${encodeURIComponent(poID)}`)
          let j = await res.json().catch(() => null)
          if (!(res.ok && j && j.success && j.productionOrder)) {
            res = await fetch(`/api/production-orders?pdoNo=${encodeURIComponent(poNo || poID)}`)
            j = await res.json().catch(() => null)
          }
          if (j && j.success) {
            q = j.productionOrder || j.productionOrders?.[0] || null
          }
        }

        if (q) {
          if (q.items && typeof q.items === 'string') {
            try { q.items = JSON.parse(q.items) } catch (_) {}
          }
          setDoc(q)

          const branchRaw = String(
            q?.branch || q?.branch_name || q?.branchName || ''
          ).trim()
          const pdoNoText = String(q?.pdoNo || q?.poNo || poNo || '').toUpperCase()
          const branchForManager = (() => {
            if (branchRaw) return branchRaw
            if (pdoNoText.startsWith('PDOKR')) return 'Korea Branch'
            if (pdoNoText.startsWith('PDOTH')) return 'Thailand Branch'
            if (pdoNoText.startsWith('PDOVT') || pdoNoText.startsWith('PDOVN')) return 'Vietnam Branch'
            if (pdoNoText.startsWith('PDOBN')) return 'Brunei Branch'
            if (pdoNoText.startsWith('PDOML') || pdoNoText.startsWith('PDOMY')) return 'Malaysia Branch'
            return 'thailand'
          })()

          try {
            const mr = await fetch(`/api/user/branch-manager?branch=${encodeURIComponent(branchForManager)}`)
            const mj = await mr.json().catch(() => null)
            if (mr.ok && mj?.success && mj?.managerName) {
              setBranchManagerFromRole(mj.managerName)
            }
          } catch {
            // Keep fallback value.
          }
        }
      } catch (err) {
        console.error('Failed to load production order for print', err)
      }
    })()
  }, [poID, poNo, branchKeyFromQuery])

  useEffect(() => {
    if (reportNo) return
    const sourceId = String((doc as any)?.pdoID || (doc as any)?.poID || (doc as any)?.id || poID || '').trim()
    const pdoNoText = String((doc as any)?.pdoNo || (doc as any)?.poNo || poNo || '').toUpperCase()
    if (!sourceId || !pdoNoText) return

    const branchKey = (() => {
      if (pdoNoText.startsWith('PDOKR')) return 'korea'
      if (pdoNoText.startsWith('PDOTH')) return 'thailand'
      if (pdoNoText.startsWith('PDOVT') || pdoNoText.startsWith('PDOVN')) return 'vietnam'
      if (pdoNoText.startsWith('PDOML') || pdoNoText.startsWith('PDOMY')) return 'malaysia'
      if (pdoNoText.startsWith('PDOBN')) return 'brunei'
      return ''
    })()
    if (!branchKey) return

    ;(async () => {
      try {
        const res = await fetch(`/api/korea/production-reports?branchKey=${encodeURIComponent(branchKey)}&pdoID=${encodeURIComponent(sourceId)}`, { cache: 'no-store' })
        const rows = await res.json().catch(() => [])
        const row = Array.isArray(rows) ? rows[0] : null
        const foundReportNo = String(row?.report_no || '')
        if (foundReportNo) setReportNo(foundReportNo)
      } catch {
        // Keep fallback '-'
      }
    })()
  }, [doc, poID, poNo, reportNo])

  useEffect(() => {
    const soId = doc?.sales_orderID || doc?.sales_order_id
    if (!soId) return
    ;(async () => {
      try {
        const res = await fetch(`/api/sales-orders?id=${encodeURIComponent(String(soId))}`)
        const j = await res.json().catch(() => null)
        if (res.ok && j?.success && j?.order) {
          const so = j.order
          setSalesOrder(so)
          // If SO doesn't have customer_name, fetch from customers table using cusID
          const cusId = so.cusID || so.cus_id
          if (cusId && !so.customer_name) {
            try {
              const cr = await fetch(`/api/customers?id=${encodeURIComponent(String(cusId))}`)
              const cj = await cr.json().catch(() => null)
              if (cr.ok && cj?.success && cj?.customer) {
                setCustomerDetail(cj.customer)
              }
            } catch (e) {
              console.error('Failed to load customer detail', e)
            }
          }
        }
      } catch (e) {
        console.error('Failed to load sales order for delivery customer info', e)
      }
    })()
  }, [doc?.sales_orderID, doc?.sales_order_id])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('k_system_admin_user')
      if (raw) {
        const u = JSON.parse(raw)
        setLoggedUser(u?.name || u?.fullname || u?.username || String(u?.userId || ''))
      }
    } catch {}
    const key = `print_count:production-order:${poID || poNo || 'unknown'}`
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
  }, [poID, poNo])

  useEffect(() => {
    if (doc && (auto === '1' || auto === 'true')) {
      setTimeout(() => { try { window.print() } catch (e) { console.error(e) } }, 300)
    }
  }, [doc, auto])

  const updateQueryStringParameter = (uri: string, key: string, value: string) => {
    try {
      const url = new URL(uri)
      url.searchParams.set(key, value)
      return url.toString()
    } catch (e) { return uri }
  }

  const L = (en: string, th: string, ko?: string) => {
    if (selectedLang === 'th') return th
    if (selectedLang === 'ko') return ko || en
    return en
  }
  const fmtDate = (v: any) => {
    if (!v) return '-'
    const d = new Date(v)
    if (isNaN(d.getTime())) return '-'
    return d.toLocaleDateString(selectedLang === 'th' ? 'th-TH' : selectedLang === 'ko' ? 'ko-KR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  if (!hydrated) return <div style={{ padding: 20 }}>{L('Loading...', 'กำลังโหลด...', '로딩 중...')}</div>
  if (!poID && !poNo) return <div style={{ padding: 20 }}>{L('Missing poID or poNo', 'ไม่พบ poID หรือ poNo', 'poID 또는 poNo가 없습니다')}</div>
  if (!doc) return <div style={{ padding: 20 }}>{L('Loading...', 'กำลังโหลด...', '로딩 중...')}</div>

  const productName = doc.product_name || doc.product || '-'
  const productCode = doc.product_code || '-'
  const productionLine = doc.production_line || doc.line || '-'
  const shift = doc.shift || '-'
  const priority = doc.priority || '-'
  const supervisor = doc.supervisor || doc.supervisedBy || '-'
  const targetQty = doc.quantity_ordered || doc.target_qty || doc.quantity || '-'
  const unit = doc.unit || 'pcs'
  const createdBy = doc.created_by || '-'
  const reference = salesOrder?.orderNo || doc.so_no || doc.sales_order_no || (doc.sales_orderID ? `SO-${String(doc.sales_orderID).padStart(6, '0')}` : '-')
  const notesText = String(doc.notes || doc.productionNote || '')
  const notes = notesText || '-'
  const approvedByFromNotes = (() => {
    try {
      const text = notesText
      const match = text.match(/\[APPROVED_BY:([^\]]+)\]/)
      return match?.[1]?.trim() || ''
    } catch {
      return ''
    }
  })()
  const normalizedStatus = String(doc.status || '').toLowerCase()
  const isApprovedStatus = normalizedStatus === 'approved' || normalizedStatus === 'completed' || normalizedStatus === 'done' || normalizedStatus === 'confirmed'
  const approvedByName = doc.approved_by || doc.approvedBy || approvedByFromNotes || (isApprovedStatus ? '양해욱 (Harry Yang)' : '-')
  const isBlank = (v: any) => !v || String(v).trim() === '' || String(v).trim() === '-'
  const manufacturerName = isBlank(doc.manufacturer_name) ? 'Zera co.,Ltd' : doc.manufacturer_name
  const manufacturerTaxId = isBlank(doc.manufacturer_tax_id) ? '831-87-03154' : doc.manufacturer_tax_id
  const manufacturerAddress = isBlank(doc.manufacturer_address) ? '2F, 16-10, 166beon-gil\nElseso-ro, Gunpo-si\nGyeonggi-do, Korea' : doc.manufacturer_address
  const manufacturerNameDisplay = manufacturerName
  const manufacturerAddressDisplay = String(manufacturerAddress || '-').replace(/\n/g, ' ')
  const reportNoDisplay = reportNo || String((doc as any)?.reportNo || (doc as any)?.report_no || '-')
  const cusAddrParts = customerDetail ? [
    customerDetail.house_number, customerDetail.moo ? `ม.${customerDetail.moo}` : '',
    customerDetail.tambon, customerDetail.amphoe, customerDetail.province, customerDetail.postcode
  ].filter(Boolean).join(' ') : ''
  const deliveryCustomerName = salesOrder?.customer_name || customerDetail?.fullname || customerDetail?.company || doc.customer_name || '-'
  const deliveryCustomerTaxId = salesOrder?.customer_tax_id || customerDetail?.tax_id || doc.customer_tax_id || '-'
  const deliveryCustomerPhone = salesOrder?.customer_phone || customerDetail?.phone || doc.customer_phone || '-'
  const deliveryCustomerAddress = salesOrder?.customer_address || cusAddrParts || doc.customer_address || doc.address || '-'
  const deliveryDate = salesOrder?.delivery_date || '-'
  const branchRaw = String(
    doc.branch ||
    doc.branch_name ||
    doc.branchName ||
    salesOrder?.branch ||
    salesOrder?.branch_name ||
    salesOrder?.branchName ||
    ''
  ).trim()
  const pdoNoText = String(doc.pdoNo || doc.poNo || poNo || '').toUpperCase()
  const inferredBranch = (() => {
    if (branchRaw) return branchRaw
    if (pdoNoText.startsWith('PDOKR')) return 'Korea Branch'
    if (pdoNoText.startsWith('PDOTH')) return 'Thailand Branch'
    if (pdoNoText.startsWith('PDOVT') || pdoNoText.startsWith('PDOVN')) return 'Vietnam Branch'
    if (pdoNoText.startsWith('PDOBN')) return 'Brunei Branch'
    if (pdoNoText.startsWith('PDOML') || pdoNoText.startsWith('PDOMY')) return 'Malaysia Branch'
    return '-'
  })()
  const inferredBranchLabel = (() => {
    const key = inferredBranch.toLowerCase()
    if (key.includes('korea')) return L('Korea Branch', 'สาขาเกาหลี', '한국 지점')
    if (key.includes('thailand')) return L('Thailand Branch', 'สาขาไทย', '태국 지점')
    if (key.includes('vietnam')) return L('Vietnam Branch', 'สาขาเวียดนาม', '베트남 지점')
    if (key.includes('malaysia')) return L('Malaysia Branch', 'สาขามาเลเซีย', '말레이시아 지점')
    if (key.includes('brunei')) return L('Brunei Branch', 'สาขาบรูไน', '브루나이 지점')
    return inferredBranch
  })()
  const branchNameEnglish = (() => {
    const key = inferredBranch.toLowerCase()
    if (key.includes('korea')) return 'Korea'
    if (key.includes('thailand')) return 'Thailand'
    if (key.includes('vietnam')) return 'Vietnam'
    if (key.includes('malaysia')) return 'Malaysia'
    if (key.includes('brunei')) return 'Brunei'
    return inferredBranchLabel
  })()
  const createdByDisplay = (() => {
    const raw = String(createdBy || '').trim()
    if (!raw || raw === '-') return '-'
    if (raw.toLowerCase() === 'branch-manager' || raw.toLowerCase() === 'branch manager') {
      return `Branch ${branchNameEnglish}`
    }
    return raw
  })()
  const preparedByDisplay = createdByDisplay !== '-' ? createdByDisplay : 'Eun Seok Oh / Assistant Manager'
  const branchManagerName = branchManagerFromRole || supervisor || '-'
  const responsiblePerson = branchManagerName !== '-' ? branchManagerName : approvedByName
  const items = Array.isArray(doc.items) && doc.items.length > 0
    ? doc.items
    : [{ description: productName, quantity: targetQty, unit }]

  return (
    <>
      <PrintStyles />
      <style>{`
        @page { size: A4 portrait; margin: 10mm 12mm; }
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; background: #fff; }
          .a4-page { box-shadow: none !important; margin: 0 !important; min-height: auto !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        @media screen { body { background: linear-gradient(180deg, #edf5ff 0%, #f7fafc 100%); overflow-y: auto; } }
        * { box-sizing: border-box; }
        :root {
          --brand-green: #0f766e;
          --brand-blue: #0369a1;
          --title-blue: #0ea5e9;
          --line: #94a3b8;
          --card-bg: #f8fafc;
          --text-main: #0f172a;
          --text-sub: #334155;
        }
        .a4-page {
          width: 100%;
          max-width: 190mm;
          min-height: 297mm;
          margin: 10mm auto;
          padding: 10mm 12mm 12mm;
          background: #fff;
          font-family: "Segoe UI", Arial, Helvetica, sans-serif;
          font-size: 10pt;
          color: var(--text-main);
          box-shadow: 0 10px 35px rgba(15, 23, 42, 0.14);
          border-radius: 8px;
        }
        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 14px;
          padding-bottom: 12px;
          border-bottom: 2px solid #16a34a;
          position: relative;
        }
        .header-row::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -2px;
          height: 2px;
          background: linear-gradient(90deg, #16a34a 0%, #0ea5e9 70%, #06b6d4 100%);
        }
        .company-info { flex: 1; }
        .brand-row { display: flex; align-items: center; gap: 12px; margin-bottom: 6px; }
        .brand-logo {
          width: 54px;
          height: 54px;
          object-fit: contain;
          border-radius: 10px;
          background: #fff;
          box-shadow: 0 1px 6px rgba(2, 132, 199, 0.22);
          border: 1px solid #dbeafe;
          padding: 4px;
        }
        .company-name { font-size: 15pt; font-weight: 800; line-height: 1.15; color: var(--brand-green); letter-spacing: 0.2px; }
        .company-name-en { font-size: 9.6pt; font-weight: 700; line-height: 1.3; color: #1e293b; }
        .company-address { font-size: 8.8pt; line-height: 1.45; color: #334155; }
        .doc-title { text-align: right; }
        .doc-title h1 { margin: 0; font-size: 20pt; line-height: 1.08; letter-spacing: 0.4px; color: var(--brand-blue); }
        .doc-title h2 { margin: 3px 0 0; font-size: 11pt; font-weight: 700; color: #475569; letter-spacing: 0.3px; }
        .info-section { display: flex; gap: 12px; margin-bottom: 12px; }
        .info-box, .line-box {
          flex: 1;
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 9px 10px;
          min-height: 154px;
          background: var(--card-bg);
        }
        .full-box {
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 9px 10px;
          margin-bottom: 12px;
          background: #ffffff;
        }
        .box-title {
          font-weight: 700;
          margin: -9px -10px 8px -10px;
          padding: 6px 10px;
          font-size: 9.6pt;
          color: #fff;
          background: linear-gradient(90deg, var(--title-blue) 0%, #0284c7 100%);
          border-top-left-radius: 7px;
          border-top-right-radius: 7px;
        }
        .info-row {
          display: flex;
          margin-bottom: 4px;
          padding-bottom: 3px;
          border-bottom: 1px dashed #d1d5db;
        }
        .info-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .info-label { width: 118px; font-weight: 700; color: var(--text-sub); }
        .info-value { flex: 1; color: var(--text-main); word-break: break-word; }
        .notes-box {
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 9px 10px;
          margin-bottom: 12px;
          min-height: 72px;
          background: #fffbeb;
        }
        .notes-text { white-space: pre-wrap; color: #374151; line-height: 1.45; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border-radius: 8px; overflow: hidden; }
        .items-table th, .items-table td { border: 1px solid var(--line); padding: 7px 8px; font-size: 9.5pt; }
        .items-table th { text-align: center; font-weight: 700; background: linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%); color: #fff; }
        .items-table td:nth-child(1) { width: 42px; text-align: center; }
        .items-table td:nth-child(3) { width: 120px; text-align: right; }
        .items-table tbody tr:nth-child(even) { background: #f8fafc; }
        .items-table tbody tr:hover { background: #ecfeff; }
        .signature-section { display: flex; gap: 12px; margin-top: 10px; }
        .signature-box { flex: 1; text-align: center; }
        .signature-line {
          border-bottom: 1px solid #334155;
          border-top: 2px solid #e2e8f0;
          border-radius: 6px 6px 0 0;
          height: 46px;
          margin-bottom: 6px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          font-size: 9.3pt;
          font-weight: 600;
          padding-bottom: 4px;
          color: #0f172a;
          background: #f8fafc;
        }
        .signature-label { font-size: 9.5pt; font-weight: 700; color: #0f172a; }
        .signature-sub { font-size: 8.6pt; color: #475569; }
        .footer-info {
          margin-top: 18px;
          display: flex;
          justify-content: space-between;
          font-size: 8pt;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
          padding-top: 7px;
        }
        @media (max-width: 900px) {
          .a4-page { padding: 8mm 8mm 10mm; border-radius: 0; }
          .info-section { flex-direction: column; gap: 10px; }
          .doc-title h1 { font-size: 17pt; }
          .doc-title h2 { font-size: 10pt; }
          .signature-section { gap: 8px; }
          .info-label { width: 104px; }
        }
      `}</style>
        <div className="no-print" style={{ textAlign: 'center', padding: '12px', background: '#f0f0f0' }}>
          <button
            onClick={() => { setSelectedLang('en'); window.history.replaceState(null, '', updateQueryStringParameter(window.location.href, 'lang', 'en')) }}
            style={{ marginRight: 8, padding: '6px 16px', fontSize: 13, borderRadius: 20, border: selectedLang === 'en' ? '2px solid #e67e22' : '1px solid #ccc', background: selectedLang === 'en' ? '#fff5eb' : '#fff', cursor: 'pointer', fontWeight: selectedLang === 'en' ? 600 : 400 }}
          >English</button>
          <button
            onClick={() => { setSelectedLang('th'); window.history.replaceState(null, '', updateQueryStringParameter(window.location.href, 'lang', 'th')) }}
            style={{ marginRight: 8, padding: '6px 16px', fontSize: 13, borderRadius: 20, border: selectedLang === 'th' ? '2px solid #e67e22' : '1px solid #ccc', background: selectedLang === 'th' ? '#fff5eb' : '#fff', cursor: 'pointer', fontWeight: selectedLang === 'th' ? 600 : 400 }}
          >Thai</button>
          <button
            onClick={() => window.print()}
            style={{ marginLeft: 16, padding: '6px 20px', fontSize: 13, borderRadius: 20, border: '1px solid #e67e22', background: '#e67e22', color: 'white', cursor: 'pointer', fontWeight: 600 }}
          >{L('Print', 'พิมพ์', '인쇄')}</button>
        </div>

      <div className="a4-page">
        <div className="header-row">
          <div className="company-info">
            <div className="brand-row">
              <img src="/k-energy-save-logo.png" className="brand-logo" alt="K Energy Save Logo" />
              <div>
                <div className="company-name">K Energy Save</div>
                <div className="company-name-en">K Energy Save Co., Ltd.</div>
              </div>
            </div>
            <div className="company-address">
              {L('84 Chaloem Phrakiat Rama 9 Soi 34, Nong Bon, Prawet, Bangkok 10250', '84 ถนนเฉลิมพระเกียรติ ร.9 ซอย 34 แขวงหนองบอน เขตประเวศ กรุงเทพมหานคร 10250')}<br/>
              {L('Tel: 02-080-8916 | Email: info@kenergy-save.com', 'โทร: 02-080-8916 | อีเมล: info@kenergy-save.com')}
            </div>
          </div>
          <div className="doc-title">
            <h1>{L('PRODUCTION ORDER', 'ใบสั่งผลิต')}</h1>
            <h2>{L('Manufacturing Order', 'คำสั่งการผลิต')}</h2>
          </div>
        </div>

        <div className="info-section">
          <div className="info-box">
            <div className="box-title">{L('Production Order Information', 'ข้อมูลใบสั่งผลิต')}</div>
            <div className="info-row">
              <span className="info-label">{L('PDO No:', 'เลขที่ PDO:')}</span>
              <span className="info-value">{doc.pdoNo || doc.poNo || doc.po_no || '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Date:', 'วันที่:')}</span>
              <span className="info-value">{fmtDate(doc.created_at || doc.order_date || doc.createdAt)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Start Date:', 'วันที่เริ่ม:')}</span>
              <span className="info-value">{fmtDate(doc.start_date || doc.startDate || doc.created_at)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Due Date:', 'กำหนดส่ง:')}</span>
              <span className="info-value">{fmtDate(doc.due_date || doc.dueDate)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Status:', 'สถานะ:')}</span>
              <span className="info-value">{doc.status || '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Created By:', 'ผู้สร้าง:')}</span>
              <span className="info-value">{createdByDisplay}</span>
            </div>
          </div>
          <div className="line-box">
            <div className="box-title">{L('Production Details', 'รายละเอียดการผลิต')}</div>
            <div className="info-row">
              <span className="info-label">{L('Line:', 'ไลน์ผลิต:')}</span>
              <span className="info-value">{productionLine}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Supervisor:', 'หัวหน้างาน:')}</span>
              <span className="info-value">{branchManagerName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Shift:', 'กะงาน:')}</span>
              <span className="info-value">{shift}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Priority:', 'ความเร่งด่วน:')}</span>
              <span className="info-value">{priority}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('SO Ref:', 'อ้างอิง SO:')}</span>
              <span className="info-value">{reference}</span>
            </div>
          </div>
        </div>

        <div className="full-box">
          <div className="box-title">{L('Manufacturer Information', 'ข้อมูลผู้ผลิต')}</div>
          <div className="info-row">
            <span className="info-label">{L('Manufacturer:', 'ผู้ผลิต:')}</span>
            <span className="info-value">{manufacturerNameDisplay}</span>
          </div>
          <div className="info-row">
            <span className="info-label">{L('Tax ID:', 'เลขผู้เสียภาษี:')}</span>
            <span className="info-value">{manufacturerTaxId}</span>
          </div>
          <div className="info-row">
            <span className="info-label">{L('Address:', 'ที่อยู่:')}</span>
            <span className="info-value">{manufacturerAddressDisplay}</span>
          </div>
        </div>

        <div className="full-box">
          <div className="box-title">{L('Delivery Customer Information', 'ข้อมูลลูกค้าจัดส่ง')}</div>
          <div className="info-row">
            <span className="info-label">{L('Customer:', 'ลูกค้า:')}</span>
            <span className="info-value">{deliveryCustomerName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">{L('Tax ID:', 'เลขผู้เสียภาษี:')}</span>
            <span className="info-value">{deliveryCustomerTaxId}</span>
          </div>
          <div className="info-row">
            <span className="info-label">{L('Phone:', 'โทรศัพท์:')}</span>
            <span className="info-value">{deliveryCustomerPhone}</span>
          </div>
          <div className="info-row">
            <span className="info-label">{L('Address:', 'ที่อยู่:')}</span>
            <span className="info-value">{deliveryCustomerAddress}</span>
          </div>
          <div className="info-row">
            <span className="info-label">{L('Delivery Date:', 'วันที่จัดส่ง:')}</span>
            <span className="info-value">{fmtDate(deliveryDate)}</span>
          </div>
        </div>

        <div className="notes-box">
          <div className="box-title">{L('Notes', 'หมายเหตุ')}</div>
          <div className="notes-text">{notes}</div>
        </div>

        <table className="items-table">
          <thead>
            <tr>
              <th>{L('No.', 'ลำดับ')}</th>
              <th>{L('Description', 'รายการ')}</th>
              <th>{L('Qty', 'จำนวน')}</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={3} style={{ textAlign: 'center', color: '#999', padding: 20 }}>-</td></tr>
            ) : items.map((it: any, idx: number) => {
              const rawQty = it.quantity || it.qty || targetQty
              const qtyNum = parseFloat(String(rawQty))
              const qtyDisplay = !isNaN(qtyNum) ? qtyNum.toFixed(2) : (rawQty || '-')
              const itemUnit = it.unit || unit || ''
              const desc = it.description || it.product_name || it.desc || productName || '-'
              return (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{desc}</td>
                  <td>{`${qtyDisplay}${itemUnit ? ` ${itemUnit}` : ''}`}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="signature-section">
          <div className="signature-box">
            <div className="signature-line">{preparedByDisplay}</div>
            <div className="signature-label">{L('Prepared By', 'ผู้จัดทำ')}</div>
            <div className="signature-sub">{L('Planning', 'วางแผน')}</div>
          </div>
          <div className="signature-box">
            <div className="signature-line">{branchManagerName}</div>
            <div className="signature-label">{L('Supervisor', 'ผู้ควบคุม')}</div>
            <div className="signature-sub">{L('Branch Manager', 'ผู้จัดการสาขา')}</div>
          </div>
          <div className="signature-box">
            <div className="signature-line">{approvedByName}</div>
            <div className="signature-label">{L('Approved By', 'ผู้อนุมัติ')}</div>
            <div className="signature-sub">{L('Manager', 'ผู้จัดการ')}</div>
          </div>
        </div>

        <div className="footer-info">
          <span>{L('User', 'ผู้พิมพ์')}: {loggedUser || '-'}</span>
          <span>{L('Printed', 'พิมพ์เมื่อ')}: {new Date(lastPrinted || new Date()).toLocaleString(selectedLang === 'th' ? 'th-TH' : 'en-US')}</span>
          <span>{L('Print Count', 'จำนวนครั้งที่พิมพ์')}: {printCount + 1}</span>
        </div>
      </div>
    </>
  )
}
