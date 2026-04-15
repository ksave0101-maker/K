"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

export default function KoreaAdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, pageName: '/Korea/Admin-Login' })
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || 'Login failed')
        return
      }

      const userTypeID = parseInt(data.typeID)

      // Show success notification
      try {
        const toast = document.createElement('div')
        toast.style.cssText = `
          position: fixed; top: 20px; right: 20px;
          background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
          color: white; padding: 16px 24px; border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 9999;
          font-family: system-ui, -apple-system, sans-serif; font-size: 14px;
          animation: slideIn 0.3s ease-out;
        `
        toast.innerHTML = `
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="font-size: 24px;">✅</div>
            <div>
              <div style="font-weight: 600; margin-bottom: 4px;">Login Successful!</div>
              <div style="font-size: 13px; opacity: 0.95;">Welcome ${data.username} - Korea Admin</div>
            </div>
          </div>
        `
        document.body.appendChild(toast)
        const style = document.createElement('style')
        style.textContent = `@keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`
        document.head.appendChild(style)
        setTimeout(() => { toast.style.animation = 'slideIn 0.3s ease-out reverse'; setTimeout(() => toast.remove(), 300) }, 3000)
      } catch (_) {}

      const deptID = data.departmentID || ''

      // Map departmentID → URL slug for /login/[department]
      const userId = data.userId

      // Super users (admin userId 1/7, typeID 4/7) → executive
      const isSuperUser = userId === 1 || userId === 7 || userTypeID === 4 || userTypeID === 7

      const deptToSlug: Record<string, string> = {
        'Executive':           'executive',
        'Admin':               'executive',
        'CRM':                 'executive',
        'HR':                  'hr',
        'Production':          'production',
        'InternationalMarket': 'international-market',
        'DomesticMarket':      'domestic-market',
        'QualityControl':      'quality-control',
        'AfterSales':          'after-sales',
        'Maintenance':         'maintenance',
        'RnD':                 'research-development',
        'Logistics':           'logistics',
        'Branch Manager':      'executive',
        'CustomerMgmt':        'customers',
        'Translator':          'translator',
        'AIAssistant':         'ai-assistant',
        'BruneiChat':          'chat-brunei',
        'VietnamChat':         'chat-vietnam',
      }
      const slug = isSuperUser ? 'executive' : deptToSlug[deptID]
      const redirectPath = '/korea-main'

      // Store user data and token
      localStorage.setItem('k_system_admin_user', JSON.stringify({
        userId: data.userId,
        username: data.username,
        name: data.name,
        email: data.email,
        site: data.site,
        typeID: userTypeID,
        departmentID: deptID
      }))
      localStorage.setItem('k_system_admin_token', data.token || '')

      router.push(redirectPath)
    } catch (e: any) {
      setError(e.message || 'Connection error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
      padding: 20
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
        padding: 40,
        maxWidth: 450,
        width: '100%'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 80, height: 80, borderRadius: 12, overflow: 'hidden', margin: '0 auto 14px', border: '2px solid #e2e8f0', background: '#fff' }}>
            <img src="/k-energy-save-logo.jpg" alt="K Energy Save Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', padding: 4 }} />
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#1f2937', letterSpacing: '-0.02em' }}>
            K Energy Save Co., Ltd.
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#4b5563', marginTop: 2 }}>
            (Group of Zera)
          </div>
          <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>
            Republic of Korea - Headquarters
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #374151, #4b5563)',
          padding: '18px 24px',
          borderRadius: 12,
          marginBottom: 24,
          textAlign: 'center',
          boxShadow: '0 4px 16px rgba(55,65,81,0.25)'
        }}>
          <h2 style={{ margin: 0, color: '#fff', fontSize: 22, fontWeight: 800 }}>
            Korea Admin System
          </h2>
          <div style={{ fontSize: 13, color: '#d1d5db', marginTop: 4 }}>
            Korea Headquarters Management Login
          </div>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            background: '#fef2f2',
            color: '#b91c1c',
            borderRadius: 10,
            marginBottom: 16,
            fontSize: 14,
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              style={{
                width: '100%', padding: '11px 14px', fontSize: 15,
                border: '1px solid #e2e8f0', borderRadius: 10, outline: 'none',
                transition: 'border-color 0.2s', boxSizing: 'border-box'
              }}
              onFocus={e => (e.target.style.borderColor = '#6b7280')}
              onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#374151' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                style={{
                  width: '100%', padding: '11px 44px 11px 14px', fontSize: 15,
                  borderRadius: 10, border: '1px solid #e2e8f0', outline: 'none',
                  transition: 'border-color 0.2s', boxSizing: 'border-box'
                }}
                onFocus={e => (e.target.style.borderColor = '#6b7280')}
                onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                required
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

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px', borderRadius: 10,
              fontSize: 16, fontWeight: 700,
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #374151, #4b5563)',
              color: '#fff', border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(55,65,81,0.35)',
              marginTop: 8, transition: 'all 0.2s'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <a
            href="/Korea/Admin-Login"
            style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'none', cursor: 'pointer' }}
            onClick={(e) => { e.preventDefault(); try { (window as any).location.href = '/Korea/Admin-Login' } catch {}}
            }
            onMouseOver={e => (e.currentTarget.style.color = '#4b5563')}
            onMouseOut={e => (e.currentTarget.style.color = '#94a3b8')}
          >
            &larr; Back to Korea Admin
          </a>
        </div>
      </div>
    </div>
  )
}
