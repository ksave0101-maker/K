"use client"

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import styles from '../../Admin-Login/admin-theme.module.css'

type MenuItem = {
  label: string
  labelTh: string
  href: string
  icon: React.ReactNode
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard', labelTh: 'แดชบอร์ด',
    href: '/Thailand/Accounting-Login/dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>
      </svg>
    )
  },
  {
    label: 'Balance Sheet', labelTh: 'งบดุล',
    href: '/Thailand/Accounting-Login/balance-sheet',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <line x1="10" y1="9" x2="8" y2="9"/>
      </svg>
    )
  },
]

type Props = {
  children: React.ReactNode
  title?: string
  titleTh?: string
}

type AccountingUser = {
  userId: string | null
  username: string | null
  fullname: string
  typeID: number
}

export default function AccountingLayout({
  children,
  title = 'Dashboard',
  titleTh = 'แดชบอร์ด',
}: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<AccountingUser | null>(null)
  const [lang, setLang] = useState<'en' | 'th'>('th')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      if (l === 'en' || l === 'th') setLang(l)
      else setLang('th')
    } catch {}
    setMounted(true)

    // Auth check
    try {
      const uid = localStorage.getItem('user_id')
      const uname = localStorage.getItem('username')
      const typeID = localStorage.getItem('typeID')
      const token = localStorage.getItem('token')
      if (!uid && !uname && !token) {
        router.push('/Thailand/Accounting-Login')
        return
      }
      setUser({
        userId: uid,
        username: uname,
        fullname: localStorage.getItem('fullname') || '',
        typeID: typeID ? parseInt(typeID) : 0,
      })
    } catch {
      router.push('/Thailand/Accounting-Login')
    }
  }, [router])

  const handleLogout = () => {
    try {
      localStorage.removeItem('user_id')
      localStorage.removeItem('username')
      localStorage.removeItem('fullname')
      localStorage.removeItem('typeID')
      localStorage.removeItem('site')
      localStorage.removeItem('token')
    } catch {}
    router.push('/Thailand/Accounting-Login')
  }

  const L = (en: string, th: string) => (mounted && lang === 'th') ? th : en

  const handleLanguageChange = (newLang: 'en' | 'th') => {
    setLang(newLang)
    try {
      localStorage.setItem('k_system_lang', newLang)
      localStorage.setItem('locale', newLang)
      window.dispatchEvent(new CustomEvent('k-system-lang', { detail: newLang }))
      window.dispatchEvent(new CustomEvent('locale-changed', { detail: { locale: newLang } }))
    } catch {}
  }

  return (
    <div className={styles.adminLayout}>
      {/* Top Header - Green theme for accounting */}
      <header className={styles.topHeader} style={{
        background: 'linear-gradient(180deg, #059669 0%, #047857 100%)'
      }}>
        <div className={styles.headerLogo}>
          <Image
            src="/k-energy-save-logo.jpg"
            alt="K Energy Save Co., Ltd."
            width={96}
            height={48}
            unoptimized
            style={{ height: 48, width: 'auto', objectFit: 'contain', display: 'block', borderRadius: 6, marginRight: 12 }}
          />
          <div>
            <div className={styles.headerTitle}>
              {L('Accounting System', 'ระบบบัญชี')}
            </div>
            <div className={styles.headerSubtitle}>
              K Energy Save Co., Ltd. - Thailand
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div className={`${styles.langPrintGroup} no-print`}>
            <div className={styles.langPill}>
              <button type="button" onClick={() => handleLanguageChange('th')} className={`${styles.btnLocale} ${lang === 'th' ? styles.localeActive : ''}`}>
                ไทย
              </button>
              <button type="button" onClick={() => handleLanguageChange('en')} className={`${styles.btnLocale} ${lang === 'en' ? styles.localeActive : ''}`}>
                EN
              </button>
            </div>
          </div>

          {mounted && user && (
            <div className={styles.headerUserInfo}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span className={styles.headerUserName}>
                {user.fullname || user.username || 'User'}
              </span>
            </div>
          )}

          <button onClick={handleLogout} className={styles.headerLogout}>
            {L('Logout', 'ออกจากระบบ')}
          </button>
        </div>
      </header>

      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <span className={styles.breadcrumbSeparator}>/</span>
        <Link href="/Thailand/Accounting-Login/dashboard" className={styles.breadcrumbLink}>
          {L('Accounting', 'บัญชี')}
        </Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>{L(title, titleTh)}</span>
      </nav>

      {/* Main Container */}
      <div className={styles.mainContainer}>
        {/* Sidebar */}
        <aside className={`${styles.sidebar} no-print`}>
          <div style={{ padding: '6px 8px 0' }}>
            <div className={styles.sidebarHeader} style={{
              background: 'linear-gradient(180deg, #059669 0%, #047857 100%)'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              {L('Accounting Menu', 'เมนูบัญชี')}
            </div>
            <nav className={styles.sidebarMenu}>
              <div style={{
                margin: '6px 8px',
                borderRadius: 10,
                border: '1px solid #05966940',
                borderLeft: '4px solid #059669',
                background: 'rgba(255,255,255,0.03)',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '8px 12px',
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#059669',
                  background: 'linear-gradient(135deg, #05966930, #05966918)',
                  borderBottom: '1px solid #05966925',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#059669', display: 'inline-block', flexShrink: 0,
                    boxShadow: '0 0 6px #05966980'
                  }} />
                  {L('Accounting', 'บัญชี')}
                  {mounted && <span style={{ marginLeft: 'auto', fontSize: 10, opacity: 0.5, fontWeight: 500 }}>{menuItems.length}</span>}
                </div>
                <div style={{ padding: '4px 0' }}>
                  {menuItems.map(item => {
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
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className={styles.footer} style={{
        background: '#047857'
      }}>
        &copy; 2026 K Energy Save Co., Ltd. (Group of Zera) All rights reserved.
      </footer>
    </div>
  )
}
