"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'
import styles from '../admin-theme.module.css'
import { Eye, EyeOff } from 'lucide-react'

type User = {
  username?: string
  fullname?: string
  name?: string
  typeID?: number
  site?: string
}

export default function MarketingLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [locale, setLocale] = useState<'en' | 'th'>('en')
  const [mounted, setMounted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const L = (en: string, th: string) => (mounted && locale === 'th') ? th : en

  useEffect(() => {
    setMounted(true)
    // Load language
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      if (l === 'en' || l === 'th') setLocale(l)
    } catch {}

    // Load user
    try {
      const raw = localStorage.getItem('k_system_admin_user')
      if (raw) {
        const user = JSON.parse(raw)
        setCurrentUser(user)
      }
    } catch (e) {
      console.error('Failed to load user:', e)
    }

    // Listen for language changes
    const handleLangChange = (e: any) => {
      const newLang = e.detail
      if (newLang === 'en' || newLang === 'th') setLocale(newLang)
    }
    const handleLocaleChange = (e: any) => {
      if (e.detail?.locale === 'en' || e.detail?.locale === 'th') {
        setLocale(e.detail.locale)
      }
    }
    window.addEventListener('k-system-lang', handleLangChange)
    window.addEventListener('locale-changed', handleLocaleChange)
    return () => {
      window.removeEventListener('k-system-lang', handleLangChange)
      window.removeEventListener('locale-changed', handleLocaleChange)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Check credentials - customize as needed
    if (username === 'marketing' && password === 'marketing2025') {
      // Redirect to marketing system
      window.open('https://marketing.ksystem.com', '_blank')
      router.back()
    } else {
      setError('invalid_credentials')
    }
    setLoading(false)
  }

  return (
    <AdminLayout title="Marketing System Login" titleTh="ล็อกอินระบบการตลาด">
      <div className={styles.contentCard} style={{
        maxWidth: 500,
        margin: '20px auto',
        marginLeft: 'auto',
        marginRight: 'auto',
        width: '100%',
        padding: '0'
      }}>
        <div className={styles.cardHeader} style={{
          textAlign: 'center',
          padding: '32px 20px 24px'
        }}>
          <div style={{
            width: 70,
            height: 70,
            margin: '0 auto 16px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
            </svg>
          </div>
          <h2 className={styles.cardTitle} style={{ fontSize: '1.375rem', marginBottom: '8px' }}>
            {L('Marketing System Login', 'ล็อกอินระบบการตลาด')}
          </h2>
          <p className={styles.cardSubtitle} style={{ fontSize: '0.875rem' }}>
            {L('Login to access marketing system', 'เข้าสู่ระบบการตลาด')}
          </p>
        </div>

        <div className={styles.cardBody} style={{ padding: '0 20px 32px' }}>
          <form onSubmit={handleSubmit}>
              {error && (
                <div style={{
                  padding: '12px 14px',
                  marginBottom: '16px',
                  borderRadius: 8,
                  color: '#7f1d1d',
                  background: '#fee2e2',
                  border: '1px solid #fca5a5',
                  fontSize: '0.875rem',
                  lineHeight: '1.4'
                }}>
                  ⚠ {error === 'invalid_credentials'
                    ? L('Invalid username or password', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
                    : error}
                </div>
              )}

              <div className={styles.formGroup} style={{ marginBottom: '18px' }}>
                <label className={styles.formLabel} style={{ fontSize: '0.875rem', marginBottom: '8px' }}>
                  {L('Username', 'ชื่อผู้ใช้')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className={styles.formInput}
                  placeholder={L('Enter username', 'กรอกชื่อผู้ใช้')}
                  autoFocus
                  style={{ fontSize: '16px', padding: '12px 14px' }}
                />
              </div>

              <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                <label className={styles.formLabel} style={{ fontSize: '0.875rem', marginBottom: '8px' }}>
                  {L('Password', 'รหัสผ่าน')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={styles.formInput}
                    placeholder={L('Enter password', 'กรอกรหัสผ่าน')}
                    style={{ fontSize: '16px', padding: '12px 44px 12px 14px', width: '100%', boxSizing: 'border-box' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex', alignItems: 'center' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginTop: '24px',
                paddingTop: '18px',
                borderTop: '1px solid #f1f5f9'
              }}>
                <button
                  type="submit"
                  disabled={loading}
                  className={`${styles.btnPrimary} ${styles.btnLarge}`}
                  style={{
                    width: '100%',
                    padding: '13px 24px',
                    fontSize: '0.938rem',
                    fontWeight: 600
                  }}
                >
                  {loading ? L('Logging in...', 'กำลังเข้าสู่ระบบ...') : L('Login', 'เข้าสู่ระบบ')}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className={`${styles.btnSecondary} ${styles.btnOutline}`}
                  style={{
                    width: '100%',
                    padding: '13px 24px',
                    fontSize: '0.938rem',
                    fontWeight: 600
                  }}
                >
                  {L('Cancel', 'ยกเลิก')}
                </button>
              </div>
            </form>

          {currentUser && [0, 1, 16, 17].includes(currentUser.typeID || -1) && (
            <div style={{
              marginTop: '16px',
              padding: '12px 14px',
              background: '#fef3c7',
              borderRadius: 8,
              fontSize: '0.813rem',
              lineHeight: '1.5',
              color: '#92400e',
              wordBreak: 'break-word'
            }}>
              💡 <strong>{L('Test credentials:', 'ข้อมูลทดสอบ:')}</strong><br />
              username: marketing<br />
              password: marketing2025
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
