"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

export default function LearningLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const allowedLearningUserIds = new Set([19, 20, 21])
  const allowedLearningEmails = new Set([
    'sinad270@gmail.com',
    'thissana.nhoowhong@gmail.com',
    'yodin.thanida@gmail.com'
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Keep legacy account for backward compatibility
      if (username === 'learning' && password === 'learning2025') {
        router.push('/admin/main/learning-main')
        return
      }

      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, pageName: '/admin/main/learning-login' })
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || 'Invalid username or password')
        return
      }

      const userId = Number(data.userId)
      const email = (data.email || '').toString().trim().toLowerCase()
      const usernameValue = (data.username || '').toString().trim().toLowerCase()
      const deptID = (data.departmentID || '').toString().trim()
      const isGlobalAllowed = Boolean(data.superAccess) || usernameValue === 'pavinee' || deptID === 'Executive'
      const isAllowedUser = isGlobalAllowed || allowedLearningUserIds.has(userId) || allowedLearningEmails.has(email)

      if (!isAllowedUser) {
        setError('This account is not authorized for Learning & Training System')
        return
      }

      localStorage.setItem('k_system_admin_user', JSON.stringify({
        userId: data.userId,
        username: data.username,
        name: data.name,
        email: data.email,
        site: data.site,
        typeID: Number(data.typeID),
        departmentID: data.departmentID || ''
      }))
      localStorage.setItem('k_system_admin_token', data.token || '')

      router.push('/admin/main/learning-main')
    } catch (err: any) {
      setError(err?.message || 'Connection error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f0f4f8 0%, #e2e8f0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 500, width: '100%', margin: '0 24px' }}>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', padding: '40px 40px 32px' }}>
            <div style={{
              width: 80,
              height: 80,
              margin: '0 auto 20px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Learning & Training System</h2>
            <p style={{ margin: 0, fontSize: 14, color: '#94a3b8' }}>Login to access learning resources</p>
          </div>

          {/* Body */}
          <div style={{ padding: '0 40px 40px' }}>
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{
                  padding: '12px 16px',
                  marginBottom: '16px',
                  borderRadius: 8,
                  color: '#7f1d1d',
                  background: '#fee2e2',
                  border: '1px solid #fca5a5',
                  fontSize: 14
                }}>
                  ⚠ {error}
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                  Username <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter username"
                  autoFocus
                  onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                  Password <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 44px 12px 16px',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      fontSize: 14,
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Enter password"
                    onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
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

              <div style={{ display: 'flex', gap: 12, paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    borderRadius: 8,
                    border: 'none',
                    background: loading ? '#94a3b8' : '#6366f1',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => !loading && (e.currentTarget.style.background = '#4f46e5')}
                  onMouseOut={(e) => !loading && (e.currentTarget.style.background = '#6366f1')}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  style={{
                    padding: '12px 24px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    color: '#64748b',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#f8fafc'
                    e.currentTarget.style.borderColor = '#cbd5e1'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#fff'
                    e.currentTarget.style.borderColor = '#e2e8f0'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
