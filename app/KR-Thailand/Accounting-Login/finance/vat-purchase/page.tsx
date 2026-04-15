'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AccWindow, { useLang } from '../../components/AccWindow'

export default function VatPurchasePage() {
  const router = useRouter()
  const { L, lang } = useLang()
  const [showDialog, setShowDialog] = useState(true)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [onlyWithDate, setOnlyWithDate] = useState(false)
  const [buttonHover, setButtonHover] = useState<string | null>(null)
  const [vatData, setVatData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [showPrintDialog, setShowPrintDialog] = useState(false)

  // Mock data for demonstration
  const mockData = [
    { date: '01/01/69', docNo: '201000047/2', taxDate: '01/01/69', taxId: 'VW6011003001', credit: 'เปล่า', branch: 'Digital Verse', description: 'Digital Verse', amount: 38500.00, vatAmount: 2695.00, vat: 8.75 },
    { date: '01/01/69', docNo: '#4113603318#3', taxDate: '01/01/69', taxId: 'BW6010019101', credit: '', branch: '', description: 'กรุงไทยคอนซูมเมอร์', amount: 0.00, vatAmount: 374.01, vat: 374.01 },
    { date: '02/01/69', docNo: '2510000372', taxDate: '02/01/69', taxId: 'VW6010019101', credit: 'เปล่า', branch: '', description: 'ร้าน iPoint (Chonburi) จำกัด', amount: 142598.10, vatAmount: 9981.87, vat: 33.61 },
    { date: '05/01/69', docNo: '3806500303', taxDate: '05/01/69', taxId: 'GW5010109002', credit: '', branch: '', description: 'ร้าน iRest (Chonburi)', amount: 0.00, vatAmount: 41250.00, vat: 2887.50 },
    { date: '12/01/69', docNo: 'A0402270091', taxDate: '12/01/69', taxId: 'RW6011003001', credit: '', branch: '', description: '(รายการที่ถูกลบ)', amount: 0.00, vatAmount: 116.30, vat: 8.14 },
    { date: '12/01/69', docNo: '2805796', taxDate: '12/01/69', taxId: 'VW6011002001', credit: '', branch: '', description: 'ห้างอินโดนี (Rayong) จำกัด', amount: 0.00, vatAmount: 2691.44, vat: 188.40 },
    { date: '12/01/69', docNo: '2805795', taxDate: '12/01/69', taxId: 'VW6011002002', credit: '', branch: '', description: 'ผลิตภัณฑ์เพื่อสุขภาพ จำกัด', amount: 0.00, vatAmount: 7750.01, vat: 542.50 },
    { date: '12/01/69', docNo: '29-01187', taxDate: '12/01/69', taxId: 'GW5011003005', credit: '', branch: '', description: 'ไมอามี่ อินดัสทรี จำกัด', amount: 0.00, vatAmount: 401.87, vat: 28.13 },
    { date: '13/01/69', docNo: '2660278590', taxDate: '13/01/69', taxId: 'RW6011001788', credit: '', branch: '', description: 'ดิจิตอลมาร์เก็ตติ้ง จำกัด (Rayong)', amount: 0.00, vatAmount: 9747.01, vat: 682.29 },
    { date: '13/01/69', docNo: '2660278592', taxDate: '13/01/69', taxId: 'RW6011001780', credit: '', branch: '', description: 'ค้าขายคอมพิวเตอร์ จำกัด (Rayong)', amount: 0.00, vatAmount: 1207.30, vat: 84.51 },
    { date: '14/01/69', docNo: 'A1128556', taxDate: '14/01/69', taxId: 'VW6011003002', credit: '', branch: '', description: 'บริษัท อินเวน จำกัด', amount: 0.00, vatAmount: 2692.21, vat: 402.46 },
    { date: '15/01/69', docNo: '2805010069419', taxDate: '15/01/69', taxId: 'RW6011002001', credit: '', branch: '', description: 'Itannich การค้า จำกัด', amount: 0.00, vatAmount: 2578.00, vat: 180.46 },
    { date: '16/01/69', docNo: '32604695/0', taxDate: '16/01/69', taxId: 'VW6011006001', credit: '', branch: '', description: 'ดิจิตอลอะดาปเตอร์ จำกัด (Rayong)', amount: 0.00, vatAmount: 5433.58, vat: 142.52 },
    { date: '16/01/69', docNo: '29604734/0', taxDate: '16/01/69', taxId: 'RW6011008002', credit: '', branch: '', description: 'ดิจิตอลซัพพลายอิเล็กทรอนิกส์ จำกัด', amount: 0.00, vatAmount: 11114.00, vat: 70.11 },
    { date: '16/01/69', docNo: '2660280158', taxDate: '16/01/69', taxId: 'RW6011001804', credit: '', branch: '', description: 'บริษัทอุตสาหกรรมก่อสร้าง จำกัด', amount: 0.00, vatAmount: 183.05, vat: 12.81 },
    { date: '16/01/69', docNo: '2660280160', taxDate: '16/01/69', taxId: 'VW6011004004', credit: '', branch: '', description: 'เอ็กซ์ซีลเล้นท์คลาสติ้ง จำกัด', amount: 0.00, vatAmount: 185.05, vat: 12.95 },
    { date: '16/01/69', docNo: '28604695/0', taxDate: '16/01/69', taxId: 'VW6011005002', credit: '', branch: '', description: 'อิ ลิทเทิลแลนด์ ดีทราเวล จำกัด', amount: 0.00, vatAmount: 1873.01, vat: 10.89 },
    { date: '16/01/69', docNo: '2660280157', taxDate: '16/01/69', taxId: 'RW6011008003', credit: '', branch: '', description: 'บริษัท ไดนามิค สมาร์ท เทคโนโลยี จำกัด', amount: 0.00, vatAmount: 275.05, vat: 19.25 },
    { date: '18/01/69', docNo: '2605108818/7', taxDate: '18/01/69', taxId: 'VW6011008001', credit: '', branch: '', description: 'เอสซีจีพลาสติกส์ จำกัด', amount: 205, vatAmount: 10474.77, vat: 215.23 },
    { date: '18/01/69', docNo: '2605108818/8', taxDate: '18/01/69', taxId: 'RW6011008002', credit: '', branch: '', description: 'เอสซีจีเคมิคอลส์ จำกัด', amount: 0.00, vatAmount: 522.38, vat: 16.62 },
    { date: '19/01/69', docNo: '30-20160114', taxDate: '19/01/69', taxId: 'GW5011009001', credit: 'เปล่า', branch: '', description: 'ไทยแซมซุง จำกัด', amount: 0.00, vatAmount: 33900.00, vat: 2376.50 },
    { date: '19/01/69', docNo: '30-20160115', taxDate: '19/01/69', taxId: 'VW6011009002', credit: '', branch: '', description: 'ไทยซัมซุงฯ', amount: 0.00, vatAmount: 2300.00, vat: 161.00 },
    { date: '26/01/69', docNo: '6903953', taxDate: '26/01/69', taxId: 'VW6011020001', credit: '', branch: '', description: 'บริษัทคอมพิวเตอร์ไอดี จำกัด', amount: 0.00, vatAmount: 8140.00, vat: 576.80 },
    { date: '26/01/69', docNo: '6903954', taxDate: '26/01/69', taxId: 'RW6011020002', credit: '', branch: '', description: 'บริษัทจำหน่ายอะไหล่อิเล็กทรอนิกส์ ไอที จำกัด', amount: 0.00, vatAmount: 11470.00, vat: 801.90 },
    { date: '30/01/69', docNo: '300601200020', taxDate: '30/01/69', taxId: 'VW6013000003', credit: 'เปล่า', branch: 'Montersu', description: 'Montersu', amount: 0.00, vatAmount: 13053.36, vat: 91.04 }
  ]

  useEffect(() => {
    // Set default dates (current date)
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const year = String(now.getFullYear())
    const defaultDate = `${year}-${month}-${day}`
    setFromDate(defaultDate)
    setToDate(defaultDate)

    // Load mock data by default
    setVatData(mockData)
  }, [])

  const loadVatData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/accounting/vat-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromDate,
          toDate,
          onlyWithDate
        })
      })
      const data = await response.json()
      if (data.success) {
        setVatData(data.records || [])
      }
    } catch (error) {
      console.error('Error loading VAT data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOk = () => {
    setShowDialog(false)
    loadVatData()
  }

  const handleCancel = () => {
    router.push('/Thailand/Accounting-Login/dashboard')
  }

  const handleNew = () => {
    if (confirm(L('Create new purchase record?', 'สร้างรายการซื้อใหม่?'))) {
      router.push('/Thailand/Accounting-Login/purchase/cash')
    }
  }

  const handleDelete = async () => {
    if (selectedRows.length === 0) {
      alert(L('Please select records to delete', 'กรุณาเลือกรายการที่ต้องการลบ'))
      return
    }

    if (confirm(L(`Delete ${selectedRows.length} selected record(s)?`, `ลบ ${selectedRows.length} รายการที่เลือก?`))) {
      try {
        // Filter out selected rows
        const updatedData = vatData.filter((_, idx) => !selectedRows.includes(idx))
        setVatData(updatedData)
        setSelectedRows([])
        alert(L('Records deleted successfully!', 'ลบรายการสำเร็จ!'))
      } catch (error) {
        alert(L('Failed to delete records', 'ลบรายการไม่สำเร็จ'))
      }
    }
  }

  const handlePrint = () => {
    setShowPrintDialog(true)
  }

  const handleSearch = () => {
    const searchDate = prompt(L('Enter date (DD/MM/YY) or leave empty:', 'ป้อนวันที่ (DD/MM/YY) หรือเว้นว่าง:'), '')
    const searchDocNo = prompt(L('Enter bill/document number or leave empty:', 'ป้อนเลขที่บิล/เอกสาร หรือเว้นว่าง:'), '')

    if (searchDate !== null || searchDocNo !== null) {
      if ((searchDate?.trim() === '' || !searchDate) && (searchDocNo?.trim() === '' || !searchDocNo)) {
        loadVatData()
        setSearchTerm('')
      } else {
        const filtered = vatData.filter(row => {
          const dateMatch = !searchDate || searchDate.trim() === '' ||
            row.date?.includes(searchDate) || row.taxDate?.includes(searchDate)
          const docMatch = !searchDocNo || searchDocNo.trim() === '' ||
            row.docNo?.toLowerCase().includes(searchDocNo.toLowerCase())
          return dateMatch && docMatch
        })
        setVatData(filtered)
        setSearchTerm(`${searchDate || ''} ${searchDocNo || ''}`.trim())
      }
    }
  }

  const handleExport = () => {
    try {
      if (vatData.length === 0) {
        alert(L('No data to export', 'ไม่มีข้อมูลให้ส่งออก'))
        return
      }

      // Create Excel-compatible tab-delimited format
      const header = [
        L('No.', 'ลำดับที่'),
        L('Period', 'ในงวด'),
        L('Tax Invoice Date', 'ใบกำกับภาษี-วันที่'),
        L('Tax Invoice No.', 'ใบกำกับภาษี-เลขที่'),
        L('Internal Doc Date', 'เอกสารภายใน-วันที่'),
        L('Internal Doc No.', 'เอกสารภายใน-เลขที่'),
        L('Department', 'แผนก'),
        L('Prefix', 'คำนำหน้า'),
        L('Description', 'รายการ'),
        L('TAX ID', 'TAXID'),
        L('Branch#', 'สาขา#'),
        L('Deductible Tax', 'ภาษีที่ขอได้'),
        L('Amount', 'มูลค่า'),
        L('Tax', 'ภาษี')
      ].join('\t')

      // Create Excel rows with tab delimiter
      const rows = vatData.map((row, idx) => {
        const dateStr = row.taxDate || row.date || ''
        const parts = dateStr.split('/')
        const periodFormat = parts.length === 3 ? `${parts[1]}/${parts[2]}` : ''

        return [
          idx + 1,
          periodFormat,
          row.taxDate || '',
          row.docNo || '',
          row.date || '',
          '',
          '',
          row.credit || '',
          row.description || '',
          row.taxId || '',
          row.branch || '',
          row.vatAmount || 0,
          row.amount || 0,
          row.vat || 0
        ].join('\t')
      })

      const excel = [header, ...rows].join('\n')
      const blob = new Blob(['\ufeff' + excel], { type: 'application/vnd.ms-excel;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `vat-purchase-${fromDate}-${toDate}.xls`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      alert(L('Export to Excel successful!', 'ส่งออก Excel สำเร็จ!'))
    } catch (error) {
      console.error('Export error:', error)
      alert(L('Export failed', 'ส่งออกไม่สำเร็จ'))
    }
  }

  const calculateTotals = () => {
    return vatData.reduce((acc, row) => ({
      amount: acc.amount + (parseFloat(row.amount) || 0),
      taxBase: acc.taxBase + (parseFloat(row.taxBase) || 0),
      vatAmount: acc.vatAmount + (parseFloat(row.vatAmount) || 0),
      vat: acc.vat + (parseFloat(row.vat) || 0),
    }), { amount: 0, taxBase: 0, vatAmount: 0, vat: 0 })
  }

  const totals = calculateTotals()

  return (
    <AccWindow title="แฟ้มภาษีซื้อ">
      {/* Date Range Dialog */}
      {showDialog && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            background: '#f9fafb',
            border: '3px solid #9ca3af',
            borderRadius: 8,
            width: 500,
            boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
          }}>
            {/* Title Bar */}
            <div style={{
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: '#fff',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 15,
              fontWeight: 700,
              borderRadius: '5px 5px 0 0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>📅</span>
                <span>{L('Date Range Selection', 'เลือกช่วงเวลา')}</span>
              </div>
              <button
                onClick={handleCancel}
                onMouseEnter={() => setButtonHover('close')}
                onMouseLeave={() => setButtonHover(null)}
                style={{
                  background: buttonHover === 'close' ? '#dc2626' : 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#fff',
                  width: 26,
                  height: 26,
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                  transition: 'all 0.2s',
                }}
              >×</button>
            </div>

            {/* Content */}
            <div style={{ padding: '28px 24px' }}>
              <div style={{
                fontSize: 14,
                marginBottom: 20,
                color: '#374151',
                fontWeight: 600,
                padding: '12px 16px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 6,
              }}>
                {L('Select accounting period to display', 'ดูเฉพาะรายการที่ยื่นรวมในงวด')}
              </div>

              {/* Date Inputs Container */}
              <div style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: '20px',
                marginBottom: 20,
              }}>
                {/* From Date */}
                <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <label style={{ fontSize: 14, color: '#374151', fontWeight: 600, width: 80 }}>
                    {L('From:', 'ตั้งแต่:')}
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      border: '2px solid #d1d5db',
                      borderRadius: 6,
                      background: '#fff',
                      fontSize: 14,
                      width: 180,
                      fontFamily: '"Sarabun","Tahoma",sans-serif',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = '2px solid #059669'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.1)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = '2px solid #d1d5db'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                  <span style={{ fontSize: 13, color: '#6b7280', fontStyle: 'italic' }}>
                    ({L('start date', 'วันที่เริ่มต้น')})
                  </span>
                </div>

                {/* To Date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <label style={{ fontSize: 14, color: '#374151', fontWeight: 600, width: 80 }}>
                    {L('To:', 'ถึง:')}
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      border: '2px solid #d1d5db',
                      borderRadius: 6,
                      background: '#fff',
                      fontSize: 14,
                      width: 180,
                      fontFamily: '"Sarabun","Tahoma",sans-serif',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = '2px solid #059669'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.1)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = '2px solid #d1d5db'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                  <span style={{ fontSize: 13, color: '#6b7280', fontStyle: 'italic' }}>
                    ({L('end date', 'วันที่สิ้นสุด')})
                  </span>
                </div>
              </div>

              {/* Checkbox */}
              <div style={{
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                background: '#fffbeb',
                border: '1px solid #fef3c7',
                borderRadius: 6,
              }}>
                <input
                  type="checkbox"
                  id="onlyWithDate"
                  checked={onlyWithDate}
                  onChange={(e) => setOnlyWithDate(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
                <label htmlFor="onlyWithDate" style={{ fontSize: 13, color: '#92400e', cursor: 'pointer', fontWeight: 500 }}>
                  {L('Show only entries without tax invoice', 'เลือกเฉพาะรายการที่ยังไม่ได้ใบกำกับภาษี')}
                </label>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <button
                  onClick={handleOk}
                  onMouseEnter={() => setButtonHover('ok')}
                  onMouseLeave={() => setButtonHover(null)}
                  style={{
                    padding: '10px 32px',
                    background: buttonHover === 'ok' ? '#047857' : '#059669',
                    border: 'none',
                    borderRadius: 6,
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    minWidth: 100,
                    fontFamily: '"Sarabun","Tahoma",sans-serif',
                    boxShadow: buttonHover === 'ok' ? '0 4px 12px rgba(5,150,105,0.4)' : '0 2px 6px rgba(0,0,0,0.15)',
                    transition: 'all 0.2s',
                    transform: buttonHover === 'ok' ? 'translateY(-1px)' : 'none',
                  }}
                >
                  ✓ {L('OK', 'ตกลง')}
                </button>
                <button
                  onClick={handleCancel}
                  onMouseEnter={() => setButtonHover('cancel')}
                  onMouseLeave={() => setButtonHover(null)}
                  style={{
                    padding: '10px 32px',
                    background: buttonHover === 'cancel' ? '#6b7280' : '#9ca3af',
                    border: 'none',
                    borderRadius: 6,
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    minWidth: 100,
                    fontFamily: '"Sarabun","Tahoma",sans-serif',
                    boxShadow: buttonHover === 'cancel' ? '0 4px 12px rgba(107,114,128,0.4)' : '0 2px 6px rgba(0,0,0,0.15)',
                    transition: 'all 0.2s',
                    transform: buttonHover === 'cancel' ? 'translateY(-1px)' : 'none',
                  }}
                >
                  ✕ {L('Cancel', 'ยกเลิก')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Dialog */}
      {showPrintDialog && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            background: '#f9fafb',
            border: '3px solid #9ca3af',
            borderRadius: 8,
            width: 500,
            boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
          }}>
            {/* Title Bar */}
            <div style={{
              background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
              color: '#fff',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 15,
              fontWeight: 700,
              borderRadius: '5px 5px 0 0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>🖨️</span>
                <span>{L('Print Options', 'ตัวเลือกการพิมพ์')}</span>
              </div>
              <button
                onClick={() => setShowPrintDialog(false)}
                onMouseEnter={() => setButtonHover('printClose')}
                onMouseLeave={() => setButtonHover(null)}
                style={{
                  background: buttonHover === 'printClose' ? '#dc2626' : 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#fff',
                  width: 26,
                  height: 26,
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                  transition: 'all 0.2s',
                }}
              >×</button>
            </div>

            {/* Content */}
            <div style={{ padding: '28px 24px' }}>
              <div style={{
                fontSize: 14,
                marginBottom: 20,
                color: '#374151',
                fontWeight: 600,
                padding: '12px 16px',
                background: '#dbeafe',
                border: '1px solid #93c5fd',
                borderRadius: 6,
              }}>
                {L('Select print options', 'เลือกตัวเลือกการพิมพ์')}
              </div>

              {/* Print Options */}
              <div style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: '20px',
                marginBottom: 20,
              }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: '#374151' }}>
                    <input type="radio" name="printOption" defaultChecked />
                    <span>{L('Print all records', 'พิมพ์ทุกรายการ')} ({vatData.length} {L('items', 'รายการ')})</span>
                  </label>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: '#374151' }}>
                    <input type="radio" name="printOption" disabled={selectedRows.length === 0} />
                    <span>{L('Print selected records', 'พิมพ์รายการที่เลือก')} ({selectedRows.length} {L('items', 'รายการ')})</span>
                  </label>
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: '#374151' }}>
                    <input type="radio" name="printOption" />
                    <span>{L('Print date range:', 'พิมพ์ช่วงเวลา:')} {fromDate} - {toDate}</span>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowPrintDialog(false)
                    window.print()
                  }}
                  onMouseEnter={() => setButtonHover('printOk')}
                  onMouseLeave={() => setButtonHover(null)}
                  style={{
                    padding: '10px 32px',
                    background: buttonHover === 'printOk' ? '#0891b2' : '#06b6d4',
                    border: 'none',
                    borderRadius: 6,
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    minWidth: 100,
                    fontFamily: '"Sarabun","Tahoma",sans-serif',
                    boxShadow: buttonHover === 'printOk' ? '0 4px 12px rgba(6,182,212,0.4)' : '0 2px 6px rgba(0,0,0,0.15)',
                    transition: 'all 0.2s',
                    transform: buttonHover === 'printOk' ? 'translateY(-1px)' : 'none',
                  }}
                >
                  🖨️ {L('Print', 'พิมพ์')}
                </button>
                <button
                  onClick={() => setShowPrintDialog(false)}
                  onMouseEnter={() => setButtonHover('printCancel')}
                  onMouseLeave={() => setButtonHover(null)}
                  style={{
                    padding: '10px 32px',
                    background: buttonHover === 'printCancel' ? '#6b7280' : '#9ca3af',
                    border: 'none',
                    borderRadius: 6,
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    minWidth: 100,
                    fontFamily: '"Sarabun","Tahoma",sans-serif',
                    boxShadow: buttonHover === 'printCancel' ? '0 4px 12px rgba(107,114,128,0.4)' : '0 2px 6px rgba(0,0,0,0.15)',
                    transition: 'all 0.2s',
                    transform: buttonHover === 'printCancel' ? 'translateY(-1px)' : 'none',
                  }}
                >
                  ✕ {L('Cancel', 'ยกเลิก')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content (after dialog closed) */}
      {!showDialog && (
        <div style={{ padding: 0, minHeight: '100%', background: 'linear-gradient(180deg, #f3f4f6 0%, #e5e7eb 100%)' }}>
          {/* Toolbar */}
          <div style={{
            background: 'linear-gradient(180deg, #4b5563 0%, #374151 100%)',
            borderBottom: '2px solid #1f2937',
            padding: '10px 14px',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}>
            <button
              onClick={handleNew}
              title={L('Create new purchase record', 'สร้างรายการซื้อใหม่')}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#6b7280'
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#9ca3af'
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)'
              }}
              style={{
                padding: '8px 16px',
                background: '#9ca3af',
                border: 'none',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                borderRadius: 6,
                color: '#fff',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                letterSpacing: '0.3px'
              }}>
              📄 {L('New', 'ใหม่')}
            </button>
            <button
              onClick={handleDelete}
              title={L('Delete selected records', 'ลบรายการที่เลือก')}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#dc2626'
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(220,38,38,0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ef4444'
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)'
              }}
              style={{
                padding: '8px 16px',
                background: '#ef4444',
                border: 'none',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                borderRadius: 6,
                color: '#fff',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                letterSpacing: '0.3px'
              }}>
              🗑️ {L('Delete', 'ลบ')}
            </button>
            <button
              onClick={handlePrint}
              title={L('Print report (Ctrl+P)', 'พิมพ์รายงาน (Ctrl+P)')}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#6b7280'
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#9ca3af'
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)'
              }}
              style={{
                padding: '8px 16px',
                background: '#9ca3af',
                border: 'none',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                borderRadius: 6,
                color: '#fff',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                letterSpacing: '0.3px'
              }}>
              🖨️ {L('Print', 'พิมพ์')}
            </button>
            <div style={{ width: 2, height: 28, background: 'rgba(255,255,255,0.3)', margin: '0 6px' }} />
            <button
              onClick={handleSearch}
              title={L('Search by supplier or document number', 'ค้นหาจากชื่อผู้จำหน่ายหรือเลขที่เอกสาร')}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#6b7280'
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#9ca3af'
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)'
              }}
              style={{
                padding: '8px 16px',
                background: '#9ca3af',
                border: 'none',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                borderRadius: 6,
                color: '#fff',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                letterSpacing: '0.3px'
              }}>
              🔍 {L('Search', 'ค้นหา')}
            </button>
            <button
              onClick={handleExport}
              title={L('Export to CSV file', 'ส่งออกเป็นไฟล์ CSV')}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#6b7280'
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#9ca3af'
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)'
              }}
              style={{
                padding: '8px 16px',
                background: '#9ca3af',
                border: 'none',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                borderRadius: 6,
                color: '#fff',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                letterSpacing: '0.3px'
              }}>
              📊 {L('Export', 'ส่งออก')}
            </button>
            <div style={{ flex: 1 }} />
            {loading && (
              <div style={{ fontSize: 13, color: '#fbbf24', fontWeight: 600 }}>
                ⏳ {L('Loading...', 'กำลังโหลด...')}
              </div>
            )}
            {searchTerm && (
              <div style={{ fontSize: 13, color: '#fbbf24', fontWeight: 600, marginRight: 12 }}>
                🔍 {searchTerm}
              </div>
            )}
            <div style={{
              fontSize: 13,
              color: '#fff',
              fontWeight: 700,
              background: 'rgba(0,0,0,0.3)',
              padding: '8px 14px',
              borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.2)',
              letterSpacing: '0.3px'
            }}>
              📅 {L('Period:', 'ช่วงเวลา:')} {fromDate ? new Date(fromDate).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '-'} - {toDate ? new Date(toDate).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '-'}
            </div>
          </div>

          {/* Table Container */}
          <div style={{
            background: '#fff',
            margin: 12,
            border: '1px solid #9ca3af',
            borderRadius: 8,
            overflow: 'auto',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            maxWidth: '100%',
          }}>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '40px 50px 80px 120px 80px 60px 60px 70px 300px 110px 120px 100px 100px 90px',
              gridTemplateRows: 'auto auto',
              background: 'linear-gradient(180deg, #d4d4d8 0%, #a1a1aa 100%)',
              borderBottom: '2px solid #71717a',
              fontSize: 11,
              fontWeight: 700,
              color: '#18181b',
              minWidth: '1380px',
            }}>
              {/* Row 1 - Main Headers */}
              <div style={{ gridRow: '1', gridColumn: '1 / 3', padding: '4px 3px', borderRight: '1px solid #a1a1aa', borderBottom: '1px solid #a1a1aa', textAlign: 'center' }}>{L('Filed', 'ยื่นรวม')}</div>
              <div style={{ gridRow: '1', gridColumn: '3 / 5', padding: '4px 3px', borderRight: '1px solid #a1a1aa', borderBottom: '1px solid #a1a1aa', textAlign: 'center' }}>{L('Tax Invoice', 'ใบกำกับภาษี')}</div>
              <div style={{ gridRow: '1', gridColumn: '5 / 7', padding: '4px 3px', borderRight: '1px solid #a1a1aa', borderBottom: '1px solid #a1a1aa', textAlign: 'center' }}>{L('Internal Document', 'เอกสารภายใน')}</div>
              <div style={{ gridRow: '1 / 3', padding: '8px 3px', borderRight: '1px solid #a1a1aa', borderBottom: '1px solid #a1a1aa', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{L('Department', 'แผนก')}</div>
              <div style={{ gridRow: '1 / 3', padding: '8px 3px', borderRight: '1px solid #a1a1aa', borderBottom: '1px solid #a1a1aa', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{L('Prefix', 'คำนำหน้า')}</div>
              <div style={{ gridRow: '1 / 3', padding: '8px 3px', borderRight: '1px solid #a1a1aa', borderBottom: '1px solid #a1a1aa', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{L('Description', 'รายการ')}</div>
              <div style={{ gridRow: '1 / 3', padding: '8px 3px', borderRight: '1px solid #a1a1aa', borderBottom: '1px solid #a1a1aa', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{L('TAX ID', 'TAXID')}</div>
              <div style={{ gridRow: '1 / 3', padding: '8px 3px', borderRight: '1px solid #a1a1aa', borderBottom: '1px solid #a1a1aa', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{L('Branch#', 'สาขา#')}</div>
              <div style={{ gridRow: '1 / 3', padding: '8px 3px', borderRight: '1px solid #a1a1aa', borderBottom: '1px solid #a1a1aa', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{L('Deductible Tax', 'ภาษีที่ขอได้')}</div>
              <div style={{ gridRow: '1 / 3', padding: '8px 3px', borderRight: '1px solid #a1a1aa', borderBottom: '1px solid #a1a1aa', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{L('Amount', 'มูลค่า')}</div>
              <div style={{ gridRow: '1 / 3', padding: '8px 3px', borderBottom: '1px solid #a1a1aa', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{L('Tax', 'ภาษี')}</div>

              {/* Row 2 - Sub Headers */}
              <div style={{ gridRow: '2', gridColumn: '1', padding: '4px 3px', borderRight: '1px solid #a1a1aa', textAlign: 'center' }}>{L('No.', 'ลำดับที่')}</div>
              <div style={{ gridRow: '2', gridColumn: '2', padding: '4px 3px', borderRight: '1px solid #a1a1aa', textAlign: 'center' }}>{L('Period', 'ในงวด')}</div>
              <div style={{ gridRow: '2', gridColumn: '3', padding: '4px 3px', borderRight: '1px solid #a1a1aa', textAlign: 'center' }}>{L('Date', 'วันที่')}</div>
              <div style={{ gridRow: '2', gridColumn: '4', padding: '4px 3px', borderRight: '1px solid #a1a1aa', textAlign: 'center' }}>{L('No.', 'เลขที่')}</div>
              <div style={{ gridRow: '2', gridColumn: '5', padding: '4px 3px', borderRight: '1px solid #a1a1aa', textAlign: 'center' }}>{L('Date', 'วันที่')}</div>
              <div style={{ gridRow: '2', gridColumn: '6', padding: '4px 3px', borderRight: '1px solid #a1a1aa', textAlign: 'center' }}>{L('No.', 'เลขที่')}</div>
            </div>

            {/* Table Body */}
            <div style={{ fontSize: 11, fontFamily: '"Courier New",monospace', fontWeight: 500, maxHeight: '600px', overflowY: 'auto', minWidth: '1380px' }}>
              {vatData.length === 0 ? (
                /* No data row */
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 50px 80px 120px 80px 60px 60px 70px 300px 110px 120px 100px 100px 90px',
                  borderBottom: '1px solid #d4d4d8',
                }}>
                  <div style={{ padding: '6px 4px', borderRight: '1px solid #e4e4e7', textAlign: 'center', background: '#fafafa', color: '#000', fontWeight: 600 }}>-</div>
                  <div style={{ padding: '6px 4px', borderRight: '1px solid #e4e4e7', textAlign: 'center', background: '#fafafa', color: '#000', fontWeight: 600 }}>-</div>
                  <div style={{ padding: '6px 4px', borderRight: '1px solid #e4e4e7', background: '#fff', color: '#000' }}>-</div>
                  <div style={{ padding: '6px 4px', borderRight: '1px solid #e4e4e7', background: '#fff', color: '#000' }}>-</div>
                  <div style={{ padding: '6px 4px', borderRight: '1px solid #e4e4e7', background: '#fff', color: '#000' }}>-</div>
                  <div style={{ padding: '6px 4px', borderRight: '1px solid #e4e4e7', background: '#fff', color: '#000' }}>-</div>
                  <div style={{ padding: '6px 4px', borderRight: '1px solid #e4e4e7', textAlign: 'center', background: '#fff', color: '#000' }}>-</div>
                  <div style={{ padding: '6px 4px', borderRight: '1px solid #e4e4e7', background: '#fff', color: '#000' }}>-</div>
                  <div style={{ padding: '6px 4px', borderRight: '1px solid #e4e4e7', background: '#fff', color: '#71717a', fontStyle: 'italic' }}>
                    {L('No purchase VAT data in this period', 'ไม่มีข้อมูลภาษีซื้อในช่วงเวลานี้')}
                  </div>
                  <div style={{ padding: '6px 4px', borderRight: '1px solid #e4e4e7', textAlign: 'center', background: '#fff', color: '#000' }}>-</div>
                  <div style={{ padding: '6px 4px', borderRight: '1px solid #e4e4e7', textAlign: 'center', background: '#fff', color: '#000' }}>-</div>
                  <div style={{ padding: '6px 4px', borderRight: '1px solid #e4e4e7', textAlign: 'right', background: '#fff', color: '#000' }}>-</div>
                  <div style={{ padding: '6px 4px', borderRight: '1px solid #e4e4e7', textAlign: 'right', background: '#fff', color: '#000' }}>-</div>
                  <div style={{ padding: '6px 4px', textAlign: 'right', background: '#fff', color: '#000' }}>-</div>
                </div>
              ) : (
                vatData.map((row, idx) => {
                  // Extract MM/YY from tax date field (e.g., "01/01/69" in DD/MM/YY format -> "01/69" as MM/YY)
                  const dateStr = row.taxDate || row.date || ''
                  const parts = dateStr.split('/')
                  const periodFormat = parts.length === 3 ? `${parts[1]}/${parts[2]}` : '-'

                  return (
                    <div key={idx} style={{
                      display: 'grid',
                      gridTemplateColumns: '40px 50px 80px 120px 80px 60px 60px 70px 300px 110px 120px 100px 100px 90px',
                      borderBottom: '1px solid #e4e4e7',
                      background: idx % 2 === 0 ? '#fff' : '#fafafa'
                    }}>
                      <div style={{ padding: '6px 4px', borderRight: '1px solid #e4e4e7', textAlign: 'center', color: '#000', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(idx)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRows([...selectedRows, idx])
                            } else {
                              setSelectedRows(selectedRows.filter(i => i !== idx))
                            }
                          }}
                          style={{ cursor: 'pointer', width: '14px', height: '14px' }}
                        />
                        <span style={{ fontSize: '10px' }}>{idx + 1}</span>
                      </div>
                      <div style={{ padding: '6px 4px', borderRight: '1px solid #e4e4e7', textAlign: 'center', color: '#000', fontWeight: 600 }}>
                        {periodFormat}
                      </div>
                      <div style={{ padding: '6px 4px', borderRight: '1px solid #e4e4e7', color: '#000', fontWeight: 600 }}>{row.taxDate || '-'}</div>
                      <div style={{ padding: '6px 4px', borderRight: '1px solid #e4e4e7', color: '#000', fontWeight: 600 }}>{row.docNo || '-'}</div>
                      <div style={{ padding: '6px 4px', borderRight: '1px solid #e4e4e7', color: '#000', fontWeight: 600 }}>{row.date || '-'}</div>
                      <div style={{ padding: '6px 4px', borderRight: '1px solid #e4e4e7', color: '#000', fontWeight: 600 }}>-</div>
                      <div style={{ padding: '6px 4px', borderRight: '1px solid #e4e4e7', textAlign: 'center', color: '#000', fontWeight: 600 }}>-</div>
                      <div style={{ padding: '6px 4px', borderRight: '1px solid #e4e4e7', color: '#000', fontWeight: 600 }}>{row.credit || '-'}</div>
                      <div style={{ padding: '6px 4px', borderRight: '1px solid #e4e4e7', color: '#000', fontWeight: 600 }}>{row.description || '-'}</div>
                      <div style={{ padding: '6px 4px', borderRight: '1px solid #e4e4e7', textAlign: 'center', color: '#000', fontWeight: 600 }}>{row.taxId || '-'}</div>
                      <div style={{ padding: '6px 4px', borderRight: '1px solid #e4e4e7', textAlign: 'center', color: '#000', fontWeight: 600 }}>{row.branch || '-'}</div>
                      <div style={{ padding: '6px 4px', borderRight: '1px solid #e4e4e7', textAlign: 'right', color: '#000', fontWeight: 700 }}>{parseFloat(row.vatAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                      <div style={{ padding: '6px 4px', borderRight: '1px solid #e4e4e7', textAlign: 'right', color: '#000', fontWeight: 700 }}>{parseFloat(row.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                      <div style={{ padding: '6px 4px', textAlign: 'right', color: '#000', fontWeight: 700 }}>{parseFloat(row.vat || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Summary Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '40px 50px 80px 120px 80px 60px 60px 70px 300px 110px 120px 100px 100px 90px',
              background: '#fef3c7',
              borderTop: '2px solid #d97706',
              fontSize: 12,
              fontWeight: 800,
              color: '#000',
              fontFamily: '"Courier New",monospace',
              minWidth: '1380px',
            }}>
              <div style={{ padding: '10px 4px', borderRight: '1px solid #d97706', textAlign: 'center', gridColumn: 'span 11' }}>
                {L('Total', 'รวมทั้งหมด')} ({vatData.length} {L('items', 'รายการ')})
              </div>
              <div style={{ padding: '10px 4px', borderRight: '1px solid #d97706', textAlign: 'right' }}>
                {totals.vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ padding: '10px 4px', borderRight: '1px solid #d97706', textAlign: 'right' }}>
                {totals.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ padding: '10px 4px', textAlign: 'right' }}>
                {totals.vat.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      )}
    </AccWindow>
  )
}
