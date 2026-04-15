"use client"

import Link from 'next/link'

const loginTargets = [
  { label: 'Production Login', href: '/login/production' },
  { label: 'Quality Control Login', href: '/login/quality-control' },
  { label: 'International Market Login', href: '/login/international-market' },
  { label: 'Domestic Market Login', href: '/login/domestic-market' }
]

export default function ProductGuidesPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: 24 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111827', marginBottom: 8 }}>
          คู่มือเกี่ยวกับผลิตภัณฑ์
        </h1>
        <p style={{ color: '#6b7280', marginBottom: 20 }}>
          เลือกปุ่มเพื่อล็อกอินเข้าสู่ระบบที่เกี่ยวข้องกับข้อมูลผลิตภัณฑ์
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          {loginTargets.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                textDecoration: 'none',
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 10,
                padding: '14px 16px',
                fontWeight: 700,
                color: '#1f2937'
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
