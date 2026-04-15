"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'
import styles from '../admin-theme.module.css'

type User = {
  username?: string
  fullname?: string
  name?: string
  typeID?: number
  site?: string
}

type DocumentStats = {
  creditNotes: number
  goodsReceipts: number
  paymentVouchers: number
  warranties: number
  purchaseRequests: number
  supplierInvoices: number
  stockCards: number
  stockTransfers: number
  stockAdjustments: number
  expenseBills: number
  productionOrders: number
  imports: number
  exports: number
  fieldWorkLogs: number
  vacationLeaveRequests: number
}

export default function DocumentsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [lang, setLang] = useState<'en'|'th'>('th')
  const [stats, setStats] = useState<DocumentStats>({
    creditNotes: 0,
    goodsReceipts: 0,
    paymentVouchers: 0,
    warranties: 0,
    purchaseRequests: 0,
    supplierInvoices: 0,
    stockCards: 0,
    stockTransfers: 0,
    stockAdjustments: 0,
    expenseBills: 0,
    productionOrders: 0,
    imports: 0,
    exports: 0,
    fieldWorkLogs: 0,
    vacationLeaveRequests: 0
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateResult, setGenerateResult] = useState<string>('')

  // VLR verify modal state
  const [vlrModal, setVlrModal] = useState(false)
  const [vlrUsername, setVlrUsername] = useState('')
  const [vlrPassword, setVlrPassword] = useState('')
  const [vlrError, setVlrError] = useState('')
  const [vlrLoading, setVlrLoading] = useState(false)
  const [userList, setUserList] = useState<{ userName: string; name: string; displayName: string; displayNameTh: string }[]>([])
  const [isAdminSession, setIsAdminSession] = useState(false)

  useEffect(() => {
    // Load language preference
    try {
      const savedLang = localStorage.getItem('k_system_lang') as 'en' | 'th'
      if (savedLang === 'en' || savedLang === 'th') {
        setLang(savedLang)
      }
    } catch (e) {
      console.error('Failed to load language:', e)
    }

    // Listen for language changes
    const handleLangChange = (e: any) => {
      if (e.detail === 'en' || e.detail === 'th') {
        setLang(e.detail)
      }
    }
    window.addEventListener('k-system-lang', handleLangChange)

    // Load user data
    try {
      const raw = localStorage.getItem('k_system_admin_user')
      if (raw) {
        const stored = JSON.parse(raw)
        setUser(stored)
        // Admin users (typeID 1/2/7) auto-bypass the VLR modal
        const isAdmin = [1, 2, 7].includes(Number(stored?.typeID))
        if (isAdmin && stored?.username) {
          setVlrUsername(stored.username)
          setIsAdminSession(true)
        }
      }
    } catch (e) {
      console.error('Failed to load user data:', e)
    }

    // Load document stats
    loadStats()

    // Load user list for VLR picker
    fetch('/api/auth/user-list?site=Thailand')
      .then(r => r.json())
      .then(d => { if (d.success) setUserList(d.users || []) })
      .catch(() => {})

    return () => {
      window.removeEventListener('k-system-lang', handleLangChange)
    }
  }, [])

  const L = (en: string, th: string) => lang === 'th' ? th : en

  const loadStats = async () => {
    // Fetch each API independently so one failure doesn't zero out all counts
    const safe = (url: string) =>
      fetch(url)
        .then(r => r.ok ? r.json() : { total: 0, data: [] })
        .catch(() => ({ total: 0, data: [] }))

    const [cn, gr, pv, wt, pr, si, sc, st, sa, eb, po, imp, exp, fwl, vlr] = await Promise.all([
      safe('/api/credit-notes?limit=1'),
      safe('/api/goods-receipts?limit=1'),
      safe('/api/payment-vouchers?limit=1'),
      safe('/api/warranties?limit=1'),
      safe('/api/purchase-requests?limit=1'),
      safe('/api/supplier-invoices?limit=1'),
      safe('/api/stock-cards?limit=1'),
      safe('/api/stock-transfers?limit=1'),
      safe('/api/stock-adjustments?limit=1'),
      safe('/api/expense-bills?limit=1'),
      safe('/api/production-orders?limit=1'),
      safe('/api/imports?limit=1'),
      safe('/api/exports?limit=1'),
      safe('/api/field-work-logs?limit=1'),
      safe('/api/vacation-leave-requests?limit=1'),
    ])

    setStats({
      creditNotes: Number(cn.total) || 0,
      goodsReceipts: Number(gr.total) || 0,
      paymentVouchers: Number(pv.total) || 0,
      warranties: Number(wt.total) || 0,
      purchaseRequests: Number(pr.total) || 0,
      supplierInvoices: Number(si.total) || 0,
      stockCards: Number(sc.total) || 0,
      stockTransfers: Number(st.total) || 0,
      stockAdjustments: Number(sa.total) || 0,
      expenseBills: Number(eb.total) || 0,
      productionOrders: Number(po.total) || 0,
      imports: Number(imp.total ?? imp.data?.length) || 0,
      exports: Number(exp.total ?? exp.data?.length) || 0,
      fieldWorkLogs: Number(fwl.total) || 0,
      vacationLeaveRequests: Number(vlr.total) || 0,
    })
  }

  const handleGenerateNumbers = async () => {
    if (!confirm(lang === 'th'
      ? 'สร้างเลขที่เอกสารอัตโนมัติสำหรับรายการที่ยังไม่มีเลขที่?\n\n⚠️ เลขที่จะไม่ซ้ำกัน'
      : 'Generate document numbers for items without numbers?\n\n⚠️ Numbers will be unique'
    )) return

    setIsGenerating(true)
    setGenerateResult('')

    try {
      const res = await fetch('/api/documents/generate-numbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await res.json()

      if (data.success) {
        const totalGenerated = data.generated.reduce((sum: number, item: any) => sum + item.count, 0)

        let message = lang === 'th'
          ? `✅ สร้างเลขที่เอกสารสำเร็จ ${totalGenerated} รายการ\n\n`
          : `✅ Generated ${totalGenerated} document numbers\n\n`

        if (data.generated.length > 0) {
          message += (lang === 'th' ? 'รายละเอียด:\n' : 'Details:\n')
          data.generated.forEach((item: any) => {
            message += `${item.prefix}: ${item.count} ${lang === 'th' ? 'รายการ' : 'items'}\n`
          })
        }

        if (data.errors.length > 0) {
          message += `\n⚠️ ${lang === 'th' ? 'มีข้อผิดพลาด' : 'Errors'}: ${data.errors.length}`
        }

        setGenerateResult(message)
        alert(message)

        // Reload stats
        loadStats()
      } else {
        const errMsg = lang === 'th'
          ? `❌ เกิดข้อผิดพลาด: ${data.error}`
          : `❌ Error: ${data.error}`
        setGenerateResult(errMsg)
        alert(errMsg)
      }
    } catch (error: any) {
      const errMsg = lang === 'th'
        ? `❌ เกิดข้อผิดพลาด: ${error.message}`
        : `❌ Error: ${error.message}`
      setGenerateResult(errMsg)
      alert(errMsg)
    } finally {
      setIsGenerating(false)
    }
  }

  const documentCategories = [
    {
      category: 'Purchase & Procurement',
      categoryTh: 'การจัดซื้อ',
      icon: '🛒',
      color: '#6f42c1',
      documents: [
        {
          title: 'Purchase Request',
          titleTh: 'ใบขอซื้อ',
          code: 'PR',
          desc: 'Request for purchasing items',
          descTh: 'ขอซื้อสินค้าและวัตถุดิบ',
          href: '/KR-Thailand/Admin-Login/documents/purchase-requests',
          count: stats.purchaseRequests,
          icon: (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
          ),
          color: '#6f42c1'
        },
        {
          title: 'Supplier Invoice',
          titleTh: 'ใบแจ้งหนี้ผู้ขาย',
          code: 'SI',
          desc: 'Invoices from suppliers',
          descTh: 'ใบแจ้งหนี้จากผู้ขาย',
          href: '/KR-Thailand/Admin-Login/documents/supplier-invoices',
          count: stats.supplierInvoices,
          icon: (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          ),
          color: '#fd7e14'
        },
        {
          title: 'Goods Receipt',
          titleTh: 'ใบรับสินค้า',
          code: 'GR',
          desc: 'Record received goods',
          descTh: 'บันทึกการรับสินค้า',
          href: '/KR-Thailand/Admin-Login/documents/goods-receipts',
          count: stats.goodsReceipts,
          icon: (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          ),
          color: '#28a745'
        }
      ]
    },
    {
      category: 'Inventory & Warehouse',
      categoryTh: 'คลังสินค้า',
      icon: '📦',
      color: '#20c997',
      documents: [
        {
          title: 'Stock Card',
          titleTh: 'การ์ดสินค้า',
          code: 'SC',
          desc: 'Track stock movements',
          descTh: 'ติดตามการเคลื่อนไหวสินค้า',
          href: '/KR-Thailand/Admin-Login/documents/stock-cards',
          count: stats.stockCards,
          icon: (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          ),
          color: '#20c997'
        },
        {
          title: 'Stock Transfer',
          titleTh: 'ใบโอนสินค้า',
          code: 'ST',
          desc: 'Transfer between warehouses',
          descTh: 'โอนสินค้าระหว่างคลัง',
          href: '/KR-Thailand/Admin-Login/documents/stock-transfers',
          count: stats.stockTransfers,
          icon: (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <path d="M8 5l8 4"/>
            </svg>
          ),
          color: '#0dcaf0'
        },
        {
          title: 'Stock Adjustment',
          titleTh: 'ใบปรับสต๊อค',
          code: 'SA',
          desc: 'Adjust inventory quantities',
          descTh: 'ปรับปรุงจำนวนสินค้าคงคลัง',
          href: '/KR-Thailand/Admin-Login/documents/stock-adjustments',
          count: stats.stockAdjustments,
          icon: (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <path d="M12 8v8"/>
              <path d="M8 12h8"/>
            </svg>
          ),
          color: '#6610f2'
        },
        {
          title: 'Import',
          titleTh: 'ใบนำเข้า',
          code: 'IMP',
          desc: 'Import documents',
          descTh: 'เอกสารนำเข้าสินค้า',
          href: '/KR-Thailand/Admin-Login/documents/imports',
          count: stats.imports,
          icon: (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          ),
          color: '#198754'
        },
        {
          title: 'Export',
          titleTh: 'ใบส่งออก',
          code: 'EXP',
          desc: 'Export documents',
          descTh: 'เอกสารส่งออกสินค้า',
          href: '/KR-Thailand/Admin-Login/documents/exports',
          count: stats.exports,
          icon: (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          ),
          color: '#fd7e14'
        }
      ]
    },
    {
      category: 'Finance & Payments',
      categoryTh: 'การเงิน',
      icon: '💰',
      color: '#ffc107',
      documents: [
        {
          title: 'Payment Voucher',
          titleTh: 'ใบชำระเงิน',
          code: 'PV',
          desc: 'Record payments',
          descTh: 'บันทึกการชำระเงิน',
          href: '/KR-Thailand/Admin-Login/documents/payment-vouchers',
          count: stats.paymentVouchers,
          icon: (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          ),
          color: '#ffc107'
        },
        {
          title: 'Credit Note',
          titleTh: 'ใบลดหนี้',
          code: 'CN',
          desc: 'Issue credit notes',
          descTh: 'ออกใบลดหนี้ให้ลูกค้า',
          href: '/KR-Thailand/Admin-Login/documents/credit-notes',
          count: stats.creditNotes,
          icon: (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6"/>
              <path d="M9 13h6"/>
              <path d="M9 17h6"/>
            </svg>
          ),
          color: '#dc3545'
        },
        {
          title: 'Expense Bill',
          titleTh: 'บิลค่าใช้จ่าย',
          code: 'EB',
          desc: 'Track company expenses',
          descTh: 'บันทึกค่าใช้จ่ายบริษัท',
          href: '/KR-Thailand/Admin-Login/documents/expense-bills',
          count: stats.expenseBills,
          icon: (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          ),
          color: '#d63384'
        }
      ]
    },
    {
      category: 'Production',
      categoryTh: 'การผลิต',
      icon: '⚙️',
      color: '#495057',
      documents: [
        {
          title: 'Production Order',
          titleTh: 'ใบสั่งผลิต',
          code: 'PDO',
          desc: 'Manage production orders',
          descTh: 'จัดการใบสั่งผลิตสินค้า',
          href: '/KR-Thailand/Admin-Login/documents/production-orders',
          count: stats.productionOrders,
          icon: (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m6.36 6.36l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m6.36-6.36l4.24-4.24"/>
            </svg>
          ),
          color: '#495057'
        }
      ]
    },
    {
      category: 'After Sales Service',
      categoryTh: 'บริการหลังการขาย',
      icon: '🛡️',
      color: '#17a2b8',
      documents: [
        {
          title: 'Warranty',
          titleTh: 'ใบรับประกัน',
          code: 'WT',
          desc: 'Manage product warranties',
          descTh: 'จัดการใบรับประกันสินค้า',
          href: '/KR-Thailand/Admin-Login/documents/warranties',
          count: stats.warranties,
          icon: (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          ),
          color: '#17a2b8'
        },
        {
          title: 'Field Work Log',
          titleTh: 'บันทึกทำงานนอกสถานที่',
          code: 'FWL',
          desc: 'On-site work tracking',
          descTh: 'บันทึกงานนอกสถานที่และติดตามงาน',
          href: '/KR-Thailand/Admin-Login/documents/field-work-logs',
          count: stats.fieldWorkLogs,
          icon: (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          ),
          color: '#0d6efd'
        }
      ]
    },
    {
      category: 'Human Resources',
      categoryTh: 'ทรัพยากรบุคคล',
      icon: '🏖️',
      color: '#7c3aed',
      documents: [
        {
          title: 'Vacation Leave Approval',
          titleTh: 'คำขออนุมัติลาพักร้อน',
          code: 'VLR',
          desc: 'Create a vacation leave approval request form',
          descTh: 'สร้างแบบฟอร์มคำขออนุมัติลาพักร้อน',
          href: '/Thailand/Admin-Login/documents/vacation-leave/create',
          count: stats.vacationLeaveRequests,
          icon: (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
              <path d="M9 14h6"/>
              <path d="M9 18h4"/>
            </svg>
          ),
          color: '#7c3aed'
        }
      ]
    }
  ]

  async function handleVlrVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!vlrUsername.trim() || !vlrPassword.trim()) {
      setVlrError(lang === 'en' ? 'Please enter username and password' : 'กรุณากรอก Username และ Password')
      return
    }
    setVlrLoading(true)
    setVlrError('')
    try {
      const res = await fetch('/api/auth/mysql-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: vlrUsername.trim(), password: vlrPassword.trim() })
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setVlrError(lang === 'en' ? 'Incorrect username or password' : 'Username หรือ Password ไม่ถูกต้อง')
        return
      }
      // Admin users (typeID 1/2/7) can view all users' approvals — go to main approvals list
      const isAdmin = [1, 2, 7].includes(Number(data.typeID))
      setVlrModal(false)
      setVlrUsername('')
      setVlrPassword('')
      if (isAdmin) {
        router.push('/KR-Thailand/Admin-Login/my-approvals')
      } else {
        router.push(`/KR-Thailand/Admin-Login/my-approvals?user=${encodeURIComponent(data.username)}`)
      }
    } catch {
      setVlrError(lang === 'en' ? 'Connection error, please try again' : 'ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่')
    } finally {
      setVlrLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1>{lang === 'en' ? 'Document Management' : 'จัดการเอกสาร'}</h1>
            <p className={styles.subtitle}>
              {lang === 'en'
                ? 'Organized by categories for easy access'
                : 'จัดหมวดหมู่เพื่อหาง่าย เข้าถึงสะดวก'}
            </p>
          </div>
        </div>



        {documentCategories.map((category) => (
          <div key={category.category} style={{ marginBottom: '48px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: `3px solid ${category.color}`
            }}>
              <span style={{ fontSize: '32px' }}>{category.icon}</span>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: category.color,
                margin: 0
              }}>
                {lang === 'en' ? category.category : category.categoryTh}
              </h2>
              <span style={{
                marginLeft: 'auto',
                background: category.color,
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                {category.documents.length} {lang === 'en' ? 'types' : 'ประเภท'}
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {category.documents.map((doc) => (
                <div
                  key={doc.code}
                  onClick={() => router.push(doc.href)}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: `2px solid transparent`,
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)'
                    e.currentTarget.style.borderColor = doc.color
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
                    e.currentTarget.style.borderColor = 'transparent'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: doc.color,
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {doc.code}
                  </div>

                  <div style={{ color: doc.color, marginBottom: '12px' }}>
                    {doc.icon}
                  </div>

                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    marginBottom: '6px',
                    color: '#333'
                  }}>
                    {lang === 'en' ? doc.title : doc.titleTh}
                  </h3>

                  <p style={{
                    color: '#666',
                    fontSize: '13px',
                    marginBottom: '12px',
                    minHeight: '36px'
                  }}>
                    {lang === 'en' ? doc.desc : doc.descTh}
                  </p>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '12px',
                    borderTop: '1px solid #eee'
                  }}>
                    <span style={{ color: '#999', fontSize: '12px' }}>
                      {lang === 'en' ? 'Documents' : 'เอกสาร'}
                    </span>
                    <span style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: doc.color
                    }}>
                      {doc.count}
                    </span>
                  </div>

                  {/* VLR-only: ปุ่มตรวจสอบการอนุมัติ */}
                  {doc.code === 'VLR' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setVlrModal(true)
                        setVlrError('')
                        setVlrUsername('')
                        setVlrPassword('')
                      }}
                      style={{
                        marginTop: 14,
                        width: '100%',
                        padding: '9px 14px',
                        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M9 11l3 3L22 4"/>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                      </svg>
                      {lang === 'en' ? 'Check Approvals' : 'ตรวจสอบการอนุมัติ'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{
          marginTop: '32px',
          padding: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          color: 'white'
        }}>
          <h3 style={{ fontSize: '16px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📋</span>
            {lang === 'en' ? 'Document Numbering Format' : 'รูปแบบเลขที่เอกสาร'}
          </h3>
          <p style={{ opacity: 0.9, fontSize: '13px', margin: 0 }}>
            {lang === 'en'
              ? 'Format: PREFIX-YYYYMM-#### (Example: CN-202603-0001, PR-202603-0025)'
              : 'รูปแบบ: คำนำหน้า-ปีเดือน-#### (ตัวอย่าง: CN-202603-0001, PR-202603-0025)'}
          </p>
        </div>
      </div>

      {/* VLR verify modal */}
      {vlrModal && (
        <div
          onClick={() => setVlrModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: '32px 28px',
              width: '100%',
              maxWidth: 400,
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              position: 'relative'
            }}
          >
            {/* Close */}
            <button
              onClick={() => setVlrModal(false)}
              style={{
                position: 'absolute', top: 14, right: 14,
                background: 'none', border: 'none',
                fontSize: 20, cursor: 'pointer', color: '#9ca3af', lineHeight: 1
              }}
            >✕</button>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 17, color: '#1e1b4b' }}>
                  {lang === 'en' ? 'Identity Verification' : 'ยืนยันตัวตน'}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                  {lang === 'en'
                    ? 'Enter your credentials to view your approvals'
                    : 'กรอก Username และ Password ของคุณเพื่อดูคำขออนุมัติ'}
                </div>
              </div>
            </div>

            <form onSubmit={handleVlrVerify}>
              {/* User picker */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  {lang === 'en' ? 'Step 1 — Select your account' : 'ขั้นที่ 1 — เลือกบัญชีของคุณ'}
                </label>
                {userList.length === 0 ? (
                  <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 8, border: '1.5px solid #e2e8f0', color: '#94a3b8', fontSize: 13 }}>
                    {lang === 'en' ? 'Loading users...' : 'กำลังโหลด...'}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxHeight: 200, overflowY: 'auto', padding: 2 }}>
                    {userList.map(u => {
                      const isSelected = vlrUsername === u.userName
                      return (
                        <button
                          key={u.userName}
                          type="button"
                          onClick={() => {
                            setVlrUsername(u.userName)
                            setVlrError('')
                            if (isAdminSession) {
                              // Admin: bypass password — navigate immediately
                              setVlrModal(false)
                              router.push(`/KR-Thailand/Admin-Login/my-approvals?user=${encodeURIComponent(u.userName)}`)
                            }
                          }}
                          style={{
                            padding: '9px 10px', borderRadius: 10,
                            border: isSelected ? '2px solid #7c3aed' : '1.5px solid #e2e8f0',
                            background: isSelected ? 'linear-gradient(135deg,#ede9fe,#dbeafe)' : '#f8fafc',
                            cursor: 'pointer', textAlign: 'left',
                            display: 'flex', alignItems: 'center', gap: 8,
                          }}
                        >
                          <div style={{
                            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                            background: isSelected ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : '#e2e8f0',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, color: isSelected ? '#fff' : '#64748b', fontWeight: 700,
                          }}>
                            {(lang === 'th' ? u.displayNameTh : u.displayName).charAt(0).toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: isSelected ? '#4c1d95' : '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {lang === 'th' ? u.displayNameTh : u.displayName}
                            </div>
                            <div style={{ fontSize: 10, color: '#94a3b8' }}>@{u.userName}</div>
                          </div>
                          {isSelected && <span style={{ marginLeft: 'auto', color: '#7c3aed', fontSize: 14, flexShrink: 0 }}>✓</span>}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Selected badge */}
              {vlrUsername && (() => {
                const sel = userList.find(u => u.userName === vlrUsername)
                return sel ? (
                  <div style={{
                    marginBottom: 14, padding: '9px 12px',
                    background: 'linear-gradient(135deg,#ede9fe,#dbeafe)',
                    border: '1px solid #c4b5fd', borderRadius: 9,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span>👤</span>
                    <span style={{ fontWeight: 700, color: '#4c1d95', fontSize: 13 }}>
                      {lang === 'th' ? sel.displayNameTh : sel.displayName}
                    </span>
                    <span style={{ fontSize: 11, color: '#7c3aed' }}>@{sel.userName}</span>
                  </div>
                ) : null
              })()}

              {/* Password — only after user selected, hidden for admin */}
              {vlrUsername && !isAdminSession && (
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    {lang === 'en' ? 'Step 2 — Enter your password' : 'ขั้นที่ 2 — กรอก Password ของคุณ'}
                  </label>
                  <input
                    type="password"
                    value={vlrPassword}
                    onChange={e => setVlrPassword(e.target.value)}
                    autoComplete="current-password"
                    autoFocus
                    placeholder={lang === 'en' ? 'Enter your password' : 'กรอก Password'}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '10px 12px', borderRadius: 8,
                      border: '1.5px solid #d1d5db', fontSize: 14, outline: 'none'
                    }}
                  />
                </div>
              )}

              {vlrError && (
                <div style={{
                  marginBottom: 14, padding: '9px 12px',
                  background: '#fee2e2', border: '1px solid #fca5a5',
                  borderRadius: 8, color: '#991b1b', fontSize: 13
                }}>
                  ⚠️ {vlrError}
                </div>
              )}

              <button
                type="submit"
                disabled={vlrLoading || !vlrUsername || (!isAdminSession && !vlrPassword)}
                style={{
                  width: '100%', padding: '11px',
                  background: (vlrLoading || !vlrUsername || (!isAdminSession && !vlrPassword)) ? '#a78bfa' : 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                  color: 'white', border: 'none', borderRadius: 8,
                  fontSize: 15, fontWeight: 700,
                  cursor: (vlrLoading || !vlrUsername || (!isAdminSession && !vlrPassword)) ? 'not-allowed' : 'pointer'
                }}
              >
                {vlrLoading
                  ? (lang === 'en' ? 'Verifying...' : 'กำลังตรวจสอบ...')
                  : (lang === 'en' ? 'Verify & View Approvals' : 'ยืนยันและดูคำขออนุมัติ')}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
