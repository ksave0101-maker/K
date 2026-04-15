"use client"

import Link from 'next/link'
import CountryFlag from '@/components/CountryFlag'

const branchSections = [
  {
    key: 'korea-hq',
    branch: 'Korea HQ',
    links: [
      { label: 'Executive Login', href: '/login/executive' },
      { label: 'HR Login', href: '/login/hr' },
      { label: 'Production Login', href: '/login/production' },
      { label: 'International Market Login', href: '/login/international-market' },
      { label: 'Domestic Market Login', href: '/login/domestic-market' },
      { label: 'Logistics Login', href: '/login/logistics' },
      { label: 'Quality Control Login', href: '/login/quality-control' },
      { label: 'After Sales Login', href: '/login/after-sales' },
      { label: 'Maintenance Login', href: '/login/maintenance' },
      { label: 'R&D Login', href: '/login/research-development' }
    ]
  },
  {
    key: 'thailand-branch',
    branch: 'Thailand Branch',
    links: [
      { label: 'Thailand Admin Login', href: '/KR-Thailand/Admin-Login' },
      { label: 'Thailand Accounting Login', href: '/KR-Thailand/Accounting-Login' },
      { label: 'Thailand Marketing Login', href: '/KR-Thailand/Marketing-Login' },
      { label: 'Thailand Intl-Market Login', href: '/login/international-market' }
    ]
  },
  {
    key: 'vietnam-branch',
    branch: 'Vietnam Branch',
    links: [
      { label: 'Vietnam Invoice Login', href: '/KR-Vietnam/Admin-Login/invoices/list' },
      { label: 'Vietnam Korea-Invoices', href: '/KR-Vietnam/Admin-Login/korea-invoices' },
      { label: 'Vietnam Department Login', href: '/login/international-market' }
    ]
  },
  {
    key: 'malaysia-branch',
    branch: 'Malaysia Branch',
    links: [
      { label: 'Malaysia Invoice Login', href: '/KR-Malaysia/Admin-Login/invoices/list' },
      { label: 'Malaysia Korea-Invoices', href: '/KR-Malaysia/Admin-Login/korea-invoices' },
      { label: 'Malaysia Department Login', href: '/login/international-market' }
    ]
  },
  {
    key: 'brunei-branch',
    branch: 'Brunei Branch',
    links: [
      { label: 'Brunei Invoice Login', href: '/KR-Brunei/Admin-Login/invoices/list' },
      { label: 'Brunei Korea-Invoices', href: '/KR-Brunei/Admin-Login/korea-invoices' },
      { label: 'Brunei Department Login', href: '/login/international-market' }
    ]
  }
]

export default function DepartmentWorkGuidesPage() {
  const branchFlag = (key: string): 'KR' | 'TH' | 'VN' | 'MY' | 'BN' => {
    if (key.includes('thailand')) return 'TH'
    if (key.includes('vietnam')) return 'VN'
    if (key.includes('malaysia')) return 'MY'
    if (key.includes('brunei')) return 'BN'
    return 'KR'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: 24 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111827', marginBottom: 8 }}>
          คู่มือการทำงานแต่ละแผนกของแต่ละสาขา
        </h1>
        <p style={{ color: '#6b7280', marginBottom: 20 }}>
          แยกตามสาขาก่อน และมีปุ่มล็อกอินของแต่ละแผนก/งานในสาขานั้น
        </p>

        <div style={{ display: 'grid', gap: 14 }}>
          {branchSections.map((section) => (
            <div id={section.key} key={section.branch} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CountryFlag country={branchFlag(section.key)} size="sm" /> {section.branch}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 10 }}>
                {section.links.map((item) => (
                  <Link
                    key={`${section.branch}-${item.href}-${item.label}`}
                    href={item.href}
                    style={{
                      textDecoration: 'none',
                      background: '#f8fafc',
                      border: '1px solid #e5e7eb',
                      borderRadius: 10,
                      padding: '10px 12px',
                      fontWeight: 700,
                      color: '#1f2937',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10
                    }}
                  >
                    <span style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: '#e0e7ff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      overflow: 'hidden'
                    }}>
                      <CountryFlag country={branchFlag(section.key)} size="sm" />
                    </span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
