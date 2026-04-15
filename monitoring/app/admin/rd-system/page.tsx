"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RDSystemPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [connectingDevice, setConnectingDevice] = useState<string | null>(null)
  const [showZoom, setShowZoom] = useState(false)
  const [zoomUrl, setZoomUrl] = useState('')

  useEffect(() => {
    try {
      const token = localStorage.getItem('k_system_rd_token')
      if (token) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        router.replace('/admin/rd-login')
      }
    } catch (error) {
      console.error('Authentication check failed:', error)
      setIsAuthenticated(false)
      router.replace('/admin/rd-login')
    }
  }, [router])

  function handleLogout() {
    try {
      localStorage.removeItem('k_system_rd_token')
    } catch (err) {
      console.error('Failed to remove token', err)
    }
    router.push('/admin/rd-login')
  }

  function handleConnectVNC(device: string, url: string) {
    // Show connecting message
    setConnectingDevice(device)

    // Open VNC Viewer application directly using vnc:// protocol
    // Create a temporary anchor element to trigger the VNC protocol handler
    const link = document.createElement('a')
    link.href = url
    link.target = '_blank'
    link.click()

    // Hide connecting message after 2 seconds
    setTimeout(() => {
      setConnectingDevice(null)
    }, 2000)
  }

  function handleOpenZoom() {
    // Default Zoom meeting URL (you can change this)
    const defaultZoomUrl = 'https://zoom.us/j/your-meeting-id'
    setZoomUrl(defaultZoomUrl)
    setShowZoom(true)
  }

  function handleCloseZoom() {
    setShowZoom(false)
    setZoomUrl('')
  }

  // RealVNC Connect protocol URLs for each KSave device
  // Opens VNC Viewer application installed on the device
  const remoteLinks = {
    'KSAVE01': 'vnc://172.20.24.10:5900',
    'KSAVE02': 'vnc://172.20.24.10:5901',
    'KSAVE03': 'vnc://172.20.24.10:5902',
    'KSAVE04': 'vnc://172.20.24.10:5903',
    'KSAVE05': 'vnc://172.20.24.10:5904'
  }

  if (isAuthenticated === null) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f8fafc'
      }}>
        <div>Checking authentication...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f8fafc'
      }}>
        <div>Redirecting to login...</div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: 20
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <header style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: 40,
          background: 'rgba(255,255,255,0.95)',
          padding: '20px 32px',
          borderRadius: 16,
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: 36, 
              fontWeight: 800,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              K-SAVE R&D System
            </h1>
            <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: 16 }}>
              Remote Access Portal for KSave Devices
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={handleOpenZoom}
              style={{
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 600,
                color: '#fff',
                background: '#2D8CFF',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2563eb'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#2D8CFF'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M15.2 3.2c-.4-.3-.9-.2-1.3.1L11 5.6V4c0-1.1-.9-2-2-2H2C.9 2 0 2.9 0 4v8c0 1.1.9 2 2 2h7c1.1 0 2-.9 2-2v-1.6l2.9 2.3c.2.2.4.3.7.3.2 0 .3 0 .5-.1.4-.3.7-.7.7-1.2V4.4c0-.5-.2-.9-.6-1.2z"/>
              </svg>
              Zoom Meeting
            </button>
            <button
              onClick={() => router.push('/admin')}
              style={{
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 600,
                color: '#667eea',
                background: '#fff',
                border: '2px solid #667eea',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#eff6ff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff'
              }}
            >
              ← Back to Admin
            </button>
            <button
              onClick={handleLogout}
              style={{
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 600,
                color: '#fff',
                background: '#ef4444',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#dc2626'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ef4444'
              }}
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Remote Access Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24
        }}>
          {Object.entries(remoteLinks).map(([device, url]) => (
            <div
              key={device}
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: 32,
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                {/* Device Icon */}
                <div style={{
                  width: 80,
                  height: 80,
                  margin: '0 auto 20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
                }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="6" width="20" height="12" rx="2" stroke="#fff" strokeWidth="2" />
                    <circle cx="7" cy="12" r="1.5" fill="#fff" />
                    <circle cx="12" cy="12" r="1.5" fill="#fff" />
                    <circle cx="17" cy="12" r="1.5" fill="#fff" />
                    <path d="M8 18h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>

                {/* Device Name */}
                <h2 style={{
                  fontSize: 28,
                  fontWeight: 800,
                  margin: '0 0 12px 0',
                  color: '#111827'
                }}>
                  {device}
                </h2>

                <p style={{
                  color: '#6b7280',
                  fontSize: 14,
                  margin: '0 0 24px 0'
                }}>
                  Remote Access Control
                </p>

                {/* Remote Button */}
                <button
                  onClick={() => handleConnectVNC(device, url)}
                  style={{
                    display: 'inline-block',
                    width: '100%',
                    padding: '14px 24px',
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#fff',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: 10,
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)'
                  }}
                >
                  🖥️ Connect Remote
                </button>

                {/* Status Indicator */}
                <div style={{
                  marginTop: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#10b981',
                    boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)'
                  }} />
                  <span style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>
                    Ready
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div style={{
          marginTop: 40,
          padding: 24,
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 16,
          textAlign: 'center',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0, color: '#9ca3af', fontSize: 13 }}>
            K Energy Save Co., Ltd - R&D Portal © 2025
          </p>
        </div>
      </div>

      {/* Connecting Notification */}
      {connectingDevice && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10000,
          background: 'rgba(0, 0, 0, 0.9)',
          color: '#fff',
          padding: '32px 48px',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          textAlign: 'center',
          minWidth: 320
        }}>
          {/* Loading Spinner */}
          <div style={{
            width: 48,
            height: 48,
            margin: '0 auto 20px',
            border: '4px solid rgba(255,255,255,0.2)',
            borderTop: '4px solid #fff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />

          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>

          <h3 style={{ margin: '0 0 8px 0', fontSize: 20, fontWeight: 700 }}>
            Connecting to {connectingDevice}
          </h3>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
            Opening VNC Viewer...
          </p>
        </div>
      )}

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
