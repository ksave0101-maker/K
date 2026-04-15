"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/lib/LocaleContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import CountryFlag from '@/components/CountryFlag'

export default function AdminMainPage() {
  const router = useRouter()
  const { locale } = useLocale()
  const [, setToken] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const [showZoom, setShowZoom] = useState(false)
  const [zoomUrl, setZoomUrl] = useState('')

  // Language helper
  const L = (en: string, ko: string) => {
    if (locale === 'ko') return ko;
    return en;
  }

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
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8' }}>
        <div style={{ padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          {L('Loading admin...', '관리자 로딩 중...')}
        </div>
      </div>
    )
  }

  const systems = [
    {
      title: 'K-SAVE',
      desc: L('Monitoring & IoT System', '모니터링 및 IoT 시스템'),
      href: '/',
      color: '#2563eb',
      bg: '#eff6ff',
      border: '#dbeafe',
      country: 'KR' as const,
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
          <rect x="2" y="7" width="20" height="10" rx="2" fill="#dbeafe"/><circle cx="8" cy="12" r="1.8" fill="#2563eb"/><circle cx="16" cy="12" r="1.8" fill="#2563eb"/>
        </svg>
      )
    },
    {
      title: L('Thailand Admin', '태국 관리자'),
      desc: L('Thailand Branch Management', '태국 지사 관리'),
      href: '/KR-Thailand/Admin-Login',
      color: '#059669',
      bg: '#ecfdf5',
      border: '#d1fae5',
      country: 'TH' as const,
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.5">
          <rect x="3" y="6" width="18" height="12" rx="2" fill="#d1fae5"/><path d="M7 10h10" strokeLinecap="round"/><path d="M7 14h6" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      title: L('Korea Admin', '한국 관리자'),
      desc: L('Korea HQ Management', '한국 본사 관리'),
      href: '/Korea/Admin-Login',
      color: '#b45309',
      bg: '#fffbeb',
      border: '#fef3c7',
      country: 'KR' as const,
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" fill="#fef3c7"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      )
    },
    {
      title: L('LEARNING AND TRAINING', '학습 및 교육'),
      desc: L('Learning & Training System', '학습 및 교육 시스템'),
      href: '/admin/main/learning-login',
      color: '#6366f1',
      bg: '#eef2ff',
      border: '#e0e7ff',
      country: 'KR' as const,
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" fill="#e0e7ff"/><path d="M7 14h3v3H7zM11 10h3v7h-3zM15 7h3v10h-3z" fill="#6366f1"/>
        </svg>
      )
    },
    {
      title: L('SMART FARM', '스마트 팜'),
      desc: L('Smart Farm System', '스마트 팜 시스템'),
      href: '/admin/main/smart-farm-login',
      color: '#16a34a',
      bg: '#f0fdf4',
      border: '#bbf7d0',
      country: 'TH' as const,
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5">
          <rect x="4" y="8" width="16" height="12" rx="2" fill="#bbf7d0"/><path d="M8 8V6c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2" strokeLinecap="round"/><circle cx="12" cy="14" r="2" fill="#16a34a"/><path d="M9 14h6M12 12v4" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      title: L('MARKETING', '마케팅'),
      desc: L('Marketing System', '마케팅 시스템'),
      href: '/admin/main/marketing-login',
      color: '#dc2626',
      bg: '#fef2f2',
      border: '#fecaca',
      country: 'KR' as const,
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5">
          <path d="M11 5L6 9H2v6h4l5 4V5z" fill="#fecaca" strokeLinejoin="round"/><path d="M15.54 8.46a5 5 0 010 7.07M18.07 5.93a9 9 0 010 12.73" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ]

  const cardStyle = (_color: string, _bg: string, border: string): React.CSSProperties => ({
    display: 'block', padding: '20px 22px', borderRadius: 14,
    background: '#fff', border: `1px solid ${border}`,
    textDecoration: 'none', color: '#111827',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    cursor: 'pointer'
  })

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f0f4f8 0%, #e2e8f0 100%)' }}>
      {/* Top Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, overflow: 'hidden', background: '#fff', border: '2px solid rgba(255,255,255,0.2)', flexShrink: 0 }}>
            <img src="/k-energy-save-logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 2 }} />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              {L('Admin System', '관리자 시스템')}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>K Energy Save Co., Ltd. (Group of Zera)</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LanguageSwitcher />
          <button onClick={() => router.push('/admin/LoginMain')} style={{
            padding: '8px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}>
            {L('Sign out', '로그아웃')}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 60%, #3b82f6 100%)',
          borderRadius: 18, padding: '36px 40px', marginBottom: 32, color: '#fff',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(37,99,235,0.25)'
        }}>
          <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', right: 80, bottom: -50, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 12, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 6 }}>
              {L('Admin Control Panel', '관리자 제어판')}
            </div>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>
              Zera co.,ltd {L('(Korea Headquarters)', '(한국 본사)')}
            </h1>
            <div style={{ margin: '8px 0 0', fontSize: 14, opacity: 0.75, maxWidth: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CountryFlag country="KR" size="sm" />
              <span>1114,27 Dunchon-daero 457beon-gil, Jungwon-gu, Seongnam-si, Gyeonggi-do, Republic of Korea</span>
            </div>
            <h2 style={{ margin: '16px 0 0', fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', opacity: 0.9 }}>
              K Energy Save Co., Ltd. {L('(Thailand Branch)', '(태국 지사)')}
            </h2>
            <div style={{ margin: '8px 0 0', fontSize: 14, opacity: 0.75, maxWidth: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CountryFlag country="TH" size="sm" />
              <span>84 Chaloem Phrakiat Rama 9 Soi 34, Nong Bon, Prawet, Bangkok 10250, Thailand</span>
            </div>
          </div>
        </div>

        {/* Systems Section */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{ width: 4, height: 22, borderRadius: 2, background: 'linear-gradient(180deg, #2563eb, #3b82f6)' }} />
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1e293b' }}>
              {L('Systems', '시스템')}
            </h2>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>
              {L('Select a system to login', '로그인할 시스템 선택')}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {systems.map((sys, i) => (
              <Link key={i} href={sys.href} style={cardStyle(sys.color, sys.bg, sys.border)}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${sys.color}18`; e.currentTarget.style.borderColor = sys.color }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = sys.border }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 12, background: sys.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {sys.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: '#1e293b', marginBottom: 2 }}>{sys.title}</div>
                    <div style={{ fontSize: 13, color: '#94a3b8' }}>{sys.desc}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Zoom */}
        <div style={{ marginBottom: 36, background: '#fff', borderRadius: 14, padding: '20px 24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#2563eb"><path d="M22.8 4.8c-.6-.45-1.35-.3-1.95.15L16.5 8.4V6c0-1.65-1.35-3-3-3H3c-1.65 0-3 1.35-3 3v12c0 1.65 1.35 3 3 3h10.5c1.65 0 3-1.35 3-3v-2.4l4.35 3.45c.3.3.6.45 1.05.45.3 0 .45 0 .75-.15.6-.45 1.05-1.05 1.05-1.8V6.6c0-.75-.3-1.35-.9-1.8z"/></svg>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>
                  {L('Zoom Meeting', 'Zoom 미팅')}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  {L('Join or start a meeting', '회의 참가 또는 시작')}
                </div>
              </div>
            </div>
            <button onClick={handleOpenZoom} style={{
              padding: '9px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600,
              background: '#2563eb', color: '#fff', cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseOver={e => (e.currentTarget.style.background = '#1d4ed8')}
            onMouseOut={e => (e.currentTarget.style.background = '#2563eb')}>
              {L('Join Meeting', '회의 참가')}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '20px 0', borderTop: '1px solid #e2e8f0', color: '#94a3b8', fontSize: 12 }}>
          {L(
            'K Energy Save Co., Ltd. (Group of Zera) Admin System',
            'K Energy Save Co., Ltd. (Group of Zera) 관리 시스템'
          )}
        </div>
      </div>

      {/* Zoom Meeting Modal */}
      {showZoom && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', flexDirection: 'column' }}
          onClick={e => { if (e.target === e.currentTarget) handleCloseZoom() }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: '#2D8CFF', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M22.8 4.8c-.6-.45-1.35-.3-1.95.15L16.5 8.4V6c0-1.65-1.35-3-3-3H3c-1.65 0-3 1.35-3 3v12c0 1.65 1.35 3 3 3h10.5c1.65 0 3-1.35 3-3v-2.4l4.35 3.45c.3.3.6.45 1.05.45.3 0 .45 0 .75-.15.6-.45 1.05-1.05 1.05-1.8V6.6c0-.75-.3-1.35-.9-1.8z"/></svg>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                {L('Zoom Meeting', 'Zoom 미팅')}
              </h2>
            </div>
            <button onClick={handleCloseZoom} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', fontSize: 24, width: 40, height: 40, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ✕
            </button>
          </div>
          <iframe src={zoomUrl} style={{ flex: 1, width: '100%', border: 'none', background: '#000' }} title="Zoom Meeting" allow="camera; microphone; fullscreen; speaker; display-capture" />
        </div>
      )}
    </div>
  )
}
