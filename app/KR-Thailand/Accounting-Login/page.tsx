"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

export default function AccountingLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
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

    // Listen for language changes
    const handleLangChange: EventListener = (event) => {
      const newLang = (event as CustomEvent<string>).detail
      if (newLang === 'en' || newLang === 'th') setLocale(newLang)
    }
    const handleLocaleChange: EventListener = (event) => {
      const detail = (event as CustomEvent<{ locale?: string }>).detail
      if (detail?.locale === 'en' || detail?.locale === 'th') {
        setLocale(detail.locale)
      }
    }
    window.addEventListener('k-system-lang', handleLangChange)
    window.addEventListener('locale-changed', handleLocaleChange)
    return () => {
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
      // Superadmin shortcut
      if (username === 'ksystem' && password === 'Ksave2025Admin') {
        router.push('/Thailand/Accounting-Login/dashboard')
        setLoading(false)
        return
      }

      // Authenticate via API (no site check for Thailand Accounting Login)
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setError('invalid_credentials')
        setLoading(false)
        return
      }

      const userTypeID = parseInt(data.typeID)
      const allowedTypes = [18, 9, 4, 11]

      if (!allowedTypes.includes(userTypeID)) {
        setError('access_denied')
        setLoading(false)
        return
      }

      // Store session
      try {
        localStorage.setItem('user_id', String(data.userID || data.userId || ''))
        localStorage.setItem('username', data.username || username)
        localStorage.setItem('fullname', data.name || data.fullname || '')
        localStorage.setItem('typeID', String(userTypeID))
        localStorage.setItem('site', data.site || 'thailand')
        localStorage.setItem('token', data.token || '')
        localStorage.setItem('locale', locale)
      } catch {}

      router.push('/Thailand/Accounting-Login/dashboard')
    } catch {
      setError('invalid_credentials')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxWidth: '500px',
        width: '100%',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'relative',
          textAlign: 'center',
          padding: '40px 20px 32px',
          background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)'
        }}>
          {/* Language Switcher */}
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            display: 'flex',
            gap: '6px',
            background: 'rgba(255,255,255,0.15)',
            padding: '6px',
            borderRadius: '10px',
            backdropFilter: 'blur(10px)'
          }}>
            <button
              type="button"
              onClick={() => handleLanguageChange('en')}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                background: locale === 'en' ? 'rgba(255,255,255,0.95)' : 'transparent',
                color: locale === 'en' ? '#2563eb' : 'rgba(255,255,255,0.9)',
                fontSize: '0.813rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('th')}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                background: locale === 'th' ? 'rgba(255,255,255,0.95)' : 'transparent',
                color: locale === 'th' ? '#2563eb' : 'rgba(255,255,255,0.9)',
                fontSize: '0.813rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              ไทย
            </button>
          </div>

          <div style={{
            width: 80,
            height: 80,
            margin: '0 auto 20px',
            borderRadius: '50%',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: 'white',
            marginBottom: '8px'
          }}>
            {L('Accounting System', 'ระบบงบดุล')}
          </h1>
          <p style={{
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.9)'
          }}>
            {L('Login to access accounting system', 'เข้าสู่ระบบงบดุล')}
          </p>
        </div>

        <div style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                padding: '12px 14px',
                marginBottom: '20px',
                borderRadius: 8,
                color: '#7f1d1d',
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                fontSize: '0.875rem',
                lineHeight: '1.4'
              }}>
                ⚠ {error === 'invalid_credentials'
                  ? L('Invalid username or password', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
                  : error === 'access_denied'
                  ? L('Access denied. This login is for accounting staff only.', 'ไม่มีสิทธิ์เข้าใช้งาน สำหรับพนักงานบัญชีเท่านั้น')
                  : error}
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: '8px',
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
                autoFocus
                style={{
                  width: '100%',
                  fontSize: '16px',
                  padding: '12px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: '8px',
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
                  style={{
                    width: '100%',
                    fontSize: '16px',
                    padding: '12px 44px 12px 14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px 24px',
                fontSize: '1rem',
                fontWeight: 600,
                color: 'white',
                background: loading ? '#9ca3af' : '#2563eb',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                marginBottom: '12px'
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#1d4ed8')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#2563eb')}
            >
              {loading ? L('Logging in...', 'กำลังเข้าสู่ระบบ...') : L('Login', 'เข้าสู่ระบบ')}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              style={{
                width: '100%',
                padding: '14px 24px',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#374151',
                background: 'white',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
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
          padding: '20px 32px',
          background: '#f9fafb',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            margin: 0
          }}>
            {L('K Energy Save Co., Ltd. - Thailand Branch', 'K Energy Save Co., Ltd. - สาขาประเทศไทย')}
          </p>
        </div>
      </div>
    </div>
  )
}
