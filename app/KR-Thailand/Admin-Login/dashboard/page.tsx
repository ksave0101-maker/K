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

type ActivityItem = {
  type: string
  descEn: string
  descTh: string
  ts?: string | null
}

type ActivityApiItem = {
  type?: string
  title?: string
  ts?: string | null
}

export default function ThailandAdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [lang, setLang] = useState<'en'|'th'>('th')
  const [stats, setStats] = useState({
    orders: 0,
    customers: 0,
    products: 0,
    invoices: 0,
    contracts: 0,
    followUps: 0,
    preInstallations: 0,
    salesOrders: 0,
    quotations: 0,
    receipts: 0,
    deliveryNotes: 0,
    powerCalculations: 0,
    taxInvoices: 0,
    pendingBills: 0,
    customerTesting: 0,
    suppliers: 0,
    koreaTracking: 0
  })

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

    // Load user data
    try {
      const raw = localStorage.getItem('k_system_admin_user')
      if (raw) {
        setUser(JSON.parse(raw))
      }
    } catch (e) {
      console.error('Failed to load user data:', e)
    }

    // Load stats from API
    ;(async () => {
      try {
        const res = await fetch('/api/stats')
        const j = await res.json()
        if (j && j.success && j.stats) {
          setStats({
            orders: Number(j.stats.orders) || 0,
            customers: Number(j.stats.customers) || 0,
            products: Number(j.stats.products) || 0,
            invoices: Number(j.stats.invoices) || 0,
            contracts: Number(j.stats.contracts) || 0,
            followUps: Number(j.stats.followUps) || 0,
            preInstallations: Number(j.stats.preInstallations) || 0,
            salesOrders: Number(j.stats.salesOrders) || 0,
            quotations: Number(j.stats.quotations) || 0,
            receipts: Number(j.stats.receipts) || 0,
            deliveryNotes: Number(j.stats.deliveryNotes) || 0,
            powerCalculations: Number(j.stats.powerCalculations) || 0,
            taxInvoices: Number(j.stats.taxInvoices) || 0,
            pendingBills: Number(j.stats.pendingBills) || 0,
            customerTesting: Number(j.stats.customerTesting) || 0,
            suppliers: Number(j.stats.suppliers) || 0,
            koreaTracking: Number(j.stats.koreaTracking) || 0
          })
        }
      } catch (e) {
        console.error('Failed to load stats:', e)
      }
    })()
  }, [])

  const quickActions = [
    {
      title: 'All Lists',
      titleTh: 'รายการทั้งหมด',
      desc: 'Quick access to all lists',
      descTh: 'เข้าถึงรายการทั้งหมดในที่เดียว',
      href: '/KR-Thailand/Admin-Login/all-lists',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 7h18M3 12h18M3 17h18"/>
        </svg>
      ),
      color: '#0f172a'
    },
    {
      title: 'Quotation',
      titleTh: 'ใบเสนอราคา',
      desc: 'Create quotation',
      descTh: 'สร้างใบเสนอราคา',
      href: '/KR-Thailand/Admin-Login/quotation/list',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 18v-6"/><path d="M9 15h6"/>
        </svg>
      ),
      color: '#28a745'
    },
    {
      title: 'Sales Order',
      titleTh: 'ใบสั่งขาย',
      desc: 'Create sales order',
      descTh: 'สร้างใบสั่งขาย',
      href: '/KR-Thailand/Admin-Login/sales-order/list',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      ),
      color: '#0d6efd'
    },
    {
      title: 'Follow Up',
      titleTh: 'ติดตามงาน',
      desc: 'Track follow-ups',
      descTh: 'ติดตามงานลูกค้า',
      href: '/KR-Thailand/Admin-Login/follow-up/list',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      ),
      color: '#10b981'
    },
    {
      title: 'Invoice',
      titleTh: 'ใบแจ้งหนี้',
      desc: 'Create invoice',
      descTh: 'สร้างใบแจ้งหนี้',
      href: '/KR-Thailand/Admin-Login/invoice/list',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
      color: '#FF6600'
    },
    {
      title: 'Tax Invoice',
      titleTh: 'ใบกำกับภาษี',
      desc: 'Create tax invoice',
      descTh: 'สร้างใบกำกับภาษี',
      href: '/KR-Thailand/Admin-Login/tax-invoice/list',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 15h6"/><path d="M9 11h6"/>
        </svg>
      ),
      color: '#dc2626'
    },
    {
      title: 'Receipt',
      titleTh: 'ใบเสร็จรับเงิน',
      desc: 'Create receipt',
      descTh: 'สร้างใบเสร็จรับเงิน',
      href: '/KR-Thailand/Admin-Login/receipt/list',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.342a2 2 0 0 0-.602-1.43l-4.44-4.342A2 2 0 0 0 13.56 2H6a2 2 0 0 0-2 2z"/><path d="M9 13h6"/><path d="M9 17h3"/>
        </svg>
      ),
      color: '#7c3aed'
    },
    {
      title: 'Customer Payments',
      titleTh: 'รายการชำระเงิน',
      desc: 'Pending payments',
      descTh: 'รายการบิลค้างชำระ',
      href: '/KR-Thailand/Admin-Login/receipt/pending',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
      color: '#ca8a04'
    },
    {
      title: 'Purchase Order',
      titleTh: 'ใบสั่งซื้อ',
      desc: 'Create purchase order',
      descTh: 'สร้างใบสั่งซื้อ',
      href: '/KR-Thailand/Admin-Login/purchase-order/list',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      ),
      color: '#0890EB'
    },
    {
      title: 'Add Supplier',
      titleTh: 'เพิ่มซัพพลายเออร์',
      desc: 'Add new supplier',
      descTh: 'เพิ่มซัพพลายเออร์ใหม่',
      href: '/KR-Thailand/Admin-Login/supplier-add',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
      color: '#64748b'
    },
    {
      title: 'Korea HQ Tracking',
      titleTh: 'ติดตามสินค้าเกาหลี',
      desc: 'Korea order tracking',
      descTh: 'ติดตามสินค้าจากเกาหลี',
      href: '/KR-Thailand/Admin-Login/korea-order-tracking',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      ),
      color: '#b45309'
    },
    {
      title: 'Customers',
      titleTh: 'รายชื่อลูกค้า',
      desc: 'Manage customers',
      descTh: 'จัดการข้อมูลลูกค้า',
      href: '/KR-Thailand/Admin-Login/customers/list',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      color: '#3b82f6'
    },
    {
      title: 'Customer Testing',
      titleTh: 'ทดสอบลูกค้า',
      desc: 'Customer testing',
      descTh: 'ทดสอบระบบลูกค้า',
      href: '/KR-Thailand/Admin-Login/customer-testing',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
        </svg>
      ),
      color: '#c026d3'
    },
    {
      title: 'Add Product',
      titleTh: 'เพิ่มสินค้า',
      desc: 'Add new product',
      descTh: 'เพิ่มสินค้าใหม่',
      href: '/KR-Thailand/Admin-Login/product-add',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      ),
      color: '#ea580c'
    },
    {
      title: 'Product List',
      titleTh: 'รายการสินค้า',
      desc: 'View product list',
      descTh: 'ดูรายการสินค้า',
      href: '/KR-Thailand/Admin-Login/product-list/list',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      ),
      color: '#0ea5a4'
    },
    {
      title: 'Pre-installation',
      titleTh: 'แบบฟอร์มก่อนติดตั้ง',
      desc: 'Site survey form',
      descTh: 'ตรวจสอบหน้างาน',
      href: '/KR-Thailand/Admin-Login/pre-installation/list',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      ),
      color: '#f59e0b'
    },
    {
      title: 'Pre-Installation Analysis',
      titleTh: 'วิเคราะห์ก่อนติดตั้ง',
      desc: 'Current & Power Analysis',
      descTh: 'วิเคราะห์กระแสและพลังงาน',
      href: '/KR-Thailand/Admin-Login/pre-installation-analysis',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
          <path d="M13 21h4a2 2 0 0 0 2-2v-4"/><polyline points="19 9 13 9 13 3"/>
        </svg>
      ),
      color: '#8b5cf6'
    },
    {
      title: 'Power Calculator',
      titleTh: 'คำนวณค่าไฟฟ้า',
      desc: 'Electricity Cost Calculator',
      descTh: 'คำนวณค่าไฟฟ้าและพลังงาน',
      href: '/KR-Thailand/Admin-Login/power-calculator',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      ),
      color: '#eab308'
    },
    {
      title: 'Documents',
      titleTh: 'จัดการเอกสาร',
      desc: 'Manage all documents',
      descTh: 'จัดการเอกสารทั้งหมด',
      href: '/KR-Thailand/Admin-Login/documents',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
          <polyline points="13 2 13 9 20 9"/>
        </svg>
      ),
      color: '#ea580c'
    }
  ]

  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [activitiesLoading, setActivitiesLoading] = useState(true)
  const [activitiesError, setActivitiesError] = useState<string | null>(null)
  const [, forceUpdate] = useState(0)


  // Reload stats from API
  const refreshStats = async () => {
    try {
      const res = await fetch('/api/stats')
      const j = await res.json()
      if (j && j.success && j.stats) {
        setStats({
          orders: Number(j.stats.orders) || 0,
          customers: Number(j.stats.customers) || 0,
          products: Number(j.stats.products) || 0,
          invoices: Number(j.stats.invoices) || 0,
          contracts: Number(j.stats.contracts) || 0,
          followUps: Number(j.stats.followUps) || 0,
          preInstallations: Number(j.stats.preInstallations) || 0,
          salesOrders: Number(j.stats.salesOrders) || 0,
          quotations: Number(j.stats.quotations) || 0,
          receipts: Number(j.stats.receipts) || 0,
          deliveryNotes: Number(j.stats.deliveryNotes) || 0,
          powerCalculations: Number(j.stats.powerCalculations) || 0,
          taxInvoices: Number(j.stats.taxInvoices) || 0,
          pendingBills: Number(j.stats.pendingBills) || 0,
          customerTesting: Number(j.stats.customerTesting) || 0,
          suppliers: Number(j.stats.suppliers) || 0,
          koreaTracking: Number(j.stats.koreaTracking) || 0
        })
      }
    } catch (e) {
      console.error('Failed to refresh stats:', e)
    }
  }

  useEffect(() => {
    let mounted = true
    const fetchActivities = async (attempt = 0) => {
      try {
        const res = await fetch('/api/activity')
        const j = await res.json()
        if (j && j.success && Array.isArray(j.activities) && mounted) {
          const items = (j.activities as ActivityApiItem[]).map((a) => ({
            type: a.type || 'activity',
            descEn: a.title || '-',
            descTh: a.title || '-',
            ts: a.ts
          }))
          setActivities(items.slice(0, 24))
          setActivitiesError(null)
        } else if (j && !j.success && mounted) {
          const isConnErr = (j.error || '').toLowerCase().includes('connection')
          if (isConnErr && attempt < 3) {
            setTimeout(() => { if (mounted) fetchActivities(attempt + 1) }, 3000 * (attempt + 1))
          } else {
            setActivitiesError(j.error || 'Load failed')
          }
        }
      } catch (e) {
        console.error('load activities failed', e)
        if (mounted) {
          if (attempt < 3) {
            setTimeout(() => { if (mounted) fetchActivities(attempt + 1) }, 3000 * (attempt + 1))
          } else {
            setActivitiesError('Connection error')
          }
        }
      } finally {
        if (mounted) setActivitiesLoading(false)
      }
    }
    fetchActivities()

    // SSE subscription for real-time updates (activities + stats)
    let esRetryTimer: ReturnType<typeof setTimeout> | null = null
    const connectActivityStream = () => {
      const es = new EventSource('/api/activity/stream')
      es.onmessage = (evt) => {
        try {
          const d = JSON.parse(evt.data)
          if (d && d.type) {
            const act = { type: d.type, descEn: d.title || JSON.stringify(d), descTh: d.title || JSON.stringify(d), ts: d.ts || new Date().toISOString() }
            setActivities(prev => [act, ...prev].slice(0, 24))
            setActivitiesError(null)
            // Refresh stats when new activity arrives
            refreshStats()
          }
        } catch {
          // ignore ping/ready messages
        }
      }
      es.onerror = () => {
        es.close()
        if (mounted) {
          esRetryTimer = setTimeout(() => { if (mounted) connectActivityStream() }, 8000)
        }
      }
      return es
    }
    const es = connectActivityStream()

    // SSE for live stats (updates every few seconds)
    const statsEs = new EventSource('/api/stats/stream')
    statsEs.onmessage = (evt) => {
      try {
        const d = JSON.parse(evt.data)
        if (d && d.success && d.stats) {
          setStats({
            orders: Number(d.stats.orders) || 0,
            customers: Number(d.stats.customers) || 0,
            products: Number(d.stats.products) || 0,
            invoices: Number(d.stats.invoices) || 0,
            contracts: Number(d.stats.contracts) || 0,
            followUps: Number(d.stats.followUps) || 0,
            preInstallations: Number(d.stats.preInstallations) || 0,
            salesOrders: Number(d.stats.salesOrders) || 0,
            quotations: Number(d.stats.quotations) || 0,
            receipts: Number(d.stats.receipts) || 0,
            deliveryNotes: Number(d.stats.deliveryNotes) || 0,
            powerCalculations: Number(d.stats.powerCalculations) || 0,
            taxInvoices: Number(d.stats.taxInvoices) || 0,
            pendingBills: Number(d.stats.pendingBills) || 0,
            customerTesting: Number(d.stats.customerTesting) || 0,
            suppliers: Number(d.stats.suppliers) || 0,
            koreaTracking: Number(d.stats.koreaTracking) || 0
          })
        }
      } catch {
        // ignore invalid messages
      }
    }

    // Update time display every 30 seconds
    const timeInterval = setInterval(() => {
      forceUpdate(n => n + 1)
    }, 30000)

    return () => {
      mounted = false
      if (esRetryTimer) clearTimeout(esRetryTimer)
      try { es.close() } catch {}
      try { statsEs.close() } catch {}
      clearInterval(timeInterval)
    }
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const v = (e as CustomEvent<'en' | 'th'>).detail
      if (v) setLang(v)
    }
    const storageHandler = () => {
      try {
        const l = localStorage.getItem('k_system_lang') as 'en' | 'th'
        if (l === 'en' || l === 'th') setLang(l)
      } catch {}
    }
    window.addEventListener('k-system-lang', handler)
    window.addEventListener('storage', storageHandler)
    return () => {
      window.removeEventListener('k-system-lang', handler)
      window.removeEventListener('storage', storageHandler)
    }
  }, [])

  const L = (en: string, th: string) => lang === 'th' ? th : en

  return (
    <AdminLayout title="Dashboard" titleTh="แดชบอร์ด">
      {/* Hero Welcome */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 60%, #3b82f6 100%)',
        borderRadius: 16, padding: '28px 32px', marginTop: 8, marginBottom: 24, color: '#fff',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(37,99,235,0.25)'
      }}>
        <div style={{ position: 'absolute', right: -30, top: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', right: 60, bottom: -40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
              {L('Dashboard', 'แดชบอร์ด')} &mdash; K Energy Save (Group of Zera)
            </div>
            <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>
              {L('Welcome,','ยินดีต้อนรับ,')} {user?.name || user?.fullname || user?.username || 'Admin'}
            </h2>
            <p style={{ margin: '6px 0 0', fontSize: 14, opacity: 0.8 }}>
              {L('Manage your business at a glance', 'ภาพรวมการจัดการธุรกิจของคุณ')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/KR-Thailand/Admin-Login/purchase-order')} style={{
              padding: '10px 20px', borderRadius: 10, border: '2px solid rgba(255,255,255,0.25)',
              background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', backdropFilter: 'blur(4px)', transition: 'all 0.2s'
            }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
            onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}>
              + {L('New PO', 'สร้าง PO')}
            </button>
            <button onClick={() => router.push('/KR-Thailand/Admin-Login/contract/list')} style={{
              padding: '10px 20px', borderRadius: 10, border: 'none',
              background: 'rgba(255,255,255,0.95)', color: '#1e3a5f', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
            onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}>
              {L('Contracts', 'สัญญา')}
            </button>
            <button onClick={() => router.push('/Thailand/Accounting-Login')} style={{
              padding: '10px 20px', borderRadius: 10, border: '2px solid rgba(255,255,255,0.25)',
              background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', backdropFilter: 'blur(4px)', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 6
            }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
            onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              {L('Accounting System', 'ระบบงบดุล')}
            </button>
            <button onClick={() => router.push('/Thailand/Marketing-Login')} style={{
              padding: '10px 20px', borderRadius: 10, border: '2px solid rgba(255,255,255,0.25)',
              background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', backdropFilter: 'blur(4px)', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 6
            }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
            onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
              </svg>
              {L('Marketing System', 'ระบบการตลาด')}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingLeft: 2 }}>
          <div style={{ width: 4, height: 20, borderRadius: 2, background: 'linear-gradient(180deg, #2563eb, #3b82f6)' }} />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
            {L('Overview', 'ภาพรวม')}
          </h3>
          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
            {L('Total records in system', 'จำนวนรายการทั้งหมดในระบบ')}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 160px)', gap: '14px', justifyContent: 'start', alignItems: 'stretch' }}>
          {[
            { value: stats.orders, label: L('Purchase Orders','ใบสั่งซื้อ'), icon: '📦', iconClass: styles.statIconBlue },
            { value: stats.customers, label: L('Customers','ลูกค้า'), icon: '👥', iconClass: styles.statIconGreen },
            { value: stats.products, label: L('Products','สินค้า'), icon: '📋', iconClass: styles.statIconOrange },
            { value: stats.invoices, label: L('Invoices','ใบแจ้งหนี้'), icon: '🧾', iconClass: styles.statIconPurple },
            { value: stats.quotations, label: L('Quotations','ใบเสนอราคา'), icon: '📄', iconClass: styles.statIconTeal },
            { value: stats.contracts, label: L('Contracts','สัญญา'), icon: '📝', iconClass: styles.statIconIndigo },
            { value: stats.followUps, label: L('Follow Ups','ติดตามงาน'), icon: '✅', iconClass: styles.statIconEmerald },
            { value: stats.preInstallations, label: L('Pre-Installation','ก่อนติดตั้ง'), icon: '🔧', iconClass: styles.statIconYellow },
            { value: stats.salesOrders, label: L('Sales Orders','ใบสั่งขาย'), icon: '🛒', iconClass: styles.statIconCyan },
            { value: stats.receipts, label: L('Receipts','ใบเสร็จ'), icon: '🧾', iconClass: styles.statIconRose },
            { value: stats.deliveryNotes, label: L('Delivery Notes','ใบจัดส่ง'), icon: '🚚', iconClass: styles.statIconSky },
            { value: stats.powerCalculations, label: L('Power Calcs','คำนวณพลังงาน'), icon: '⚡', iconClass: styles.statIconAmber },
            { value: stats.taxInvoices, label: L('Tax Invoices','ใบกำกับภาษี'), icon: '📑', iconClass: styles.statIconRed },
            { value: stats.pendingBills, label: L('Pending Bills','บิลค้างชำระ'), icon: '💰', iconClass: styles.statIconLime },
            { value: stats.customerTesting, label: L('Customer Testing','ทดสอบลูกค้า'), icon: '🧪', iconClass: styles.statIconFuchsia },
            { value: stats.suppliers, label: L('Suppliers','ซัพพลายเออร์'), icon: '🏭', iconClass: styles.statIconSlate },
            { value: stats.koreaTracking, label: L('Korea Tracking','สินค้าเกาหลี'), icon: (<img src="https://flagcdn.com/kr.svg" alt="Korea" width={22} height={16} style={{ borderRadius: 3, objectFit: 'cover', display: 'inline-block' }} />), iconClass: styles.statIconKorea },
          ].map((card, idx) => (
            <div key={idx} className={styles.statCard}>
              <div className={`${styles.statIcon} ${card.iconClass}`}>
                {card.icon}
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{card.value}</div>
                <div className={styles.statLabel}>{card.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingLeft: 2 }}>
          <div style={{ width: 4, height: 20, borderRadius: 2, background: 'linear-gradient(180deg, #f59e0b, #fbbf24)' }} />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
            {L('Quick Actions','เมนูด่วน')}
          </h3>
          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
            {L('Quick access to common functions','เข้าถึงฟังก์ชันที่ใช้บ่อย')}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '14px' }}>
          {quickActions.map((action, idx) => (
            <div
              key={idx}
              onClick={() => router.push(action.href)}
              style={{
                padding: '20px 16px',
                boxSizing: 'border-box',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: '#fff',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                borderLeft: `3px solid ${action.color}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = action.color
                e.currentTarget.style.boxShadow = `0 6px 20px ${action.color}18`
                e.currentTarget.style.transform = 'translateY(-3px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.borderLeftColor = action.color
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: `${action.color}12`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: action.color
              }}>
                {action.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', marginBottom: 3 }}>
                  {lang === 'th' ? action.titleTh : action.title}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.4 }}>
                  {lang === 'th' ? action.descTh : action.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
            {L('Recent Activity','กิจกรรมล่าสุด')}
          </h3>
        </div>
        <div style={{ padding: 0 }}>
          <table className={styles.table}>
            <thead>
                <tr>
                  <th style={{ width: '60%' }}>{L('Details','รายละเอียด')}</th>
                  <th style={{ width: '20%' }}>{L('Type','ประเภท')}</th>
                  <th style={{ width: '20%' }}>{L('Time','เวลา')}</th>
                </tr>
            </thead>
            <tbody>
              {activitiesLoading ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: 13 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 14, height: 14, border: '2px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', display: 'inline-block' }} className="animate-spin" />
                      {L('Loading...', 'กำลังโหลด...')}
                    </span>
                  </td>
                </tr>
              ) : activitiesError ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '20px', color: '#ef4444', fontSize: 13 }}>
                    ⚠ {activitiesError === 'Too many connections' || activitiesError.includes('connections')
                      ? L('Database busy — retrying shortly', 'ฐานข้อมูลยุ่ง — กรุณารอสักครู่')
                      : activitiesError}
                  </td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '28px', color: '#94a3b8', fontSize: 13 }}>
                    {L('No recent activity', 'ยังไม่มีกิจกรรม')}
                  </td>
                </tr>
              ) : (
              activities.map((activity, idx) => (
                <tr key={idx}>
                  <td>{lang === 'th' ? activity.descTh || activity.descEn : activity.descEn || activity.descTh}</td>
                  <td>
                    <span className={`${styles.badge} ${
                      activity.type === 'order' ? styles.badgeInfo :
                      activity.type === 'customer' ? styles.badgeSuccess :
                      activity.type === 'supplier' ? styles.badgeSuccess :
                      activity.type === 'product' ? styles.badgePending :
                      activity.type === 'invoice' ? styles.badgeWarning :
                      activity.type === 'quotation' ? styles.badgeInfo :
                      activity.type === 'receipt' ? styles.badgeSuccess :
                      activity.type === 'contract' ? styles.badgePending :
                      activity.type === 'sales' ? styles.badgeInfo :
                      activity.type === 'followup' ? styles.badgeWarning :
                      activity.type === 'tracking' ? styles.badgeInfo :
                      activity.type === 'tax_invoice' ? styles.badgeWarning :
                      activity.type === 'testing' ? styles.badgePending :
                      styles.badgePending
                    }`}>
                      {activity.type === 'order' ? L('PO','ใบสั่งซื้อ') :
                       activity.type === 'customer' ? L('Customer','ลูกค้า') :
                       activity.type === 'supplier' ? L('Supplier','ซัพพลายเออร์') :
                       activity.type === 'product' ? L('Product','สินค้า') :
                       activity.type === 'invoice' ? L('Invoice','ใบแจ้งหนี้') :
                       activity.type === 'quotation' ? L('Quote','ใบเสนอราคา') :
                       activity.type === 'receipt' ? L('Receipt','ใบเสร็จ') :
                       activity.type === 'contract' ? L('Contract','สัญญา') :
                       activity.type === 'sales' ? L('SO','ใบสั่งขาย') :
                       activity.type === 'followup' ? L('Follow','ติดตาม') :
                       activity.type === 'tracking' ? L('Tracking','ติดตามขนส่ง') :
                       activity.type === 'tax_invoice' ? L('Tax','ใบกำกับภาษี') :
                       activity.type === 'testing' ? L('Testing','ทดสอบลูกค้า') :
                       L('Other','อื่นๆ')}
                    </span>
                  </td>
                  <td style={{ color: '#94a3b8', fontSize: 13 }}>
                    {activity.ts ? (() => {
                      const d = new Date(activity.ts)
                      const day = String(d.getDate()).padStart(2, '0')
                      const month = String(d.getMonth() + 1).padStart(2, '0')
                      const year = d.getFullYear()
                      const hours = String(d.getHours()).padStart(2, '0')
                      const minutes = String(d.getMinutes()).padStart(2, '0')
                      return `${day}/${month}/${year} ${hours}:${minutes}`
                    })() : '-'}
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
