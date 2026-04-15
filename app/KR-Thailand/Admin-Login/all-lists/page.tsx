"use client"

import React, { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import styles from '../admin-theme.module.css'
import Link from 'next/link'

export default function AllListsPage() {
  const [locale, setLocale] = useState<'en'|'th'>('th')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      if (l === 'en' || l === 'th') setLocale(l)
    } catch {}

    const handler = (e: Event) => {
      const d = (e as any).detail
      const v = typeof d === 'string' ? d : d?.locale
      if (v === 'en' || v === 'th') setLocale(v)
    }
    window.addEventListener('k-system-lang', handler)
    window.addEventListener('locale-changed', handler)
    return () => {
      window.removeEventListener('k-system-lang', handler)
      window.removeEventListener('locale-changed', handler)
    }
  }, [])

  const L = (en: string, th: string) => locale === 'th' ? th : en

  if (!mounted) {
    return (
      <AdminLayout title="All Lists" titleTh="รายการทั้งหมด">
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
      </AdminLayout>
    )
  }

  const listPages = [
    {
      group: L('Sales & Marketing', 'ฝ่ายขายและการตลาด'),
      color: '#db2777',
      items: [
        { name: L('Quotation List', 'รายการใบเสนอราคา'), href: '/KR-Thailand/Admin-Login/quotation/list', icon: '📋' },
        { name: L('Sales Order List', 'รายการใบสั่งขาย'), href: '/KR-Thailand/Admin-Login/sales-order/list', icon: '🛒' },
        { name: L('Follow Up List', 'รายการติดตามงาน'), href: '/KR-Thailand/Admin-Login/follow-up/list', icon: '✓' },
        { name: L('Customer List', 'รายการลูกค้า'), href: '/KR-Thailand/Admin-Login/customers/list', icon: '👥' },
      ]
    },
    {
      group: L('Accounting & Finance', 'ฝ่ายบัญชีและการเงิน'),
      color: '#059669',
      items: [
        { name: L('Invoice List', 'รายการใบแจ้งหนี้'), href: '/KR-Thailand/Admin-Login/invoice/list', icon: '💰' },
        { name: L('Tax Invoice List', 'รายการใบกำกับภาษี'), href: '/KR-Thailand/Admin-Login/tax-invoice/list', icon: '📄' },
        { name: L('Receipt List', 'รายการใบเสร็จรับเงิน'), href: '/KR-Thailand/Admin-Login/receipt/list', icon: '🧾' },
      ]
    },
    {
      group: L('Operations & Logistics', 'ฝ่ายปฏิบัติการและโลจิสติกส์'),
      color: '#dc2626',
      items: [
        { name: L('Pre-Installation List', 'รายการแบบฟอร์มก่อนติดตั้ง'), href: '/KR-Thailand/Admin-Login/pre-installation/list', icon: '📝' },
        { name: L('Delivery Note List', 'รายการใบส่งของ'), href: '/KR-Thailand/Admin-Login/delivery-note/list', icon: '🚚' },
        { name: L('Purchase Order List', 'รายการใบสั่งซื้อ'), href: '/KR-Thailand/Admin-Login/purchase-order/list', icon: '📦' },
        { name: L('Korea Order Tracking', 'ติดตามคำสั่งซื้อจากเกาหลี'), href: '/KR-Thailand/Admin-Login/korea-order-tracking/list', icon: '🇰🇷' },
      ]
    },
    {
      group: L('Master Data & Products', 'ข้อมูลหลักและสินค้า'),
      color: '#7c3aed',
      items: [
        { name: L('Product List', 'รายการสินค้า'), href: '/KR-Thailand/Admin-Login/products/list', icon: '📦' },
        { name: L('Product List (Alternative)', 'รายการสินค้า (ทางเลือก)'), href: '/KR-Thailand/Admin-Login/product-list/list', icon: '📋' },
      ]
    },
    {
      group: L('Tools & Calculators', 'เครื่องมือและเครื่องคำนวณ'),
      color: '#0f172a',
      items: [
        { name: L('Power Calculator List', 'รายการคำนวณกำลังไฟ'), href: '/KR-Thailand/Admin-Login/power-calculator/list', icon: '⚡' },
        { name: L('Contract List', 'รายการสัญญา'), href: '/KR-Thailand/Admin-Login/contract/list', icon: '📜' },
      ]
    },
  ]

  return (
    <AdminLayout title="All Lists — Thailand Branch" titleTh="รายการทั้งหมด — สาขาประเทศไทย">
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 7h18M3 12h18M3 17h18"/>
            </svg>
            {L('All Lists - Quick Access', 'รายการทั้งหมด - เข้าถึงง่าย')}
          </h2>
          <p className={styles.cardSubtitle}>
            {L('Access all list pages in one place', 'เข้าถึงหน้ารายการทั้งหมดในที่เดียว')}
          </p>
        </div>

        <div className={styles.cardBody}>
          {listPages.map((section, idx) => (
            <div key={idx} style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 700,
                color: section.color,
                marginBottom: '16px',
                paddingBottom: '8px',
                borderBottom: `2px solid ${section.color}20`
              }}>
                {section.group}
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '12px'
              }}>
                {section.items.map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: '#1f2937',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f9fafb'
                      e.currentTarget.style.borderColor = section.color
                      e.currentTarget.style.boxShadow = `0 2px 8px ${section.color}20`
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#fff'
                      e.currentTarget.style.borderColor = '#e5e7eb'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>{item.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.name}</div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
