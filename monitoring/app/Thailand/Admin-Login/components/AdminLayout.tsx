"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import styles from '../admin-theme.module.css'

type MenuItem = {
  label: string
  labelTh: string
  href: string
  icon: React.ReactNode
}

type MenuGroup = {
  group: string
  groupTh: string
  color: string
  items: MenuItem[]
}

const menuGroups: MenuGroup[] = [
  {
    group: 'Main', groupTh: 'หลัก', color: '#1e293b',
    items: [
      { label: 'Dashboard', labelTh: 'แดชบอร์ด', href: '/Thailand/Admin-Login/dashboard', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
      ) },
    ]
  },
  {
    group: 'Sales', groupTh: 'ฝ่ายขาย', color: '#2563eb',
    items: [
      { label: 'Quotation', labelTh: 'ใบเสนอราคา', href: '/Thailand/Admin-Login/quotation', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 18v-6"/><path d="M9 15h6"/></svg>
      ) },
      { label: 'Sales Order', labelTh: 'ใบสั่งขาย', href: '/Thailand/Admin-Login/sales-order/list', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8V7a2 2 0 0 0-2-2h-3"/><path d="M3 12h18"/><path d="M5 20h14a2 2 0 0 0 2-2v-5"/></svg>
      ) },
      { label: 'Contract', labelTh: 'สัญญา', href: '/Thailand/Admin-Login/contract/list', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="M9 15l3 3 3-3"/></svg>
      ) },
      { label: 'Follow Up', labelTh: 'ติดตามงาน', href: '/Thailand/Admin-Login/follow-up', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
      ) },
    ]
  },
  {
    group: 'Finance', groupTh: 'ฝ่ายการเงิน', color: '#059669',
    items: [
      { label: 'Invoice', labelTh: 'ใบแจ้งหนี้', href: '/Thailand/Admin-Login/invoice', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
      ) },
      { label: 'Tax Invoice', labelTh: 'ใบกำกับภาษี', href: '/Thailand/Admin-Login/tax-invoice', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15h6"/><path d="M9 11h6"/></svg>
      ) },
      { label: 'Receipt', labelTh: 'ใบเสร็จรับเงิน', href: '/Thailand/Admin-Login/receipt', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.342a2 2 0 0 0-.602-1.43l-4.44-4.342A2 2 0 0 0 13.56 2H6a2 2 0 0 0-2 2z"/><path d="M9 13h6"/><path d="M9 17h3"/></svg>
      ) },
      { label: 'Customer Payments', labelTh: 'รายการชำระเงิน', href: '/Thailand/Admin-Login/customer-pay', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3"/><path d="M5 20v-2a6 6 0 0 1 12 0v2"/><path d="M21 8v6"/><path d="M23 11h-6"/></svg>
      ) },
      { label: 'Pending Bills', labelTh: 'บิลรออนุมัติ', href: '/Thailand/Admin-Login/receipt/pending', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4"/><path d="M7 10h10"/><path d="M7 13h6"/></svg>
      ) },
    ]
  },
  {
    group: 'Purchasing', groupTh: 'ฝ่ายจัดซื้อ', color: '#d97706',
    items: [
      { label: 'Purchase Order', labelTh: 'ใบสั่งซื้อ', href: '/Thailand/Admin-Login/purchase-order', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
      ) },
      { label: 'Add Supplier', labelTh: 'เพิ่มซัพพลายเออร์', href: '/Thailand/Admin-Login/supplier-add', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
      ) },
      { label: 'Korea HQ Tracking', labelTh: 'ติดตามสินค้าเกาหลี', href: '/Thailand/Admin-Login/korea-order-tracking', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      ) },
    ]
  },
  {
    group: 'Customers', groupTh: 'ฝ่ายลูกค้า', color: '#7c3aed',
    items: [
      { label: 'Add Customer', labelTh: 'เพิ่มลูกค้า', href: '/Thailand/Admin-Login/customer-add', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z"/><path d="M6 21v-2a4 4 0 0 1 4-4h4"/><path d="M20 8v6"/><path d="M23 11h-6"/></svg>
      ) },
      { label: 'Customers', labelTh: 'รายชื่อลูกค้า', href: '/Thailand/Admin-Login/customers', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      ) },
      { label: 'Customer Testing', labelTh: 'ทดสอบลูกค้า', href: '/Thailand/Admin-Login/customer-testing', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/><circle cx="12" cy="19" r="1"/></svg>
      ) },
    ]
  },
  {
    group: 'Products', groupTh: 'ฝ่ายสินค้า', color: '#0891b2',
    items: [
      { label: 'Add Product', labelTh: 'เพิ่มสินค้า', href: '/Thailand/Admin-Login/product-add', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
      ) },
      { label: 'Product List', labelTh: 'รายการสินค้า', href: '/Thailand/Admin-Login/products', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h18M3 12h18M3 17h18" /></svg>
      ) },
      { label: 'Product Catalog', labelTh: 'แคตาล็อกสินค้า', href: '/Thailand/Admin-Login/products/list', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="14"/><path d="M3 11h18"/></svg>
      ) },
    ]
  },
  {
    group: 'Installation', groupTh: 'ฝ่ายติดตั้ง', color: '#dc2626',
    items: [
      { label: 'Pre-Installation', labelTh: 'แบบฟอร์มก่อนติดตั้ง', href: '/Thailand/Admin-Login/pre-installation-form', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      ) },
      { label: 'Pre-Installation List', labelTh: 'รายการก่อนติดตั้ง', href: '/Thailand/Admin-Login/pre-installation/list', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h18"/><path d="M3 12h18"/><path d="M3 17h18"/></svg>
      ) },
      { label: 'Installation & Delivery', labelTh: 'ติดตั้งและจัดส่ง', href: '/Thailand/Admin-Login/delivery-note', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
      ) },
    ]
  },
  {
    group: 'Tools', groupTh: 'เครื่องมือ', color: '#475569',
    items: [
      { label: 'Power Calculator', labelTh: 'คำนวณพลังงาน', href: '/Thailand/Admin-Login/power-calculator', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="18"/><line x1="8" y1="10" x2="8" y2="10"/><line x1="12" y1="10" x2="12" y2="10"/><line x1="16" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="8" y2="14"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="8" y1="18" x2="8" y2="18"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
      ) },
      { label: 'Power Calculator List', labelTh: 'รายการคำนวณพลังงาน', href: '/Thailand/Admin-Login/power-calculator/list', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h18"/><path d="M3 12h18"/><path d="M3 17h18"/></svg>
      ) },
    ]
  },
];

// Flatten for permission filtering
const allMenuItems = menuGroups.flatMap(g => g.items);

type Props = {
  children: React.ReactNode
  title?: string
  titleTh?: string
  subtitle?: string
  subtitleTh?: string
  breadcrumbs?: { label: string; href?: string }[]
}

export default function AdminLayout({
  children,
  title = 'Dashboard',
  titleTh = 'แดชบอร์ด',
  subtitle,
  subtitleTh,
  breadcrumbs = []
}: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [allowedPages, setAllowedPages] = useState<Set<string> | null>(null)
  const [lang, setLang] = useState<'en' | 'th'>('th')

  useEffect(() => {
    // Read language from localStorage on client side only
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      if (l === 'en' || l === 'th') setLang(l)
    } catch (_) {}

    try {
      const userData = localStorage.getItem('k_system_admin_user')
      if (userData) {
        setUser(JSON.parse(userData))
      }
    } catch (_) {}
    // fetch permissions for current user type to filter menu for non-admins
    try {
      const raw = localStorage.getItem('k_system_admin_user')
      if (raw) {
        const u = JSON.parse(raw)
        fetch(`/api/user/permissions?typeID=${u.typeID}`)
          .then(r => r.json())
          .then(j => {
            if (j?.ok && j.permissions?.pages) {
              const pages = j.permissions.pages
              const allowed = new Set<string>(Object.keys(pages).filter(k => pages[k]))
              setAllowedPages(allowed)
            } else {
              setAllowedPages(new Set())
            }
          })
          .catch(() => setAllowedPages(new Set()))
      }
    } catch (_) { setAllowedPages(new Set()) }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('k_system_admin_user')
    localStorage.removeItem('k_system_admin_token')
    router.push('/Thailand/Admin-Login')
  }

  const L = (en: string, th: string) => lang === 'th' ? th : en

  // persist language selection and broadcast to pages
  useEffect(() => {
    try {
      // Persist both keys for backward compatibility and broadcast both events.
      localStorage.setItem('k_system_lang', lang)
      localStorage.setItem('locale', lang)
      window.dispatchEvent(new CustomEvent('k-system-lang', { detail: lang }))
      window.dispatchEvent(new CustomEvent('locale-changed', { detail: { locale: lang } }))
    } catch (_) {}
  }, [lang])

  return (
    <div className={styles.adminLayout}>
      {/* Top Header */}
      <header className={styles.topHeader}>
          <div className={styles.headerLogo}>
          <div style={{ width: 160, height: 48, borderRadius: 6, overflow: 'hidden', flex: '0 0 160px', marginRight: 12, border: '1px solid #ddd', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/k-energy-save-logo.jpg" alt="K Energy Save Co., Ltd." style={{ width: 'auto', height: '80%', objectFit: 'contain', display: 'block', padding: 6 }} />
          </div>
          <div>
            <div className={styles.headerTitle}>K Energy Save Co., Ltd. (Group of Zera)</div>
            <div className={styles.headerSubtitle}>Management System - Thailand</div>
          </div>
        </div>

        <div className={styles.headerNav}>
          <div className={`${styles.langPrintGroup} no-print`}>
            <div className={styles.langPill}>
              <button type="button" onClick={() => setLang('th')} className={`${styles.btnLocale} ${lang === 'th' ? styles.localeActive : ''}`}>ไทย</button>
              <button type="button" onClick={() => setLang('en')} className={`${styles.btnLocale} ${lang === 'en' ? styles.localeActive : ''}`}>EN</button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user && (
            <div className={styles.headerUserInfo}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span className={styles.headerUserName}>{user.name || user.username}</span>
            </div>
          )}
          <button onClick={handleLogout} className={styles.headerLogout}>
            {L('Logout', 'ออกจากระบบ')}
          </button>
        </div>
      </header>

      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        {breadcrumbs.map((item, idx) => (
          <React.Fragment key={idx}>
            <span className={styles.breadcrumbSeparator}>/</span>
            {item.href ? (
              <Link href={item.href} className={styles.breadcrumbLink}>{item.label}</Link>
            ) : (
              <span className={styles.breadcrumbCurrent}>{item.label}</span>
            )}
          </React.Fragment>
        ))}
        {breadcrumbs.length === 0 && (
          <>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span className={styles.breadcrumbCurrent}>{L(title, titleTh)}</span>
          </>
        )}
      </nav>

      {/* Main Container */}
      <div className={styles.mainContainer}>
        {/* Sidebar */}
        <aside className={`${styles.sidebar} no-print`}>
          <div style={{ padding: '6px 8px 0' }}>
            <div className={styles.sidebarHeader}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="9" y1="21" x2="9" y2="9"/>
              </svg>
              {L('Menu', 'เมนู')}
            </div>
            <nav className={styles.sidebarMenu}>
              {menuGroups.map(group => {
                const filtered = group.items.filter(item => {
                  try {
                    if (allowedPages === null) return true
                    const u = user || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('k_system_admin_user') || 'null') : null)
                    const strType = String(u?.typeName || u?.type || '').toLowerCase()
                    const isAdminUser = [1,2,7].includes(Number(u?.typeID)) || strType.includes('admin')
                    if (isAdminUser) return true
                    return allowedPages.has(item.href)
                  } catch (e) { return true }
                })
                if (filtered.length === 0) return null
                return (
                  <div key={group.group} style={{
                    margin: '6px 8px',
                    borderRadius: 10,
                    border: '1px solid rgba(0,0,0,0.06)',
                    background: 'rgba(255,255,255,0.03)',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      padding: '8px 12px',
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: group.color,
                      background: `linear-gradient(135deg, ${group.color}12, ${group.color}08)`,
                      borderBottom: '1px solid rgba(0,0,0,0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: group.color, display: 'inline-block', flexShrink: 0
                      }} />
                      {L(group.group, group.groupTh)}
                      <span style={{ marginLeft: 'auto', fontSize: 10, opacity: 0.5, fontWeight: 500 }}>{filtered.length}</span>
                    </div>
                    <div style={{ padding: '4px 0' }}>
                      {filtered.map(item => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.sidebarMenuItem} ${isActive ? styles.sidebarMenuItemActive : ''}`}
                          >
                            <span className={styles.sidebarMenuIcon}>{item.icon}</span>
                            {L(item.label, item.labelTh)}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </nav>
          </div>

          {/* Quick Actions */}
          <div className={styles.sidebarCard} style={{ marginTop: 12 }}>
            <div className={styles.sidebarHeader}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v6"/><path d="M5 12h14"/><path d="M12 18v4"/>
              </svg>
              {L('Quick Actions', 'ด่วน')}
            </div>
            <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Build quick actions from existing menu items so labels/icons stay consistent */}
              {(() => {
                const quickLabels = new Set([
                  'Quotation','Sales Order','Follow Up','Invoice','Tax Invoice','Receipt',
                  'Customer Payments','Purchase Order','Add Supplier','Korea HQ Tracking',
                  'Customers','Customer Testing','Add Product','Product List','Pre-Installation'
                ])
                const quickActions = allMenuItems.filter(i => quickLabels.has(i.label) && i.href !== '/Thailand/Admin-Login/delivery-note')
                return quickActions.map(item => (
                  <Link key={item.href} href={item.href} className={styles.sidebarMenuItem}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</span>
                      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                        <span style={{ fontWeight: 600 }}>{L(item.label, item.labelTh)}</span>
                        <span style={{ fontSize: 12, color: '#777' }}>{L(item.labelTh, item.label)}</span>
                      </div>
                    </span>
                  </Link>
                ))
              })()}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        © 2026 K Energy Save Co., Ltd. (Group of Zera) All rights reserved.
      </footer>
      {/* Toast container listens for 'k-system-toast' events */}
      <div id="k-system-toast-container" style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 9999 }}>
        {/* toasts will be injected by client-side listener */}
      </div>
    </div>
  )
}
