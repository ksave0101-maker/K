"use client"

import Image from 'next/image'
import React, { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'

/* ---------- Language Hook for Child Pages ---------- */
let _lang: 'th' | 'en' = 'th'
const _listeners = new Set<() => void>()
function _subscribe(cb: () => void) { _listeners.add(cb); return () => { _listeners.delete(cb) } }
function _getSnapshot() { return _lang }
function _setLang(v: 'th' | 'en') {
  _lang = v
  try { localStorage.setItem('acc_lang', v) } catch {}
  _listeners.forEach(cb => cb())
}
export function useLang() {
  const lang = useSyncExternalStore(_subscribe, _getSnapshot, () => 'th' as const)
  const L = useCallback((en: string, th: string) => lang === 'th' ? th : en, [lang])
  return { lang, L, setLang: _setLang }
}

/* ---------- Menu Definitions (bilingual) ---------- */
export type AccMenuDef = {
  label_th: string
  label_en: string
  submenu: { label_th: string; label_en: string; href?: string; divider?: boolean }[]
}

export const ACC_MENU: AccMenuDef[] = [
  {
    label_th: '1.ซื้อ', label_en: '1.Purchase',
    submenu: [
      { label_th: '1. จ่ายเงินมัดจำ', label_en: '1. Pay Deposit', href: '/Thailand/Accounting-Login/purchase/deposit' },
      { label_th: '2. ซื้อเงินสด', label_en: '2. Cash Purchase', href: '/Thailand/Accounting-Login/purchase/cash' },
      { label_th: '3. ใบสั่งซื้อ', label_en: '3. Purchase Order', href: '/Thailand/Accounting-Login/purchase/order' },
      { label_th: '4. ซื้อเงินเชื่อ', label_en: '4. Credit Purchase', href: '/Thailand/Accounting-Login/purchase/credit' },
      { label_th: '5. บันทึกค่าใช้จ่ายอื่น ๆ', label_en: '5. Other Expenses', href: '/Thailand/Accounting-Login/purchase/expense' },
      { divider: true, label_th: '', label_en: '' },
      { label_th: '6. รายละเอียดผู้จำหน่าย', label_en: '6. Supplier Details', href: '/Thailand/Accounting-Login/purchase/suppliers' },
      { label_th: '7. รายละเอียดค่าใช้จ่ายอื่น ๆ', label_en: '7. Expense Categories', href: '/Thailand/Accounting-Login/purchase/expense-details' },
      { divider: true, label_th: '', label_en: '' },
      { label_th: '8. คำนวณยอดเจ้าหนี้ใหม่', label_en: '8. Recalculate AP', href: '/Thailand/Accounting-Login/purchase/recalc-payable' },
      { divider: true, label_th: '', label_en: '' },
      { label_th: '9. สแกนบิล', label_en: '9. Scan Bill', href: '/Thailand/Accounting-Login/purchase/scan-bill' },
    ],
  },
  {
    label_th: '2.ขาย', label_en: '2.Sales',
    submenu: [
      { label_th: '1. รับเงินมัดจำ', label_en: '1. Receive Deposit', href: '/Thailand/Accounting-Login/sales/deposit' },
      { label_th: '2. ขายเงินสด', label_en: '2. Cash Sales', href: '/Thailand/Accounting-Login/sales/cash' },
      { label_th: '3. ใบสั่งขาย', label_en: '3. Sales Order', href: '/Thailand/Accounting-Login/sales/order' },
      { label_th: '4. ขายเงินเชื่อ', label_en: '4. Credit Sales', href: '/Thailand/Accounting-Login/sales/credit' },
      { label_th: '5. รับคืนสินค้า', label_en: '5. Sales Return', href: '/Thailand/Accounting-Login/sales/return' },
      { divider: true, label_th: '', label_en: '' },
      { label_th: '6. รายละเอียดลูกค้า', label_en: '6. Customer Details', href: '/Thailand/Accounting-Login/sales/customers' },
      { label_th: '7. รายละเอียดรายได้อื่น ๆ', label_en: '7. Income Categories', href: '/Thailand/Accounting-Login/sales/income-details' },
      { divider: true, label_th: '', label_en: '' },
      { label_th: '8. คำนวณยอดลูกหนี้ใหม่', label_en: '8. Recalculate AR', href: '/Thailand/Accounting-Login/sales/recalc-receivable' },
    ],
  },
  {
    label_th: '3.การเงิน', label_en: '3.Finance',
    submenu: [
      { label_th: '1. รับเงิน', label_en: '1. Receive Money', href: '/Thailand/Accounting-Login/finance/receive' },
      { label_th: '2. จ่ายเงิน', label_en: '2. Pay Money', href: '/Thailand/Accounting-Login/finance/pay' },
      { label_th: '3. ธนาคาร', label_en: '3. Bank', href: '/Thailand/Accounting-Login/finance/bank' },
      { divider: true, label_th: '', label_en: '' },
      { label_th: '4. ภาษีมูลค่าเพิ่ม', label_en: '4. VAT', href: '/Thailand/Accounting-Login/finance/vat' },
      { label_th: '   - แฟ้มภาษีซื้อ', label_en: '   - Purchase VAT', href: '/Thailand/Accounting-Login/finance/vat-purchase' },
      { label_th: '   - แฟ้มภาษีขาย', label_en: '   - Sales VAT', href: '/Thailand/Accounting-Login/finance/vat-sales' },
      { divider: true, label_th: '', label_en: '' },
      { label_th: '5. ภาษีหัก ณ ที่จ่าย', label_en: '5. Withholding Tax', href: '/Thailand/Accounting-Login/finance/withholding-tax' },
    ],
  },
  {
    label_th: '4.สินค้า', label_en: '4.Inventory',
    submenu: [
      { label_th: '1. รับสินค้า', label_en: '1. Receive Goods', href: '/Thailand/Accounting-Login/inventory/receive' },
      { label_th: '2. จ่ายสินค้า', label_en: '2. Issue Goods', href: '/Thailand/Accounting-Login/inventory/issue' },
      { label_th: '3. โอนสินค้า', label_en: '3. Transfer Goods', href: '/Thailand/Accounting-Login/inventory/transfer' },
      { label_th: '4. ปรับสินค้า', label_en: '4. Adjust Stock', href: '/Thailand/Accounting-Login/inventory/adjust' },
      { divider: true, label_th: '', label_en: '' },
      { label_th: '5. ตรวจนับสินค้า', label_en: '5. Stock Count', href: '/Thailand/Accounting-Login/inventory/count' },
    ],
  },
  {
    label_th: '5.บัญชี', label_en: '5.Accounting',
    submenu: [
      { label_th: '1. บันทึกบัญชี', label_en: '1. Journal Entry', href: '/Thailand/Accounting-Login/accounting/journal' },
      { divider: true, label_th: '', label_en: '' },
      { label_th: '2. งบดุล', label_en: '2. Balance Sheet', href: '/Thailand/Accounting-Login/balance-sheet' },
      { label_th: '3. งบกำไรขาดทุน', label_en: '3. Income Statement', href: '/Thailand/Accounting-Login/accounting/income-statement' },
      { label_th: '4. งบกระแสเงินสด', label_en: '4. Cash Flow Statement', href: '/Thailand/Accounting-Login/accounting/cashflow' },
    ],
  },
  {
    label_th: '6.เงินเดือน/HR', label_en: '6.Payroll/HR',
    submenu: [
      { label_th: '1. ข้อมูลพนักงาน', label_en: '1. Employee Data', href: '/Thailand/Accounting-Login/payroll/employees' },
      { label_th: '2. บันทึกเวลาเข้า-ออกงาน', label_en: '2. Time Attendance', href: '/Thailand/Accounting-Login/payroll/attendance' },
      { label_th: '3. สแกนหน้าเข้างาน', label_en: '3. Face Scan Clock-In', href: '/Thailand/Accounting-Login/payroll/face-scan-in' },
      { label_th: '4. สแกนหน้าเลิกงาน', label_en: '4. Face Scan Clock-Out', href: '/Thailand/Accounting-Login/payroll/face-scan-out' },
      { label_th: '5. รายงานเวลาทำงาน', label_en: '5. Working Hours Report', href: '/Thailand/Accounting-Login/payroll/working-hours' },
      { divider: true, label_th: '', label_en: '' },
      { label_th: '6. คำนวณเงินเดือน', label_en: '6. Calculate Payroll', href: '/Thailand/Accounting-Login/payroll/calculate' },
      { label_th: '7. บันทึกเงินเดือน', label_en: '7. Payroll Entry', href: '/Thailand/Accounting-Login/payroll/entry' },
      { label_th: '8. สลิปเงินเดือน', label_en: '8. Payslip', href: '/Thailand/Accounting-Login/payroll/payslip' },
      { label_th: '9. จ่ายเงินเดือน', label_en: '9. Payroll Payment', href: '/Thailand/Accounting-Login/payroll/payment' },
      { divider: true, label_th: '', label_en: '' },
      { label_th: '10. ภาษีหัก ณ ที่จ่าย', label_en: '10. Withholding Tax', href: '/Thailand/Accounting-Login/payroll/withholding-tax' },
      { label_th: '11. ประกันสังคม', label_en: '11. Social Security', href: '/Thailand/Accounting-Login/payroll/social-security' },
      { label_th: '12. กองทุนสำรองเลี้ยงชีพ', label_en: '12. Provident Fund', href: '/Thailand/Accounting-Login/payroll/provident-fund' },
      { divider: true, label_th: '', label_en: '' },
      { label_th: '13. รายงานเงินเดือน', label_en: '13. Payroll Report', href: '/Thailand/Accounting-Login/payroll/report' },
    ],
  },
  {
    label_th: '7.ข้อมูล', label_en: '7.Data',
    submenu: [
      { label_th: '1. ข้อมูลรายวันข้อมูล', label_en: '1. Daily Data Entry', href: '/Thailand/Accounting-Login/data/daily' },
      { label_th: '2. เปลี่ยนหัวข้อบัญชี', label_en: '2. Change Account Header', href: '/Thailand/Accounting-Login/data/change-header' },
      { label_th: '3. ระบบบัญชีรหัสผังบัญชี', label_en: '3. Chart of Accounts', href: '/Thailand/Accounting-Login/data/chart-of-accounts' },
      { label_th: '4. การบันทึกรายละเอียดผังบัญชี', label_en: '4. Account Details Entry', href: '/Thailand/Accounting-Login/data/account-details' },
      { label_th: '5. เปิดปิดรายการของลูกหนี้', label_en: '5. AR Item Control', href: '/Thailand/Accounting-Login/data/ar-control' },
      { label_th: '6. ลบบันทึกที่ตรวจสอบแล้ว', label_en: '6. Delete Verified Records', href: '/Thailand/Accounting-Login/data/delete-verified' },
      { label_th: '7. ลบบันทึกที่กำหนดให้สามารถลบได้', label_en: '7. Delete Allowed Records', href: '/Thailand/Accounting-Login/data/delete-allowed' },
      { label_th: '8. เปลี่ยนการบัญชี', label_en: '8. Change Accounting', href: '/Thailand/Accounting-Login/data/change-accounting' },
      { label_th: '9. ตั้งค่าเสริม', label_en: '9. Additional Settings', href: '/Thailand/Accounting-Login/data/additional-settings' },
      { divider: true, label_th: '', label_en: '' },
      { label_th: 'บันทึกข้อมูล', label_en: 'Save Data', href: '/Thailand/Accounting-Login/data/save' },
      { label_th: 'บันทึกข้อมูลในโปรแกรม', label_en: 'Save Program Data', href: '/Thailand/Accounting-Login/data/save-program' },
      { label_th: 'ค้นหาหัวข้อบัญชี', label_en: 'Search Account Header', href: '/Thailand/Accounting-Login/data/search' },
    ],
  },
  {
    label_th: '8.รายงาน', label_en: '8.Reports',
    submenu: [
      { label_th: '1. รายงานยอดซื้อ', label_en: '1. Purchase Report', href: '/Thailand/Accounting-Login/reports/purchase' },
      { label_th: '2. รายงานยอดขาย', label_en: '2. Sales Report', href: '/Thailand/Accounting-Login/reports/sales' },
      { label_th: '3. รายงานกระแสเงินสด', label_en: '3. Cash Flow Report', href: '/Thailand/Accounting-Login/reports/cashflow' },
      { label_th: '4. รายงานสินค้าคงเหลือ', label_en: '4. Inventory Report', href: '/Thailand/Accounting-Login/reports/inventory' },
      { label_th: '5. รายงานลูกหนี้/เจ้าหนี้', label_en: '5. AR/AP Report', href: '/Thailand/Accounting-Login/reports/ar-ap' },
    ],
  },
  {
    label_th: '9.เริ่มระบบ', label_en: '9.System',
    submenu: [
      { label_th: '1. ข้อมูลเกี่ยวกับข้อมูล', label_en: '1. About Data', href: '/Thailand/Accounting-Login/system/about-data' },
      { label_th: '2. ข้อมูลแสดงรายข้อมูล', label_en: '2. Data List Display', href: '/Thailand/Accounting-Login/system/data-list' },
      { label_th: '3. สแกนเอกสารหลักฐาน', label_en: '3. Scan Documents', href: '/Thailand/Accounting-Login/system/scan-docs' },
      { label_th: '4. ข้อมูลแสดงข้อมูลการทำงาน', label_en: '4. Work Data Display', href: '/Thailand/Accounting-Login/system/work-data' },
      { label_th: '5. ข้อมูลแสดงในรายงานผลกำไร', label_en: '5. Profit Report Display', href: '/Thailand/Accounting-Login/system/profit-report' },
      { label_th: '6. ข้อมูลแสดงการกำหนดรหัส', label_en: '6. Code Definition Display', href: '/Thailand/Accounting-Login/system/code-definition' },
      { label_th: '7. ข้อมูลแสดงสิทธิ์', label_en: '7. Permission Display', href: '/Thailand/Accounting-Login/system/permissions' },
      { label_th: '8. ระบบการตั้งค่าระบบ', label_en: '8. System Configuration', href: '/Thailand/Accounting-Login/settings' },
      { divider: true, label_th: '', label_en: '' },
      { label_th: '9. งวดบัญชี', label_en: '9. Accounting Periods', href: '/Thailand/Accounting-Login/settings/periods' },
      { divider: true, label_th: '', label_en: '' },
      { label_th: 'ออกจากระบบ', label_en: 'Logout', href: '__logout__' },
    ],
  },
  {
    label_th: '10.อื่น ๆ', label_en: '10.Others',
    submenu: [
      { label_th: '1. เกี่ยวกับระบบ', label_en: '1. About System', href: '/Thailand/Accounting-Login/about' },
      { label_th: '2. คู่มือการใช้งาน', label_en: '2. User Manual', href: '/Thailand/Accounting-Login/manual' },
      { label_th: '3. ติดต่อสนับสนุน', label_en: '3. Contact Support', href: '/Thailand/Accounting-Login/support' },
    ],
  },
]

/* ---------- Component ---------- */
type Props = {
  title: string
  children: React.ReactNode
  minHeight?: number
}

export default function AccWindow({ title, children, minHeight = 500 }: Props) {
  const router = useRouter()
  const { lang, L, setLang: setLanguage } = useLang()
  const [openMenu, setOpenMenu] = useState<number | null>(null)
  const [username, setUsername] = useState('')
  const [fullname, setFullname] = useState('')
  const [clock, setClock] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('acc_lang')
      if (stored === 'en' || stored === 'th') _setLang(stored)
    } catch {}
    try {
      setUsername(localStorage.getItem('username') || '')
      setFullname(localStorage.getItem('fullname') || '')
    } catch {}
    const tick = () => setClock(new Date().toLocaleTimeString(lang === 'th' ? 'th-TH' : 'en-US'))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [lang])

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(null)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const go = (href?: string) => {
    setOpenMenu(null)
    if (!href) return
    if (href === '__logout__') {
      try { localStorage.clear() } catch {}
      router.push('/Thailand/Accounting-Login')
      return
    }
    router.push(href)
  }

  const today = new Date().toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  })

  return (
    <div style={{
      minHeight: '100vh',
      background: '#9ca3af',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '"Sarabun","Tahoma","Arial",sans-serif',
      fontSize: 14,
    }}>
      <div style={{
        width: '100%',
        flex: 1,
        background: '#f5f7fa',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #374151 0%, #6b7280 100%)',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 3px 12px rgba(0,0,0,0.25)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Image
              src="/k-energy-save-logo.jpg"
              alt="K Energy Save"
              width={110}
              height={38}
              style={{
                height: 38, width: 'auto', objectFit: 'contain', borderRadius: 6,
                boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            />
            <div>
              <div
                suppressHydrationWarning
                style={{ color: '#fff', fontSize: 17, fontWeight: 800, lineHeight: 1.2, textShadow: '0 1px 3px rgba(0,0,0,0.3)', letterSpacing: '0.01em' }}
              >
                {title}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11.5, marginTop: 2, fontWeight: 500, letterSpacing: '0.02em' }}>K-Energy Accounting System</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Language toggle */}
            <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <button onClick={() => setLanguage('th')} style={{
                padding: '5px 14px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12.5,
                background: lang === 'th' ? '#e5e7eb' : 'rgba(255,255,255,0.12)',
                color: lang === 'th' ? '#1f2937' : 'rgba(255,255,255,0.8)',
                fontFamily: '"Sarabun","Tahoma",sans-serif',
                transition: 'all 0.2s',
              }}>TH</button>
              <button onClick={() => setLanguage('en')} style={{
                padding: '5px 14px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12.5,
                background: lang === 'en' ? '#e5e7eb' : 'rgba(255,255,255,0.12)',
                color: lang === 'en' ? '#1f2937' : 'rgba(255,255,255,0.8)',
                fontFamily: '"Sarabun","Tahoma",sans-serif',
                transition: 'all 0.2s',
              }}>EN</button>
            </div>
            <button onClick={() => go('/Thailand/Accounting-Login/dashboard')} style={{
              padding: '6px 18px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontWeight: 700, fontSize: 12.5,
              background: 'rgba(255,255,255,0.12)', color: '#fff', borderRadius: 6,
              fontFamily: '"Sarabun","Tahoma",sans-serif',
              transition: 'all 0.2s',
              backdropFilter: 'blur(4px)',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)' }}
            >{lang === 'th' ? 'เมนูหลัก' : 'Home'}</button>
          </div>
        </div>

        {/* Menu bar */}
        <div ref={menuRef} style={{
          background: '#fff',
          borderBottom: '2px solid #d1d5db',
          display: 'flex',
          flexWrap: 'wrap',
          position: 'relative',
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
          paddingLeft: 8,
        }}>
          {ACC_MENU.map((menu, idx) => (
            <div key={idx} style={{ position: 'relative' }}
              onMouseEnter={() => setOpenMenu(idx)}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <div
                onClick={() => setOpenMenu(openMenu === idx ? null : idx)}
                style={{
                  padding: '9px 18px',
                  cursor: 'pointer',
                  background: openMenu === idx ? '#4b5563' : 'transparent',
                  color: openMenu === idx ? '#fff' : '#1f2937',
                  fontSize: 14,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  borderRadius: openMenu === idx ? '6px 6px 0 0' : 0,
                  transition: 'all 0.15s',
                  letterSpacing: '0.01em',
                }}
              >
                {lang === 'th' ? menu.label_th : menu.label_en}
              </div>
              {openMenu === idx && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  background: '#fff',
                  border: '1px solid #c9cdd3',
                  borderRadius: '0 6px 6px 6px',
                  minWidth: 280,
                  zIndex: 1000,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
                  padding: '4px 0',
                  overflow: 'hidden',
                }}>
                  {menu.submenu.map((item, i) =>
                    item.divider ? (
                      <div key={i} style={{ height: 1, background: '#d1d5db', margin: '4px 12px' }} />
                    ) : (
                      <div
                        key={i}
                        onClick={() => go(item.href)}
                        style={{
                          padding: '8px 20px',
                          cursor: 'pointer',
                          color: '#1f2937',
                          fontSize: 13.5,
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#f0f1f3'
                          e.currentTarget.style.color = '#111827'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color = '#1f2937'
                        }}
                      >
                        {lang === 'th' ? item.label_th : item.label_en}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Content area */}
        <div style={{ background: '#f4f4f5', minHeight, flex: 1, padding: 0, userSelect: 'text', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.06)' }}>
          {children}
        </div>

        {/* Status bar */}
        <div style={{
          background: '#fff',
          borderTop: '2px solid #d1d5db',
          padding: '7px 20px',
          display: 'flex',
          gap: 16,
          fontSize: 13,
          color: '#4b5563',
          fontWeight: 500,
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 4px rgba(34,197,94,0.5)' }} />
            {fullname || username ? `${L('User','ผู้ใช้')}: ${fullname || username}` : L('Ready','พร้อมใช้งาน')}
          </div>
          <div style={{ flex: 1, textAlign: 'center', color: '#6b7280' }}>{today}</div>
          <div style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{clock}</div>
        </div>
      </div>
    </div>
  )
}
