"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import CountryFlag from '@/components/CountryFlag'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useLocale } from '@/lib/LocaleContext'

const branchSections = [
  {
    key: 'korea-hq',
    branch: 'Korea HQ',
    links: [
      { label: 'Executive Department Login', href: '/login/executive' },
      { label: 'HR Department Login', href: '/login/hr' },
      { label: 'Production Department Login', href: '/login/production' },
      { label: 'International Market Department Login', href: '/login/international-market' },
      { label: 'Domestic Market Department Login', href: '/login/domestic-market' },
      { label: 'Logistics Department Login', href: '/login/logistics' },
      { label: 'Quality Control Department Login', href: '/login/quality-control' },
      { label: 'After Sales Department Login', href: '/login/after-sales' },
      { label: 'Maintenance Department Login', href: '/login/maintenance' },
      { label: 'R&D Department Login', href: '/login/research-development' },
      { label: 'QR Code System Login', href: '/login/qr-code' }
    ]
  },
  {
    key: 'thailand-branch',
    branch: 'Thailand Branch',
    links: [
      { label: 'Thailand Admin Login', href: '/KR-Thailand/Admin-Login' },
      { label: 'Thailand Accounting Login', href: '/KR-Thailand/Accounting-Login' },
      { label: 'Thailand Marketing Login', href: '/KR-Thailand/Marketing-Login' },
      { label: 'Learning Login', href: '/admin/main/learning-login' }
    ]
  },
  {
    key: 'vietnam-branch',
    branch: 'Vietnam Branch',
    links: [
      { label: 'Vietnam Invoices List', href: '/KR-Vietnam/Admin-Login/invoices/list' },
      { label: 'Vietnam Create Invoice', href: '/KR-Vietnam/Admin-Login/invoices/create' },
      { label: 'Vietnam Korea Invoices', href: '/KR-Vietnam/Admin-Login/korea-invoices' }
    ]
  },
  {
    key: 'malaysia-branch',
    branch: 'Malaysia Branch',
    links: [
      { label: 'Malaysia Invoices List', href: '/KR-Malaysia/Admin-Login/invoices/list' },
      { label: 'Malaysia Create Invoice', href: '/KR-Malaysia/Admin-Login/invoices/create' },
      { label: 'Malaysia Korea Invoices', href: '/KR-Malaysia/Admin-Login/korea-invoices' }
    ]
  },
  {
    key: 'brunei-branch',
    branch: 'Brunei Branch',
    links: [
      { label: 'Brunei Invoices List', href: '/KR-Brunei/Admin-Login/invoices/list' },
      { label: 'Brunei Create Invoice', href: '/KR-Brunei/Admin-Login/invoices/create' },
      { label: 'Brunei Korea Invoices', href: '/KR-Brunei/Admin-Login/korea-invoices' }
    ]
  }
]

export default function SystemUsageGuidesPage() {
  const { locale } = useLocale()
  const [activeBranchKey, setActiveBranchKey] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [docTotal, setDocTotal] = useState<number | null>(null)

  const L = (en: string, ko: string) => (locale === 'ko' ? ko : en)

  useEffect(() => {
    const applyHashFilter = () => {
      try {
        const hash = (window.location.hash || '').replace('#', '').trim()
        setActiveBranchKey(hash || null)
      } catch {
        setActiveBranchKey(null)
      }
    }

    applyHashFilter()
    window.addEventListener('hashchange', applyHashFilter)

    // Fetch total document count from DB
    fetch('/api/documents/count')
      .then(r => r.json())
      .then(data => setDocTotal(typeof data.total === 'number' ? data.total : 0))
      .catch(() => setDocTotal(null))

    return () => window.removeEventListener('hashchange', applyHashFilter)
  }, [])

  const branchFlag = (key: string): 'KR' | 'TH' | 'VN' | 'MY' | 'BN' => {
    if (key.includes('thailand')) return 'TH'
    if (key.includes('vietnam')) return 'VN'
    if (key.includes('malaysia')) return 'MY'
    if (key.includes('brunei')) return 'BN'
    return 'KR'
  }

  const branchLabel = (key: string, fallback: string) => {
    if (locale !== 'ko') return fallback
    if (key === 'korea-hq') return '한국 본사'
    if (key === 'thailand-branch') return '태국 지사'
    if (key === 'vietnam-branch') return '베트남 지사'
    if (key === 'malaysia-branch') return '말레이시아 지사'
    if (key === 'brunei-branch') return '브루나이 지사'
    return fallback
  }

  const linkLabel = (label: string) => {
    if (locale !== 'ko') return label
    const map: Record<string, string> = {
      'Executive Department Login': '경영진 부서 로그인',
      'HR Department Login': '인사 부서 로그인',
      'Production Department Login': '생산 부서 로그인',
      'International Market Department Login': '해외시장 부서 로그인',
      'Domestic Market Department Login': '국내시장 부서 로그인',
      'Logistics Department Login': '물류 부서 로그인',
      'Quality Control Department Login': '품질관리 부서 로그인',
      'After Sales Department Login': '애프터서비스 부서 로그인',
      'Maintenance Department Login': '유지보수 부서 로그인',
      'R&D Department Login': '연구개발 부서 로그인',
      'QR Code System Login': 'QR 코드 시스템 로그인',
      'Thailand Admin Login': '태국 관리자 로그인',
      'Thailand Accounting Login': '태국 회계 로그인',
      'Thailand Marketing Login': '태국 마케팅 로그인',
      'Learning Login': '학습 시스템 로그인',
      'Vietnam Invoices List': '베트남 청구서 목록',
      'Vietnam Create Invoice': '베트남 청구서 생성',
      'Vietnam Korea Invoices': '베트남 한국 청구서',
      'Malaysia Invoices List': '말레이시아 청구서 목록',
      'Malaysia Create Invoice': '말레이시아 청구서 생성',
      'Malaysia Korea Invoices': '말레이시아 한국 청구서',
      'Brunei Invoices List': '브루나이 청구서 목록',
      'Brunei Create Invoice': '브루나이 청구서 생성',
      'Brunei Korea Invoices': '브루나이 한국 청구서'
    }
    return map[label] || label
  }

  const visibleSections = activeBranchKey
    ? branchSections.filter((section) => section.key === activeBranchKey)
    : branchSections

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: 24 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 14,
          padding: 16,
          marginBottom: 14,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12
        }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111827', marginBottom: 8 }}>
              {L('System Usage Manuals by Department - Korea Headquarters', '한국 본사 부서별 시스템 사용 매뉴얼')}
            </h1>
            <p style={{ color: '#6b7280' }}>
              {L('Select by branch and open the system according to your role permissions.', '지점별로 선택하고 권한에 맞는 시스템으로 이동하세요.')}
            </p>
          </div>
          <LanguageSwitcher allowedCodes={['ko', 'en']} />
        </div>

        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 14,
          padding: 14,
          marginBottom: 16,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={L('Search department/system button...', '부서/시스템 버튼 검색...')}
            style={{
              flex: 1,
              minWidth: 260,
              border: '1px solid #d1d5db',
              borderRadius: 10,
              padding: '10px 12px',
              fontSize: 14,
              outline: 'none'
            }}
          />
          <button
            onClick={() => setQuery('')}
            style={{
              border: '1px solid #d1d5db',
              background: '#fff',
              borderRadius: 10,
              padding: '10px 12px',
              cursor: 'pointer',
              fontWeight: 700,
              color: '#374151'
            }}
          >
            {L('Clear', '초기화')}
          </button>
        </div>

        <div style={{ display: 'grid', gap: 14 }}>
          {visibleSections.map((section) => (
            <div id={section.key} key={section.branch} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
              <div style={{
                fontSize: 18,
                fontWeight: 800,
                color: '#111827',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: 10
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CountryFlag country={branchFlag(section.key)} size="sm" /> {branchLabel(section.key, section.branch)}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {section.key === 'thailand-branch' && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      background: '#eef2ff', color: '#4338ca',
                      border: '1px solid #c7d2fe',
                      borderRadius: 20, padding: '3px 10px',
                      fontSize: 12, fontWeight: 700
                    }}>
                      📄 {L('Documents', 'เอกสาร')}&nbsp;
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#6366f1' }}>
                      {docTotal === null ? '—' : docTotal.toLocaleString()}
                      </span>
                    </span>
                  )}
                  <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 700 }}>
                    {L('System Buttons', '시스템 버튼')}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 10 }}>
                {section.links
                  .filter((item) => linkLabel(item.label).toLowerCase().includes(query.toLowerCase()))
                  .map((item) => (
                  <Link
                    key={`${section.branch}-${item.href}-${item.label}`}
                    href={item.href}
                    style={{
                      textDecoration: 'none',
                      background: '#ffffff',
                      border: '1px solid #dbeafe',
                      borderRadius: 10,
                      padding: '12px 12px',
                      fontWeight: 700,
                      color: '#1f2937',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                    }}
                  >
                    <span style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: '#eff6ff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      overflow: 'hidden'
                    }}>
                      <CountryFlag country={branchFlag(section.key)} size="sm" />
                    </span>
                    <span style={{ fontSize: 14, color: '#0f172a', fontWeight: 800 }}>{linkLabel(item.label)}</span>
                  </Link>
                ))}
              </div>

              {section.links.filter((item) => linkLabel(item.label).toLowerCase().includes(query.toLowerCase())).length === 0 && (
                <div style={{ marginTop: 8, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: 10, color: '#9a3412', fontWeight: 700 }}>
                  {L('No button matches your search.', '검색 결과가 없습니다.')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
