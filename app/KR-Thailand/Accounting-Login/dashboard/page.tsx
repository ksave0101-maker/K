"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AccWindow, { useLang } from '../components/AccWindow'

/* ── Module tiles ─────────────────────────────────────────────── */
const MODULES = [
  { icon: '🛒', th: 'ซื้อ',         en: 'Purchase',   href: '/Thailand/Accounting-Login/purchase/order',    color: '#1f2937', bg: '#f0f1f3' },
  { icon: '💰', th: 'ขาย',          en: 'Sales',       href: '/Thailand/Accounting-Login/sales/order',       color: '#1f2937', bg: '#f0f1f3' },
  { icon: '🏦', th: 'การเงิน',      en: 'Finance',     href: '/Thailand/Accounting-Login/finance/receive',   color: '#1f2937', bg: '#f0f1f3' },
  { icon: '📦', th: 'สินค้า',       en: 'Inventory',   href: '/Thailand/Accounting-Login/inventory/receive', color: '#1f2937', bg: '#f0f1f3' },
  { icon: '📒', th: 'บัญชี',        en: 'Accounting',  href: '/Thailand/Accounting-Login/accounting/journal',color: '#1f2937', bg: '#f0f1f3' },
  { icon: '📊', th: 'รายงาน',       en: 'Reports',     href: '/Thailand/Accounting-Login/reports/purchase',  color: '#1f2937', bg: '#f0f1f3' },
  { icon: '⚙️', th: 'ตั้งค่า',      en: 'Settings',    href: '/Thailand/Accounting-Login/settings',          color: '#1f2937', bg: '#f0f1f3' },
  { icon: '🔐', th: 'ออกจากระบบ',  en: 'Logout',      href: '/Thailand/Accounting-Login',                   color: '#4b5563', bg: '#e5e7eb' },
]

/* ── Quick-access buttons ─────────────────────────────────────── */
const QUICK = [
  { th: 'ซื้อเงินสด',   en: 'Cash Purchase', href: '/Thailand/Accounting-Login/purchase/cash',     icon: '\uD83D\uDED2' },
  { th: 'ขายเงินสด',    en: 'Cash Sale',      href: '/Thailand/Accounting-Login/sales/cash',        icon: '\uD83D\uDCB0' },
  { th: 'ขายเชื่อ',     en: 'Credit Sale',    href: '/Thailand/Accounting-Login/sales/credit',      icon: '\uD83D\uDCB3' },
  { th: 'รับชำระ',      en: 'Receive Pymt',  href: '/Thailand/Accounting-Login/finance/receive',   icon: '\uD83D\uDCE5' },
  { th: 'จ่ายชำระ',     en: 'Make Payment',  href: '/Thailand/Accounting-Login/finance/pay',       icon: '\uD83D\uDCE4' },
  { th: 'รับสินค้า',    en: 'Receive Goods', href: '/Thailand/Accounting-Login/inventory/receive', icon: '\uD83D\uDCE6' },
  { th: 'บันทึกบัญชี',  en: 'Journal Entry', href: '/Thailand/Accounting-Login/accounting/journal',icon: '\uD83D\uDCD3' },
  { th: 'งบดุล',        en: 'Balance Sheet', href: '/Thailand/Accounting-Login/balance-sheet',     icon: '\uD83D\uDCCB' },
  { th: 'สแกนบิล',      en: 'Scan Bill',     href: '/Thailand/Accounting-Login/purchase/scan-bill',icon: '\uD83D\uDCF7' },
]

const ACCOUNTING_FLOW_MENU = [
  {
    ledgerTh: 'สมุดรายวันทั่วไป',
    ledgerEn: 'General Journal',
    rowSpan: 1,
    postingTh: 'สินทรัพย์/ค่าเสื่อม',
    postingEn: 'Assets/Depreciation',
    postingHref: '/Thailand/Accounting-Login/accounting/journal',
    documentLinks: [
      {
        labelTh: 'บันทึกรายการบัญชี',
        labelEn: 'Journal Entry',
        href: '/Thailand/Accounting-Login/accounting/journal'
      }
    ],
  },
  {
    ledgerTh: 'สมุดรายวันจ่าย',
    ledgerEn: 'Cash Disbursements Journal',
    rowSpan: 1,
    postingTh: 'จ่ายชำระหนี้',
    postingEn: 'Pay Debt',
    postingHref: '/Thailand/Accounting-Login/finance/pay',
    documentLinks: [
      {
        labelTh: 'ใบเสร็จรับเงิน',
        labelEn: 'Receipt',
        href: '/KR-Thailand/Admin-Login/receipt/list'
      }
    ],
  },
  {
    ledgerTh: 'สมุดรายวันรับ',
    ledgerEn: 'Cash Receipts Journal',
    rowSpan: 1,
    postingTh: 'รับชำระหนี้',
    postingEn: 'Receive Debt Payment',
    postingHref: '/Thailand/Accounting-Login/finance/receive',
    documentLinks: [
      {
        labelTh: 'ใบเสร็จรับเงิน',
        labelEn: 'Receipt',
        href: '/KR-Thailand/Admin-Login/receipt/list'
      }
    ],
  },
  {
    ledgerTh: 'สมุดรายวันขาย',
    ledgerEn: 'Sales Journal',
    rowSpan: 2,
    postingTh: 'ขายสด',
    postingEn: 'Cash Sale',
    postingHref: '/Thailand/Accounting-Login/sales/cash',
    documentLinks: [
      {
        labelTh: 'ใบกำกับภาษี',
        labelEn: 'Tax Invoice',
        href: '/KR-Thailand/Admin-Login/tax-invoice/list'
      },
      {
        labelTh: 'ใบเสร็จรับเงิน',
        labelEn: 'Receipt',
        href: '/KR-Thailand/Admin-Login/receipt/list'
      }
    ],
  },
  {
    ledgerTh: 'สมุดรายวันขาย',
    ledgerEn: 'Sales Journal',
    rowSpan: 0,
    postingTh: 'ขายเชื่อ',
    postingEn: 'Credit Sale',
    postingHref: '/Thailand/Accounting-Login/sales/credit',
    documentLinks: [
      {
        labelTh: 'ใบแจ้งหนี้',
        labelEn: 'Invoice',
        href: '/KR-Thailand/Admin-Login/invoice/list'
      },
      {
        labelTh: 'ใบกำกับภาษี',
        labelEn: 'Tax Invoice',
        href: '/KR-Thailand/Admin-Login/tax-invoice/list'
      }
    ],
  },
  {
    ledgerTh: 'สมุดรายวันซื้อ',
    ledgerEn: 'Purchase Journal',
    rowSpan: 2,
    postingTh: 'ซื้อสด',
    postingEn: 'Cash Purchase',
    postingHref: '/Thailand/Accounting-Login/purchase/cash',
    documentLinks: [
      {
        labelTh: 'ใบกำกับภาษี',
        labelEn: 'Tax Invoice',
        href: '/KR-Thailand/Admin-Login/tax-invoice/list'
      },
      {
        labelTh: 'ใบเสร็จรับเงิน',
        labelEn: 'Receipt',
        href: '/KR-Thailand/Admin-Login/receipt/list'
      }
    ],
  },
  {
    ledgerTh: 'สมุดรายวันซื้อ',
    ledgerEn: 'Purchase Journal',
    rowSpan: 0,
    postingTh: 'ซื้อเชื่อ',
    postingEn: 'Credit Purchase',
    postingHref: '/Thailand/Accounting-Login/purchase/credit',
    documentLinks: [
      {
        labelTh: 'ใบแจ้งหนี้',
        labelEn: 'Invoice',
        href: '/KR-Thailand/Admin-Login/invoice/list'
      },
      {
        labelTh: 'ใบกำกับภาษี',
        labelEn: 'Tax Invoice',
        href: '/KR-Thailand/Admin-Login/tax-invoice/list'
      }
    ],
  },
]

type PendingPurchaseRequest = {
  prID?: number
  prNo?: string
  prDate?: string
  requester_name?: string
  requested_by?: string
  department?: string
  purpose?: string
  item_count?: number
  status?: string
}

type KoreaInvoice = {
  id: string
  invoiceNumber?: string
  customer?: string
  supplier_name?: string
  issueDate?: string
  dueDate?: string
  subtotal?: number
  taxRate?: number
  taxAmount?: number
  totalAmount?: number
  paymentStatus?: string
  notes?: string
  salesContractNumber?: string
  created_at?: string
}

/* ── Dashboard page ───────────────────────────────────────────── */
export default function AccountingDashboardPage() {
  const [username, setUsername] = useState('')
  const [fullname, setFullname] = useState('')
  const [hover, setHover] = useState<number | null>(null)
  const [quickHover, setQuickHover] = useState<number | null>(null)
  const [pendingPRCount, setPendingPRCount] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [showPendingPRModal, setShowPendingPRModal] = useState(false)
  const [pendingPRList, setPendingPRList] = useState<PendingPurchaseRequest[]>([])
  const [koreaInvoiceCount, setKoreaInvoiceCount] = useState(0)
  const [showKoreaInvoiceModal, setShowKoreaInvoiceModal] = useState(false)
  const [koreaInvoiceList, setKoreaInvoiceList] = useState<KoreaInvoice[]>([])
  const router = useRouter()
  const { L } = useLang()

  useEffect(() => {
    setMounted(true)
    try {
      setUsername(localStorage.getItem('username') || '')
      setFullname(localStorage.getItem('fullname') || '')
    } catch {}

    // Fetch pending purchase requests count
    fetchPendingPRCount()
    // Fetch Korea unpaid invoices
    fetchKoreaInvoices()
  }, [])

  async function fetchPendingPRCount() {
    try {
      // Fetch all purchase requests and filter by pending status
      const res = await fetch('/api/purchase-requests')
      const data = await res.json()
      console.log('PR API Response:', data)

      if (data.success && data.rows) {
        const pending = (data.rows as PendingPurchaseRequest[]).filter((pr) =>
          pr.status === 'pending' || pr.status === 'submitted' || pr.status === 'draft'
        )
        console.log('Pending PR Count:', pending.length)
        setPendingPRCount(pending.length)
        setPendingPRList(pending)
      }
    } catch (err) {
      console.error('Failed to fetch pending PR count:', err)
    }
  }

  function handleShowPendingPR() {
    setShowPendingPRModal(true)
    // Refresh the list when opening modal
    fetchPendingPRCount()
  }

  async function handlePendingPRAction(prID: number | undefined, action: 'rejected' | 'submitted') {
    if (!prID) return

    try {
      const res = await fetch('/api/purchase-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prID,
          status: action
        })
      })

      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.success) {
        alert(L('Failed to update status', 'อัปเดตสถานะไม่สำเร็จ'))
        return
      }

      await fetchPendingPRCount()
    } catch (err) {
      console.error('Failed to update PR status:', err)
      alert(L('Failed to update status', 'อัปเดตสถานะไม่สำเร็จ'))
    }
  }

  async function fetchKoreaInvoices() {
    try {
      const res = await fetch('/api/korea-invoices?status=unpaid')
      const data = await res.json()
      console.log('Korea Invoice API Response:', data)

      if (data.success && data.rows) {
        setKoreaInvoiceCount(data.count || data.rows.length)
        setKoreaInvoiceList(data.rows as KoreaInvoice[])
      }
    } catch (err) {
      console.error('Failed to fetch Korea invoices:', err)
    }
  }

  function handleShowKoreaInvoices() {
    setShowKoreaInvoiceModal(true)
    // Refresh the list when opening modal
    fetchKoreaInvoices()
  }

  const dateLong = new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const dateShort = new Date().toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' })

  // Prevent hydration errors
  if (!mounted) {
    return (
      <AccWindow title="บริษัท เค เอ็นเนอร์ยี่ เซฟ จำกัด">
        <div style={{ padding: 20, minHeight: '100%' }}>
          <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
            Loading...
          </div>
        </div>
      </AccWindow>
    )
  }

  return (
    <AccWindow title="บริษัท เค เอ็นเนอร์ยี่ เซฟ จำกัด">
      <div style={{ padding: 20, minHeight: '100%' }}>

        {/* Welcome card */}
        <div style={{
          background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 50%, #6b7280 100%)',
          borderRadius: 12,
          padding: '26px 30px',
          marginBottom: 22,
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 6px 20px rgba(45,55,72,0.35)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 5, textShadow: '0 1px 3px rgba(0,0,0,0.3)', letterSpacing: '0.01em' }}>
              {L('Welcome back', 'ยินดีต้อนรับ')}, {fullname || username || 'User'}
            </div>
            <div style={{ fontSize: 14, opacity: 0.85, fontWeight: 500 }}>
              {L('Company: ', 'บริษัท: ')}เค เอ็นเนอร์ยี่ เซฟ จำกัด
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 15, fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>{dateLong}</div>
          </div>
        </div>

        {/* Section label */}
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1f2937', marginBottom: 12, letterSpacing: '0.01em' }}>
          {L('Main Modules', 'เมนูหลัก')}
        </div>

        {/* Purchase Request Notification - Always show for testing */}
        {mounted && (
          <div
            onClick={handleShowPendingPR}
            style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              borderRadius: 12,
              padding: '14px 20px',
              marginBottom: 16,
              color: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
              border: '1px solid rgba(255,255,255,0.15)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.4)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}>
                🔔
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>
                  {L('Purchase Requests Pending Approval', 'คำขอซื้อรออนุมัติ')}
                </div>
                <div style={{ fontSize: 12, opacity: 0.9 }}>
                  {L('Click to view details', 'คลิกเพื่อดูรายละเอียด')}
                </div>
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.25)',
              borderRadius: 10,
              padding: '8px 16px',
              fontSize: 22,
              fontWeight: 800,
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              minWidth: 60,
              textAlign: 'center',
            }}>
              {pendingPRCount}
            </div>
          </div>
        )}

        {/* Korea Invoice Notification - Always show */}
        {mounted && (
          <div
            onClick={handleShowKoreaInvoices}
            style={{
              background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
              borderRadius: 12,
              padding: '14px 20px',
              marginBottom: 16,
              color: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.4)',
              border: '1px solid rgba(255,255,255,0.15)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(234, 88, 12, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(234, 88, 12, 0.4)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}>
                🏢
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>
                  {L('Korea HQ - Unpaid Invoices', 'ใบแจ้งหนี้จากเกาหลี (ยังไม่ชำระ)')}
                </div>
                <div style={{ fontSize: 12, opacity: 0.9 }}>
                  {L('Click to view details', 'คลิกเพื่อดูรายละเอียด')}
                </div>
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.25)',
              borderRadius: 10,
              padding: '8px 16px',
              fontSize: 22,
              fontWeight: 800,
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              minWidth: 60,
              textAlign: 'center',
            }}>
              {koreaInvoiceCount}
            </div>
          </div>
        )}

        {/* Module grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 12, marginBottom: 24 }}>
          {MODULES.map((m, i) => (
            <div
              key={i}
              onClick={() => router.push(m.href)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: '20px 8px 16px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: hover === i ? '0 10px 28px rgba(0,0,0,0.15)' : '0 2px 6px rgba(0,0,0,0.08)',
                transform: hover === i ? 'translateY(-4px)' : 'none',
                border: `1px solid ${hover === i ? '#9ca3af' : '#d1d5db'}`,
                userSelect: 'none',
              }}
            >
              <div style={{
                width: 50, height: 50, borderRadius: 12, background: m.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 10px', fontSize: 26,
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}>{m.icon}</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: m.color, lineHeight: 1.3 }}>
                {L(m.en, m.th)}
              </div>
            </div>
          ))}
        </div>

        {/* Section label */}
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1f2937', marginBottom: 12, letterSpacing: '0.01em' }}>
          {L('Quick Access', 'ทางลัดที่ใช้บ่อย')}
        </div>

        {/* Quick access */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 18,
          marginBottom: 20,
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          border: '1px solid #d1d5db',
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {QUICK.map((q, i) => (
              <button
                key={i}
                onClick={() => router.push(q.href)}
                onMouseEnter={() => setQuickHover(i)}
                onMouseLeave={() => setQuickHover(null)}
                style={{
                  padding: '9px 18px',
                  background: quickHover === i ? '#4b5563' : '#f3f4f6',
                  color: quickHover === i ? '#fff' : '#1f2937',
                  border: quickHover === i ? '1px solid #4b5563' : '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: '"Sarabun","Tahoma",sans-serif',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: quickHover === i ? '0 2px 8px rgba(0,0,0,0.15)' : '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                <span style={{ fontSize: 16 }}>{q.icon}</span>
                {L(q.en, q.th)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 15, fontWeight: 700, color: '#1f2937', marginBottom: 12, letterSpacing: '0.01em' }}>
          {L('Accounting Flow Menu', 'เมนูสมุดบัญชีและรูปแบบเอกสาร')}
        </div>

        <div style={{
          background: '#fff',
          borderRadius: 12,
          marginBottom: 20,
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          border: '1px solid #d1d5db',
          overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              minWidth: 760,
              borderCollapse: 'collapse',
              tableLayout: 'fixed',
              fontSize: 15,
            }}>
              <thead>
                <tr style={{ background: '#f3f4f6' }}>
                  <th style={{ border: '1px solid #9ca3af', padding: '14px 12px', fontWeight: 700, textAlign: 'center', color: '#111827' }}>
                    {L('Account Book', 'สมุดบัญชี')}
                  </th>
                  <th style={{ border: '1px solid #9ca3af', padding: '14px 12px', fontWeight: 700, textAlign: 'center', color: '#111827' }}>
                    {L('Accounting Posting', 'การผูกบัญชี')}
                  </th>
                  <th style={{ border: '1px solid #9ca3af', padding: '14px 12px', fontWeight: 700, textAlign: 'center', color: '#111827' }}>
                    {L('Document Format', 'รูปแบบของเอกสาร')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {ACCOUNTING_FLOW_MENU.map((item, index) => (
                  <tr key={`${item.ledgerTh}-${item.postingTh}-${index}`}>
                    {item.rowSpan > 0 && (
                      <td
                        rowSpan={item.rowSpan}
                        onClick={() => router.push(item.postingHref)}
                        style={{
                          border: '1px solid #9ca3af',
                          padding: '16px 14px',
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          fontWeight: 700,
                          color: '#111827',
                          cursor: 'pointer',
                          background: '#fff',
                        }}
                        title={L(item.ledgerEn, item.ledgerTh)}
                      >
                        {L(item.ledgerEn, item.ledgerTh)}
                      </td>
                    )}
                    <td
                      style={{
                        border: '1px solid #9ca3af',
                        padding: '10px 12px',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        background: '#fff',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => router.push(item.postingHref)}
                        title={L(item.postingEn, item.postingTh)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 10,
                          border: '1px solid #cbd5e1',
                          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                          color: '#111827',
                          fontSize: 14,
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 1px 2px rgba(15,23,42,0.06)',
                          fontFamily: '"Sarabun","Tahoma",sans-serif',
                        }}
                      >
                        {L(item.postingEn, item.postingTh)}
                      </button>
                    </td>
                    <td
                      style={{
                        border: '1px solid #9ca3af',
                        padding: '10px 12px',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        background: '#fff',
                      }}
                    >
                      {item.documentLinks?.length ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                          {item.documentLinks.map((doc, docIndex) => (
                            <React.Fragment key={`${doc.labelTh}-${doc.href}`}>
                              <button
                                type="button"
                                onClick={() => router.push(doc.href)}
                                title={L(doc.labelEn, doc.labelTh)}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  color: '#1d4ed8',
                                  fontSize: 14,
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  fontFamily: '"Sarabun","Tahoma",sans-serif',
                                  textDecoration: 'underline',
                                  padding: 0,
                                }}
                              >
                                {L(doc.labelEn, doc.labelTh)}
                              </button>
                              {docIndex < item.documentLinks.length - 1 ? (
                                <span style={{ color: '#94a3b8', fontWeight: 700 }}>/</span>
                              ) : null}
                            </React.Fragment>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#9ca3af', fontWeight: 600 }}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info footer */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: '16px 22px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          border: '1px solid #d1d5db',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 13,
          color: '#6b7280',
          fontWeight: 500,
        }}>
          <div>
            <div>{L('Data Storage: ', 'ที่เก็บข้อมูล: ')}<span style={{ fontWeight: 600, color: '#4b5563' }}>Server {L('Head Office Korea', 'สำนักงานใหญ่เกาหลี')}</span> &middot; MySQL</div>
            <div style={{ marginTop: 3 }}>K-Energy-TH 2025</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div>{L('Working Date: ', 'วันที่ทำการ: ')}<span style={{ fontWeight: 600, color: '#4b5563' }}>{dateShort}</span></div>
            <div style={{ marginTop: 3 }}>{L('User: ', 'ผู้ใช้: ')}<span style={{ fontWeight: 600, color: '#4b5563' }}>{fullname || username || 'USER'}</span></div>
          </div>
        </div>

        {/* Pending Purchase Requests Modal */}
        {showPendingPRModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20
          }}>
            <div style={{
              background: '#fff',
              borderRadius: 16,
              maxWidth: 1200,
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
            }}>
              {/* Modal Header */}
              <div style={{
                padding: '20px 24px',
                borderBottom: '2px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                borderRadius: '16px 16px 0 0',
                color: '#fff'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20
                  }}>🔔</div>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                    {L('Purchase Requests Pending Approval', 'คำขอซื้อรออนุมัติ')} ({pendingPRList.length})
                  </h3>
                </div>
                <button
                  onClick={() => setShowPendingPRModal(false)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: '#fff',
                    fontSize: 28,
                    cursor: 'pointer',
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                >×</button>
              </div>

              {/* Modal Body */}
              <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
                {pendingPRList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                    <div style={{ fontSize: 18, fontWeight: 600 }}>
                      {L('No pending purchase requests', 'ไม่มีคำขอซื้อที่รออนุมัติ')}
                    </div>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: 14
                    }}>
                      <thead>
                        <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#1f2937' }}>{L('PR No.', 'เลขที่ PR')}</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#1f2937' }}>{L('Date', 'วันที่')}</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#1f2937' }}>{L('Requester', 'ผู้ขอซื้อ')}</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#1f2937' }}>{L('Department', 'แผนก')}</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#1f2937' }}>{L('Purpose', 'วัตถุประสงค์')}</th>
                          <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#1f2937' }}>{L('Items', 'รายการ')}</th>
                          <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#1f2937' }}>{L('Status', 'สถานะ')}</th>
                          <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#1f2937' }}>{L('Action', 'ดำเนินการ')}</th>
                          <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#1f2937' }}>{L('View', 'ดูรายละเอียดบิล')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingPRList.map((pr, idx: number) => (
                          <tr
                            key={pr.prID || idx}
                            style={{
                              borderBottom: '1px solid #e5e7eb',
                              background: idx % 2 === 0 ? '#fff' : '#fafafa',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f0f9ff'}
                            onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#fafafa'}
                          >
                            <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0ea5e9' }}>{pr.prNo || '-'}</td>
                            <td style={{ padding: '12px 16px', color: '#4b5563' }}>
                              {pr.prDate ? new Date(pr.prDate).toLocaleDateString('th-TH') : '-'}
                            </td>
                            <td style={{ padding: '12px 16px', color: '#1f2937' }}>{pr.requester_name || pr.requested_by || '-'}</td>
                            <td style={{ padding: '12px 16px', color: '#1f2937' }}>{pr.department || '-'}</td>
                            <td style={{ padding: '12px 16px', color: '#6b7280', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {pr.purpose || '-'}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center', color: '#6b7280' }}>{pr.item_count || 0}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                              <span style={{
                                padding: '4px 12px',
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 600,
                                background: pr.status === 'pending' ? '#fef3c7' : pr.status === 'submitted' ? '#dbeafe' : '#f3f4f6',
                                color: pr.status === 'pending' ? '#92400e' : pr.status === 'submitted' ? '#1e40af' : '#4b5563'
                              }}>
                                {pr.status || 'draft'}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <button
                                  onClick={() => handlePendingPRAction(pr.prID, 'rejected')}
                                  style={{
                                    padding: '6px 12px',
                                    background: '#dc2626',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 6,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#b91c1c'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = '#dc2626'}
                                >
                                  {L('Reject', 'ไม่อนุมัติ')}
                                </button>

                                <button
                                  onClick={() => handlePendingPRAction(pr.prID, 'submitted')}
                                  style={{
                                    padding: '6px 12px',
                                    background: '#2563eb',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 6,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = '#2563eb'}
                                >
                                  {L('Send to Executive', 'ส่งให้ผู้บริหารอนุมัติ')}
                                </button>
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                              <button
                                onClick={() => {
                                  const url = `/KR-Thailand/Admin-Login/purchase-requests/print?prID=${pr.prID}`
                                  window.open(url, '_blank')
                                }}
                                style={{
                                  padding: '6px 16px',
                                  background: '#16a34a',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: 6,
                                  fontSize: 13,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#15803d'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#16a34a'}
                              >
                                {L('View Bill', 'ดูรายละเอียดบิล')}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f9fafb'
              }}>
                <div style={{ fontSize: 14, color: '#6b7280' }}>
                  {L('Total:', 'ทั้งหมด:')} <span style={{ fontWeight: 700, color: '#1f2937' }}>{pendingPRList.length}</span> {L('items', 'รายการ')}
                </div>
                <button
                  onClick={() => setShowPendingPRModal(false)}
                  style={{
                    padding: '10px 24px',
                    background: '#6b7280',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#4b5563'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#6b7280'}
                >
                  {L('Close', 'ปิด')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Korea Invoice Modal */}
        {showKoreaInvoiceModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20
          }}>
            <div style={{
              background: '#fff',
              borderRadius: 16,
              maxWidth: 1200,
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
            }}>
              {/* Modal Header */}
              <div style={{
                padding: '20px 24px',
                borderBottom: '2px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                borderRadius: '16px 16px 0 0',
                color: '#fff'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20
                  }}>🏢</div>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                    {L('Korea HQ - Unpaid Invoices', 'ใบแจ้งหนี้จากเกาหลี (ยังไม่ชำระ)')} ({koreaInvoiceList.length})
                  </h3>
                </div>
                <button
                  onClick={() => setShowKoreaInvoiceModal(false)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: '#fff',
                    fontSize: 28,
                    cursor: 'pointer',
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                >×</button>
              </div>

              {/* Modal Body */}
              <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
                {koreaInvoiceList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                    <div style={{ fontSize: 18, fontWeight: 600 }}>
                      {L('No unpaid invoices', 'ไม่มีใบแจ้งหนี้ที่ค้างชำระ')}
                    </div>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: 13.5
                    }}>
                      <thead>
                        <tr style={{
                          background: '#f9fafb',
                          borderBottom: '2px solid #e5e7eb'
                        }}>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#1f2937' }}>
                            {L('Invoice No.', 'เลขที่ใบแจ้งหนี้')}
                          </th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#1f2937' }}>
                            {L('Branch Company', 'บริษัทสาขา')}
                          </th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#1f2937' }}>
                            {L('Issue Date', 'วันที่ออก')}
                          </th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#1f2937' }}>
                            {L('Due Date', 'วันครบกำหนด')}
                          </th>
                          <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#1f2937' }}>
                            {L('Amount', 'จำนวนเงิน')}
                          </th>
                          <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#1f2937' }}>
                            {L('Status', 'สถานะ')}
                          </th>
                          <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#1f2937' }}>
                            {L('Action', 'ดำเนินการ')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {koreaInvoiceList.map((invoice, idx) => (
                          <tr
                            key={invoice.id}
                            style={{
                              borderBottom: '1px solid #e5e7eb',
                              transition: 'background 0.15s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '12px 16px', fontWeight: 600, color: '#ea580c' }}>
                              {invoice.invoiceNumber || invoice.id}
                            </td>
                            <td style={{ padding: '12px 16px', color: '#1f2937' }}>
                              {invoice.supplier_name || invoice.customer || '-'}
                            </td>
                            <td style={{ padding: '12px 16px', color: '#6b7280' }}>
                              {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString('th-TH') : '-'}
                            </td>
                            <td style={{ padding: '12px 16px', color: '#6b7280' }}>
                              {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('th-TH') : '-'}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#1f2937' }}>
                              ${(invoice.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                              <span style={{
                                padding: '4px 12px',
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 600,
                                background: invoice.paymentStatus === 'overdue' ? '#fee2e2' :
                                           invoice.paymentStatus === 'partial' ? '#fef3c7' : '#fef9c3',
                                color: invoice.paymentStatus === 'overdue' ? '#991b1b' :
                                       invoice.paymentStatus === 'partial' ? '#92400e' : '#854d0e'
                              }}>
                                {invoice.paymentStatus === 'overdue' ? L('Overdue', 'เกินกำหนด') :
                                 invoice.paymentStatus === 'partial' ? L('Partial', 'บางส่วน') :
                                 L('Unpaid', 'ยังไม่ชำระ')}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                              <button
                                onClick={() => {
                                  const amountUSD = (invoice.totalAmount || 0).toFixed(2)
                                  const amountTHB = (parseFloat(amountUSD) * 35).toFixed(2)
                                  const params = new URLSearchParams({
                                    source: 'korea_invoice',
                                    invoice_id: invoice.id,
                                    invoice_number: invoice.invoiceNumber || '',
                                    amount: amountUSD,
                                    amount_thb: amountTHB,
                                    supplier: invoice.supplier_name || invoice.customer || '',
                                    notes: `Korea HQ Invoice: ${invoice.invoiceNumber || invoice.id} ($${amountUSD} = ฿${parseFloat(amountTHB).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
                                  })
                                  router.push(`/Thailand/Accounting-Login/finance/pay?${params.toString()}`)
                                }}
                                style={{
                                  padding: '6px 16px',
                                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: 6,
                                  fontSize: 13,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  boxShadow: '0 2px 4px rgba(5, 150, 105, 0.3)'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-1px)'
                                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(5, 150, 105, 0.4)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)'
                                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(5, 150, 105, 0.3)'
                                }}
                              >
                                💰 {L('Pay', 'ชำระเงิน')}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '16px 24px',
                borderTop: '2px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f9fafb'
              }}>
                <div style={{ fontSize: 14, color: '#6b7280' }}>
                  {L('Total:', 'ทั้งหมด:')} <span style={{ fontWeight: 700, color: '#1f2937' }}>{koreaInvoiceList.length}</span> {L('invoices', 'ใบแจ้งหนี้')}
                </div>
                <button
                  onClick={() => setShowKoreaInvoiceModal(false)}
                  style={{
                    padding: '10px 24px',
                    background: '#6b7280',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#4b5563'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#6b7280'}
                >
                  {L('Close', 'ปิด')}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AccWindow>
  )
}
