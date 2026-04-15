"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Button from '../../components/ui/Button'
import { useRouter } from 'next/navigation'

export default function AdminMainPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  // R&D Portal local state (inline editor + login)
  const [rdOpen, setRdOpen] = useState(false)
  const [rdUsername, setRdUsername] = useState('')
  const [rdPassword, setRdPassword] = useState('')
  const [rdLoading, setRdLoading] = useState(false)
  const [rdError, setRdError] = useState<string | null>(null)
  const [rdToken, setRdToken] = useState<string | null>(null)
  const [rdCode, setRdCode] = useState<string>('// write your test code here')
  const [rdOutput, setRdOutput] = useState<string | null>(null)
  const [showZoom, setShowZoom] = useState(false)
  const [zoomUrl, setZoomUrl] = useState('')

  useEffect(() => {
    try {
      const t = localStorage.getItem('k_system_admin_token')
      setToken(t)
    } catch (err) {
      console.error('Failed to read token', err)
      setToken(null)
    } finally {
      setChecking(false)
    }
  }, [])

  function handleLogout() {
    try {
      localStorage.removeItem('k_system_admin_token')
    } catch (err) {
      console.error('Failed to remove token', err)
    }
    router.push('/admin/LoginMain')
  }

  function handleOpenZoom() {
    const defaultZoomUrl = 'https://zoom.us/j/YOUR_MEETING_ID'
    setZoomUrl(defaultZoomUrl)
    setShowZoom(true)
  }

  function handleCloseZoom() {
    setShowZoom(false)
    setZoomUrl('')
  }

  if (checking) {
    return <div style={{ padding: 24 }}>Loading admin...</div>
  }

  // Allow this admin main page to be viewable even when there's no token present.
  // Previously the page redirected unauthenticated users to the login page;
  // we intentionally keep the page visible per user request.

  return (
    <div style={{ padding: 20 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h1 style={{ margin: 0, fontSize: 46, fontWeight: 800, textAlign: 'center', flex: 1 }}>Admin System</h1>

        <div style={{ marginLeft: 12 }}>
          <Button variant="danger" onClick={() => router.push('/admin/LoginMain')}>Sign out</Button>
        </div>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: 32, marginLeft: '-5ch' }}>K Energy Save co., Ltd</div>
          <div style={{ fontSize: 22, color: '#6b7280' }}>Address : 1114,27 Dunchon-daero 457beon-gil, Jungwon-gu, Seongnam-si, Gyeonggi-do, Republic of korea</div>
        </div>
      </div>

      <p style={{ color: '#6b7280', textAlign: 'left', fontSize: 24 }}>You are signed in as an admin. Use the links below to manage the system.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 60 }}>
        <Link href="/" style={{ display: 'block', padding: 18, borderRadius: 14, background: '#fff', border: '1px solid #e6eefb', textDecoration: 'none', color: '#111827' }}>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="7" width="20" height="10" rx="2" stroke="#2563eb" strokeWidth="1.5" fill="#eff6ff" />
              <circle cx="8" cy="12" r="1.8" fill="#2563eb" />
              <circle cx="16" cy="12" r="1.8" fill="#2563eb" />
            </svg>
            <div>
                  <div style={{ fontWeight: 600, fontSize: 30, cursor: 'pointer' }}>K-SAVE</div>
                  <div style={{ fontSize: 18, color: '#6b7280' }}>Click For Login System</div>
                </div>
          </div>
            </Link>

        <Link href="/Thailand/Admin-Login" style={{ display: 'block', padding: 16, borderRadius: 10, background: '#fff', border: '1px solid #e6ffef', textDecoration: 'none', color: '#111827' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="6" width="18" height="12" rx="2" stroke="#10b981" strokeWidth="1.5" fill="#ecfdf5" />
              <path d="M7 10h10" stroke="#10b981" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M7 14h6" stroke="#10b981" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <div>
              <div style={{ fontWeight: 600, fontSize: 30 }}>Thailand Admin</div>
              <div style={{ fontSize: 18, color: '#6b7280' }}>Login Thailand System</div>
            </div>
          </div>
        </Link>

        <Link href="/admin/add-machine" style={{ display: 'block', padding: 16, borderRadius: 10, background: '#fff', border: '1px solid #fff7ed', textDecoration: 'none', color: '#111827' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="4" width="16" height="12" rx="2" stroke="#f59e0b" strokeWidth="1.5" fill="#fff7ed" />
              <path d="M8 16v2" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M16 16v2" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div>
              <div style={{ fontWeight: 600, fontSize: 30 }}>System 3</div>
              <div style={{ fontSize: 18, color: '#6b7280' }}>Click For Login System</div>
            </div>
          </div>
        </Link>

        <Link href="/admin/main/report" style={{ display: 'block', padding: 16, borderRadius: 10, background: '#fff', border: '1px solid #eef2ff', textDecoration: 'none', color: '#111827' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#6b7280" strokeWidth="1.2" fill="#f8fafc" />
              <path d="M7 14h3v3H7zM11 10h3v7h-3zM15 7h3v10h-3z" fill="#6b7280" />
            </svg>
            <div>
              <div style={{ fontWeight: 600, fontSize: 30 }}>System 4</div>
              <div style={{ fontSize: 18, color: '#6b7280' }}>Click For Login System</div>
            </div>
          </div>
        </Link>
      </div>

      <div style={{ marginTop: 18 }}>
        <h4 style={{ marginBottom: 8, fontSize: 18 }}>Zoom Meeting</h4>
        <button
          onClick={handleOpenZoom}
          style={{
            display: 'inline-block',
            background: '#2563eb',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: 6,
            border: 'none',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s',
            marginRight: 12
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#2563eb'}
        >
          🎥 Join Zoom Meeting
        </button>
      </div>

      <div style={{ marginTop: 20, borderTop: '1px solid #eef2ff', paddingTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0,fontSize: 34 }}>R&D Portal</h3>
        </div>
    </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 60 }}>
        <Link href="/admin/rd-login" style={{ display: 'block', padding: 18, borderRadius: 14, background: '#fff', border: '1px solid #e6eefb', textDecoration: 'none', color: '#111827' }}>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="7" width="20" height="10" rx="2" stroke="#2563eb" strokeWidth="1.5" fill="#eff6ff" />
              <circle cx="8" cy="12" r="1.8" fill="#2563eb" />
              <circle cx="16" cy="12" r="1.8" fill="#2563eb" />
            </svg>
            <div>
                  <div style={{ fontWeight: 600, fontSize: 30, cursor: 'pointer' }}>K-SAVE R&D</div>
                  <div style={{ fontSize: 18, color: '#6b7280' }}>Click For Login System</div>
                </div>
          </div>
            </Link>

        <Link href="/admin/tokens" style={{ display: 'block', padding: 16, borderRadius: 10, background: '#fff', border: '1px solid #e6ffef', textDecoration: 'none', color: '#111827' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="6" width="18" height="12" rx="2" stroke="#10b981" strokeWidth="1.5" fill="#ecfdf5" />
              <path d="M7 10h10" stroke="#10b981" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M7 14h6" stroke="#10b981" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <div>
              <div style={{ fontWeight: 600, fontSize: 30 }}>Thailand Admin R&D</div>
              <div style={{ fontSize: 18, color: '#6b7280' }}>Click For Login System</div>
            </div>
          </div>
        </Link>

        <Link href="/admin/add-machine" style={{ display: 'block', padding: 16, borderRadius: 10, background: '#fff', border: '1px solid #fff7ed', textDecoration: 'none', color: '#111827' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="4" width="16" height="12" rx="2" stroke="#f59e0b" strokeWidth="1.5" fill="#fff7ed" />
              <path d="M8 16v2" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M16 16v2" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div>
              <div style={{ fontWeight: 600, fontSize: 30 }}>System 3 R&D</div>
              <div style={{ fontSize: 18, color: '#6b7280' }}>Click For Login System</div>
            </div>
          </div>
        </Link>

        <Link href="/admin/AdminKsave" style={{ display: 'block', padding: 16, borderRadius: 10, background: '#fff', border: '1px solid #eef2ff', textDecoration: 'none', color: '#111827' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#6b7280" strokeWidth="1.2" fill="#f8fafc" />
              <path d="M7 14h3v3H7zM11 10h3v7h-3zM15 7h3v10h-3z" fill="#6b7280" />
            </svg>
            <div>
              <div style={{ fontWeight: 600, fontSize: 30 }}>System 4 R&D</div>
              <div style={{ fontSize: 18, color: '#6b7280' }}>Click For Login System</div>
            </div>
          </div>
        </Link>
      </div>

      {/* Zoom Meeting Modal */}
      {showZoom && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseZoom()
            }
          }}
        >
          {/* Modal Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            background: '#2D8CFF',
            color: '#fff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.8 4.8c-.6-.45-1.35-.3-1.95.15L16.5 8.4V6c0-1.65-1.35-3-3-3H3c-1.65 0-3 1.35-3 3v12c0 1.65 1.35 3 3 3h10.5c1.65 0 3-1.35 3-3v-2.4l4.35 3.45c.3.3.6.45 1.05.45.3 0 .45 0 .75-.15.6-.45 1.05-1.05 1.05-1.8V6.6c0-.75-.3-1.35-.9-1.8z"/>
              </svg>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                Zoom Meeting
              </h2>
            </div>
            <button
              onClick={handleCloseZoom}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: '#fff',
                fontSize: 24,
                width: 40,
                height: 40,
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
              }}
              title="Close (ESC)"
            >
              ✕
            </button>
          </div>

          {/* Zoom iframe */}
          <iframe
            src={zoomUrl}
            style={{
              flex: 1,
              width: '100%',
              border: 'none',
              background: '#000'
            }}
            title="Zoom Meeting"
            allow="camera; microphone; fullscreen; speaker; display-capture"
          />
        </div>
      )}
      </div>
  )
}