"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [site, setSite] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate site - only allow "thailand" or "admin"
    const siteLower = site.toLowerCase().trim()
    if (siteLower !== 'thailand' && siteLower !== 'admin') {
      setError('Access allowed only for Thailand or Admin sites')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, site })
      })

      const data = await res.json()

      console.log('🔍 Login response:', data)

      if (!res.ok || data.error) {
        setError(data.error || 'Login failed')
        return
      }

      // Check user's site from response data
      const userSite = (data.site || '').toLowerCase().trim()
      const userTypeID = parseInt(data.typeID) // Convert to number

      // Show success notification
      try {
        const toast = document.createElement('div')
        toast.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px 24px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          z-index: 9999;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 14px;
          animation: slideIn 0.3s ease-out;
        `
        toast.innerHTML = `
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="font-size: 24px;">✅</div>
            <div>
              <div style="font-weight: 600; margin-bottom: 4px;">Login Successful!</div>
              <div style="font-size: 13px; opacity: 0.95;">Welcome ${data.username} from ${userSite}</div>
            </div>
          </div>
        `
        document.body.appendChild(toast)

        // Add animation
        const style = document.createElement('style')
        style.textContent = `
          @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `
        document.head.appendChild(style)

        // Remove after 3 seconds
        setTimeout(() => {
          toast.style.animation = 'slideIn 0.3s ease-out reverse'
          setTimeout(() => toast.remove(), 300)
        }, 3000)
      } catch(_) {}

      console.log('🔍 Full response data:', JSON.stringify(data))
      console.log('🔍 User site:', userSite, 'typeID:', userTypeID, 'typeID type:', typeof userTypeID)

      // Allow specific republic korea users (pavinee, admin) to access
      const allowedRepublicKoreaUsers = ['pavinee', 'admin']
      const isAllowedRepublicKorea = userSite === 'republic korea' && allowedRepublicKoreaUsers.includes(data.username)

      // Verify user's site is thailand, admin, or allowed republic korea user
      if (userSite !== 'thailand' && userSite !== 'admin' && !isAllowedRepublicKorea) {
        console.log('❌ Dashboard check failed:', userSite, 'username:', data.username)
        setError('This account is not authorized to access the Thailand system')
        return
      }

      // Store user data and token
      localStorage.setItem('k_system_admin_user', JSON.stringify({
        userId: data.userId,
        username: data.username,
        name: data.name,
        email: data.email,
        site: data.site,
        typeID: userTypeID
      }))
      localStorage.setItem('k_system_admin_token', data.token || '')

      console.log('🔍 About to redirect - dashboard:', userSite, 'typeID:', userTypeID)

      // Redirect based on typeID and site
      // 1. Admin users (typeID 1,2) always go to dashboard
      if (userTypeID === 1 || userTypeID === 2) {
        console.log('✅ Redirecting to Thailand dashboard (Admin)')
        router.push('/Thailand/Admin-Login/dashboard')
        return
      }

      // 2. Allow specific users to access dashboard
      if (userTypeID === 0) {
        // pavinee and admin (republic korea) - full access to dashboard
        if (isAllowedRepublicKorea) {
          console.log('✅ Allowing Republic Korea user full access to dashboard')
          router.push('/Thailand/Admin-Login/dashboard')
          return
        }

        // user (thailand) - access to dashboard
        if (userSite === 'thailand' && data.username === 'user') {
          console.log('✅ Allowing Thailand user "user" access to dashboard')
          router.push('/Thailand/Admin-Login/dashboard')
          return
        }

        // testuser and other users - redirect to sites
        console.log('⚠️ User not authorized for dashboard - redirecting to dashboard')
        router.push('/Thailand/Admin-Login/dashboard')
        return
      }

      // Fallback
      console.log('⚠️ Fallback - redirecting to dashboard')
      router.push('/Thailand/Admin-Login/dashboard')
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: 20
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        padding: 40,
        maxWidth: 450,
        width: '100%'
      }}>
        {/* Company Logo and Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/k-energy-save-logo.jpg" alt="K Energy Save Logo" style={{ width: 72, height: 'auto', margin: '0 auto 12px', display: 'block' }} />
          <div style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#1f2937',
            marginBottom: 8
          }}>
            K Energy Save Co., Ltd.
          </div>
          <div style={{ fontSize: 16, color: '#6b7280', marginBottom: 4 }}>
            K Energy Save Co., Ltd.
          </div>
          <div style={{ fontSize: 14, color: '#9ca3af', marginTop: 4 }}>
            Thailand Branch
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          padding: '16px 24px',
          borderRadius: 8,
          marginTop: 24,
          marginBottom: 24,
          textAlign: 'center'
        }}>
          <h2 style={{ margin: 0, color: '#fff', fontSize: 24, fontWeight: 700 }}>
            Management System
          </h2>
          <div style={{ fontSize: 14, color: '#e5e7eb', marginTop: 4 }}>
            Management System Login
          </div>
        </div>

        {error && (
          <div style={{
            padding: 12,
            background: '#fee2e2',
            color: '#b91c1c',
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 14
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6, color: '#374151' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 15,
                border: '1px solid #d1d5db',
                borderRadius: 6,
                outline: 'none'
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#374151' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 15,
                borderRadius: 6,
                border: '1px solid #d1d5db',
                outline: 'none'
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#374151' }}>
              Site <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <select
              value={site}
              onChange={(e) => setSite(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 15,
                borderRadius: 6,
                border: '1px solid #d1d5db',
                outline: 'none',
                cursor: 'pointer',
                background: '#fff'
              }}
              required
            >
              <option value="">-- เลือก Site --</option>
              <option value="thailand">Thailand</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#fff',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
              marginTop: 8
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
