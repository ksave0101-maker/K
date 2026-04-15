"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('9999')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Call the API to authenticate
      const res = await fetch('/api/admin_route/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || 'Invalid username or password')
        setLoading(false)
        return
      }

      // Store token and user data
      localStorage.setItem('k_system_admin_token', data.token || '')
      localStorage.setItem('k_system_admin_user', JSON.stringify({
        userId: data.userId,
        username: data.username,
        name: data.name,
        typeID: data.typeID
      }))

      console.log('✅ Admin login successful')

      // Redirect to admin main page
      router.push('/admin/main')
    } catch (err: any) {
      console.error('❌ Login error:', err)
      setError(err.message || 'Failed to connect to server')
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      {/* Background Pattern */}
      <div style={styles.bgPattern}></div>

      {/* Animated Background Gradient */}
      <div style={styles.bgGradient}></div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={styles.formContainer}>
        {/* Logo/Icon */}
        <div style={styles.logoContainer}>
          <div style={styles.logoCircle}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7v10c0 5.5 3.8 10.7 10 12 6.2-1.3 10-6.5 10-12V7l-10-5z"
                    fill="url(#gradient)" stroke="#2563eb" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="gradient" x1="2" y1="2" x2="22" y2="22">
                  <stop offset="0%" stopColor="#3b82f6"/>
                  <stop offset="100%" stopColor="#2563eb"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 style={styles.title}>Admin System Login</h1>
        <p style={styles.subtitle}>Enter your credentials to access the admin panel</p>

        {/* Form */}
        <form onSubmit={submit} style={styles.form}>
          {/* Username Field */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 8 }}>
                <circle cx="12" cy="8" r="4" stroke="#6b7280" strokeWidth="2"/>
                <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              placeholder="Enter your username"
              required
            />
          </div>

          {/* Password Field */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 8 }}>
                <rect x="5" y="11" width="14" height="10" rx="2" stroke="#6b7280" strokeWidth="2"/>
                <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1" fill="#6b7280"/>
              </svg>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div style={styles.errorBox}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 8, flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" fill="#fee2e2"/>
                <path d="M12 8v4m0 4h.01" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Buttons */}
          <div style={styles.buttonGroup}>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitButton,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                       style={{ marginRight: 8, animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="3" strokeDasharray="60" strokeLinecap="round"/>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 8 }}>
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M10 17l5-5-5-5m5 5H3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Sign in
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setUsername(''); setPassword(''); setError(null); }}
              style={styles.resetButton}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 8 }}>
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/>
                <path d="M3 3v5h5" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Reset
            </button>
          </div>
        </form>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            K Energy Save Co., Ltd. © 2026
          </p>
        </div>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden'
  },
  bgPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    opacity: 0.3
  } as React.CSSProperties,
  bgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.8))',
    backgroundSize: '400% 400%',
    animation: 'gradientShift 15s ease infinite'
  } as React.CSSProperties,
  formContainer: {
    width: '100%',
    maxWidth: '480px',
    background: '#ffffff',
    borderRadius: '24px',
    padding: '48px 40px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 100px rgba(102, 126, 234, 0.2)',
    position: 'relative',
    zIndex: 1,
    animation: 'slideUp 0.6s ease-out'
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '32px',
    animation: 'float 3s ease-in-out infinite'
  },
  logoCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #e0e7ff 0%, #ddd6fe 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.2)'
  },
  title: {
    fontSize: '32px',
    fontWeight: 800,
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: '8px',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: '40px',
    lineHeight: '1.5'
  },
  form: {
    width: '100%'
  },
  inputGroup: {
    marginBottom: '24px'
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '15px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '10px'
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 16px',
    background: '#fef2f2',
    border: '2px solid #fecaca',
    borderRadius: '12px',
    color: '#dc2626',
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '24px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '32px'
  },
  submitButton: {
    flex: 1,
    padding: '16px 24px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 700,
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'inherit'
  },
  resetButton: {
    padding: '16px 24px',
    background: '#f8fafc',
    color: '#64748b',
    fontSize: '16px',
    fontWeight: 600,
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'inherit'
  },
  footer: {
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid #e5e7eb',
    textAlign: 'center'
  },
  footerText: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: 0
  }
}
