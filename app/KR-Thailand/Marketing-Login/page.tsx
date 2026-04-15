"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

export default function MarketingLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [locale, setLocale] = useState<'en' | 'th'>('en')
  const [mounted, setMounted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const L = (en: string, th: string) => (mounted && locale === 'th') ? th : en

  useEffect(() => {
    setMounted(true)

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Load language
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      if (l === 'en' || l === 'th') setLocale(l)
    } catch {}

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
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('k-system-lang', handleLangChange)
      window.removeEventListener('locale-changed', handleLocaleChange)
    }
  }, [])

  const handleLanguageChange = (lang: 'en' | 'th') => {
    setLocale(lang)
    try {
      localStorage.setItem('locale', lang)
      localStorage.setItem('k_system_lang', lang)
      window.dispatchEvent(new CustomEvent('k-system-lang', { detail: lang }))
      window.dispatchEvent(new CustomEvent('locale-changed', { detail: { locale: lang } }))
    } catch {}
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // เรียก API ตรวจสอบ username/password จากฐานข้อมูล
      const response = await fetch('/api/marketing-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (data.success && data.user) {
        // บันทึกข้อมูล user ลง localStorage
        localStorage.setItem('k_system_marketing_user', JSON.stringify(data.user))

        // Redirect to marketing dashboard
        router.push('/Thailand/Marketing-Login/dashboard')
      } else {
        // แสดง error ตามประเภท
        setError(data.error || 'invalid_credentials')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      setError('server_error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 30%, #ffa600 70%, #ffb627 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '16px' : '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: isMobile ? '12px' : '16px',
        boxShadow: '0 25px 70px rgba(255, 107, 53, 0.35), 0 10px 30px rgba(0,0,0,0.2)',
        maxWidth: '500px',
        width: '100%',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'relative',
          textAlign: 'center',
          padding: isMobile ? '32px 20px 24px' : '40px 20px 32px',
          background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 50%, #ffa600 100%)'
        }}>
          {/* Language Switcher */}
          <div style={{
            position: 'absolute',
            top: isMobile ? '12px' : '16px',
            right: isMobile ? '12px' : '16px',
            display: 'flex',
            gap: '6px',
            background: 'rgba(255,255,255,0.2)',
            padding: isMobile ? '5px' : '6px',
            borderRadius: '10px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <button
              type="button"
              onClick={() => handleLanguageChange('en')}
              style={{
                padding: isMobile ? '6px 12px' : '8px 14px',
                borderRadius: '8px',
                border: 'none',
                background: locale === 'en' ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.1)',
                color: locale === 'en' ? '#ff6b35' : 'rgba(255,255,255,0.95)',
                fontSize: isMobile ? '0.75rem' : '0.813rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                boxShadow: locale === 'en' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'
              }}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('th')}
              style={{
                padding: isMobile ? '6px 12px' : '8px 14px',
                borderRadius: '8px',
                border: 'none',
                background: locale === 'th' ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.1)',
                color: locale === 'th' ? '#ff6b35' : 'rgba(255,255,255,0.95)',
                fontSize: isMobile ? '0.75rem' : '0.813rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                boxShadow: locale === 'th' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'
              }}
            >
              ไทย
            </button>
          </div>

          <div style={{
            width: isMobile ? 70 : 80,
            height: isMobile ? 70 : 80,
            margin: isMobile ? '0 auto 16px' : '0 auto 20px',
            borderRadius: '50%',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width={isMobile ? "35" : "40"} height={isMobile ? "35" : "40"} viewBox="0 0 24 24" fill="none" stroke="#ff6b35" strokeWidth="2.5">
              <path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
            </svg>
          </div>
          <h1 style={{
            fontSize: isMobile ? '1.5rem' : '1.75rem',
            fontWeight: 700,
            color: 'white',
            marginBottom: '8px',
            lineHeight: 1.2
          }}>
            {L('Marketing System', 'ระบบการตลาด')}
          </h1>
          <p style={{
            fontSize: isMobile ? '0.875rem' : '1rem',
            color: 'rgba(255,255,255,0.9)',
            lineHeight: 1.4
          }}>
            {L('Login to access marketing system', 'เข้าสู่ระบบการตลาด')}
          </p>
        </div>

        <div style={{ padding: isMobile ? '24px 20px' : '32px' }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                padding: isMobile ? '14px 16px' : '12px 14px',
                marginBottom: isMobile ? '24px' : '20px',
                borderRadius: 8,
                color: '#7f1d1d',
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                fontSize: isMobile ? '0.938rem' : '0.875rem',
                lineHeight: '1.5'
              }}>
                ⚠️ {error === 'no_permission'
                  ? L('You do not have permission to access the marketing system (Admin, Executive, M_Marketing, Marketing, and Branch Manager only)', 'คุณไม่มีสิทธิ์เข้าถึงระบบการตลาด (เฉพาะ Admin, Executive, M_Marketing, Marketing และ Branch Manager)')
                  : error === 'invalid_credentials'
                  ? L('Invalid username or password', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
                  : error === 'server_error'
                  ? L('Server error. Please try again later.', 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง')
                  : error === 'missing_credentials'
                  ? L('Please enter username and password', 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน')
                  : error}
              </div>
            )}

            <div style={{ marginBottom: isMobile ? '22px' : '20px' }}>
              <label style={{
                display: 'block',
                fontSize: isMobile ? '0.938rem' : '0.875rem',
                fontWeight: 600,
                marginBottom: isMobile ? '10px' : '8px',
                color: '#374151'
              }}>
                {L('Username', 'ชื่อผู้ใช้')} <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder={L('Enter username', 'กรอกชื่อผู้ใช้')}
                autoFocus={!isMobile}
                autoComplete="username"
                style={{
                  width: '100%',
                  fontSize: '16px',
                  padding: isMobile ? '14px 16px' : '12px 14px',
                  border: '2px solid #d1d5db',
                  borderRadius: '10px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  WebkitAppearance: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ff6b35'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            <div style={{ marginBottom: isMobile ? '28px' : '24px' }}>
              <label style={{
                display: 'block',
                fontSize: isMobile ? '0.938rem' : '0.875rem',
                fontWeight: 600,
                marginBottom: isMobile ? '10px' : '8px',
                color: '#374151'
              }}>
                {L('Password', 'รหัสผ่าน')} <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={L('Enter password', 'กรอกรหัสผ่าน')}
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    fontSize: '16px',
                    padding: isMobile ? '14px 52px 14px 16px' : '12px 44px 12px 14px',
                    border: '2px solid #d1d5db',
                    borderRadius: '10px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    WebkitAppearance: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: isMobile ? 14 : 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    padding: isMobile ? '8px' : '4px',
                    display: 'flex',
                    alignItems: 'center',
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  {showPassword ? <EyeOff size={isMobile ? 20 : 18} /> : <Eye size={isMobile ? 20 : 18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: isMobile ? '16px 24px' : '14px 24px',
                fontSize: isMobile ? '1.063rem' : '1rem',
                fontWeight: 700,
                color: 'white',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%)',
                border: 'none',
                borderRadius: '10px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                marginBottom: '12px',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                boxShadow: loading ? 'none' : '0 4px 15px rgba(255, 107, 53, 0.4)',
                transform: 'translateY(0)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #ff8c42 0%, #ffa600 100%)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 107, 53, 0.5)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 107, 53, 0.4)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }
              }}
            >
              {loading ? L('Logging in...', 'กำลังเข้าสู่ระบบ...') : L('Login', 'เข้าสู่ระบบ')}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              style={{
                width: '100%',
                padding: isMobile ? '16px 24px' : '14px 24px',
                fontSize: isMobile ? '1.063rem' : '1rem',
                fontWeight: 600,
                color: '#374151',
                background: 'white',
                border: '2px solid #d1d5db',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f3f4f6'
                e.currentTarget.style.borderColor = '#9ca3af'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white'
                e.currentTarget.style.borderColor = '#d1d5db'
              }}
            >
              {L('Cancel', 'ยกเลิก')}
            </button>
          </form>
        </div>

        <div style={{
          padding: isMobile ? '16px 20px' : '20px 32px',
          background: '#f9fafb',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: isMobile ? '0.688rem' : '0.75rem',
            color: '#6b7280',
            margin: 0,
            lineHeight: 1.4
          }}>
            {L('K Energy Save Co., Ltd. - Thailand Branch', 'K Energy Save Co., Ltd. - สาขาประเทศไทย')}
          </p>
        </div>
      </div>
    </div>
  )
}
