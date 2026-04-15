"use client"

import React, { useState, useEffect, useCallback } from 'react'
import AccWindow from '../../components/AccWindow'

interface Account {
  id?: number
  code: string
  name_th: string
  name_en?: string
  account_type: string
  sub_type?: string
  parent_code?: string
  account_alias?: string
  is_sub_account?: number
  is_active?: number
  department_split?: string
  created_at?: string
  children?: Account[]
}

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [formData, setFormData] = useState<Account>({
    code: '',
    name_th: '',
    name_en: '',
    account_type: 'asset',
    sub_type: '',
    parent_code: '',
    account_alias: '',
    is_sub_account: 0
  })
  const [departmentSplit, setDepartmentSplit] = useState<string>('N')
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [isEditing, setIsEditing] = useState(false)
  const [language, setLanguage] = useState<'th' | 'en'>('th')
  const [showPrintDialog, setShowPrintDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [printDateFrom, setPrintDateFrom] = useState('')
  const [printDateTo, setPrintDateTo] = useState('')
  const [isImportingDefault, setIsImportingDefault] = useState(false)

  // Labels สำหรับแต่ละภาษา
  const labels = {
    th: {
      accountNumber: 'เลขที่บัญชี',
      nameThai: 'ชื่อ ไทย',
      nameEnglish: 'ชื่อ อังกฤษ',
      controlAccount: 'บัญชีคุม',
      accountCategory: 'หมวดบัญชี',
      accountLevel: 'ระดับ บัญชี',
      accountType: 'ประเภทบัญชี',
      departmentSplit: 'แยกเเผนก',
      noParent: '-- ไม่มีบัญชีแม่ --',
      save: '💾 บันทึก',
      edit: '💾 แก้ไข',
      new: '➕ ใหม่',
      delete: '🗑️ ลบ',
      print: '🖨️ พิมพ์',
      report: '📊 รายงาน',
      detailThai: 'ภาษาไทย',
      detailEng: 'English',
      typeAsset: '1 - สินทรัพย์',
      typeLiability: '2 - หนี้สิน',
      typeEquity: '3 - ส่วนของผู้ถือหุ้น',
      typeIncome: '4 - รายได้',
      typeExpense: '5 - ค่าใช้จ่าย'
    },
    en: {
      accountNumber: 'Account Number',
      nameThai: 'Name (Thai)',
      nameEnglish: 'Name (English)',
      controlAccount: 'Control Account',
      accountCategory: 'Account Category',
      accountLevel: 'Account Level',
      accountType: 'Account Type',
      departmentSplit: 'Department Split',
      noParent: '-- No Parent Account --',
      save: '💾 Save',
      edit: '💾 Edit',
      new: '➕ New',
      delete: '🗑️ Delete',
      print: '🖨️ Print',
      report: '📊 Report',
      detailThai: 'Thai',
      detailEng: 'English',
      typeAsset: '1 - Assets',
      typeLiability: '2 - Liabilities',
      typeEquity: '3 - Equity',
      typeIncome: '4 - Income',
      typeExpense: '5 - Expenses'
    }
  }

  const t = labels[language]

  // Input style object
  const inputStyle = {
    padding: '8px 12px',
    border: '2px solid #dee2e6',
    borderRadius: 6,
    fontSize: 13,
    fontFamily: 'Tahoma, sans-serif',
    transition: 'all 0.2s',
    outline: 'none'
  }

  const labelStyle = {
    padding: '8px 12px',
    fontWeight: 600,
    color: '#495057',
    verticalAlign: 'middle' as const
  }

  // โหลดข้อมูล
  const loadAccounts = useCallback(async () => {
    try {
      const res = await fetch('/api/accounting/chart-of-accounts')
      const json = await res.json()
      if (json.ok) {
        setAccounts(buildTree(json.data))
      }
    } catch (err) {
      console.error('Error loading accounts:', err)
    }
  }, [])

  useEffect(() => {
    loadAccounts()
  }, [loadAccounts])

  // สร้าง Tree Structure
  const buildTree = (data: Account[]): Account[] => {
    const map: { [key: string]: Account } = {}
    const roots: Account[] = []

    // สร้าง map
    data.forEach(item => {
      map[item.code] = { ...item, children: [] }
    })

    // สร้าง tree
    data.forEach(item => {
      if (item.parent_code && map[item.parent_code]) {
        map[item.parent_code].children!.push(map[item.code])
      } else {
        roots.push(map[item.code])
      }
    })

    return roots
  }

  const flattenAccounts = (nodes: Account[], level = 0): Array<Account & { level: number }> => {
    return nodes.flatMap(node => {
      const current = { ...node, level }
      const children = node.children && node.children.length > 0
        ? flattenAccounts(node.children, level + 1)
        : []
      return [current, ...children]
    })
  }

  const flatAccounts = flattenAccounts(accounts)

  const getAccountTypeLabel = (type: string) => {
    const typeMap: Record<string, { th: string; en: string }> = {
      asset: { th: 'สินทรัพย์', en: 'Asset' },
      liability: { th: 'หนี้สิน', en: 'Liability' },
      equity: { th: 'ส่วนของผู้ถือหุ้น', en: 'Equity' },
      income: { th: 'รายได้', en: 'Income' },
      expense: { th: 'ค่าใช้จ่าย', en: 'Expense' }
    }

    const label = typeMap[type]
    return label ? (language === 'th' ? label.th : label.en) : type
  }

  const getAccountTypeColors = (type: string) => {
    const colorMap: Record<string, { bg: string; text: string }> = {
      asset: { bg: '#dbeafe', text: '#1d4ed8' },
      liability: { bg: '#fee2e2', text: '#b91c1c' },
      equity: { bg: '#dcfce7', text: '#15803d' },
      income: { bg: '#ede9fe', text: '#6d28d9' },
      expense: { bg: '#ffedd5', text: '#c2410c' }
    }

    return colorMap[type] || { bg: '#e5e7eb', text: '#374151' }
  }

  // Toggle expand/collapse
  const toggleNode = (code: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(code)) {
      newExpanded.delete(code)
    } else {
      newExpanded.add(code)
    }
    setExpandedNodes(newExpanded)
  }

  // เลือกบัญชี
  const selectAccount = (account: Account) => {
    setSelectedAccount(account)
    setFormData(account)
    setDepartmentSplit(account.department_split || 'N')
    setIsEditing(true)
  }

  // เคลียร์ฟอร์ม
  const clearForm = () => {
    setFormData({
      code: '',
      name_th: '',
      name_en: '',
      account_type: 'asset',
      sub_type: '',
      parent_code: '',
      account_alias: '',
      is_sub_account: 0
    })
    setDepartmentSplit('N')
    setSelectedAccount(null)
    setIsEditing(false)
  }

  // บันทึก
  const handleSave = async () => {
    try {
      const url = '/api/accounting/chart-of-accounts'
      const method = isEditing ? 'PUT' : 'POST'

      const dataToSave = {
        ...formData,
        department_split: departmentSplit
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      })

      const json = await res.json()
      if (json.ok) {
        alert(json.message)
        loadAccounts()
        clearForm()
      } else {
        alert('Error: ' + json.error)
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err)
    }
  }

  const handleSeedDefaultAccounts = async () => {
    try {
      setIsImportingDefault(true)
      const res = await fetch('/api/accounting/chart-of-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed-default' })
      })

      const json = await res.json()
      if (json.ok) {
        alert(json.message)
        await loadAccounts()
      } else {
        alert('Error: ' + json.error)
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err)
    } finally {
      setIsImportingDefault(false)
    }
  }

  // ลบ
  const handleDelete = async () => {
    if (!selectedAccount?.id) {
      alert('กรุณาเลือกบัญชีที่ต้องการลบ')
      return
    }

    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบบัญชีนี้?')) return

    try {
      const res = await fetch(`/api/accounting/chart-of-accounts?id=${selectedAccount.id}`, {
        method: 'DELETE'
      })
      const json = await res.json()
      if (json.ok) {
        alert(json.message)
        loadAccounts()
        clearForm()
      } else {
        alert('Error: ' + json.error)
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err)
    }
  }

  // พิมพ์ - แสดง Dialog เลือกวันที่
  const handlePrint = () => {
    setShowPrintDialog(true)
  }

  // พิมพ์จริง - หลังเลือกวันที่แล้ว
  const executePrint = async () => {
    if (!printDateFrom || !printDateTo) {
      alert(language === 'th' ? 'กรุณาเลือกช่วงวันที่' : 'Please select date range')
      return
    }

    // ดึงข้อมูลจากฐานข้อมูลตามช่วงวันที่
    try {
      const res = await fetch('/api/accounting/chart-of-accounts')
      const json = await res.json()
      if (!json.ok) {
        alert('Error loading data')
        return
      }

      // กรองข้อมูลตามวันที่
      const filteredAccounts = (json.data as Account[]).filter((acc) => {
        if (!acc.created_at) return true
        const accDate = new Date(acc.created_at).toISOString().split('T')[0]
        return accDate >= printDateFrom && accDate <= printDateTo
      })

      // สร้างหน้าพิมพ์
      const printWindow = window.open('', '_blank')
      if (!printWindow) return

      const today = new Date()
      const thaiYear = today.getFullYear() + 543
      const thaiDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(thaiYear).slice(-2)}`

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>ผังบัญชี</title>
          <style>
            @page { size: A4 portrait; margin: 10mm; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Courier New', monospace;
              font-size: 10pt;
              line-height: 1.3;
              background: white;
              color: black;
            }
            .header {
              margin-bottom: 5px;
              font-size: 9pt;
            }
            .company-name {
              text-align: center;
              font-weight: bold;
              margin-bottom: 3px;
            }
            .report-title {
              font-weight: bold;
              margin-bottom: 3px;
            }
            .filter-info {
              margin-bottom: 3px;
              display: flex;
              justify-content: space-between;
            }
            .separator {
              border-top: 1px dotted #000;
              margin: 3px 0;
            }
            .table-header {
              display: flex;
              font-weight: bold;
              border-bottom: 1px solid #000;
              padding: 2px 0;
              font-size: 9pt;
            }
            .col-code { width: 12%; }
            .col-name { width: 48%; }
            .col-type { width: 8%; text-align: center; }
            .col-level { width: 8%; text-align: center; }
            .col-dept { width: 10%; text-align: center; }
            .col-parent { width: 14%; }

            .data-row {
              display: flex;
              padding: 1px 0;
              page-break-inside: avoid;
            }
            .data-row.level-0 {
              font-weight: bold;
              margin-top: 5px;
            }
            .data-row.level-1 {
              padding-left: 10px;
            }
            .data-row.level-2 {
              padding-left: 20px;
            }
            .footer {
              position: fixed;
              bottom: 10mm;
              right: 10mm;
              font-size: 8pt;
            }
            @media print {
              button { display: none !important; }
              body { font-size: 9pt; }
            }
            .button-container {
              text-align: center;
              margin-top: 20px;
              padding: 10px;
            }
            button {
              padding: 8px 20px;
              margin: 0 5px;
              font-size: 11pt;
              cursor: pointer;
              border: 1px solid #333;
              background: #f0f0f0;
              border-radius: 3px;
            }
            button:hover {
              background: #e0e0e0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">บริษัท เค เอ็นเนอร์ยี่ เซฟ จำกัด</div>
            <div class="report-title">รายงาน : ผังบัญชี</div>
            <div class="filter-info">
              <span>รหัสบัญชีจาก  ${printDateFrom.replace(/-/g, '/')}  ถึง  ${printDateTo.replace(/-/g, '/')}</span>
              <span style="text-align: right;">วันที่ : ${thaiDate}</span>
            </div>
            <div class="separator"></div>
            <div class="table-header">
              <div class="col-code">รหัสบัญชี</div>
              <div class="col-name">ชื่อบัญชี</div>
              <div class="col-type">ผน.จ</div>
              <div class="col-level">ระดับ</div>
              <div class="col-dept">ประเภท</div>
              <div class="col-parent">บัญชีคุม</div>
            </div>
            <div class="separator"></div>
          </div>

          <div class="data-container">
            ${filteredAccounts.map((acc) => {
              const level = acc.parent_code ? 1 : 0
              const typeMap: Record<string, string> = {
                'asset': 'ครท.',
                'liability': 'หนสน.',
                'equity': 'ส.ผถห.',
                'income': 'รด.',
                'expense': 'คจ.'
              }
              return `
                <div class="data-row level-${level}">
                  <div class="col-code">${acc.code}</div>
                  <div class="col-name">${acc.name_th}</div>
                  <div class="col-type">${typeMap[acc.account_type] || acc.account_type}</div>
                  <div class="col-level">${level + 1}</div>
                  <div class="col-dept">${acc.department_split === 'Y' ? 'คน' : '---'}</div>
                  <div class="col-parent">${acc.parent_code || '---'}</div>
                </div>
              `
            }).join('')}
          </div>

          <div class="button-container">
            <button onclick="window.print()">🖨️ พิมพ์</button>
            <button onclick="window.close()">✕ ปิด</button>
          </div>
        </body>
        </html>
      `

      printWindow.document.write(html)
      printWindow.document.close()
      setShowPrintDialog(false)
    } catch (err) {
      alert('Error: ' + err)
    }
  }

  // รายงาน - แสดงรายงานทั้งหมด
  const handleReport = () => {
    setShowReportDialog(true)
  }

  // แสดง Tree Node
  const renderTreeNode = (account: Account, level = 0) => {
    const hasChildren = account.children && account.children.length > 0
    const isExpanded = expandedNodes.has(account.code)
    const isSelected = selectedAccount?.code === account.code

    return (
      <div key={account.code}>
        <div
          onClick={() => selectAccount(account)}
          style={{
            paddingLeft: level * 20 + 12,
            padding: '8px 12px',
            cursor: 'pointer',
            background: isSelected
              ? 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)'
              : level === 0
              ? '#f8f9fa'
              : 'transparent',
            color: isSelected ? '#fff' : '#495057',
            display: 'flex',
            alignItems: 'center',
            fontSize: 13,
            fontFamily: 'Tahoma, sans-serif',
            borderRadius: 6,
            marginBottom: 4,
            transition: 'all 0.2s',
            boxShadow: isSelected ? '0 4px 12px rgba(45,55,72,0.3)' : 'none',
            border: isSelected ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent'
          }}
          onMouseEnter={(e) => {
            if (!isSelected) {
              e.currentTarget.style.background = '#e9ecef'
            }
          }}
          onMouseLeave={(e) => {
            if (!isSelected) {
              e.currentTarget.style.background = level === 0 ? '#f8f9fa' : 'transparent'
            }
          }}
        >
          {hasChildren && (
            <span
              onClick={(e) => {
                e.stopPropagation()
                toggleNode(account.code)
              }}
              style={{
                marginRight: 8,
                cursor: 'pointer',
                userSelect: 'none',
                width: 16,
                display: 'inline-block',
                fontWeight: 'bold',
                color: isSelected ? '#fff' : '#4a5568'
              }}
            >
              {isExpanded ? '▼' : '▶'}
            </span>
          )}
          {!hasChildren && <span style={{ width: 24, display: 'inline-block' }}></span>}
          <span style={{
            fontWeight: level === 0 ? 700 : 400,
            fontSize: level === 0 ? 14 : 13
          }}>
            {account.code} {language === 'th' ? account.name_th : (account.name_en || account.name_th)}
          </span>
        </div>
        {hasChildren && isExpanded && (
          <div style={{ marginLeft: 8 }}>
            {account.children!.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <AccWindow title="บริษัท เค เอ็นเนอร์ยี่ เซฟ จำกัด">
      <div style={{
        padding: 20,
        background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%)',
        minHeight: '100vh'
      }}>

        {/* Page Title */}
        <div style={{
          background: 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)',
          borderRadius: 12,
          padding: '16px 24px',
          marginBottom: 20,
          fontFamily: 'Tahoma, sans-serif',
          fontSize: 20,
          fontWeight: 700,
          color: '#fff',
          textAlign: 'center',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          📊 {language === 'th' ? 'ระบบบัญชีรหัสผังบัญชี' : 'Chart of Accounts System'}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 16
        }}>
          <div style={{ fontSize: 13, color: '#334155', fontFamily: 'Tahoma, sans-serif', fontWeight: 600 }}>
            {language === 'th'
              ? `รายการผังบัญชีในฐานข้อมูล ${flatAccounts.length} รายการ`
              : `Chart of accounts in database: ${flatAccounts.length} records`}
          </div>
          <button
            onClick={handleSeedDefaultAccounts}
            disabled={isImportingDefault}
            style={{
              padding: '10px 16px',
              background: isImportingDefault
                ? '#94a3b8'
                : 'linear-gradient(135deg, #0f766e 0%, #0f766e 40%, #14b8a6 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: isImportingDefault ? 'not-allowed' : 'pointer',
              fontFamily: 'Tahoma, sans-serif',
              boxShadow: '0 6px 18px rgba(15,118,110,0.25)'
            }}
          >
            {isImportingDefault
              ? (language === 'th' ? 'กำลังนำเข้าผังบัญชี...' : 'Importing chart of accounts...')
              : (language === 'th' ? 'นำเข้าผังบัญชีมาตรฐานลงฐานข้อมูล' : 'Import default chart of accounts')}
          </button>
        </div>

        {/* Main Container */}
        <div style={{
          display: 'flex',
          gap: 16,
          height: 'calc(100vh - 140px)'
        }}>

          {/* Left Panel - Tree View */}
          <div style={{
            flex: '0 0 450px',
            background: '#fff',
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            overflow: 'hidden'
          }}>
            {/* Tabs */}
            <div style={{
              display: 'flex',
              background: '#f8f9fa',
              borderBottom: '2px solid #e9ecef',
              padding: '8px 8px 0 8px'
            }}>
              <div
                onClick={() => setLanguage('th')}
                style={{
                  padding: '10px 24px',
                  background: language === 'th'
                    ? 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)'
                    : '#e9ecef',
                  color: language === 'th' ? '#fff' : '#6c757d',
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: language === 'th' ? '0 4px 12px rgba(45,55,72,0.4)' : 'none',
                  fontFamily: 'Tahoma, sans-serif'
                }}
              >
                {t.detailThai}
              </div>
              <div
                onClick={() => setLanguage('en')}
                style={{
                  padding: '10px 24px',
                  background: language === 'en'
                    ? 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)'
                    : '#e9ecef',
                  color: language === 'en' ? '#fff' : '#6c757d',
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginLeft: 8,
                  transition: 'all 0.3s',
                  boxShadow: language === 'en' ? '0 4px 12px rgba(45,55,72,0.4)' : 'none',
                  fontFamily: 'Tahoma, sans-serif'
                }}
              >
                {t.detailEng}
              </div>
            </div>

            {/* Tree Content */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: 12,
              fontFamily: 'Tahoma, sans-serif',
              background: '#fff'
            }}>
              {accounts.map(account => renderTreeNode(account))}
            </div>
          </div>

          {/* Right Panel - Form */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>

            {/* Form Container */}
            <div style={{
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              flex: 1,
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              overflow: 'auto'
            }}>
              <table style={{ width: '100%', fontFamily: 'Tahoma, sans-serif', fontSize: 13, borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                <tbody>
                  {/* เลขที่บัญชี */}
                  <tr>
                    <td style={{
                      padding: '8px 12px',
                      width: 160,
                      fontWeight: 600,
                      color: '#495057',
                      verticalAlign: 'middle'
                    }}>
                      {t.accountNumber}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        style={{
                          width: 180,
                          padding: '8px 12px',
                          border: '2px solid #dee2e6',
                          borderRadius: 6,
                          fontSize: 13,
                          fontFamily: 'Tahoma, sans-serif',
                          transition: 'all 0.2s',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#4a5568'}
                        onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
                      />
                    </td>
                  </tr>

                  {/* ชื่อ ไทย */}
                  <tr>
                    <td style={labelStyle}>{t.nameThai}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <input
                        type="text"
                        value={formData.name_th}
                        onChange={(e) => setFormData({ ...formData, name_th: e.target.value })}
                        style={{ ...inputStyle, width: '100%' }}
                        onFocus={(e) => e.target.style.borderColor = '#4a5568'}
                        onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
                      />
                    </td>
                  </tr>

                  {/* ชื่อ อังกฤษ */}
                  <tr>
                    <td style={labelStyle}>{t.nameEnglish}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <input
                        type="text"
                        value={formData.name_en || ''}
                        onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                        style={{ ...inputStyle, width: '100%' }}
                        onFocus={(e) => e.target.style.borderColor = '#4a5568'}
                        onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
                      />
                    </td>
                  </tr>

                  {/* บัญชีคุม */}
                  <tr>
                    <td style={labelStyle}>{t.controlAccount}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <select
                        value={formData.parent_code || ''}
                        onChange={(e) => setFormData({ ...formData, parent_code: e.target.value })}
                        style={{ ...inputStyle, width: '100%', cursor: 'pointer' }}
                        onFocus={(e) => e.target.style.borderColor = '#4a5568'}
                        onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
                      >
                        <option value="">{t.noParent}</option>
                        {accounts.map(acc => (
                          <option key={acc.code} value={acc.code}>
                            {acc.code} - {language === 'th' ? acc.name_th : (acc.name_en || acc.name_th)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>

                  {/* หมวดบัญชี */}
                  <tr>
                    <td style={labelStyle}>{t.accountCategory}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <select
                        value={formData.account_type}
                        onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                        style={{ ...inputStyle, width: '100%', cursor: 'pointer' }}
                        onFocus={(e) => e.target.style.borderColor = '#4a5568'}
                        onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
                      >
                        <option value="asset">{t.typeAsset}</option>
                        <option value="liability">{t.typeLiability}</option>
                        <option value="equity">{t.typeEquity}</option>
                        <option value="income">{t.typeIncome}</option>
                        <option value="expense">{t.typeExpense}</option>
                      </select>
                    </td>
                  </tr>

                  {/* ระดับ บัญชี */}
                  <tr>
                    <td style={labelStyle}>{t.accountLevel}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <input
                        type="text"
                        value={formData.is_sub_account || 1}
                        onChange={(e) => setFormData({ ...formData, is_sub_account: parseInt(e.target.value) || 0 })}
                        style={{ ...inputStyle, width: 100, textAlign: 'center' }}
                        onFocus={(e) => e.target.style.borderColor = '#4a5568'}
                        onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
                      />
                    </td>
                  </tr>

                  {/* ประเภทบัญชี */}
                  <tr>
                    <td style={labelStyle}>{t.accountType}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <input
                        type="text"
                        value={formData.account_alias || ''}
                        onChange={(e) => setFormData({ ...formData, account_alias: e.target.value })}
                        style={{ ...inputStyle, width: '100%', maxWidth: 400 }}
                        onFocus={(e) => e.target.style.borderColor = '#4a5568'}
                        onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
                      />
                    </td>
                  </tr>

                  {/* แยกเเผนก */}
                  <tr>
                    <td style={labelStyle}>{t.departmentSplit}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <select
                        value={departmentSplit}
                        onChange={(e) => setDepartmentSplit(e.target.value)}
                        style={{ ...inputStyle, width: 150, cursor: 'pointer' }}
                        onFocus={(e) => e.target.style.borderColor = '#4a5568'}
                        onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
                      >
                        <option value="N">N - {language === 'th' ? 'ไม่แยก' : 'No'}</option>
                        <option value="Y">Y - {language === 'th' ? 'แยก' : 'Yes'}</option>
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Buttons */}
            <div style={{
              background: '#fff',
              borderRadius: 12,
              padding: 16,
              display: 'flex',
              gap: 12,
              justifyContent: 'flex-start',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={handleSave}
                style={{
                  padding: '8px 16px',
                  background: 'white',
                  color: '#2d3748',
                  border: '2px solid #cbd5e0',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'Tahoma, sans-serif',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)'
                  e.currentTarget.style.borderColor = '#4a5568'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)'
                  e.currentTarget.style.borderColor = '#cbd5e0'
                }}
              >
                <span style={{
                  fontSize: 18,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 3px 8px rgba(102,126,234,0.4)'
                }}>💾</span>
                <span>{isEditing ? (language === 'th' ? 'แก้ไข' : 'Edit') : (language === 'th' ? 'บันทึก' : 'Save')}</span>
              </button>
              <button
                onClick={clearForm}
                style={{
                  padding: '8px 16px',
                  background: 'white',
                  color: '#2d3748',
                  border: '2px solid #cbd5e0',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'Tahoma, sans-serif',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)'
                  e.currentTarget.style.borderColor = '#4a5568'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)'
                  e.currentTarget.style.borderColor = '#cbd5e0'
                }}
              >
                <span style={{
                  fontSize: 18,
                  background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 3px 8px rgba(72,187,120,0.4)'
                }}>➕</span>
                <span>{language === 'th' ? 'ใหม่' : 'New'}</span>
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: '8px 16px',
                  background: 'white',
                  color: '#2d3748',
                  border: '2px solid #cbd5e0',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'Tahoma, sans-serif',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)'
                  e.currentTarget.style.borderColor = '#c62828'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)'
                  e.currentTarget.style.borderColor = '#cbd5e0'
                }}
              >
                <span style={{
                  fontSize: 18,
                  background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 3px 8px rgba(245,101,101,0.4)'
                }}>🗑️</span>
                <span>{language === 'th' ? 'ลบ' : 'Delete'}</span>
              </button>
              <button
                onClick={handlePrint}
                style={{
                  padding: '8px 16px',
                  background: 'white',
                  color: '#2d3748',
                  border: '2px solid #cbd5e0',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'Tahoma, sans-serif',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)'
                  e.currentTarget.style.borderColor = '#4a5568'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)'
                  e.currentTarget.style.borderColor = '#cbd5e0'
                }}
              >
                <span style={{
                  fontSize: 18,
                  background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 3px 8px rgba(66,153,225,0.4)'
                }}>🖨️</span>
                <span>{language === 'th' ? 'พิมพ์' : 'Print'}</span>
              </button>
              <button
                onClick={handleSeedDefaultAccounts}
                disabled={isImportingDefault}
                style={{
                  padding: '8px 16px',
                  background: 'white',
                  color: '#2d3748',
                  border: '2px solid #cbd5e0',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: isImportingDefault ? 'not-allowed' : 'pointer',
                  fontFamily: 'Tahoma, sans-serif',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  opacity: isImportingDefault ? 0.7 : 1
                }}
              >
                <span style={{
                  fontSize: 18,
                  background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 3px 8px rgba(20,184,166,0.4)'
                }}>⬇️</span>
                <span>{isImportingDefault ? (language === 'th' ? 'กำลังนำเข้า' : 'Importing') : (language === 'th' ? 'นำเข้าผังบัญชี' : 'Import COA')}</span>
              </button>
              <button
                onClick={handleReport}
                style={{
                  padding: '8px 16px',
                  background: 'white',
                  color: '#2d3748',
                  border: '2px solid #cbd5e0',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'Tahoma, sans-serif',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)'
                  e.currentTarget.style.borderColor = '#4a5568'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)'
                  e.currentTarget.style.borderColor = '#cbd5e0'
                }}
              >
                <span style={{
                  fontSize: 18,
                  background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 3px 8px rgba(237,137,54,0.4)'
                }}>📊</span>
                <span>{language === 'th' ? 'รายงาน' : 'Report'}</span>
              </button>
            </div>
          </div>

        </div>

        <div style={{
          marginTop: 20,
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          overflow: 'hidden',
          border: '1px solid rgba(148,163,184,0.3)'
        }}>
          <div style={{
            padding: '14px 18px',
            background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
            borderBottom: '1px solid #cbd5e1',
            fontFamily: 'Tahoma, sans-serif',
            fontSize: 14,
            fontWeight: 700,
            color: '#1e293b'
          }}>
            {language === 'th' ? 'รายการผังบัญชีทั้งหมดจากฐานข้อมูล' : 'All chart of accounts from database'}
          </div>
          <div style={{ overflow: 'auto', maxHeight: 420 }}>
            <table style={{
              width: '100%',
              minWidth: 980,
              borderCollapse: 'collapse',
              fontFamily: 'Tahoma, sans-serif',
              fontSize: 13
            }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '12px 10px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>{language === 'th' ? 'รหัสบัญชี' : 'Account Code'}</th>
                  <th style={{ padding: '12px 10px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>{language === 'th' ? 'ชื่อบัญชี' : 'Account Name'}</th>
                  <th style={{ padding: '12px 10px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>{language === 'th' ? 'หมวดบัญชี' : 'Type'}</th>
                  <th style={{ padding: '12px 10px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>{language === 'th' ? 'ระดับ' : 'Level'}</th>
                  <th style={{ padding: '12px 10px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>{language === 'th' ? 'บัญชีคุม' : 'Parent Code'}</th>
                  <th style={{ padding: '12px 10px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>{language === 'th' ? 'แยกแผนก' : 'Dept.'}</th>
                </tr>
              </thead>
              <tbody>
                {flatAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b' }}>
                      {language === 'th'
                        ? 'ยังไม่มีผังบัญชีในฐานข้อมูล กดปุ่ม "นำเข้าผังบัญชีมาตรฐานลงฐานข้อมูล" เพื่อเริ่มต้น'
                        : 'No chart of accounts found. Click "Import default chart of accounts" to get started.'}
                    </td>
                  </tr>
                ) : flatAccounts.map((account, index) => {
                  const colors = getAccountTypeColors(account.account_type)

                  return (
                    <tr
                      key={account.code}
                      onClick={() => selectAccount(account)}
                      style={{
                        background: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                        cursor: 'pointer'
                      }}
                    >
                      <td style={{ padding: '10px', borderBottom: '1px solid #f1f5f9', fontWeight: account.level === 0 ? 700 : 500 }}>
                        {account.code}
                      </td>
                      <td style={{ padding: '10px', paddingLeft: `${10 + account.level * 18}px`, borderBottom: '1px solid #f1f5f9', color: '#0f172a' }}>
                        {language === 'th' ? account.name_th : (account.name_en || account.name_th)}
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '4px 10px',
                          borderRadius: 999,
                          background: colors.bg,
                          color: colors.text,
                          fontWeight: 700,
                          fontSize: 12
                        }}>
                          {getAccountTypeLabel(account.account_type)}
                        </span>
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                        {account.is_sub_account || account.level + 1}
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>
                        {account.parent_code || '-'}
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                        {account.department_split || 'N'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Print Date Range Dialog */}
        {showPrintDialog && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: 12,
              padding: 32,
              minWidth: 400,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
              <h3 style={{ marginTop: 0, color: '#2d3748', fontFamily: 'Tahoma, sans-serif' }}>
                🖨️ {language === 'th' ? 'เลือกช่วงวันที่พิมพ์' : 'Select Print Date Range'}
              </h3>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#495057', fontFamily: 'Tahoma, sans-serif', fontSize: 13 }}>
                  {language === 'th' ? 'จากวันที่' : 'From Date'}
                </label>
                <input
                  type="date"
                  value={printDateFrom}
                  onChange={(e) => setPrintDateFrom(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #dee2e6',
                    borderRadius: 6,
                    fontSize: 13,
                    fontFamily: 'Tahoma, sans-serif'
                  }}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#495057', fontFamily: 'Tahoma, sans-serif', fontSize: 13 }}>
                  {language === 'th' ? 'ถึงวันที่' : 'To Date'}
                </label>
                <input
                  type="date"
                  value={printDateTo}
                  onChange={(e) => setPrintDateTo(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #dee2e6',
                    borderRadius: 6,
                    fontSize: 13,
                    fontFamily: 'Tahoma, sans-serif'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowPrintDialog(false)}
                  style={{
                    padding: '10px 24px',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontFamily: 'Tahoma, sans-serif'
                  }}
                >
                  {language === 'th' ? 'ยกเลิก' : 'Cancel'}
                </button>
                <button
                  onClick={executePrint}
                  style={{
                    padding: '10px 24px',
                    background: 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontFamily: 'Tahoma, sans-serif',
                    boxShadow: '0 4px 12px rgba(45,55,72,0.3)'
                  }}
                >
                  🖨️ {language === 'th' ? 'พิมพ์' : 'Print'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Report Dialog */}
        {showReportDialog && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20
          }}>
            <div style={{
              background: 'white',
              borderRadius: 12,
              padding: 32,
              width: '90%',
              maxWidth: 1200,
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, color: '#2d3748', fontFamily: 'Tahoma, sans-serif' }}>
                  📊 {language === 'th' ? 'รายงานผังบัญชีทั้งหมด' : 'All Chart of Accounts Report'}
                </h3>
                <button
                  onClick={() => setShowReportDialog(false)}
                  style={{
                    padding: '8px 20px',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontFamily: 'Tahoma, sans-serif'
                  }}
                >
                  ✕ {language === 'th' ? 'ปิด' : 'Close'}
                </button>
              </div>
              <div style={{ overflow: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontFamily: 'Tahoma, sans-serif',
                  fontSize: 13
                }}>
                  <thead>
                    <tr style={{ background: 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)', color: 'white' }}>
                      <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 600 }}>{language === 'th' ? 'รหัส' : 'Code'}</th>
                      <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 600 }}>{language === 'th' ? 'ชื่อ (ไทย)' : 'Name (Thai)'}</th>
                      <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 600 }}>{language === 'th' ? 'ชื่อ (Eng)' : 'Name (Eng)'}</th>
                      <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 600 }}>{language === 'th' ? 'ประเภท' : 'Type'}</th>
                      <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 600 }}>{language === 'th' ? 'บัญชีคุม' : 'Parent'}</th>
                      <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 600 }}>{language === 'th' ? 'แยกแผนก' : 'Dept.'}</th>
                      <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 600 }}>{language === 'th' ? 'สถานะ' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flatAccounts.map((acc, idx) => (
                      <tr key={acc.code} style={{
                        background: idx % 2 === 0 ? '#f8f9fa' : 'white',
                        borderBottom: '1px solid #e2e8f0'
                      }}>
                        <td style={{ padding: '10px', fontWeight: acc.level === 0 ? 600 : 400 }}>{acc.code}</td>
                        <td style={{ padding: '10px', paddingLeft: (10 + acc.level * 20) + 'px' }}>{acc.name_th}</td>
                        <td style={{ padding: '10px' }}>{acc.name_en || '-'}</td>
                        <td style={{ padding: '10px' }}>{acc.account_type}</td>
                        <td style={{ padding: '10px' }}>{acc.parent_code || '-'}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>{acc.department_split || 'N'}</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            background: acc.is_active ? '#d4edda' : '#f8d7da',
                            color: acc.is_active ? '#155724' : '#721c24'
                          }}>
                            {acc.is_active ? (language === 'th' ? 'ใช้งาน' : 'Active') : (language === 'th' ? 'ไม่ใช้งาน' : 'Inactive')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </AccWindow>
  )
}
